import { transformUrl, convertUrlsToBase64 } from "../helpers/helperBase64";
import type { ProfilesMap } from "../types/profiles";
import { getAllProfiles } from "../helpers/profiles";

type ImagePayload = { base64: string; mime_type: string };

export async function buildMenuAnalysisStringResponse(pImages: string[] = []) {
    try {
        const urls = pImages.map(transformUrl).filter((u): u is string => Boolean(u));
        const dataUrls = await convertUrlsToBase64(urls); // string[] or DataUrl[]

        const images: ImagePayload[] = dataUrls.map(splitDataUrl);

        const profiles: ProfilesMap = await getAllProfiles();

        return postDataToLocalhost(images, profiles);
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

async function postDataToLocalhost(pImages: ImagePayload[], pProfiles: ProfilesMap) {
    try {
        const url = "http://localhost:8080/detect";

        const postData = {
            images: pImages,
            profiles: pProfiles,
        }
        console.log(postData);

        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(postData),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Server response:", data);
        return data;
    } catch (error) {
        console.error("Error posting data:", error);
    }
}
