import { useEffect, useRef, useState } from "react";

type PushMsg = { type: "MENU_IMAGES_PUSH"; images: string[] };
type GetResult = { type: "MENU_IMAGES_RESULT"; images: string[] };
type AnalyzeResult = { type: "ANALYZE_MENU_RESULT"; text?: string };

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

	const [analysisText, setAnalysisText] = useState<string>("");

	useEffect(() => {
		const port = chrome.runtime.connect({ name: "popup" });
		portRef.current = port;

		port.onMessage.addListener((msg: PushMsg | GetResult | AnalyzeResult) => {
			if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
				setImages(Array.isArray(msg.images) ? msg.images : []);
			}

			if (msg.type === "ANALYZE_MENU_RESULT") {
				// allow either { text } or { error }
				if ("error" in msg && msg.error) {
					setAnalysisText(`Error: ${String(msg.error)}`);
				} else {
					const raw = (msg as any).text;
					const safe =
						typeof raw === "string"
							? raw
							: JSON.stringify(raw, null, 2); // ensure it's a string for <pre>{...}
					setAnalysisText(safe || "(no data)");
				}
			}

		});

		// Ask for the current snapshot immediately
		port.postMessage({ type: "GET_MENU_IMAGES" });

		return () => { try { port.disconnect(); } catch {} };
	}, []);
		

  
	const getMenuAnalysis = () => {
    portRef.current?.postMessage({ type: "ANALYZE_MENU_STUB" });
  };

  return (
    <>
      <NavToggle isResults={isResults} onToggle={toggle} />
      {/* Always render small navigator to switch views */}
      {isResults ? <h1>Results</h1> : <h1>Start Analysis Process</h1>}

	  <div style={{ padding: 12 }}>
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 10 }}>
        <button onClick={getMenuAnalysis} disabled={!portRef.current || images.length === 0}>
          Analyze Menus?
        </button>
        <span style={{ fontSize: 12, color: "#555" }}>
          Number Of Menus Found: {images.length}
        </span>
      </div>
    </div>
		{analysisText && (
			<pre
				style={{
					whiteSpace: "pre-wrap",
					marginTop: 12,
					maxHeight: 320,        
					overflowY: "auto",    
					padding: 8,
					borderRadius: 6,
				}}
			>
				{analysisText}
			</pre>
		)}

    </>
  );


}

export default Results;
