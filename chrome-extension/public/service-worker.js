// service-worker.js  

// Minimal "latest only" state
let latestImages = [];

// Notify all connected popups
const popupPorts = new Set();
function notifyPopups() {
  const payload = { type: "MENU_IMAGES_PUSH", images: latestImages };
  for (const port of popupPorts) {
    try { port.postMessage(payload); } catch {}
  }
}

// Receive updates from content scripts
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  if (msg?.type === "MENU_IMAGES_UPDATE") {
    latestImages = Array.isArray(msg.images) ? msg.images : [];
    notifyPopups();
  }
  return false; // no async sendResponse
});

// Popup connections
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "popup") return;
  popupPorts.add(port);

  port.onMessage.addListener((msg) => {
    if (msg?.type === "GET_MENU_IMAGES") {
      port.postMessage({ type: "MENU_IMAGES_RESULT", images: latestImages });
    }
  });

  port.onDisconnect.addListener(() => popupPorts.delete(port));
});
