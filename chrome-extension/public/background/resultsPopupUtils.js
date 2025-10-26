export function openPopupWithRoute(route = "") {
  const popupPath =
    chrome.runtime.getManifest().action?.default_popup || "index.html";
  const finalPopup = `${popupPath}${route || ""}`;

  // Temporarily repoint, open, then reset
  chrome.action.setPopup({ popup: finalPopup });
  chrome.action.openPopup().catch((e) => console.warn("openPopup failed:", e));
  setTimeout(() => chrome.action.setPopup({ popup: popupPath }), 0);
}
