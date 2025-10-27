// src/helpers/profileFormat.ts
import type { Profile as CtxProfile } from "../contexts/ProfileContext";

// ===== API shapes =====
export type ApiAllergen = "gluten" | "tree_nuts" | "shellfish";
export type ApiSensitivity = "MILD" | "HIGH";
export interface ApiProfile {
  name: string;
  allergens: { allergen: ApiAllergen; sensitivity: ApiSensitivity }[];
}

// Normalize "tree nuts" → "tree_nuts" and drop unsupported allergens.
const normalizeAllergen = (raw: string): ApiAllergen | null => {
  const k = raw.trim().toLowerCase().replace(/\s+/g, "_");
  if (k === "gluten") return "gluten";
  if (k === "tree_nuts") return "tree_nuts";
  if (k === "shellfish") return "shellfish";
  return null; // drop soy, sesame, etc.
};

// Map "mild" | "severe" → "MILD" | "HIGH"
const normalizeSensitivity = (raw: string): ApiSensitivity =>
  raw.trim().toLowerCase() === "severe" ? "HIGH" : "MILD";

// Single profile adapter
export const ctxProfileToApi = (p: CtxProfile): ApiProfile => ({
  name: p.name,
  allergens: (p.allergies ?? [])
    .map(a => {
      const allergen = normalizeAllergen(a.name);
      if (!allergen) return null;
      return { allergen, sensitivity: normalizeSensitivity(a.severity) };
    })
    .filter(
      (x): x is { allergen: ApiAllergen; sensitivity: ApiSensitivity } => !!x
    ),
});

// Array adapter
export const ctxProfilesToApi = (profiles: CtxProfile[]): ApiProfile[] =>
  profiles.map(ctxProfileToApi);
