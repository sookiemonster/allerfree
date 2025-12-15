import { addPopupPort } from "./ports.js";

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

/** Ask a specific tab's content script for its current menu images. */
function fetchMenuImagesFromTab(tabId, done) {
  try {
    chrome.tabs.sendMessage(tabId, { type: "REQUEST_MENU_IMAGES" }, (response) => {
      if (chrome.runtime.lastError) {
        console.warn(" REQUEST_MENU_IMAGES failed:", chrome.runtime.lastError);
        done([]);
        return;
      }

      const images = Array.isArray(response?.images) ? response.images : [];
      done(images);
    });
  } catch (err) {
    console.error(" Failed to send REQUEST_MENU_IMAGES:", err);
    done([]);
  }
}

/** Ask a specific tab's content script for its current restaurant info. */
function fetchRestaurantInfoFromTab(tabId, done) {
  try {
    chrome.tabs.sendMessage(
      tabId,
      { type: "REQUEST_RESTAURANT_INFO" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn(
            " REQUEST_RESTAURANT_INFO failed:",
            chrome.runtime.lastError,
          );
          done(null);
          return;
        }

        done(response?.restaurant ?? null);
      },
    );
  } catch (err) {
    console.error(" Failed to send REQUEST_RESTAURANT_INFO:", err);
    done(null);
  }
}

// Popup connections
export function initPopupToContent() {
  chrome.runtime.onConnect.addListener((port) => {
    if (port.name !== "popup") return;

    addPopupPort(port);

    port.onMessage.addListener((msg) => {
      switch (msg?.type) {
        case "GET_MENU_IMAGES": {
          resolveTabIdMaybe(msg.tabId, (tabId) => {
            if (typeof tabId !== "number") {
              port.postMessage({ type: "MENU_IMAGES_RESULT", images: [] });
              return;
            }

            fetchMenuImagesFromTab(tabId, (images) => {
              port.postMessage({ type: "MENU_IMAGES_RESULT", images });
            });
          });
          break;
        }

        case "GET_RESTAURANT_INFO": {
          resolveTabIdMaybe(msg.tabId, (tabId) => {
            if (typeof tabId !== "number") {
              port.postMessage({
                type: "RESTAURANT_INFO_RESULT",
                restaurant: null,
              });
              return;
            }

            fetchRestaurantInfoFromTab(tabId, (restaurant) => {
              port.postMessage({
                type: "RESTAURANT_INFO_RESULT",
                restaurant: restaurant ?? null,
              });
            });
          });
          break;
        }

        case "START_ANALYSIS": {
          const profiles = Array.isArray(msg.profiles) ? msg.profiles : [];

          // use the active tab in the current window.
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            const tab = tabs[0];
            if (!tab || typeof tab.id !== "number") {
              console.warn("[Allerfree] START_ANALYSIS: no active tab found");
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
                err,
              );
            }
          });
          break;
        }

        default:
          // no-op for unknown message types
          break;
      }
    });
  });
}
