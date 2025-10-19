// service-worker.js  
import { transformUrl, convertUrlsToBase64 } from "./helperBase64.js";
import { getSampleProfileData } from "./profileData.js";

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

     // test calls to see base 64 conversion is working
    if (msg?.type === "GET_MENU_IMAGES_BASE64") {
      const toConvert = (latestImages || [])
      .map(transformUrl)
      .filter(Boolean);

      convertUrlsToBase64(toConvert)
        .then((dataUrls) => {
          port.postMessage({
            type: "MENU_IMAGES_BASE64_RESULT",
            dataUrls,
            count: dataUrls.length
          });
        })
        .catch((err) => {
          port.postMessage({
            type: "MENU_IMAGES_BASE64_RESULT",
            error: err.message
          });
        });
    }

    if (msg?.type === "GET_SAMPLE_PROFILE_DATA") {
        port.postMessage({
          type: "SAMPLE_PROFILE_DATA_RESULT",
          ...getSampleProfileData(),
        });
      }
  });

 

  port.onDisconnect.addListener(() => popupPorts.delete(port));
});

