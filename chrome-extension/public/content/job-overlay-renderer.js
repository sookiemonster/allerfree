// public/content/job-overlay-renderer.js
//
// Renders the bottom-right job queue overlay from chrome.storage.local.
// Source of truth is analysisContext.js jobs stored under `allerfree_job:<restaurantKey>`.
//
// Behavior:
// - Cross-tab: all tabs with this content script loaded reflect the same last-3 jobs.
// - Hydrates on load + re-hydrates when any job key changes.

(function (g) {
  const ns = (g.__allerfree ||= {});

  const STORAGE_PREFIX = "allerfree_job:";
  const MAX_JOBS = 3;

  function isJobStorageKey(key) {
    return typeof key === "string" && key.startsWith(STORAGE_PREFIX);
  }

  function storageKeyToRestaurantKey(storageKey) {
    return storageKey.slice(STORAGE_PREFIX.length);
  }

  function mapJobStatusToOverlayState(jobStatus) {
    if (jobStatus === "success") return "success";
    if (jobStatus === "error") return "error";
    // analysisContext uses "running"
    return "loading";
  }

  function readAllJobsFromStorage(callback) {
    chrome.storage.local.get(null, (data) => {
      if (chrome.runtime && chrome.runtime.lastError) {
        console.warn(
          "[Allerfree] Failed to read jobs for overlay:",
          chrome.runtime.lastError
        );
        callback([]);
        return;
      }

      const jobs = [];

      for (const [storageKey, job] of Object.entries(data || {})) {
        if (!isJobStorageKey(storageKey)) continue;
        if (!job) continue;

        const restaurantKey = storageKeyToRestaurantKey(storageKey);
        const restaurant = job.restaurant || null;
        if (!restaurant) continue;

        const status = job.status || "running";
        const updatedAt = typeof job.updatedAt === "number" ? job.updatedAt : 0;

        jobs.push({
          restaurantKey,
          status,
          restaurant,
          updatedAt,
          // keep everything else (result/error fields) if they exist
          ...job,
        });
      }

      jobs.sort((a, b) => (a.updatedAt || 0) - (b.updatedAt || 0));
      callback(jobs.slice(-MAX_JOBS));
    });
  }

  function applyOverlayFromJobs(jobs) {
    if (typeof ns.setJobQueue !== "function") return;

    // overlay expects jobs with a derived display state
    const jobItems = (jobs || []).map((job) => ({
      restaurantKey: job.restaurantKey,
      status: job.status,
      state: mapJobStatusToOverlayState(job.status),
      restaurant: job.restaurant,
      updatedAt: job.updatedAt,
      job,
    }));

    ns.setJobQueue(jobItems);
  }

  function hydrate() {
    readAllJobsFromStorage((jobs) => applyOverlayFromJobs(jobs));
  }

  // Initial hydration
  hydrate();

  // Updates
  chrome.storage.onChanged.addListener((changes, areaName) => {
    if (areaName !== "local") return;

    for (const key of Object.keys(changes || {})) {
      if (isJobStorageKey(key)) {
        hydrate();
        return;
      }
    }
  });
})(self);
