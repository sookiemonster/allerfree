// menuAnalysis.js
import { getAllSampleProfileData } from "./profileData.js";

export function buildMenuAnalysisStringResponse() {
  try {
    const data = getAllSampleProfileData();
    return JSON.stringify(data, null, 2);
  } catch (e) {
    return `Error creating stub: ${e?.message || String(e)}`;
  }
}
