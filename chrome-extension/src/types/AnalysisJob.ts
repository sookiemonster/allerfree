export const ANALYSIS_STORAGE_PREFIX = "allerfree_job:" as const;

export type JobStatus = "running" | "success" | "error";

export type RestaurantInfo = {
  name?: string;
  coordinates?: { lat?: number; lng?: number };
  url?: string;
};

export type AnalysisJob = {
  jobId: string;
  restaurantKey: string;
  restaurant: RestaurantInfo;
  status: JobStatus;
  profiles: any[];
  images: string[];
  result?: unknown;
  error?: string | null;
  updatedAt: number;
};

export type JobSummary = {
  jobId: string;
  restaurantKey: string;
  restaurantName: string;
  updatedAt: number;
};

export function storageKeyForRestaurantKey(restaurantKey: string) {
  return `${ANALYSIS_STORAGE_PREFIX}${restaurantKey}`;
}

export function toJobSummary(job: AnalysisJob): JobSummary {
  return {
    jobId: job.jobId,
    restaurantKey: job.restaurantKey,
    restaurantName: job.restaurant?.name || "Unknown restaurant",
    updatedAt: job.updatedAt || 0,
  };
}
