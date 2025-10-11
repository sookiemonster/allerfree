import { useEffect, useRef, useState } from "react";

type PushMsg = { type: "MENU_IMAGES_PUSH"; images: string[] };
type GetResult = { type: "MENU_IMAGES_RESULT"; images: string[] };

// Base64 data URL type (template literal type)
type Base64DataUrl = `data:${string};base64,${string}`;

// Result coming back from the service worker after conversion
type GetBase64Result =
  | { type: "MENU_IMAGES_BASE64_RESULT"; dataUrls: Base64DataUrl[]; count: number }
  | { type: "MENU_IMAGES_BASE64_RESULT"; error: string };

export default function Popup() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [testBase64, setTestBase64] = useState<boolean>();
  const [dataUrls, setDataUrls] = useState<Base64DataUrl[]>([]);

  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });
    portRef.current = port;

    port.onMessage.addListener((msg: PushMsg | GetResult | GetBase64Result) => {
      if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
        setImages(Array.isArray(msg.images) ? msg.images : []);
      }

      // 
      if (msg.type === "MENU_IMAGES_BASE64_RESULT") {
        if ("error" in msg) {
          setDataUrls([]);
        } else {
          setDataUrls(msg.dataUrls);
          setTestBase64(true); // switch view to show thumbnails
        }
      }
    });

    // Ask for the current snapshot immediately
    port.postMessage({ type: "GET_MENU_IMAGES" });


    setTestBase64(true);


    return () => { try { port.disconnect(); } catch {} };
  }, []);

  
  if(!testBase64) return (
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

    // --- Button handler: ask SW to convert latest images to Base64 ---
  const handleGetBase64 = () => {
    portRef.current?.postMessage({
      type: "GET_MENU_IMAGES_BASE64"
    } as any);
  };

  return (
    <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <button onClick={handleGetBase64} disabled={!portRef.current || images.length === 0}>
          Get Base64
        </button>
        <span style={{ fontSize: 12, color: "#555" }}>
          URLs: {images.length} • Base64: {dataUrls.length}
        </span>
      </div>

      {/* Always show all data URLs as images */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {dataUrls.length === 0 ? (
          <div style={{ color: "#777" }}>No Base64 images yet. Click “Get Base64”.</div>
        ) : (
          dataUrls.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`img-${i}`}
              style={{ maxWidth: 140, maxHeight: 140, borderRadius: 6 }}
            />
          ))
        )}
      </div>
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
