// src/pages/Results.tsx
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { DetectionResult } from "../types";

import { useProfiles } from "../contexts/ProfileContext";
import { ctxProfilesToApi } from "../helpers/profileFormat";

import "./Results.css";

import type { AnalysisJob, JobSummary, RestaurantInfo } from "../types/AnalysisJob";
import {
  ANALYSIS_STORAGE_PREFIX,
  storageKeyForRestaurantKey,
  toJobSummary,
} from "../types/AnalysisJob";

import {
  connectResultsPort,
  disconnectResultsPort,
  requestInitialResultsData,
  startAnalysis,
} from "../helpers/resultsPortMessaging";

import MiniNav from "../components/MiniNav";
import AnalysisView from "../components/AnalysisView";
import ResultsView from "../components/ResultsView";

function coerceDetectionResult(value: unknown): DetectionResult | null {
  if (!value || typeof value !== "object") return null;
  const v = value as any;
  if (!("results" in v) || !("failed" in v)) return null;
  return v as DetectionResult;
}

function sortByUpdatedDesc(a: JobSummary, b: JobSummary) {
  return (b.updatedAt || 0) - (a.updatedAt || 0);
}

/**
 * Must match the restaurantKey construction used in contentScriptAnalysisContext.js:
 * `${name.toLowerCase()}|${lat},${lng}` or `${name.toLowerCase()}|no-coords`
 */
function makeRestaurantKeyFromRestaurantInfo(
  restaurant: RestaurantInfo | null
): string {
  if (!restaurant) return "";

  const namePart = String(restaurant.name || "").trim().toLowerCase();
  const coordsAny = (restaurant as any).coordinates;

  const coords =
    coordsAny && coordsAny.lat != null && coordsAny.lng != null
      ? `${coordsAny.lat},${coordsAny.lng}`
      : "no-coords";

  return `${namePart}|${coords}`;
}

export default function Results() {
  const portRef = useRef<chrome.runtime.Port | null>(null);

  // Which view are we in?
  const [isResultsView, setIsResultsView] = useState(false);

  // Analysis view: data for the active Google Maps tab
  const [menuImages, setMenuImages] = useState<string[]>([]);
  const [activeRestaurantInfo, setActiveRestaurantInfo] =
    useState<RestaurantInfo | null>(null);

  // Analysis view: spinner/disabled state driven by the *active restaurant's* job status
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Results view: job history (completed jobs) + selected job for viewing
  const [historyJobs, setHistoryJobs] = useState<JobSummary[]>([]);
  const [selectedJobKey, setSelectedJobKey] = useState<string>("");
  const selectedJobKeyRef = useRef<string>("");

  // Keep the full job as the source of truth for "Results" view
  const [selectedHistoryJob, setSelectedHistoryJob] = useState<AnalysisJob | null>(
    null
  );

  // Derive detection result from selectedHistoryJob
  const selectedDetectionResult = useMemo(
    () => coerceDetectionResult(selectedHistoryJob?.result),
    [selectedHistoryJob]
  );

  // Track the active restaurant key (for analysis view spinner state)
  const activeRestaurantKeyRef = useRef<string>("");

  // Profiles from Context → API shape
  const { profiles } = useProfiles();
  const apiProfiles = useMemo(() => ctxProfilesToApi(profiles), [profiles]);

  // Selection state by name
  const [selectedNames, setSelectedNames] = useState<Set<string>>(new Set());
  const profileNames = useMemo(() => profiles.map((p) => p.name), [profiles]);

  useEffect(() => {
    setSelectedNames((prev) => {
      const allowed = new Set(profileNames);
      const next = new Set<string>();
      for (const k of prev) if (allowed.has(k)) next.add(k);
      return next;
    });
  }, [profileNames]);

  // Keep active restaurant key in sync with activeRestaurantInfo
  useEffect(() => {
    activeRestaurantKeyRef.current =
      makeRestaurantKeyFromRestaurantInfo(activeRestaurantInfo);
  }, [activeRestaurantInfo]);

  // Connect to SW for images + current restaurant
  useEffect(() => {
    const port = connectResultsPort((msg) => {
      if (msg.type === "MENU_IMAGES_PUSH" || msg.type === "MENU_IMAGES_RESULT") {
        setMenuImages(Array.isArray(msg.images) ? msg.images : []);
        return;
      }

      if (
        msg.type === "RESTAURANT_INFO_PUSH" ||
        msg.type === "RESTAURANT_INFO_RESULT"
      ) {
        setActiveRestaurantInfo(msg.restaurant ?? null);
      }
    });

    portRef.current = port;

    // request initial images + restaurant for active tab
    requestInitialResultsData(port);

    return () => {
      disconnectResultsPort(portRef.current);
      portRef.current = null;
    };
  }, []);

  // Whenever the active restaurant changes, pull its job from storage and set isAnalyzing
  useEffect(() => {
    const restaurantKey = makeRestaurantKeyFromRestaurantInfo(activeRestaurantInfo);

    if (!restaurantKey) {
      setIsAnalyzing(false);
      return;
    }

    const storageKey = storageKeyForRestaurantKey(restaurantKey);
    chrome.storage.local.get(storageKey, (data) => {
      const job = (data?.[storageKey] as AnalysisJob | undefined) || null;
      setIsAnalyzing(job?.status === "running");
    });
  }, [activeRestaurantInfo]);

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

      setHistoryJobs(successSummaries);

      // Auto-select most recent success job
      if (successSummaries.length > 0) {
        const rk = successSummaries[0].restaurantKey;
        selectedJobKeyRef.current = rk;
        setSelectedJobKey(rk);

        const full = found.find((x) => x.job.restaurantKey === rk)?.job || null;
        setSelectedHistoryJob(full);
      } else {
        selectedJobKeyRef.current = "";
        setSelectedJobKey("");
        setSelectedHistoryJob(null);
      }
    });
  }, []);

  // Listen to chrome.storage changes:
  // - keep historyJobs (success-only) in sync
  // - keep selectedHistoryJob in sync
  // - keep isAnalyzing in sync for the ACTIVE restaurant job
  useEffect(() => {
    const handler: Parameters<typeof chrome.storage.onChanged.addListener>[0] = (
      changes,
      areaName
    ) => {
      if (areaName !== "local") return;

      const activeStorageKey = storageKeyForRestaurantKey(
        activeRestaurantKeyRef.current
      );

      setHistoryJobs((prev) => {
        let next = [...prev];
        let changed = false;

        for (const [key, change] of Object.entries(changes)) {
          // Keep analysis spinner in sync for the active restaurant
          if (key === activeStorageKey) {
            const newJob = change.newValue as AnalysisJob | undefined;
            setIsAnalyzing(!!newJob && newJob.status === "running");
          }

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

          // If the currently selected HISTORY job changed, update the Results UI
          if (restaurantKey === selectedJobKeyRef.current) {
            setSelectedHistoryJob(newJob ?? null);
          }
        }

        if (changed) next.sort(sortByUpdatedDesc);
        return changed ? next : prev;
      });
    };

    chrome.storage.onChanged.addListener(handler);
    return () => chrome.storage.onChanged.removeListener(handler);
  }, []);

  // When user selects a different HISTORY job, fetch only that one full job
  const handleSelectHistoryJob = (restaurantKey: string) => {
    selectedJobKeyRef.current = restaurantKey;
    setSelectedJobKey(restaurantKey);

    if (!restaurantKey) {
      setSelectedHistoryJob(null);
      return;
    }

    const key = storageKeyForRestaurantKey(restaurantKey);
    chrome.storage.local.get(key, (data) => {
      const job = (data?.[key] as AnalysisJob) || null;
      setSelectedHistoryJob(job);
    });
  };

  const toggleView = () => setIsResultsView((v) => !v);

  const onStartAnalysisAll = useCallback(() => {
    if (!portRef.current) return;

    try {
      startAnalysis(portRef.current, apiProfiles);
      setIsAnalyzing(true);
    } catch (err) {
      console.error("[START_ANALYSIS (all)] failed:", err);
      setIsAnalyzing(false);
    }
  }, [apiProfiles]);

  const onStartAnalysisSelected = useCallback(() => {
    if (!portRef.current) return;

    const filtered = apiProfiles.filter((p) => selectedNames.has(p.name));

    try {
      startAnalysis(portRef.current, filtered);
      setIsAnalyzing(true);
    } catch (err) {
      console.error("[START_ANALYSIS (selected)] failed:", err);
      setIsAnalyzing(false);
    }
  }, [apiProfiles, selectedNames]);

  const toggleSelection = (name: string) =>
    setSelectedNames((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  const canAnalyzeCommon = !!portRef.current && menuImages.length > 0 && !isAnalyzing;
  const canAnalyzeSelected = canAnalyzeCommon && selectedNames.size > 0;

  return (
    <div className="results-root">
      <MiniNav isResults={isResultsView} onToggle={toggleView} />

      {!isResultsView && (
        <AnalysisView
          restaurant={activeRestaurantInfo}
          menuCount={menuImages.length}
          names={profileNames}
          selected={selectedNames}
          onToggleSelection={toggleSelection}
          onAnalyzeSelected={onStartAnalysisSelected}
          onAnalyzeAll={onStartAnalysisAll}
          isAnalyzing={isAnalyzing}
          canAnalyzeSelected={canAnalyzeSelected}
          canAnalyzeAll={canAnalyzeCommon}
        />
      )}

      {isResultsView && (
        <ResultsView
          jobs={historyJobs}
          selectedRestaurantKey={selectedJobKey}
          onSelectJob={handleSelectHistoryJob}
          detectionResult={selectedDetectionResult}
        />
      )}
    </div>
  );
}
