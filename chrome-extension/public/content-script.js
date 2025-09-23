// Script to run on google maps
// if the dom of the visiable page change (or the page changes)
// then we emit an event, we can use this to know when we are looking
// at a restrant and also if the menu tab is open

(() => {
  // Only run in the top page to avoid duplicate alerts
  if (window.top !== window) return;

  const BTN_ID = "allergen-detector-btn"; // presence-by-ID guard

  // ============================================
  //  State trackers to detect changes
  // ============================================
  
  // used to see if the user is selected on smth, if not just grab body
  function getTarget() {
    return document.querySelector('#pane') ||
      document.querySelector('[role="main"]') ||
      document.body;
  }

  // Build a dom state tracker over the whole page
  function buildSignature() {
    const href = location.href;

    const t = getTarget();
    const text = (t?.innerText || "").trim();
    const len = text.length;

    // also grab specific ui elements
    const h1 = t?.querySelectorAll('h1, [role="heading"][aria-level="1"]').length || 0;
    const tabs = t?.querySelectorAll('[role="tab"]').length || 0;
    const buttons = t?.querySelectorAll('button').length || 0;
    const lists = t?.querySelectorAll('ul, ol').length || 0;

    // resist tiny edits/noise
    const head = text.slice(0, 200);
    const tail = text.slice(-200);

    return JSON.stringify({ href, len, h1, tabs, buttons, lists, head, tail });
  }
  
  // menu tracker for specifically the menu tab
  function getMenuRoot() {
    return document.querySelector('div[aria-label="Menu"]') || null;
  }
  // dom state tracker over just menu
  function buildMenuSignature(root) {
    if (!root) return null;
    const text = (root.innerText || "").trim();
    const len = text.length;
    const childCount = root.children.length;
    const firstChildTag = root.firstElementChild?.tagName || "";
    const head = text.slice(0, 180);
    const tail = text.slice(-180);
    return JSON.stringify({ len, childCount, firstChildTag, head, tail });
  }

  // ============================================
  //  Handle Menu changes when menu is open
  // ============================================
  // Will observe observer values so it only runs when open
  let menuObserver = null;
  let observedMenuRoot = null;
  let lastMenuSig = null;

  function emitMenu(reason) {
    const root = getMenuRoot();
    const sig = buildMenuSignature(root);

    // If Menu disappeared, clear state and stop.
    if (!root || sig === null) {
      lastMenuSig = null;
      return;
    }

    // If nothing changed and button exists, do nothing.
    if (sig === lastMenuSig && document.getElementById(BTN_ID)) {
      return;
    }

    // Update signature and ensure injection by presence-by-ID
    lastMenuSig = sig;
    if (!document.getElementById(BTN_ID)) {
      injectButton();
    }
  }

  // Attach/detach the Menu-only observer based on whether Menu is open
  function attachMenuObserverIfNeeded() {
    const menuRoot = getMenuRoot();
    if (!menuRoot) return detachMenuObserver();

    // If we're already observing THIS root, keep it.
    if (menuObserver && observedMenuRoot === menuRoot) return;

    // menuRoot changed (Maps re-rendered) → reattach
    detachMenuObserver();

    menuObserver = new MutationObserver(
      debounce(() => emitMenu('menu-mutation'), 120)
    );
    menuObserver.observe(menuRoot, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true
    });
    observedMenuRoot = menuRoot;
    lastMenuSig = null;         // force a fresh read
    emitMenu('menu-attach');    // do an immediate pass
  }

  function detachMenuObserver() {
    if (menuObserver) {
      menuObserver.disconnect();
      menuObserver = null;
    }
    observedMenuRoot = null;
    lastMenuSig = null;
  }

  // ============================================
  //  Handle page changes (activates menu observer)
  // ============================================

  // Allows for mutliple changes (temporally close to each other) to be listed as one
  // so there isnt multiple calls on a series of changes
  const debounce = (fn, ms) => {
    let id = 0;
    return (...args) => {
      clearTimeout(id);
      id = setTimeout(() => fn(...args), ms);
    };
  };

  let lastSig = null;

  // emit for entire page readding1
  function emit(reason) {
    const sig = buildSignature();
    if (sig !== lastSig) {
      lastSig = sig;

      // if not menu page, remove menu observer
      if (!isMenuTabSelected()) {
        detachMenuObserver();
        return;
      }

      // if menu, start tracking menu changes
      attachMenuObserverIfNeeded();
      emitMenu('from-emit');
    }
  }

  function injectButton() {
    const menuDiv = getMenuRoot();
    if (!menuDiv) return false;

    // grab the first inner div (this wraps the h2 Menu heading)
    const headerDiv = menuDiv.querySelector("div");
    if (!headerDiv) return false;

    // check if it's the correct menu page
    const headerText = (headerDiv.innerText || headerDiv.textContent || "").toLowerCase();
    if (!headerText.includes("menu")) {
      return false;
    }


    // avoid duplicates (id guard)
    if (document.getElementById(BTN_ID)) return true;

    // apply grid layout: 2 equal columns
    headerDiv.style.display = "grid";
    headerDiv.style.gridTemplateColumns = "1fr 1fr";
    headerDiv.style.alignItems = "center";

    // create button
    const btn = document.createElement("button");
    btn.id = BTN_ID; // id so we can presence-check via getElementById
    btn.className = BTN_ID; // class name most likely weill stay same same as btn id
    btn.textContent = "Can I Eat Here?";
    btn.onclick = () => {
      // alert("Button was clicked!");
      const menu = document.querySelector('div[aria-label="Menu"]');
      const carousel = menu.querySelector('div[aria-roledescription="carousel"]');

      const imageLinks = Array.from(
        carousel.querySelectorAll('img')
      ).map(img => img.src);

      console.log(imageLinks);
      alert(imageLinks);

    };

    // place button in second grid column
    headerDiv.appendChild(btn);

    return true;
  }

  // first time run (delayed)
  setTimeout(() => {
    emit("initial");

    // Observe broad DOM mutations; debounce to reduce spam.
    const observer = new MutationObserver(
      debounce(() => emit('dom-mutation'), 200)
    );

    // Observe the whole document: Maps re-parents nodes frequently.
    observer.observe(document.documentElement, {
      subtree: true,
      childList: true,
      characterData: true,
      attributes: true
    });

    // emit on coming back to the tab
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') emit('visible');
    });

    // Fallback: periodic check in case some changes dodge MutationObserver (rare).
    const poll = setInterval(() => emit('poll'), 1000);

    // Clean up if page unloads
    window.addEventListener('beforeunload', () => {
      observer.disconnect();
      detachMenuObserver();
      clearInterval(poll);
    });
  }, 2000);

  // check if the menu is open so we can inject if it is
  function isMenuTabSelected() {
    // Most reliable: if the Menu region exists, it's open
    if (getMenuRoot()) return true;

    // Otherwise, check for a "Menu" tab and selection state
    const menuBtn =
      document.querySelector('[role="tab"][aria-selected][aria-label="Menu"]') ||
      [...document.querySelectorAll('[role="tab"]')]
        .find(el => el.textContent.trim() === "Menu");

    if (!menuBtn) return false;
    return menuBtn.getAttribute("aria-selected") === "true";
  }
})();
