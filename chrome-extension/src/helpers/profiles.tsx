// src/helpers/profiles.ts

import type { ProfilesMap } from "../types/profiles";
import type { Profile, Allergen } from "../types/profiles";

export const PROFILES_STORAGE_KEY = "profiles.v1";

// ===================================
// stub seedings
// ===================================
export const SAMPLE_PROFILES: ProfilesMap = {
    Kyle: {
        name: "Kyle",
        allergens: [],
    },
    Kelly: {
        name: "Kelly",
        allergens: [
            { sensitivity: "HIGH", allergen: "gluten" },
            { sensitivity: "HIGH", allergen: "shellfish" },
        ],
    },
    Daniel: {
        name: "Daniel",
        allergens: [
            { sensitivity: "HIGH", allergen: "gluten" },
            { sensitivity: "HIGH", allergen: "tree_nuts" },
            { sensitivity: "HIGH", allergen: "shellfish" },
        ],
    },
    Thomas: {
        name: "Thomas",
        allergens: [
            { sensitivity: "HIGH", allergen: "gluten" },
            { sensitivity: "HIGH", allergen: "shellfish" },
        ],
    },
};

/**
 * Seed storage with SAMPLE_PROFILES.
 * @param overwrite If false, skip seeding when profiles already exist.
 * @returns true if wrote, false if skipped due to existing data (and overwrite=false).
 */
export async function seedSampleProfiles(overwrite: boolean = false): Promise<boolean> {
    const existing = await getAllProfiles();
    const hasExisting = Object.keys(existing).length > 0;

    if (hasExisting && !overwrite) return false;

    await saveProfiles(SAMPLE_PROFILES);
    return true;
}

// ===================================
// helper and all profile grabs
// ===================================
export async function saveProfiles(profiles: ProfilesMap): Promise<void> {
    await chrome.storage.local.set({ [PROFILES_STORAGE_KEY]: profiles });
}

export async function getAllProfiles(): Promise<ProfilesMap> {
    const res = await chrome.storage.local.get(PROFILES_STORAGE_KEY);
    return (res?.[PROFILES_STORAGE_KEY] ?? {}) as ProfilesMap;
}

// ===================================
// singular profile grabs
// ===================================
/**
 * Get a single profile by its map key (e.g., "Kelly").
 * @param key   Profile map key.
 * @returns     The Profile if found, otherwise undefined.
 */
export async function getProfile(key: string): Promise<Profile | undefined> {
    const all = await getAllProfiles();
    return all[key];
}

/**
 * (Optional) Get-or-default helper.
 * Returns an empty profile with the given name if not found.
 */
export async function getProfileOrDefault(key: string): Promise<Profile> {
    const found = await getProfile(key);
    return found ?? { name: key, allergens: [] };
}

// ===================================
// additions
// ===================================
/**
 * Add a new profile to storage.
 * @param key        Map key used to store the profile (e.g., "Kyle").
 * @param profile    The Profile object to store.
 * @param overwrite  If false and the key exists, do nothing and return false.
 * @returns          true if the profile was written, false if skipped.
 */
export async function addProfile(
    key: string,
    profile: Profile,
    overwrite: boolean = false
): Promise<boolean> {
    const all = await getAllProfiles();
    const exists = Object.prototype.hasOwnProperty.call(all, key);

    if (exists && !overwrite) return false;

    all[key] = profile;
    await saveProfiles(all);
    return true;
}

/**
 * Add (or update) an allergen entry for a specific profile.
 * @param key                      Profile map key (e.g., "Kelly").
 * @param allergenEntry            The allergen to add.
 * @param opts.dedupe              If true, avoid duplicate allergen entries (default true).
 * @param opts.replaceSensitivity  If true and allergen exists, update its sensitivity (default true).
 * @returns                        true if a change was saved, false if no-op or profile missing.
 */
export async function addAllergenToProfile(
    key: string,
    allergenEntry: Allergen,
    opts: { dedupe?: boolean; replaceSensitivity?: boolean } = {}
): Promise<boolean> {
    const { dedupe = true, replaceSensitivity = true } = opts;
    const all = await getAllProfiles();
    const profile = all[key];
    if (!profile) return false;

    const list = profile.allergens ?? [];

    if (dedupe) {
        const idx = list.findIndex(a => a.allergen === allergenEntry.allergen);
        if (idx >= 0) {
            // Allergen already present
            if (replaceSensitivity && list[idx].sensitivity !== allergenEntry.sensitivity) {
                list[idx] = { ...list[idx], sensitivity: allergenEntry.sensitivity };
                all[key] = { ...profile, allergens: list };
                await saveProfiles(all);
                return true;
            }
            // No change needed
            return false;
        }
    }

    // Add new allergen entry
    list.push(allergenEntry);
    all[key] = { ...profile, allergens: list };
    await saveProfiles(all);
    return true;
}
