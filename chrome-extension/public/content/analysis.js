// content/analysis.js
// Runs menu-analysis from the content script side.
// Attaches helpers onto the global __allerfree namespace so other
// content scripts (and the devtools console) can call them.
/* global self */

(function (g) {
  const ns = (g.__allerfree ||= {});

  /**
   * Replace the tail starting at the last "w" with "w720".
   * If there is no "w" in the string, returns the original URL.
   */
  function transformUrl(url) {
    if (typeof url !== "string") return "";
    const idx = url.lastIndexOf("w");
    if (idx === -1) return url;
    return url.slice(0, idx) + "w720";
  }

  /**
   * Fetch each URL and convert it to a data URL string
   * (for example: "data:image/jpeg;base64,...").
   */
  async function convertUrlsToBase64(urls) {
    const results = [];
    for (const url of urls) {
      if (!url) continue;

      const res = await fetch(url);
      if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);

      const blob = await res.blob();
      const dataUrl = await blobToDataUrl(blob);
      results.push(dataUrl);
    }
    return results;
  }

  function blobToDataUrl(blob) {
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => resolve(fr.result); // "data:image/jpeg;base64,...."
      fr.onerror = (e) => reject(e);
      fr.readAsDataURL(blob);
    });
  }

  /**
   * Convert "data:<mime>;base64,<payload>" → { base64, mime_type }
   */
  function splitDataUrl(dataUrl) {
    const out = { base64: "", mime_type: "" };
    if (typeof dataUrl !== "string") return out;

    const comma = dataUrl.indexOf(",");
    if (comma < 0) return out;

    const header = dataUrl.slice(0, comma);
    const payload = dataUrl.slice(comma + 1);

    let mime = "";
    if (header.startsWith("data:")) {
      const semi = header.indexOf(";");
      mime = header.slice(5, semi > -1 ? semi : undefined) || "";
    }

    out.base64 = payload;
    out.mime_type = mime;
    return out;
  }

  /**
   * Turn an array of profiles into an object keyed by profile name.
   * { name: "Kyle", ... } → { "Kyle": { ... } }
   */
  function mapProfilesByName(profiles) {
    return (profiles || []).reduce((acc, currentProfile) => {
      if (currentProfile && currentProfile.name) {
        acc[currentProfile.name] = currentProfile;
      }
      return acc;
    }, {});
  }

  async function getToken() {
    try {
      const url = "http://localhost:8081/requestToken";
      const response = await fetch(url, { method: "POST" });

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[Allerfree] Error requesting token:", error);
      throw error;
    }
  }

  async function postDataToLocalhost(pImages, pProfiles) {
    try {
      const tokenData = await getToken();
      // const url = "http://localhost:8081/detect";
      const url = "http://localhost:8081/detectSample";

      const postData = {
        images: pImages || [],
        profiles: mapProfilesByName(pProfiles || []),
      };
      console.log("[Allerfree] Sending to backend:", postData);

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization:
            String(tokenData.type || "") +
            " " +
            String(tokenData.token || ""),
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        throw new Error(
          `HTTP error! Status: ${response.status} ${response.statusText}`
        );
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("[Allerfree] Error posting data:", error);
      throw error;
    }
  }

  /**
   * Core function: takes an array of image URLs and an array of ApiProfile-like
   * objects and returns the backend JSON result.
   *
   * This mirrors src/helpers/menuAnalysis.tsx but runs in the content script.
   */
  ns.buildMenuAnalysisStringResponse = async function (pImages, pProfiles) {
    try {
      const urls = (pImages || [])
        .map(transformUrl)
        .filter(Boolean);

      const dataUrls = await convertUrlsToBase64(urls);
      const images = dataUrls.map(splitDataUrl);

      const result = await postDataToLocalhost(images, pProfiles || []);
      return result;
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[Allerfree] Error creating Analysis Response:", msg);
      throw new Error(`Error creating Analysis Response: ${msg}`);
    }
  };
})(self);
