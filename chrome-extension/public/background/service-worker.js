import { openPopupWithRoute } from "./resultsPopupUtils.js";
import { initContentToPopup } from "./contentToPopup.js";
import { initPopupToContent } from "./popupToContent.js";

// content script -> service worker -> popup (push updates, open popup)
initContentToPopup({ openPopupWithRoute });

// popup -> service worker -> content script (GET_* requests, START_ANALYSIS)
initPopupToContent();