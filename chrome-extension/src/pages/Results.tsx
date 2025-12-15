import { useEffect, useMemo, useRef, useState } from "react";
import type { DetectionResult } from "../types";
import DetectionResultPane from "../components/DetectionResult/DetectionResultPane";

import { useProfiles } from "../contexts/ProfileContext";
import { ctxProfilesToApi } from "../helpers/profileFormat";

import "./Results.css";

import type { AnalysisJob, JobSummary, RestaurantInfo} from "../types/AnalysisJob";
import {
  ANALYSIS_STORAGE_PREFIX,
  storageKeyForRestaurantKey,
  toJobSummary,
} from "../types/AnalysisJob";

import type {
  ResultsPortInboundMessage,
  ResultsPortOutboundMessage,
} from "../types/ResultsMessages";

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

function coerceDetectionResult(value: unknown): DetectionResult | null {
  if (!value || typeof value !== "object") return null;
  const v = value as any;
  if (!("results" in v) || !("failed" in v)) return null;
  return v as DetectionResult;
}

function sortByUpdatedDesc(a: JobSummary, b: JobSummary) {
  return (b.updatedAt || 0) - (a.updatedAt || 0);
}

export default function Results() {
  const portRef = useRef<chrome.runtime.Port | null>(null);

  const [isResults, setIsResults] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [restaurant, setRestaurant] = useState<RestaurantInfo | null>(null);
  const [detection_result, setDetectionResult] =
    useState<DetectionResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Jobs (summaries for dropdown) + selected job (full payload)
  const [jobs, setJobs] = useState<JobSummary[]>([]);
  const [selectedRestaurantKey, setSelectedRestaurantKey] = useState<string>("");
  const selectedRestaurantKeyRef = useRef<string>("");
  const [selectedJob, setSelectedJob] = useState<AnalysisJob | null>(null);

  // Profiles from Context → API shape
  const { profiles } = useProfiles();
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
  // Connect to SW for images + current restaurant
  useEffect(() => {
    const port = chrome.runtime.connect({ name: "popup" });
    portRef.current = port;

    port.onMessage.addListener(
      (msg: ResultsPortInboundMessage) => {
        if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
          setImages(Array.isArray(msg.images) ? msg.images : []);
          return;
        }

        if (
          msg.type === "RESTAURANT_INFO_PUSH" ||
          msg.type === "RESTAURANT_INFO_RESULT"
        ) {
          setRestaurant(msg.restaurant ?? null);
        }
      }
    );

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const active = tabs[0];
      const id = active?.id ?? null;

      port.postMessage({ type: "GET_MENU_IMAGES", tabId: id ?? undefined } as ResultsPortOutboundMessage);
      port.postMessage(
        { type: "GET_RESTAURANT_INFO", tabId: id ?? undefined } as ResultsPortOutboundMessage
      );
    });

    return () => {
      try {
        port.disconnect();
      } catch {}
    };
  }, []);


  // Initial load of success jobs for dropdown, plus choose a default selection
  useEffect(() => {
    chrome.storage.local.get(null, (data) => {
      const found: { key: string; job: AnalysisJob }[] = [];

      for (const [key, value] of Object.entries(data || {})) {
        if (!key.startsWith(ANALYSIS_STORAGE_PREFIX)) continue;
        if (!value) continue;

        const job = value as AnalysisJob;
        found.push({ key, job });
      }

      const successSummaries = found
        .map((x) => x.job)
        .filter((job) => job.status === "success")
        .map(toJobSummary)
        .sort(sortByUpdatedDesc);

      setJobs(successSummaries);

      // Auto-select most recent success job
      if (successSummaries.length > 0) {
        const rk = successSummaries[0].restaurantKey;
        selectedRestaurantKeyRef.current = rk;
        setSelectedRestaurantKey(rk);

        const full = found.find((x) => x.job.restaurantKey === rk)?.job || null;
        setSelectedJob(full);
        setDetectionResult(coerceDetectionResult(full?.result));
      } else {
        selectedRestaurantKeyRef.current = "";
        setSelectedRestaurantKey("");
        setSelectedJob(null);
        setDetectionResult(null);
      }
    });
  }, []);

  // Listen to chrome.storage changes (like analysisContext.js does)
  useEffect(() => {
    const handler: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (
      changes,
      areaName
    ) => {
      if (areaName !== "local") return;

      // Optional debug print similar to content script
      console.log("[Allerfree] storage.onChanged", changes);

      // Update dropdown summaries without storing all results in state
      setJobs((prev) => {
        let next = [...prev];
        let changed = false;

        for (const [key, change] of Object.entries(changes)) {
          if (!key.startsWith(ANALYSIS_STORAGE_PREFIX)) continue;

          const newJob = change.newValue as AnalysisJob | undefined;

          const restaurantKey = key.slice(ANALYSIS_STORAGE_PREFIX.length);
          const idx = next.findIndex((j) => j.restaurantKey === restaurantKey);

          const isSuccess = !!newJob && newJob.status === "success";

          if (!isSuccess) {
            if (idx !== -1) {
              next.splice(idx, 1);
              changed = true;
            }
          } else {
            const summary = toJobSummary(newJob);
            if (idx === -1) {
              next.push(summary);
              changed = true;
            } else {
              next[idx] = summary;
              changed = true;
            }
          }

          // If the currently selected job changed, update the results UI
          if (restaurantKey === selectedRestaurantKeyRef.current) {
            if (!newJob) {
              setSelectedJob(null);
              setDetectionResult(null);
            } else {
              setSelectedJob(newJob);
              setDetectionResult(coerceDetectionResult(newJob.result));
            }
          }
        }

        if (changed) next.sort(sortByUpdatedDesc);
        return changed ? next : prev;
      });
    };

    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  // When user selects a different job, fetch only that one full job
  const handleSelectJob = (restaurantKey: string) => {
    selectedRestaurantKeyRef.current = restaurantKey;
    setSelectedRestaurantKey(restaurantKey);

    if (!restaurantKey) {
      setSelectedJob(null);
      setDetectionResult(null);
      return;
    }

    const key = storageKeyForRestaurantKey(restaurantKey);
    chrome.storage.local.get(key, (data) => {
      const job = (data?.[key] as AnalysisJob) || null;
      setSelectedJob(job);
      setDetectionResult(coerceDetectionResult(job?.result));
    });
  };

  const toggle = () => setIsResults((v) => !v);

  const getMenuAnalysisAll = () => {
    if (!portRef.current) return;

    try {
      portRef.current.postMessage({
        type: "START_ANALYSIS",
        profiles: apiProfiles,
      } as ResultsPortOutboundMessage);
      setIsAnalyzing(true);
    } catch (err) {
      console.error("START_ANALYSIS (all) failed:", err);
      setIsAnalyzing(false);
    }
  };

  const getMenuAnalysisForSelected = () => {
    if (!portRef.current) return;

    const chosen = new Set(selected);
    const filtered = apiProfiles.filter((p) => chosen.has(p.name));

    try {
      portRef.current.postMessage({
        type: "START_ANALYSIS",
        profiles: filtered,
      } as any);
      setIsAnalyzing(true);
    } catch (err) {
      console.error("START_ANALYSIS (selected) failed:", err);
      setIsAnalyzing(false);
    }
  };

  // Stop spinner when selected job becomes success or error
  useEffect(() => {
    if (!selectedJob) return;
    if (selectedJob.status === "success" || selectedJob.status === "error") {
      setIsAnalyzing(false);
    }
  }, [selectedJob?.status]);

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

      {!isResults && (
        <>
          <div className="results-panel">
            {/* Restaurant (left) + Menus found (right) */}
            <div className="results-top-row">
              <div className="results-restaurant-summary">
                <div className="results-title">Restaurant</div>
                <div className="results-muted results-restaurant-name">
                  {restaurant?.name ? restaurant.name : "Unknown"}
                </div>
              </div>

              <div className="results-menus-summary">
                <div className="results-title">Menus found</div>
                <div className="results-muted">{images.length}</div>
              </div>
            </div>


            {/* Brown divider to separate sections */}
            <div className="results-divider" />

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

      {isResults && (
        <div className="results-panel">
          <div className="results-job-picker">
            <div className="results-title">Restaurant results</div>

            <select
              className="results-job-select"
              value={selectedRestaurantKey}
              onChange={(e) => handleSelectJob(e.target.value)}
            >
              <option value="" disabled>
                {jobs.length > 0
                  ? "Select a restaurant"
                  : "No successful jobs yet"}
              </option>

              {jobs.map((job) => (
                <option key={job.restaurantKey} value={job.restaurantKey}>
                  {job.restaurantName}
                </option>
              ))}
            </select>

            <div className="results-muted">
              {jobs.length} successful job{jobs.length === 1 ? "" : "s"}
            </div>
          </div>

          <div className="results-divider" />

          {detection_result ? (
            <DetectionResultPane detection_result={detection_result} />
          ) : (
            <div className="results-muted" style={{ padding: 8 }}>
              Select a restaurant above to view results.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
