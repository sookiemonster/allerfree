// helperBase64.ts

/** Branded type to represent a data URL string */
export type DataUrl = string & { __brand: "DataUrl" };

/**
 * Replace the tail starting at the last "w" with "w720".
 * If there is no "w" in the string, returns the original URL.
 */
export function transformUrl(url: string): string {
  const idx = url.lastIndexOf("w");
  if (idx === -1) return url;
  return url.slice(0, idx) + "w720";
}

/**
 * Fetch an array of image URLs and return them as data URLs (base64).
 */
export async function convertUrlsToBase64(
  urls: readonly string[],
  opts?: { signal?: AbortSignal }
): Promise<DataUrl[]> {
  const results: DataUrl[] = [];
  for (const url of urls) {
    if (!url) continue;

    const res = await fetch(url, { signal: opts?.signal });
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);

    const blob = await res.blob();
    const dataUrl = await blobToDataUrl(blob);
    results.push(dataUrl);
  }
  return results;
}

/** Convert a Blob to a data URL string (e.g., "data:image/jpeg;base64,..."). */
export function blobToDataUrl(blob: Blob): Promise<DataUrl> {
  return new Promise<DataUrl>((resolve, reject) => {
    const fr = new FileReader();
    fr.onload = () => resolve(fr.result as string as DataUrl);
    fr.onerror = () =>
      reject(fr.error ?? new Error("FileReader failed to read blob as data URL"));
    fr.readAsDataURL(blob);
  });
}
