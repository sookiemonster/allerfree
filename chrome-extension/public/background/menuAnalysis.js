// menuAnalysis.js
import { getAllSampleProfileData } from "./profileData.js";
import { getLatestImages } from "./menuState.js";
import { transformUrl, convertUrlsToBase64 } from "./helperBase64.js";

export function buildMenuAnalysisStringResponse() {
  try {
    const profileData = getAllSampleProfileData();

    const toConvert = (getLatestImages() || [])
              .map(transformUrl)
              .filter(Boolean);

    const blobData = convertUrlsToBase64(toConvert);

    return JSON.stringify(profileData, null, 2);
    // return JSON.stringify(blobData, null, 2);
  } catch (e) {
    return `Error creating stub: ${e?.message || String(e)}`;
  }
}
