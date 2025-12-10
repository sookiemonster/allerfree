// service-worker.js  
import { openPopupWithRoute } from "./resultsPopupUtils.js";

// Notify all connected popups
const popupPorts = new Set();
/** Broadcast a snapshot of images to all connected popups. */
function notifyPopups(images) {
  const payload = {
    type: "MENU_IMAGES_PUSH",
    images: Array.isArray(images) ? images : [],
  };
  for (const port of popupPorts) {
    try {
      port.postMessage(payload);
    } catch {
      // ignore broken ports
    }
  }
}

/** Ask a specific tab's content script for its current menu images. */
function fetchMenuImagesFromTab(tabId, done) {
  try {
    chrome.tabs.sendMessage(
      tabId,
      { type: "REQUEST_MENU_IMAGES" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            " REQUEST_MENU_IMAGES failed:",
            chrome.runtime.lastError,
          );
          done([]);
          return;
        }

        const images = Array.isArray(response?.images) ? response.images : [];
        done(images);
      },
    );
  } catch (err) {
    console.error(" Failed to send REQUEST_MENU_IMAGES:", err);
    done([]);
  }
}

/** Resolve a tab id: prefer explicit msg.tabId; otherwise use active tab. */
function resolveTabIdMaybe(tabId, cb) {
  if (typeof tabId === "number") {
    cb(tabId);
    return;
  }

  chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
    const activeId = tabs && tabs.length > 0 ? tabs[0].id : undefined;
    cb(typeof activeId === "number" ? activeId : undefined);
  });
}

// Receive updates from content scripts
chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
  switch (msg?.type) {
    case "MENU_IMAGES_UPDATE": {
      const images = Array.isArray(msg.images) ? msg.images : [];
      notifyPopups(images);
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
        resolveTabIdMaybe(msg.tabId, (tabId) => {
          if (typeof tabId !== "number") {
            port.postMessage({
              type: "MENU_IMAGES_RESULT",
              images: [],
            });
            return;
          }

          fetchMenuImagesFromTab(tabId, (images) => {
            port.postMessage({
              type: "MENU_IMAGES_RESULT",
              images,
            });
          });
        });
        break;
      }
      case "START_ANALYSIS": {
          const profiles = Array.isArray(msg.profiles) ? msg.profiles : [];

          // use the active tab in the current window.
          chrome.tabs.query(
            { active: true, currentWindow: true },
            (tabs) => {
              const tab = tabs[0];
              if (!tab || typeof tab.id !== "number") {
                console.warn(
                  "[Allerfree] START_ANALYSIS: no active tab found"
                );
                return;
              }

              try {
                chrome.tabs.sendMessage(tab.id, {
                  type: "start-analysis",
                  profiles,
                });
              } catch (err) {
                console.error(
                  "[Allerfree] Failed to send start-analysis message:",
                  err
                );
              }
            }
          );
          break;
        }

      default:
        // no-op for unknown message types
        break;
    }
  });

  port.onDisconnect.addListener(() => popupPorts.delete(port));
});