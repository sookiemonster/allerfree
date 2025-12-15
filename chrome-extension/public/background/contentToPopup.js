import { postToTabPopups } from "./ports.js";

export function initContentToPopup({ openPopupWithRoute }) {
  chrome.runtime.onMessage.addListener((msg, sender) => {
    const tabId = sender?.tab?.id;

    switch (msg?.type) {
      case "MENU_IMAGES_UPDATE": {
        if (typeof tabId === "number") {
          postToTabPopups(tabId, {
            type: "MENU_IMAGES_PUSH",
            images: Array.isArray(msg.images) ? msg.images : [],
          });
        }
        break;
      }

      case "RESTAURANT_INFO_UPDATE": {
        if (typeof tabId === "number") {
          postToTabPopups(tabId, {
            type: "RESTAURANT_INFO_PUSH",
            restaurant: msg.restaurant ?? null,
          });
        }
        break;
      }

      case "OPEN_POPUP": {
        openPopupWithRoute(typeof msg.route === "string" ? msg.route : "");
        break;
      }
    }

    return false;
  });
}
