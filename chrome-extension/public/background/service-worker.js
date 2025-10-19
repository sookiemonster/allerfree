// service-worker.js  
import { transformUrl, convertUrlsToBase64 } from "./helperBase64.js";
import { getSampleProfileData } from "./profileData.js";

import { openPopupWithRoute } from "./resultsPopupUtils.js";
import { buildMenuAnalysisStringResponse } from "./menuAnalysis.js";
import { getLatestImages, setLatestImages } from "./menuState.js"; 

// Notify all connected popups
const popupPorts = new Set();
function notifyPopups() {
  const payload = { type: "MENU_IMAGES_PUSH", images: getLatestImages() };
  for (const port of popupPorts) {
    try { port.postMessage(payload); } catch {}
  }
}

// Receive updates from content scripts
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  switch (msg?.type) {
    case "MENU_IMAGES_UPDATE": {
      setLatestImages(Array.isArray(msg.images) ? msg.images : []);
      notifyPopups();
      break;
    }

    // open popup and navigate to results page
    // triggered by "Can I Eat Here?" button
    case "OPEN_POPUP": {
      const route = typeof msg.route === "string" ? msg.route : "";
      openPopupWithRoute(route);
      break;
    }

    default:
      // no-op
      break;
  }

  return false; // no async sendResponse
});

// Popup connections
chrome.runtime.onConnect.addListener((port) => {
  if (port.name !== "popup") return;
  popupPorts.add(port);

  port.onMessage.addListener((msg) => {
    switch (msg?.type) {
      case "GET_MENU_IMAGES": {
        port.postMessage({ type: "MENU_IMAGES_RESULT", images: getLatestImages() });
        break;
      }

      case "GET_MENU_IMAGES_BASE64": {
        const toConvert = (getLatestImages() || [])
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
        break;
      }

      case "GET_SAMPLE_PROFILE_DATA": {
        port.postMessage({
          type: "SAMPLE_PROFILE_DATA_RESULT",
          ...getSampleProfileData(),
        });
        break;
      }

      case "ANALYZE_MENU_STUB": {
        const text = buildMenuAnalysisStringResponse();
        port.postMessage({ type: "ANALYZE_MENU_RESULT", text });
        break;
      }

      default:
        // no-op for unknown message types
        break;
    }
  });

  port.onDisconnect.addListener(() => popupPorts.delete(port));
});
