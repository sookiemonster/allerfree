// Shared helpers + constants (classic script)
(function (g) {
  const ns = (g.__allerfree ||= {});

  ns.BTN_ID = "allergen-detector-btn";

  ns.TIMINGS = {
    initialDelay: 2000,
    pageDebounce: 200,
    menuDebounce: 120,
    poll: 1000,
  };

  ns.debounce = function (fn, ms) {
    let id = 0;
    return function (...args) {
      clearTimeout(id);
      id = setTimeout(() => fn.apply(this, args), ms);
    };
  };

  // Build a dom state tracker over the whole page
  ns.buildSignature = function (getTarget) {
    const href = location.href;

    const t = getTarget();
    const text = (t?.innerText || "").trim();
    const len = text.length;

    const h1 = t?.querySelectorAll('h1, [role="heading"][aria-level="1"]').length || 0;
    const tabs = t?.querySelectorAll('[role="tab"]').length || 0;
    const buttons = t?.querySelectorAll('button').length || 0;
    const lists = t?.querySelectorAll('ul, ol').length || 0;

    const head = text.slice(0, 200);
    const tail = text.slice(-200);

    return JSON.stringify({ href, len, h1, tabs, buttons, lists, head, tail });
  };

  // dom state tracker over just menu
  ns.buildMenuSignature = function (root) {
    if (!root) return null;
    const text = (root.innerText || "").trim();
    const len = text.length;
    const childCount = root.children.length;
    const firstChildTag = root.firstElementChild?.tagName || "";
    const head = text.slice(0, 180);
    const tail = text.slice(-180);
    return JSON.stringify({ len, childCount, firstChildTag, head, tail });
  };

  // to background service worker communication
  ns.sendMenuImagesToBackground = function (images) {
    try {
      chrome.runtime?.sendMessage({
        type: "MENU_IMAGES_UPDATE",
        images,
        url: location.href,
      });
    } catch (_) {}
  };
})(self);
