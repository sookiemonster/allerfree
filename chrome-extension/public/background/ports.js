// public/background/ports.js
export const popupPortsByTabId = new Map(); // tabId -> Set<Port>
const portToTabId = new WeakMap(); // Port -> tabId

export function bindPopupPortToTab(port, tabId) {
  if (typeof tabId !== "number") return;

  const prev = portToTabId.get(port);
  if (typeof prev === "number" && prev !== tabId) {
    const prevSet = popupPortsByTabId.get(prev);
    if (prevSet) {
      prevSet.delete(port);
      if (prevSet.size === 0) popupPortsByTabId.delete(prev);
    }
  }

  portToTabId.set(port, tabId);

  let set = popupPortsByTabId.get(tabId);
  if (!set) {
    set = new Set();
    popupPortsByTabId.set(tabId, set);
  }
  set.add(port);

  port.onDisconnect.addListener(() => {
    const tid = portToTabId.get(port);
    const s = typeof tid === "number" ? popupPortsByTabId.get(tid) : null;
    if (!s) return;
    s.delete(port);
    if (s.size === 0) popupPortsByTabId.delete(tid);
  });
}

export function postToTabPopups(tabId, payload) {
  const set = popupPortsByTabId.get(tabId);
  if (!set) return;

  for (const port of Array.from(set)) {
    try {
      port.postMessage(payload);
    } catch {
      set.delete(port);
    }
  }

  if (set.size === 0) popupPortsByTabId.delete(tabId);
}
