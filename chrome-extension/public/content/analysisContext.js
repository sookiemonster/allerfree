// public/content/analysisContext.js

(function (g) {
  const ns = (g.__allerfree ||= {});

  const STORAGE_PREFIX = "allerfree_job:";

  // In-memory cache: one job per restaurantKey
  // Map<restaurantKey, Job>
  const jobsByRestaurant = new Map();

  /**
   * Job shape (for reference):
   * {
   *   jobId: string,            // derived from restaurantKey
   *   restaurantKey: string,    // name+coords
   *   restaurant: { name, coordinates, url },
   *   status: "running" | "success" | "error",
   *   profiles: any[],
   *   images: string[],
   *   result?: any,
   *   error?: string,
   *   updatedAt: number
   * }
   */

  function getActiveRestaurant() {
    // Prefer stateful currentRestaurant, fall back to URL parsing
    if (typeof ns.getCurrentRestaurant === "function") {
      const stored = ns.getCurrentRestaurant();
      if (stored) return stored;
    }

    if (typeof ns.getRestaurantInfo === "function") {
      return ns.getRestaurantInfo();
    }

    return null;
  }

  function makeRestaurantKey(restaurant) {
    if (!restaurant) return "unknown";

    const namePart = (restaurant.name || "").trim().toLowerCase();

    const coords =
      restaurant.coordinates &&
      restaurant.coordinates.lat != null &&
      restaurant.coordinates.lng != null
        ? `${restaurant.coordinates.lat},${restaurant.coordinates.lng}`
        : "no-coords";

    return `${namePart}|${coords}`;
  }

  function storageKeyForRestaurantKey(restaurantKey) {
    return STORAGE_PREFIX + restaurantKey;
  }

  function persistJob(restaurantKey) {
    const job = jobsByRestaurant.get(restaurantKey);
    if (!job) return;

    const key = storageKeyForRestaurantKey(restaurantKey);
    chrome.storage.local.set({ [key]: job }, () => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn(
          "[Allerfree] Failed to persist job:",
          chrome.runtime.lastError
        );
      }
    });
  }

  function storageGet(key) {
    return new Promise((resolve) => {
      chrome.storage.local.get(key, (data) => {
        if (chrome.runtime && chrome.runtime.lastError) {
          console.warn("[Allerfree] storageGet failed:", chrome.runtime.lastError);
          resolve({});
          return;
        }
        resolve(data || {});
      });
    });
  }


  // Load existing job (if any) for the current restaurant from storage
  ns.loadAnalysisJobForCurrentRestaurant = function (callback) {
    const restaurant = getActiveRestaurant();
    const restaurantKey = makeRestaurantKey(restaurant);
    const key = storageKeyForRestaurantKey(restaurantKey);

    chrome.storage.local.get(key, (data) => {
      const rawJob = data[key] || null;
      if (rawJob) {
        jobsByRestaurant.set(restaurantKey, rawJob);
      }
      if (typeof callback === "function") {
        callback(rawJob);
      }
    });
  };

  // Debug helper
  ns.getAnalysisJobForCurrentRestaurant = function () {
    const restaurant = getActiveRestaurant();
    const restaurantKey = makeRestaurantKey(restaurant);
    return jobsByRestaurant.get(restaurantKey) || null;
  };

  /**
   * Start an analysis job for the CURRENT restaurant.
   * One job per restaurant: this overwrites any existing job.
   *
   * Only input is profiles; jobId is derived from restaurantKey.
   */
  ns.startAnalysisJob = async function ({ profiles }) {
    const restaurant = getActiveRestaurant();

    if (!restaurant) {
      const errorMsg = "No active restaurant found for analysis";
      console.error("[Allerfree] " + errorMsg);
      chrome.runtime.sendMessage({
        type: "analysis-error",
        jobId: null,
        restaurantKey: null,
        restaurant: null,
        error: errorMsg,
      });
      return;
    }

    const restaurantKey = makeRestaurantKey(restaurant);
    const jobId = restaurantKey; // deterministic job ID based on restaurant

    // lockout if a job is already running for this restaurantKey
    let existing = jobsByRestaurant.get(restaurantKey) || null;

    if (!existing) {
      const key = storageKeyForRestaurantKey(restaurantKey);
      const data = await storageGet(key);
      existing = data[key] || null;
      if (existing) jobsByRestaurant.set(restaurantKey, existing);
    }

    if (existing && existing.status === "running") {
      console.warn("[Allerfree] Analysis already running for:", restaurantKey);
      // chrome.runtime.sendMessage({
      //   type: "analysis-already-running",
      //   jobId,
      //   restaurantKey,
      //   restaurant,
      // });
      return; // early exit on multiple backend calls on the same restaurant
    }

    const images =
      typeof ns.grabMenuImages === "function" ? ns.grabMenuImages() : [];

    const baseJob = {
      jobId,
      restaurantKey,
      restaurant,
      status: "running",
      profiles: profiles || [],
      images,
      result: null,
      error: null,
      updatedAt: Date.now(),
    };

    // One job per restaurant: overwrite whatever was there
    jobsByRestaurant.set(restaurantKey, baseJob);
    persistJob(restaurantKey);

    if (typeof ns.buildMenuAnalysisStringResponse !== "function") {
      const errorMsg = "buildMenuAnalysisStringResponse is not available";
      console.error("[Allerfree] " + errorMsg);

      const errorJob = {
        ...baseJob,
        status: "error",
        error: errorMsg,
        updatedAt: Date.now(),
      };
      jobsByRestaurant.set(restaurantKey, errorJob);
      persistJob(restaurantKey);

      chrome.runtime.sendMessage({
        type: "analysis-error",
        jobId,
        restaurantKey,
        restaurant,
        error: errorMsg,
      });
      return;
    }

    ns
      .buildMenuAnalysisStringResponse(getActiveRestaurant(), images, profiles || [])
      .then((result) => {
        const prev = jobsByRestaurant.get(restaurantKey) || baseJob;
        const nextJob = {
          ...prev,
          status: "success",
          result,
          updatedAt: Date.now(),
        };
        jobsByRestaurant.set(restaurantKey, nextJob);
        persistJob(restaurantKey);

        chrome.runtime.sendMessage({
          type: "analysis-complete",
          jobId,
          restaurantKey,
          restaurant,
          result,
        });
      })
      .catch((err) => {
        const prev = jobsByRestaurant.get(restaurantKey) || baseJob;
        const errorString = String(err?.message || err);
        const nextJob = {
          ...prev,
          status: "error",
          error: errorString,
          updatedAt: Date.now(),
        };
        jobsByRestaurant.set(restaurantKey, nextJob);
        persistJob(restaurantKey);

        chrome.runtime.sendMessage({
          type: "analysis-error",
          jobId,
          restaurantKey,
          restaurant,
          error: errorString,
        });
      });
  };

  /**
   * Content-side message listener:
   * Popup/service worker only sends profiles. Job ID comes from restaurant.
   *
   * Message shape:
   *   { type: "start-analysis", profiles: [...] }
   */
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    try {
      if (message && message.type === "start-analysis") {
        const { profiles } = message;
        ns.startAnalysisJob({ profiles: profiles || [] });
        // immediate ack; completion is reported via chrome.runtime.sendMessage
        sendResponse?.({ ok: true });
        return;
      }
    } catch (err) {
      const errorString = String(err?.message || err);
      console.error("[Allerfree] Error handling runtime message:", errorString);
      sendResponse?.({ ok: false, error: errorString });
    }
    // Let other listeners handle other message types
  });

  /**
   * keep jobsByRestaurant in sync with chrome.storage.local
   * so all tabs and contexts see the same job state.
   */
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    for (const [key, change] of Object.entries(changes)) {
      if (!key.startsWith(STORAGE_PREFIX)) continue;

      const restaurantKey = key.slice(STORAGE_PREFIX.length);
      const { newValue } = change;

      if (!newValue) {
        // Key was removed; drop from in-memory cache as well.
        jobsByRestaurant.delete(restaurantKey);
        continue;
      }

      // Update this tab’s in-memory cache with the new job object.
      jobsByRestaurant.set(restaurantKey, newValue);

      ns.logAllAnalysisJobs();
    }
  });

  // Debug helper: log all jobs from chrome.storage.local
  ns.logAllAnalysisJobs = function () {
    chrome.storage.local.get(null, (data) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn(
          "[Allerfree] Failed to read jobs from storage:",
          chrome.runtime.lastError
        );
        return;
      }

      const allJobs = {};

      for (const [key, value] of Object.entries(data)) {
        if (!key.startsWith(STORAGE_PREFIX)) continue;

        const restaurantKey = key.slice(STORAGE_PREFIX.length);
        allJobs[restaurantKey] = value;
      }

      console.log("[Allerfree] All analysis jobs in storage:", allJobs);
    });
  };

})(self);
