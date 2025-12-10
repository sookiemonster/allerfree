import { useEffect, useMemo, useRef, useState } from "react";
// import { buildMenuAnalysisStringResponse } from "../helpers/menuAnalysis";
import type { DetectionResult } from "../types";
import DetectionResultPane from "../components/DetectionResult/DetectionResultPane";

import { useProfiles } from "../contexts/ProfileContext";
import { ctxProfilesToApi } from "../helpers/profileFormat";

import "./Results.css";

type PushMsg = { type: "MENU_IMAGES_PUSH"; images: string[] };
type GetResult = { type: "MENU_IMAGES_RESULT"; images: string[] };

function MiniNav({
  isResults,
  onToggle,
}: {
  isResults: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={
        "results-nav-mini " +
        (isResults ? "results-nav-mini--left" : "results-nav-mini--right")
      }
    >
      <button className="nav-link" onClick={onToggle}>
        {isResults ? (
          <>
            <span className="nav-link__arrow">←</span>
            <span>Back to Analysis</span>
          </>
        ) : (
          <>
            <span>Go to Results</span>
            <span className="nav-link__arrow">→</span>
          </>
        )}
      </button>
    </div>
  );
}

export default function Results() {
  const portRef = useRef<chrome.runtime.Port | null>(null);
  // const [tabId, setTabId] = useState<number | null>(null);
  const [isResults, setIsResults] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [detection_result, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Profiles from Context → API shape
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
      if (
        msg.type === "MENU_IMAGES_PUSH" ||
        msg.type === "MENU_IMAGES_RESULT"
      ) {
        console.log( msg.images ?  msg.images : [] )
        setImages(Array.isArray(msg.images) ? msg.images : []);
      }
    });

    // fetch images based on tab this pop up is on
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const active = tabs[0];
      const id = active?.id ?? null;
      // setTabId(id);

      port.postMessage({
        type: "GET_MENU_IMAGES",
        tabId: id ?? undefined,
      } as any);
    });


    return () => {
      try {
        port.disconnect();
      } catch {}
    };
  }, []);

  const toggle = () => setIsResults((v) => !v);

  const getMenuAnalysisAll = () => {
    if (!portRef.current) {
      console.warn("[Allerfree] No popup port; cannot start analysis");
      return;
    }

    // Optional: you can still set a spinner here if you want,
    // but since we're not handling results yet, you might leave it alone
    // setIsAnalyzing(true);

    try {
      portRef.current.postMessage({
        type: "START_ANALYSIS",
        profiles: apiProfiles,
      } as any);
      console.log("[Allerfree] START_ANALYSIS (all) sent");
    } catch (err) {
      console.error("START_ANALYSIS (all) failed:", err);
      // setIsAnalyzing(false);
    }
  };

  const getMenuAnalysisForSelected = () => {
    if (!portRef.current) {
      console.warn("[Allerfree] No popup port; cannot start analysis");
      return;
    }

    const chosen = new Set(selected);
    const filtered = apiProfiles.filter((p) => chosen.has(p.name));

    try {
      portRef.current.postMessage({
        type: "START_ANALYSIS",
        profiles: filtered,
      } as any);
      console.log("[Allerfree] START_ANALYSIS (selected) sent");
    } catch (err) {
      console.error("START_ANALYSIS (selected) failed:", err);
    }
  };


  const toggleSelection = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const canAnalyzeCommon =
    !!portRef.current && images.length > 0 && !isAnalyzing;
  const canAnalyzeSelected = canAnalyzeCommon && selected.size > 0;

  return (
    <div className="results-root">
      <MiniNav isResults={isResults} onToggle={toggle} />

      {/* ANALYSIS VIEW (peach themed) */}
      {!isResults && (
        <div className="results-panel">
          {/* Menus count + Analyze All */}
          <div className="results-row">
            <div>
              <div className="results-title">Menus found</div>
              <div className="results-muted">{images.length}</div>
            </div>
            <button
              className="btn"
              onClick={getMenuAnalysisAll}
              disabled={!canAnalyzeCommon}
              aria-busy={isAnalyzing}
              title={images.length === 0 ? "No menu images found" : undefined}
            >
              {isAnalyzing ? "Analyzing…" : "Analyze All"}
            </button>
          </div>

          {/* Brown divider to separate sections */}
          <div className="results-divider" />

          {/* Analyze selected profiles */}
          <div className="results-section">
            <div className="results-title">Analyze selected profiles</div>

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
                    <label className="clickable" htmlFor={`prof-${name}`}>
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
                {isAnalyzing ? "Analyzing…" : "Analyze Selected"}
              </button>
              <span className="results-muted">Selected: {selected.size}</span>
            </div>
          </div>
        </div>
      )}

      {/* RESULTS VIEW (unchanged layout, just the tiny nav above) */}
      {isResults && detection_result && (
        <DetectionResultPane detection_result={detection_result} />
      )}
    </div>
  );
}
