// Restaurant loading overlay component
(function (g) {
  const ns = (g.__allerfree ||= {});

  const LOADING_OVERLAY_ID = "allerfree-restaurant-loading";
  const LOADING_CONTAINER_CLASS = "allerfree-loading-container";
  const MAX_RESTAURANTS = 3;

  // Internal queue of restaurants
  let restaurantQueue = [];

  // Add a restaurant to the queue (max 3)
  ns.addRestaurant = function (name, state = "loading") {
    // Remove if already exists
    restaurantQueue = restaurantQueue.filter(r => r.name !== name);

    // Add to end of queue
    restaurantQueue.push({ name, state });

    // Keep only last 3
    if (restaurantQueue.length > MAX_RESTAURANTS) {
      restaurantQueue = restaurantQueue.slice(-MAX_RESTAURANTS);
    }

    render();
  };

  // Update a specific restaurant's state
  ns.updateRestaurantState = function (name, state) {
    const restaurant = restaurantQueue.find(r => r.name === name);
    if (restaurant) {
      restaurant.state = state;
      render();
    }
  };

  // Remove a specific restaurant
  ns.removeRestaurant = function (name) {
    restaurantQueue = restaurantQueue.filter(r => r.name !== name);
    render();
  };

  // Clear all restaurants
  ns.clearAllRestaurants = function () {
    restaurantQueue = [];
    const existing = document.getElementById(LOADING_OVERLAY_ID);
    if (existing) {
      existing.remove();
    }
  };

  // Legacy methods for backward compatibility
  ns.showRestaurantLoading = function (restaurants = []) {
    restaurantQueue = restaurants.slice(0, MAX_RESTAURANTS);
    render();
  };

  ns.hideRestaurantLoading = function () {
    ns.clearAllRestaurants();
  };

  // Render the overlay
  function render() {
    // Remove existing overlay
    const existing = document.getElementById(LOADING_OVERLAY_ID);
    if (existing) {
      existing.remove();
    }

    // Don't render if queue is empty
    if (restaurantQueue.length === 0) return;

    const overlay = createLoadingOverlay(restaurantQueue);
    document.body.appendChild(overlay);
  }

  function createLoadingOverlay(restaurants) {
    const overlay = document.createElement("div");
    overlay.id = LOADING_OVERLAY_ID;

    // Styles for the overlay - positioned in bottom right
    Object.assign(overlay.style, {
      position: "fixed",
      bottom: "20px",
      right: "20px",
      zIndex: "9999",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    });

    const container = document.createElement("div");
    container.className = LOADING_CONTAINER_CLASS;

    Object.assign(container.style, {
      display: "flex",
      flexDirection: "column",
      gap: "12px",
      maxWidth: "320px",
      width: "auto",
      minWidth: "280px"
    });

    // Add restaurant cards if provided
    if (restaurants.length > 0) {
      restaurants.forEach(restaurant => {
        const card = createRestaurantCard(restaurant);
        container.appendChild(card);
      });
    } else {
      // Show generic loading message if no restaurants provided
      const card = createRestaurantCard({ name: "Loading restaurants..." });
      container.appendChild(card);
    }

    overlay.appendChild(container);
    return overlay;
  }

  function createRestaurantCard(restaurant) {
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
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.3)"
    });

    const nameSpan = document.createElement("span");
    nameSpan.textContent = restaurant.name || "Restaurant";
    nameSpan.style.flex = "1";

    // Show spinner or checkmark based on state
    const state = restaurant.state || "loading";
    const icon = state === "success" ? createCheckmark() : createSpinner();
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
      flexShrink: "0"
    });

    // Inject keyframes animation if not already present
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
      flexShrink: "0"
    });

    // Create SVG checkmark icon
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

})(self);
