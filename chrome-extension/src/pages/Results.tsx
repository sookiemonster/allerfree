import { useEffect, useRef, useState } from "react";
import { buildMenuAnalysisStringResponse } from "../helpers/menuAnalysis";

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
    const [isResults, setIsResults] = useState<boolean>(false);
    const [images, setImages] = useState<string[]>([]);
    const [analysisText, setAnalysisText] = useState<string>("");
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

    const toggle = () => setIsResults((v) => !v);

    useEffect(() => {
        const port = chrome.runtime.connect({ name: "popup" });
        portRef.current = port;

        port.onMessage.addListener((msg: PushMsg | GetResult) => {
            if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
                setImages(Array.isArray(msg.images) ? msg.images : []);
            }
        });

        // Ask for the current snapshot immediately
        port.postMessage({ type: "GET_MENU_IMAGES" });

        return () => {
            try {
                port.disconnect();
            } catch {}
        };
    }, []);

    const getMenuAnalysis = async (): Promise<string | undefined> => {
        setIsAnalyzing(true);
        try {
            const analysis = await buildMenuAnalysisStringResponse(images);
            if (typeof analysis === "string" && analysis.length > 0) {
                setAnalysisText(analysis);
                setIsResults(true); // jump to results on success
            }
            return analysis;
        } catch (err) {
            console.error("getMenuAnalysis failed:", err);
            return undefined;
        } finally {
            setIsAnalyzing(false);
        }
    };

    const disabled = !portRef.current || images.length === 0 || isAnalyzing;

    return (
        <>
            <NavToggle isResults={isResults} onToggle={toggle} />

            {isResults ? <h1>Results</h1> : <h1>Start Analysis Process</h1>}

            {!isResults && (
                <div style={{ padding: 12 }}>
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                            marginBottom: 10,
                        }}
                    >
                        <button onClick={getMenuAnalysis} disabled={disabled} aria-busy={isAnalyzing}>
                            {isAnalyzing ? "Analyzing…" : "Analyze Menus"}
                        </button>
                        <span style={{ fontSize: 12, color: "#555" }}>
                            Number Of Menus Found: {images.length}
                        </span>
                    </div>
                </div>
            )}

            {isResults && analysisText && (
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
