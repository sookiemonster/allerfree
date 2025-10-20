// menuAnalysis.js
import { getAllSampleProfileData } from "./profileData.js";
import { getLatestImages } from "./menuState.js";
import { transformUrl, convertUrlsToBase64 } from "./helperBase64.js";

export async function buildMenuAnalysisStringResponse() {
  try {
    const profileData = getAllSampleProfileData();

    const toConvert = (getLatestImages() || [])
              .map(transformUrl)
              .filter(Boolean);

    // const blobData = convertUrlsToBase64(toConvert);

    const dataUrls = await convertUrlsToBase64(toConvert);
    const base64 = dataUrls.map(stripDataUrlPrefix);

    return JSON.stringify(base64, null, 2);
    return JSON.stringify(profileData, null, 2);
  } catch (e) {
    return `Error creating Analysis Response: ${e?.message || String(e)}`;
  }
}


function stripDataUrlPrefix(dataUrl) {
  if (typeof dataUrl !== "string") return "";
  const i = dataUrl.indexOf(",");
  return i >= 0 ? dataUrl.slice(i + 1) : dataUrl;
}
