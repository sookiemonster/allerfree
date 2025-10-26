export type AllergenPresenceRating =
  | "MAY_CONTAIN"
  | "VERY_LIKELY"
  | "VERY_UNLIKELY";

export interface AllergenPrediction {
  allergen: "gluten" | "shellfish" | "tree_nuts";
  prediction: AllergenPresenceRating;
  safe_to_eat: boolean;
  explanation: string;
}

export interface MenuItem {
  name: string;
  description: string;
  symbols: string[];
  contains: AllergenPrediction[];
}

export interface MenuSection {
  section: string;
  description: string;
  items: MenuItem[];
}

export interface MenuData {
  sections: MenuSection[];
}

export interface DetectionResult {
  failed: object;
  results: {
    [profile_name: string]: MenuData;
  };
}

// Maps the rating ID to a human-readable phrase
const RATING_TEXT: Record<AllergenPresenceRating, string> = {
  MAY_CONTAIN: "May contain",
  VERY_LIKELY: "Likely contains",
  VERY_UNLIKELY: "Unlikely to contain",
};

// Maps the allergen ID to a display-friendly name
const ALLERGEN_NAME: Record<AllergenPrediction["allergen"], string> = {
  gluten: "gluten",
  shellfish: "shellfish",
  tree_nuts: "tree nuts",
};

export function formatRating(rating: AllergenPresenceRating): string {
  return RATING_TEXT[rating];
}

export function formatAllergenName(
  allergen: AllergenPrediction["allergen"]
): string {
  return ALLERGEN_NAME[allergen];
}

export function flattenMenuItems(menuData: MenuData): MenuItem[] {
  return menuData.sections.flatMap((section) => section.items);
}
