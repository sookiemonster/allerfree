// DOM lookups (classic script)
(function (g) {
  const ns = (g.__allerfree ||= {});

  ns.getTarget = function () {
    return (
      document.querySelector('#pane') ||
      document.querySelector('[role="main"]') ||
      document.body
    );
  };

  ns.getMenuRoot = function () {
    return document.querySelector('div[aria-label="Menu"]') || null;
  };

  ns.getCarousel = function (root) {
    if (!root) return null;
    return root.querySelector('div[aria-roledescription="carousel"]') || null;
  };
})(self);
