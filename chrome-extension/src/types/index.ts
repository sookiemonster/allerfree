import type {
  MenuItem,
  AllergenPrediction,
  AllergenPresenceRating,
  MenuSection,
  MenuData,
  DetectionResult,
} from "./DetectionResult";

import {
  formatRating,
  formatAllergenName,
  flattenMenuItems,
} from "./DetectionResult";

export type {
  MenuItem,
  AllergenPrediction,
  AllergenPresenceRating,
  MenuSection,
  MenuData,
  DetectionResult,
};
export { formatRating, formatAllergenName, flattenMenuItems };
