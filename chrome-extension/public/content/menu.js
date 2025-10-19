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
      // const msg = menuImageLinks.length ? menuImageLinks.join("\n") : "(No menu images detected)";
      // alert(msg);
      // console.log("[MenuImages snapshot]", menuImageLinks);

      // The extension's popup page and navigate to /results
    chrome.runtime.sendMessage({
        type: "OPEN_POPUP",
        route: "#/results" 
      });
    };

    headerDiv.appendChild(btn);
    return true;
  }
})(self);
