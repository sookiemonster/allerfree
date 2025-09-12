// // test function to put an alert on the page
// async function injectAlert(tabId, message = "Hello from extension!") {
//   if (!tabId) return;
//   try {
//     await chrome.scripting.executeScript({
//       target: { tabId },
//       func: (msg) => alert(msg),
//       args: [message]
//     });
//   } catch (e) {
//     console.warn("Injection failed:", e);
//   }
// }

// // Tab finished loading
// chrome.tabs.onUpdated.addListener(async (tabId, info) => {
//   if (!(await isGoogleMapsTab(tabId))) {
//     return;
//   }

//   if (info.status !== "complete") {
//     return;
//   }

//   injectAlert(tabId, "Tab finished loading!");
// });

// async function isGoogleMapsTab(tabId) {
//   try {
//     const tab = await chrome.tabs.get(tabId);
//     return (
//       tab?.url &&
//       tab.url.startsWith("https://www.google.") &&
//       tab.url.includes("/maps")
//     );
//   } catch {
//     return false;
//   }
// }