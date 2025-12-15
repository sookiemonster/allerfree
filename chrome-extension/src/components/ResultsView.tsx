import type { JobSummary } from "../types/AnalysisJob";
import type { DetectionResult } from "../types";
import DetectionResultPane from "./DetectionResult/DetectionResultPane";

export default function ResultsView({
  jobs,
  selectedRestaurantKey,
  onSelectJob,
  detectionResult,
}: {
  jobs: JobSummary[];
  selectedRestaurantKey: string;
  onSelectJob: (restaurantKey: string) => void;
  detectionResult: DetectionResult | null;
}) {
  return (
    <div className="results-panel">
      <div className="results-job-picker">
        <div className="results-title">Restaurant results</div>

        <select
          className="results-job-select"
          value={selectedRestaurantKey}
          onChange={(e) => onSelectJob(e.target.value)}
        >
          <option value="" disabled>
            {jobs.length > 0 ? "Select a restaurant" : "No successful jobs yet"}
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

      {detectionResult ? (
        <DetectionResultPane detection_result={detectionResult} />
      ) : (
        <div className="results-muted" style={{ padding: 8 }}>
          Select a restaurant above to view results.
        </div>
      )}
    </div>
  );
}
