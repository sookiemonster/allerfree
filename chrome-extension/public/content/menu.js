// Menu feature: state, button injection, attach/detach observer, emitMenu
(function (g) {
  const ns = (g.__allerfree ||= {});
  const {
    BTN_ID, TIMINGS, debounce, buildMenuSignature, sendMenuImagesToBackground,
    getMenuRoot, grabMenuImages
  } = ns;

  // State
  let menuImageLinks = [];
  let menuObserver = null;
  let observedMenuRoot = null;
  let lastMenuSig = null;

  ns.emitMenu = function (reason) {
    const root = getMenuRoot();
    const sig = buildMenuSignature(root);

    if (!root || sig === null) {
      lastMenuSig = null;
      menuImageLinks = [];
      sendMenuImagesToBackground(menuImageLinks);
      return;
    }

    // refresh images on any menu mutation
    menuImageLinks = grabMenuImages();
    sendMenuImagesToBackground(menuImageLinks);

    if (sig === lastMenuSig && document.getElementById(BTN_ID)) return;

    lastMenuSig = sig;
    if (!document.getElementById(BTN_ID)) injectButton();
  };

  ns.attachMenuObserverIfNeeded = function () {
    const menuRoot = getMenuRoot();
    if (!menuRoot) return ns.detachMenuObserver();

    if (menuObserver && observedMenuRoot === menuRoot) return;

    ns.detachMenuObserver();
    menuObserver = new MutationObserver(
      debounce(() => ns.emitMenu('menu-mutation'), TIMINGS.menuDebounce)
    );
    menuObserver.observe(menuRoot, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true
    });
    observedMenuRoot = menuRoot;
    lastMenuSig = null;
    ns.emitMenu('menu-attach');
  };

  ns.detachMenuObserver = function () {
    if (menuObserver) {
      menuObserver.disconnect();
      menuObserver = null;
    }
    observedMenuRoot = null;
    lastMenuSig = null;

    // Re-run grabMenuImages; if menu/carousel missing, it yields []
    menuImageLinks = grabMenuImages();
    sendMenuImagesToBackground(menuImageLinks);
  };

  ns.isMenuTabSelected = function () {
    if (getMenuRoot()) return true;

    const menuBtn =
      document.querySelector('[role="tab"][aria-selected][aria-label="Menu"]') ||
      Array.from(document.querySelectorAll('[role="tab"]'))
        .find(el => el.textContent?.trim() === "Menu");

    if (!menuBtn) return false;
    return menuBtn.getAttribute("aria-selected") === "true";
  };

  function getRestaurantName() {
    // Try to get restaurant name from page title or h1
    const h1 = document.querySelector('h1');
    if (h1 && h1.textContent) {
      return h1.textContent.trim();
    }

    // Fallback to document title
    const title = document.title;
    if (title && title !== 'Google Maps') {
      // Remove " - Google Maps" from the end
      return title.replace(/\s*-\s*Google Maps$/i, '').trim();
    }

    return "Analyzing Menu";
  }

  function injectButton() {
    const menuDiv = getMenuRoot();
    if (!menuDiv) return false;

    const headerDiv = menuDiv.querySelector("div");
    if (!headerDiv) return false;

    const headerText = (headerDiv.innerText || headerDiv.textContent || "").toLowerCase();
    if (!headerText.includes("menu")) return false;

    if (document.getElementById(BTN_ID)) return true;

    headerDiv.style.display = "grid";
    headerDiv.style.gridTemplateColumns = "1fr 1fr";
    headerDiv.style.alignItems = "center";

    const btn = document.createElement("button");
    btn.id = BTN_ID;
    btn.className = BTN_ID;
    btn.textContent = "Can I Eat Here?";
    btn.onclick = function () {
      // Open the extension's popup page and navigate to /results
      chrome.runtime.sendMessage({
        type: "OPEN_POPUP",
        route: "#/results"
      });
    };

    headerDiv.appendChild(btn);
    return true;
  }

  // Allow the background service worker to request the current menu images
  if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.onMessage) {
    chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
      if (msg && msg.type === "REQUEST_MENU_IMAGES") {
        try {
          // Refresh from DOM to make sure we have the latest
          menuImageLinks = grabMenuImages();
          // Keep background listeners in sync (optional but nice)
          sendMenuImagesToBackground(menuImageLinks);
          sendResponse({ images: menuImageLinks });
        } catch (_e) {
          sendResponse({ images: [] });
        }
        // Synchronous response
        return false;
      }

      if (msg && msg.type === "ADD_RESTAURANT") {
        if (ns.addRestaurant) {
          const restaurantName = msg.restaurantName || getRestaurantName();
          const state = msg.state || "loading";
          ns.addRestaurant(restaurantName, state);
        }
        return false;
      }

      if (msg && msg.type === "UPDATE_RESTAURANT_STATE") {
        if (ns.updateRestaurantState && msg.restaurantName) {
          ns.updateRestaurantState(msg.restaurantName, msg.state || "success");
        }
        return false;
      }

      if (msg && msg.type === "REMOVE_RESTAURANT") {
        if (ns.removeRestaurant && msg.restaurantName) {
          ns.removeRestaurant(msg.restaurantName);
        }
        return false;
      }

      if (msg && msg.type === "SHOW_RESTAURANT_LOADING") {
        if (ns.addRestaurant) {
          const restaurantName = msg.restaurantName || getRestaurantName();
          const state = msg.state || "loading";
          ns.addRestaurant(restaurantName, state);
        }
        return false;
      }

      if (msg && msg.type === "HIDE_RESTAURANT_LOADING") {
        if (ns.clearAllRestaurants) {
          ns.clearAllRestaurants();
        }
        return false;
      }

      // let other listeners run
      return undefined;
    });
  }
})(self);
