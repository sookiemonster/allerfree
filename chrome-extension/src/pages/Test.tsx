import { useEffect, useState } from "react";

type PushMsg = { type: "MENU_IMAGES_PUSH"; images: string[] };
type GetResult = { type: "MENU_IMAGES_RESULT"; images: string[] };

export default function Popup() {
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });

    port.onMessage.addListener((msg: PushMsg | GetResult) => {
      if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
        setImages(Array.isArray(msg.images) ? msg.images : []);
      }
    });

    // Ask for the current snapshot immediately
    port.postMessage({ type: "GET_MENU_IMAGES" });

    return () => { try { port.disconnect(); } catch {} };
  }, []);

  return (
    <div style={{ padding: 12 }}>
      <div style={{ fontWeight: 600, marginBottom: 6 }}>
        {images.length} menu images detected
      </div>
      <ul>
        {images.map((u, i) => {
            const transformed = transformUrl(u);
            return (
            <li key={i} style={{ marginBottom: 4, wordBreak: "break-all" }}>
                {transformed}
                <img
                    src={transformed}
                />
            </li>
            );
        })}
        </ul>

    </div>
  );
}

function transformUrl(url: string): string {
  const idx = url.lastIndexOf("w");
  if (idx === -1) {
    return url; // no "W", return as-is
  }
  return url.slice(0, idx) + "w720";
}
