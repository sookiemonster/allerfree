import { useEffect, useMemo, useRef, useState } from "react";
import { buildMenuAnalysisStringResponse } from "../helpers/menuAnalysis";
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

  const getMenuAnalysisAll = async () => {
    setIsAnalyzing(true);

    // Get restaurant name and add to queue
    let restaurantName = "Restaurant";
    chrome.tabs.query({ url: "https://www.google.com/maps/*" }, (tabs) => {
      if (tabs && tabs.length > 0) {
        // Request the restaurant name from content script
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: "ADD_RESTAURANT",
          state: "loading"
        });
      }
    });

    try {
      const result = await buildMenuAnalysisStringResponse(images, apiProfiles);
      setDetectionResult(result);
      setIsResults(true);

      // Update to success state
      chrome.tabs.query({ url: "https://www.google.com/maps/*" }, (tabs) => {
        if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "UPDATE_RESTAURANT_STATE",
            state: "success"
          });

          // Remove after 1.5 seconds
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id!, {
              type: "REMOVE_RESTAURANT"
            });
          }, 1500);
        }
      });
    } catch (err) {
      console.error("analyze (all) failed:", err);

      // Remove restaurant immediately on error
      chrome.tabs.query({ url: "https://www.google.com/maps/*" }, (tabs) => {
        if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "REMOVE_RESTAURANT"
          });
        }
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getMenuAnalysisForSelected = async () => {
    setIsAnalyzing(true);

    // Add restaurant to queue
    chrome.tabs.query({ url: "https://www.google.com/maps/*" }, (tabs) => {
      if (tabs && tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id!, {
          type: "ADD_RESTAURANT",
          state: "loading"
        });
      }
    });

    try {
      const chosen = new Set(selected);
      const filtered = apiProfiles.filter((p) => chosen.has(p.name));
      const result = await buildMenuAnalysisStringResponse(images, filtered);
      setDetectionResult(result);
      setIsResults(true);

      // Update to success state
      chrome.tabs.query({ url: "https://www.google.com/maps/*" }, (tabs) => {
        if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "UPDATE_RESTAURANT_STATE",
            state: "success"
          });

          // Remove after 1.5 seconds
          setTimeout(() => {
            chrome.tabs.sendMessage(tabs[0].id!, {
              type: "REMOVE_RESTAURANT"
            });
          }, 1500);
        }
      });
    } catch (err) {
      console.error("analyze (selected) failed:", err);

      // Remove restaurant immediately on error
      chrome.tabs.query({ url: "https://www.google.com/maps/*" }, (tabs) => {
        if (tabs && tabs.length > 0) {
          chrome.tabs.sendMessage(tabs[0].id!, {
            type: "REMOVE_RESTAURANT"
          });
        }
      });
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

  const canAnalyzeCommon =
    !!portRef.current && images.length > 0 && !isAnalyzing;
  const canAnalyzeSelected = canAnalyzeCommon && selected.size > 0;

  return (
    <div className="results-root">
      <MiniNav isResults={isResults} onToggle={toggle} />

      {/* ANALYSIS VIEW (peach themed) */}
      {!isResults && (
        <>
          <div className="results-panel">
            {/* Menus count */}
            <div className="results-menus-count">
              <div className="results-title">Menus found</div>
              <div className="results-muted">{images.length}</div>
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

          {/* Analyze All button - full width, centered */}
          <button
            className="btn btn-full-width"
            onClick={getMenuAnalysisAll}
            disabled={!canAnalyzeCommon}
            aria-busy={isAnalyzing}
            title={images.length === 0 ? "No menu images found" : undefined}
          >
            {isAnalyzing ? "Analyzing…" : "Analyze All"}
          </button>
        </>
      )}

      {/* RESULTS VIEW (unchanged layout, just the tiny nav above) */}
      {isResults && detection_result && (
        <DetectionResultPane detection_result={detection_result} />
      )}
    </div>
  );
}
