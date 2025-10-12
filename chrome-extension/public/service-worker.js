// service-worker.js  

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
  });

 

  port.onDisconnect.addListener(() => popupPorts.delete(port));
});

// Replace the tail starting at the last "w" with "w720"
function transformUrl(url) {
  const idx = url.lastIndexOf("w");
  if (idx === -1) return url;        // no "w", keep as-is
  return url.slice(0, idx) + "w720";
}


// Helper: takes the array of urls and returns them as file data
async function convertUrlsToBase64(urls) {
  const results = [];
  for (const url of urls) {
    if (!url) continue;

    // Fetch to grab image data from url
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);

    const blob = await res.blob();

    // Blob to base64 data URL
    const dataUrl = await blobToDataUrl(blob);
    results.push(dataUrl);
  }
  return results;
}

function blobToDataUrl(blob) {
  return new Promise((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result); // e.g., "data:image/jpeg;base64,...."
    fr.onerror = (e) => reject(e);
    fr.readAsDataURL(blob);
  });
}