// Replace the tail starting at the last "w" with "w720"
export function transformUrl(url) {
  const idx = url.lastIndexOf("w");
  if (idx === -1) return url;        // no "w", keep as-is
  return url.slice(0, idx) + "w720";
}


// Helper: takes the array of urls and returns them as file data
export async function convertUrlsToBase64(urls) {
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