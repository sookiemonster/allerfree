import { useEffect, useRef, useState } from "react";
import { buildMenuAnalysisStringResponse } from "../helpers/menuAnalysis";
import { buildMenuAnalysisStringResponseForNames } from "../helpers/menuAnalysis";
import { getAllProfiles } from "../helpers/profiles";
import type { ProfilesMap } from "../types/profiles";

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
    const [analysisText, setAnalysisText] = useState<any>("");
    const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

	const [profiles, setProfiles] = useState<ProfilesMap>({});
    const [selected, setSelected] = useState<Set<string>>(new Set());

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

	useEffect(() => {
        (async () => {
            const all = await getAllProfiles();
            setProfiles(all);
            
            setSelected(prev => {
                const next = new Set<string>();
                for (const k of prev) if (k in all) next.add(k);
                return next;
            });
        })();
    }, []);

    const getMenuAnalysisAll = async (): Promise<void> => {
        setIsAnalyzing(true);
        try {
            const result = await buildMenuAnalysisStringResponse(images);
            const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
            setAnalysisText(text);
            setIsResults(true);
        } catch (err) {
            console.error("analyze (all) failed:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };
	
	const getMenuAnalysisForSelected = async (): Promise<void> => {
        setIsAnalyzing(true);
        try {
            const names = Array.from(selected);
            const result = await buildMenuAnalysisStringResponseForNames(images, names);
            const text = typeof result === "string" ? result : JSON.stringify(result, null, 2);
            setAnalysisText(text);
            setIsResults(true);
        } catch (err) {
            console.error("analyze (selected) failed:", err);
        } finally {
            setIsAnalyzing(false);
        }
    };

	const toggleSelection = (name: string) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    };

	const names = Object.keys(profiles);

    const canAnalyzeCommon = !!portRef.current && images.length > 0 && !isAnalyzing;
    const canAnalyzeSelected = canAnalyzeCommon && selected.size > 0;

    return (
        <>
            <NavToggle isResults={isResults} onToggle={toggle} />

            {isResults ? <h1>Results</h1> : <h1>Start Analysis Process</h1>}

            {!isResults && (
                <div style={{ padding: 12, display: "grid", gap: 12 }}>
                    {/* Analyze ALL profiles */}
                    <div
                        style={{
                            display: "flex",
                            gap: 8,
                            alignItems: "center",
                        }}
                    >
                        <button
                            onClick={getMenuAnalysisAll}
                            disabled={!canAnalyzeCommon}
                            aria-busy={isAnalyzing}
                            title={images.length === 0 ? "No menu images found" : undefined}
                        >
                            {isAnalyzing ? "Analyzing…" : "Analyze Menus ~ All Profiles"}
                        </button>
                        <span style={{ fontSize: 12, color: "#555" }}>
                            Menus found: {images.length}
                        </span>
                    </div>

                    {/* Checklist of profiles + analyze selected */}
                    <div style={{ paddingTop: 12 }}>
                        <h2 style={{ marginBottom: 6, color: "#555", fontSize: 12 }}>
							{names.length === 0 ? "No profiles found." : "Select profiles to analyze:"}
						</h2>

                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                            {names.map((name) => (
                                <li key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                    <input
                                        id={`prof-${name}`}
                                        type="checkbox"
                                        checked={selected.has(name)}
                                        onChange={() => toggleSelection(name)}
                                    />
                                    <label htmlFor={`prof-${name}`} style={{ cursor: "pointer" }}>
                                        {name}
                                    </label>
                                </li>
                            ))}
                        </ul>

                        <div style={{ marginTop: 10 }}>
                            <button
                                onClick={getMenuAnalysisForSelected}
                                disabled={!canAnalyzeSelected}
                                aria-busy={isAnalyzing}
                                title={
                                    selected.size === 0
                                        ? "Select at least one profile"
                                        : images.length === 0
                                        ? "No menu images found"
                                        : undefined
                                }
                            >
                                {isAnalyzing ? "Analyzing…" : "Analyze Menus ~ Selected Profiles"}
                            </button>
                            <span style={{ marginLeft: 8, fontSize: 12, color: "#555" }}>
                                Selected: {selected.size}
                            </span>
                        </div>
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
