// Grab & de-dupe image URLs from the Menu carousel
(function (g) {
  const ns = (g.__allerfree ||= {});
  const { getMenuRoot, getCarousel } = ns;

  ns.grabMenuImages = function () {
    const root = getMenuRoot();
    if (!root) return [];

    const carousel = getCarousel(root);
    if (!carousel) return [];

    const links = Array.from(carousel.querySelectorAll('img'))
      .map(img => img?.src?.trim())
      .filter(Boolean);

    const seen = new Set();
    const unique = [];
    for (const url of links) {
      if (!seen.has(url)) {
        seen.add(url);
        unique.push(url);
      }
    }
    return unique;
  };
})(self);
