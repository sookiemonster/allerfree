// test function to put an alert on the page
async function injectAlert(tabId, message = "Hello from extension!") {
  if (!tabId) return;
  try {
    await chrome.scripting.executeScript({
      target: { tabId },
      func: (msg) => alert(msg),
      args: [message]
    });
  } catch (e) {
    console.warn("Injection failed:", e);
  }
}

// // First install or reload
// chrome.runtime.onInstalled.addListener(async () => {
//   const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
//   if (tab?.id) injectAlert(tab.id, "Extension installed/reloaded!");
// });

// Tab finished loading
chrome.tabs.onUpdated.addListener(async (tabId, info) => {
  if (info.status === "complete" && await isGoogleMapsTab(tabId)) {
    injectAlert(tabId, "Tab finished loading!");
  }
});

async function isGoogleMapsTab(tabId) {
  try {
    const tab = await chrome.tabs.get(tabId);
    return (
      tab?.url &&
      tab.url.startsWith("https://www.google.") &&
      tab.url.includes("/maps")
    );
  } catch {
    return false;
  }
}


// // alert
// chrome.tabs.onActivated.addListener(({ tabId }) => {
//   injectAlert(tabId, "You switched to a new tab!");
// });
