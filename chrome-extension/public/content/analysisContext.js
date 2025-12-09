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
  ns.startAnalysisJob = function ({ profiles }) {
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
      .buildMenuAnalysisStringResponse(images, profiles || [])
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
})(self);
