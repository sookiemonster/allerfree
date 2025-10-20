// Single-source-of-truth for latest menu images
let _latestImages = [];

/** Get the current latest images array */
export function getLatestImages() {
  return _latestImages;
}

/** Set/replace latest images (normalizes to an array) */
export function setLatestImages(images) {
  _latestImages = Array.isArray(images) ? images : [];
  return _latestImages;
}
