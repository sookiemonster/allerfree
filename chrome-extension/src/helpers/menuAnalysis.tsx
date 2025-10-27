import { transformUrl, convertUrlsToBase64 } from "../helpers/helperBase64";

type ImagePayload = { base64: string; mime_type: string };
import type { ApiProfile } from "./profileFormat";

export async function buildMenuAnalysisStringResponse(
  pImages: string[] = [],
  pProfiles: ApiProfile[]
) {
  try {
    const urls = pImages
      .map(transformUrl)
      .filter((u): u is string => Boolean(u));
    const dataUrls = await convertUrlsToBase64(urls);
    const images: ImagePayload[] = dataUrls.map(splitDataUrl);

    const result = await postDataToLocalhost(images, pProfiles);
    return result;
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return `Error creating Analysis Response: ${msg}`;
  }
}

// Convert "data:<mime>;base64,<payload>" → { base64, mime_type }
function splitDataUrl(dataUrl: string): ImagePayload {
  const out: ImagePayload = { base64: "", mime_type: "" };
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

async function postDataToLocalhost(
  pImages: ImagePayload[],
  pProfiles: ApiProfile[]
) {
  try {
    const tokenData = await getToken();

    const url = "http://localhost:8081/detect";

    const postData = {
      images: pImages,
      profiles: pProfiles,
    };
    console.log("Sending: ", postData);

    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: tokenData["type"] + " " + tokenData["token"],
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`
      );
    }

    let data = await response.json();
    console.log("Server response:", data);

    if (typeof data === "string") {
      data = JSON.parse(data);
    }

    return data;
  } catch (error) {
    console.error("Error posting data:", error);
  }
}

async function getToken() {
  try {
    const url = "http://localhost:8081/requestToken";

    const response = await fetch(url, {
      method: "POST",
    });

    if (!response.ok) {
      throw new Error(
        `HTTP error! Status: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error posting data:", error);
  }
}
