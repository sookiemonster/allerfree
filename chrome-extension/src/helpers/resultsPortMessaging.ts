// src/helpers/resultsPortMessaging.ts
import type {
  ResultsPortInboundMessage,
  ResultsPortOutboundMessage,
} from "../types/ResultsMessages";
import type { ApiProfile } from "./profileFormat";

export type ResultsPort = chrome.runtime.Port;

/** Connect to the service worker port used by the popup. */
export function connectResultsPort(
  onMessage: (msg: ResultsPortInboundMessage) => void
): ResultsPort {
  const port = chrome.runtime.connect({ name: "popup" });

  port.onMessage.addListener((msg: ResultsPortInboundMessage) => {
    onMessage(msg);
  });

  return port;
}

/** Best-effort disconnect (avoid throwing in cleanup). */
export function disconnectResultsPort(port: ResultsPort | null) {
  if (!port) return;
  try {
    port.disconnect();
  } catch {
    // ignore
  }
}

/** Resolve tabId: prefer explicit tabId, otherwise active tab in current window. */
export function getActiveTabId(): Promise<number | undefined> {
  return new Promise((resolve) => {
    try {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const id = tabs?.[0]?.id;
        resolve(typeof id === "number" ? id : undefined);
      });
    } catch {
      resolve(undefined);
    }
  });
}

function post(port: ResultsPort, msg: ResultsPortOutboundMessage) {
  try {
    port.postMessage(msg);
  } catch {
    // ignore
  }
}

export function requestMenuImages(port: ResultsPort, tabId?: number) {
  post(port, { type: "GET_MENU_IMAGES", tabId });
}

export function requestRestaurantInfo(port: ResultsPort, tabId?: number) {
  post(port, { type: "GET_RESTAURANT_INFO", tabId });
}

/**
 * Request initial data. If tabId not provided, it uses the active tab.
 */
export async function requestInitialResultsData(port: ResultsPort, tabId?: number) {
  const resolvedTabId = typeof tabId === "number" ? tabId : await getActiveTabId();
  requestMenuImages(port, resolvedTabId);
  requestRestaurantInfo(port, resolvedTabId);
}

export function startAnalysis(port: ResultsPort, profiles: ApiProfile[]) {
  post(port, { type: "START_ANALYSIS", profiles });
}
