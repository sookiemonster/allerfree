import { useEffect, useMemo, useRef, useState } from "react";
import { buildMenuAnalysisStringResponse } from "../helpers/menuAnalysis";
import type { DetectionResult } from "../types";
import DetectionResultPane from "../components/DetectionResult/DetectionResultPane";

import { useProfiles } from "../contexts/ProfileContext";
import { ctxProfilesToApi } from "../helpers/profileFormat";

import "./Results.css";

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
    <div className="results-nav">
      <button className="btn btn--ghost" onClick={onToggle}>
        {isResults ? "Back to Start" : "Go to Results"}
      </button>
    </div>
  );
}

export default function Results() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  const [isResults, setIsResults] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [detection_result, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Profiles from Kelly's profile Context 
  const { profiles } = useProfiles(); // Profile[]
  const apiProfiles = useMemo(() => ctxProfilesToApi(profiles), [profiles]);

  // Selection state by name
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const names = useMemo(() => profiles.map((p) => p.name), [profiles]);

  useEffect(() => {
    setSelected((prev) => {
      const allowed = new Set(names);
      const next = new Set<string>();
      for (const k of prev) if (allowed.has(k)) next.add(k);
      return next;
    });
  }, [names]);

  // Connect to SW for images
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });
    portRef.current = port;

    port.onMessage.addListener((msg: PushMsg | GetResult) => {
      if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
        setImages(Array.isArray(msg.images) ? msg.images : []);
      }
    });

    port.postMessage({ type: "GET_MENU_IMAGES" });

    return () => {
      try {
        port.disconnect();
      } catch {}
    };
  }, []);

  const toggle = () => setIsResults((v) => !v);

  const getMenuAnalysisAll = async () => {
    setIsAnalyzing(true);
    try {
      const result = await buildMenuAnalysisStringResponse(images, apiProfiles);
      setDetectionResult(result as DetectionResult);
      setIsResults(true);
    } catch (err) {
      console.error("analyze (all) failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMenuAnalysisForSelected = async () => {
    setIsAnalyzing(true);
    try {
      const chosen = new Set(selected);
      const filtered = apiProfiles.filter((p) => chosen.has(p.name));
      const result = await buildMenuAnalysisStringResponse(images, filtered);
      setDetectionResult(result as DetectionResult);
      setIsResults(true);
    } catch (err) {
      console.error("analyze (selected) failed:", err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const toggleSelection = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const canAnalyzeCommon = !!portRef.current && images.length > 0 && !isAnalyzing;
  const canAnalyzeSelected = canAnalyzeCommon && selected.size > 0;

  return (
    <div className="results-root">
      <NavToggle isResults={isResults} onToggle={toggle} />

      {!isResults && (
        <div className="results-panel">
          <div className="results-row">
            <div>
              <div className="results-title">Analyze all profiles</div>
              <div className="results-muted">Menus found: {images.length}</div>
            </div>
            <button
              className="btn"
              onClick={getMenuAnalysisAll}
              disabled={!canAnalyzeCommon}
              aria-busy={isAnalyzing}
              title={images.length === 0 ? "No menu images found" : undefined}
            >
              {isAnalyzing ? "Analyzing…" : "Analyze ~ All"}
            </button>
          </div>

          <div className="results-section">
            <div className="results-title" style={{ marginBottom: 8 }}>
              {names.length === 0
                ? "No profiles found"
                : "Analyze selected profiles"}
            </div>

            <ul className="results-list">
              {names.map((name) => {
                const selectedCls = selected.has(name)
                  ? "results-item results-item--selected"
                  : "results-item";
                return (
                  <li key={name} className={selectedCls}>
                    <input
                      id={`prof-${name}`}
                      type="checkbox"
                      checked={selected.has(name)}
                      onChange={() => toggleSelection(name)}
                    />
                    <label
                      htmlFor={`prof-${name}`}
                      style={{ cursor: "pointer", userSelect: "none" }}
                    >
                      {name}
                    </label>
                  </li>
                );
              })}
            </ul>

            <div className="results-footer">
              <button
                className="btn"
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
                {isAnalyzing ? "Analyzing…" : "Analyze ~ Selected"}
              </button>
              <span className="results-muted">Selected: {selected.size}</span>
            </div>
          </div>
        </div>
      )}

      {isResults && detection_result && (
        <DetectionResultPane detection_result={detection_result} />
      )}
    </div>
  );
}
