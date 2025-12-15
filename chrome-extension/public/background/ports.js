// Notify all connected popups
export const popupPorts = new Set();

export function addPopupPort(port) {
  popupPorts.add(port);

  port.onDisconnect.addListener(() => {
    popupPorts.delete(port);
  });
}

export function broadcastToPopups(payload) {
  for (const port of popupPorts) {
    try {
      port.postMessage(payload);
    } catch {
      // ignore broken ports
      popupPorts.delete(port);
    }
  }
}
