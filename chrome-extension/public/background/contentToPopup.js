import { broadcastToPopups } from "./ports.js";

function notifyMenuImages(images) {
  broadcastToPopups({
    type: "MENU_IMAGES_PUSH",
    images: Array.isArray(images) ? images : [],
  });
}

function notifyRestaurantInfo(restaurant) {
  broadcastToPopups({
    type: "RESTAURANT_INFO_PUSH",
    restaurant: restaurant ?? null,
  });
}

// Receive updates from content scripts
export function initContentToPopup({ openPopupWithRoute }) {
  chrome.runtime.onMessage.addListener((msg, _sender, _sendResponse) => {
    switch (msg?.type) {
      case "MENU_IMAGES_UPDATE": {
        const images = Array.isArray(msg.images) ? msg.images : [];
        notifyMenuImages(images);
        break;
      }

      case "RESTAURANT_INFO_UPDATE": {
        // sent by ns.sendRestaurantInfoToBackground() in restaurant.js
        notifyRestaurantInfo(msg.restaurant ?? null);
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
}
