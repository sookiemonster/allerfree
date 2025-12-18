// public/content/restaurant-loading.js
//
// Bottom-right queue overlay for jobs.
//
// Restaurant object shape (matches public/content/restaurant.js):
// {
//   name: string,
//   coordinates: { lat: number, lng: number } | null,
//   url: string
// }
//
// Job storage shape (analysisContext.js stored under `allerfree_job:<restaurantKey>`):
// {
//   restaurant: { name, coordinates, url },
//   status: "running" | "success" | "error",
//   updatedAt: number,
//   ... other fields like result/error
// }
//
// Overlay internal queue item shape:
// {
//   restaurantKey: string,
//   job: object,               // full job object (easy for future click behavior)
//   state: "loading" | "success" | "error",
//   updatedAt: number
// }

(function (g) {
  const ns = (g.__allerfree ||= {});

  const OVERLAY_ID = "allerfree-restaurant-loading";
  const CONTAINER_CLASS = "allerfree-loading-container";
  const MAX_ITEMS = 3;

  /** @type {Array<{restaurantKey: string, job: any, state: string, updatedAt: number}>} */
  let jobQueue = [];

  // Default click handler: alert the restaurantKey(dev b4 actual click logic)
  if (typeof ns.onJobQueueItemClick !== "function") {
    ns.onJobQueueItemClick = function (payload) {
      const key = String(payload?.restaurantKey || "").trim();
      if (!key) return;

      alert(key);
    };
  }


  function normalizeState(state) {
    if (state === "success" || state === "error" || state === "loading") return state;
    if (state === "running") return "loading";
    return "loading";
  }

  function coerceRestaurant(input) {
    if (typeof input === "string") {
      return { name: input, coordinates: null, url: "" };
    }
    if (input && typeof input === "object") {
      return {
        name: String(input.name || ""),
        coordinates:
          input.coordinates &&
          typeof input.coordinates === "object" &&
          input.coordinates.lat != null &&
          input.coordinates.lng != null
            ? { lat: input.coordinates.lat, lng: input.coordinates.lng }
            : null,
        url: String(input.url || ""),
      };
    }
    return { name: "", coordinates: null, url: "" };
  }

  // Only used as a fallback when a restaurantKey is not provided.
  function makeRestaurantKeyFromRestaurant(restaurant) {
    const namePart = String(restaurant?.name || "")
      .trim()
      .toLowerCase();

    const coords =
      restaurant?.coordinates &&
      restaurant.coordinates.lat != null &&
      restaurant.coordinates.lng != null
        ? `${restaurant.coordinates.lat},${restaurant.coordinates.lng}`
        : "no-coords";

    return `${namePart}|${coords}`;
  }

  function coerceJob(input) {
    // If it already looks like a job object from storage
    if (input && typeof input === "object" && input.restaurant) {
      const restaurant = coerceRestaurant(input.restaurant);
      const restaurantKey =
        String(input.restaurantKey || input.key || "").trim() ||
        makeRestaurantKeyFromRestaurant(restaurant);

      return {
        restaurantKey,
        job: {
          ...input,
          restaurant,
          restaurantKey,
          status: input.status || "running",
          updatedAt: typeof input.updatedAt === "number" ? input.updatedAt : Date.now(),
        },
      };
    }

    // If it is a restaurant object or a string name
    const restaurant = coerceRestaurant(input);
    const restaurantKey = makeRestaurantKeyFromRestaurant(restaurant);

    return {
      restaurantKey,
      job: {
        restaurant,
        restaurantKey,
        status: "running",
        updatedAt: Date.now(),
      },
    };
  }

  function setQueueAndRender(items) {
    // keep last 3 by updatedAt
    const normalized = (items || [])
      .map((it) => {
        const restaurantKey = String(it.restaurantKey || it.id || "").trim();
        const job = it.job || it;

        const jobObj = coerceJob(job);
        const finalKey = restaurantKey || jobObj.restaurantKey;

        const state = normalizeState(it.state || it.status || job.status || "loading");
        const updatedAt =
          typeof it.updatedAt === "number"
            ? it.updatedAt
            : typeof job.updatedAt === "number"
              ? job.updatedAt
              : Date.now();

        return {
          restaurantKey: finalKey,
          job: {
            ...jobObj.job,
            status: job.status || jobObj.job.status,
            updatedAt,
          },
          state,
          updatedAt,
        };
      })
      .filter((it) => it.restaurantKey);

    normalized.sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
    jobQueue = normalized.slice(-MAX_ITEMS);

    render();
  }

  // Public API (job-first)

  ns.setJobQueue = function (items = []) {
    setQueueAndRender(items);
  };

  ns.addJob = function (jobOrRestaurant, state = "loading", restaurantKeyOverride) {
    const coerced = coerceJob(jobOrRestaurant);
    const restaurantKey =
      (typeof restaurantKeyOverride === "string" && restaurantKeyOverride) ||
      coerced.restaurantKey;

    // remove existing
    jobQueue = jobQueue.filter((x) => x.restaurantKey !== restaurantKey);

    jobQueue.push({
      restaurantKey,
      job: {
        ...coerced.job,
        restaurantKey,
        status: coerced.job.status || "running",
        updatedAt: Date.now(),
      },
      state: normalizeState(state),
      updatedAt: Date.now(),
    });

    if (jobQueue.length > MAX_ITEMS) jobQueue = jobQueue.slice(-MAX_ITEMS);
    render();
  };

  ns.updateJobState = function (restaurantKey, state) {
    const key = String(restaurantKey || "").trim();
    if (!key) return;

    const item = jobQueue.find((x) => x.restaurantKey === key);
    if (!item) return;

    item.state = normalizeState(state);
    item.updatedAt = Date.now();
    item.job = { ...item.job, status: item.job.status, updatedAt: item.updatedAt };

    render();
  };

  ns.removeJob = function (restaurantKey) {
    const key = String(restaurantKey || "").trim();
    if (!key) return;

    jobQueue = jobQueue.filter((x) => x.restaurantKey !== key);
    render();
  };

  // Backward compatibility (restaurant-named API)
  // If you still call addRestaurant("Chipotle"), it will work.
  ns.setRestaurantQueue = function (items = []) {
    // items might be in the old { id, restaurant, state } format
    const converted = (items || []).map((it) => {
      if (it && typeof it === "object" && it.restaurant) {
        return {
          restaurantKey: it.id || it.restaurantKey,
          state: it.state || it.status,
          job: {
            restaurant: it.restaurant,
            restaurantKey: it.id || it.restaurantKey,
            status: it.status || "running",
            updatedAt: it.updatedAt || 0,
          },
          updatedAt: it.updatedAt || 0,
        };
      }
      // if it is a string, treat it as restaurant name
      return it;
    });

    ns.setJobQueue(converted);
  };

  ns.addRestaurant = function (restaurantOrName, state = "loading", restaurantKeyOverride) {
    const restaurant = coerceRestaurant(restaurantOrName);
    const restaurantKey =
      (typeof restaurantKeyOverride === "string" && restaurantKeyOverride) ||
      makeRestaurantKeyFromRestaurant(restaurant);

    ns.addJob(
      {
        restaurant,
        restaurantKey,
        status: "running",
        updatedAt: Date.now(),
      },
      state,
      restaurantKey
    );
  };

  ns.updateRestaurantState = function (restaurantKeyOrName, state) {
    // If it's a plain name, it becomes a fallback key which can collide,
    // but we keep this for backward compatibility.
    const key =
      typeof restaurantKeyOrName === "string" && restaurantKeyOrName.includes("|")
        ? restaurantKeyOrName
        : makeRestaurantKeyFromRestaurant(coerceRestaurant(restaurantKeyOrName));

    ns.updateJobState(key, state);
  };

  ns.removeRestaurant = function (restaurantKeyOrName) {
    const key =
      typeof restaurantKeyOrName === "string" && restaurantKeyOrName.includes("|")
        ? restaurantKeyOrName
        : makeRestaurantKeyFromRestaurant(coerceRestaurant(restaurantKeyOrName));

    ns.removeJob(key);
  };

  ns.getJobQueue = function () {
    return jobQueue.slice();
  };

  ns.clearAllRestaurants = function () {
    jobQueue = [];
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) existing.remove();
  };

  ns.showRestaurantLoading = function (restaurants = []) {
    // legacy alias
    ns.setRestaurantQueue(restaurants);
  };

  ns.hideRestaurantLoading = function () {
    ns.clearAllRestaurants();
  };

  // Render

  function render() {
    const existing = document.getElementById(OVERLAY_ID);
    if (existing) existing.remove();

    if (jobQueue.length === 0) return;

    const overlay = createOverlay(jobQueue);
    document.body.appendChild(overlay);
  }

  function createOverlay(items) {
    const overlay = document.createElement("div");
    overlay.id = OVERLAY_ID;

    Object.assign(overlay.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "9999",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    });

    const container = document.createElement("div");
    container.className = CONTAINER_CLASS;

    Object.assign(container.style, {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxWidth: "320px",
      width: "auto",
      minWidth: "280px",
    });

    items.forEach((item) => container.appendChild(createJobCard(item)));

    overlay.appendChild(container);
    return overlay;
  }

  function createJobCard(item) {
    const card = document.createElement("div");

    Object.assign(card.style, {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      backgroundColor: "#2d2d2d",
      color: "#fff",
      padding: "16px",
      borderRadius: "8px",
      fontSize: "14px",
      fontWeight: "500",
      gap: "12px",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)",
      cursor: "default"
    });

    const restaurant = item.job?.restaurant || { name: "Restaurant", url: "" };

    // Expose key + url for future click behavior
    card.dataset.allerfreeRestaurantKey = String(item.restaurantKey || "");
    card.dataset.allerfreeRestaurantUrl = String(restaurant.url || "");

    const nameSpan = document.createElement("span");
    nameSpan.textContent = restaurant.name || "Restaurant";
    nameSpan.style.flex = "1";

    const state = normalizeState(item.state || "loading");
    const icon =
      state === "success"
        ? createCheckmark()
        : state === "error"
          ? createErrorIcon()
          : createSpinner();

    // reflect in ui if a user can open job 
    const isClickable = state === "success";
    if (isClickable) {
      card.style.cursor = "pointer";

      const baseFontStyle = nameSpan.style.fontStyle || "";
      const baseFontWeight = nameSpan.style.fontWeight || ""; 
      // const baseBg = nameSpan.style.backgroundColor || "";

      card.addEventListener("mouseenter", () => {
        nameSpan.style.fontStyle = "italic";
        nameSpan.style.fontWeight = "1000";
        // nameSpan.style.backgroundColor = "rgba(255, 255, 255, 0.10)";
      });
      card.addEventListener("mouseleave", () => {
        nameSpan.style.fontStyle = baseFontStyle;
        nameSpan.style.fontWeight = baseFontWeight;
        // nameSpan.style.backgroundColor = baseBg;
      });

      // attach logic to click
      card.addEventListener("click", () => {
        if (typeof ns.onJobQueueItemClick === "function") {
          ns.onJobQueueItemClick({
            restaurantKey: item.restaurantKey,
            job: item.job,
          });
        }
      });
    }

    card.appendChild(nameSpan);
    card.appendChild(icon);

    return card;
  }


  function createSpinner() {
    const spinner = document.createElement("div");

    Object.assign(spinner.style, {
      width: "20px",
      height: "20px",
      border: "3px solid rgba(255, 255, 255, 0.3)",
      borderTop: "3px solid #fff",
      borderRadius: "50%",
      animation: "allerfree-spin 0.8s linear infinite",
      flexShrink: "0",
    });

    if (!document.getElementById("allerfree-spinner-styles")) {
      const style = document.createElement("style");
      style.id = "allerfree-spinner-styles";
      style.textContent = `
        @keyframes allerfree-spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `;
      document.head.appendChild(style);
    }

    return spinner;
  }

  function createCheckmark() {
    const checkmark = document.createElement("div");

    Object.assign(checkmark.style, {
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#22c55e",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "white");
    svg.setAttribute("stroke-width", "3");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.width = "14px";
    svg.style.height = "14px";

    const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M20 6L9 17l-5-5");

    svg.appendChild(path);
    checkmark.appendChild(svg);

    return checkmark;
  }

  function createErrorIcon() {
    const badge = document.createElement("div");

    Object.assign(badge.style, {
      width: "20px",
      height: "20px",
      borderRadius: "50%",
      backgroundColor: "#ef4444",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      flexShrink: "0",
    });

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("viewBox", "0 0 24 24");
    svg.setAttribute("fill", "none");
    svg.setAttribute("stroke", "white");
    svg.setAttribute("stroke-width", "3");
    svg.setAttribute("stroke-linecap", "round");
    svg.setAttribute("stroke-linejoin", "round");
    svg.style.width = "14px";
    svg.style.height = "14px";

    const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path1.setAttribute("d", "M18 6L6 18");
    const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path2.setAttribute("d", "M6 6l12 12");

    svg.appendChild(path1);
    svg.appendChild(path2);
    badge.appendChild(svg);

    return badge;
  }
})(self);
