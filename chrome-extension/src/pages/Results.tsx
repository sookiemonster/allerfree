import { useEffect, useRef, useState } from "react";

type PushMsg = { type: "MENU_IMAGES_PUSH"; images: string[] };
type GetResult = { type: "MENU_IMAGES_RESULT"; images: string[] };

function NavToggle({
  isResults,
  onToggle,
}: {
  isResults: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={onToggle}>
        {isResults ? "Go to Start Analysis Process" : "Go to Results"}
      </button>
    </div>
  );
}

function Results() {
	const portRef = useRef<chrome.runtime.Port | null>(null);
  // false = show "Start Analysis Process" first
  const [isResults, setIsResults] = useState<boolean>(false);

  const [images, setImages] = useState<string[]>([]);
  const toggle = () => setIsResults((v) => !v);

	useEffect(() => {
		const port = chrome.runtime.connect({ name: "popup" });
		portRef.current = port;

		port.onMessage.addListener((msg: PushMsg | GetResult ) => {
			if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
				setImages(Array.isArray(msg.images) ? msg.images : []);
			}
		});

		// Ask for the current snapshot immediately
		port.postMessage({ type: "GET_MENU_IMAGES" });

		return () => { try { port.disconnect(); } catch {} };
		}, []);

  
	//   // --- Button handler: ask SW to convert latest images to Base64 ---
	// const handleGetBase64 = () => {
	//   portRef.current?.postMessage({
	//     type: "GET_MENU_IMAGES_BASE64"
	//   } as any);
	// };

  return (
    <>
      <NavToggle isResults={isResults} onToggle={toggle} />
      {/* Always render small navigator to switch views */}
      {isResults ? <h1>Results</h1> : <h1>Start Analysis Process</h1>}

	  <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <button onClick={() => console.log("test btn")} disabled={!portRef.current || images.length === 0}>
          Analyze Menus?
        </button>
        <span style={{ fontSize: 12, color: "#555" }}>
          Number Of Menus Found: {images.length}
        </span>
      </div>
    </div>
    </>
  );


}

export default Results;
