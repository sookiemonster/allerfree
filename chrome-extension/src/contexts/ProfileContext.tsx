import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export interface Allergy {
  name: string;
  severity: "mild" | "severe";
  icon: string;
}

export interface Profile {
  id: string;
  name: string;
  allergies: Allergy[];
  createdAt: Date;
}

interface ProfileContextType {
  profiles: Profile[];
  currentProfile: Profile | null;
  addProfile: (name: string) => Profile;
  updateProfile: (id: string, updates: Partial<Profile>) => void;
  deleteProfile: (id: string) => void;
  setCurrentProfile: (id: string) => void;
  addAllergyToProfile: (profileId: string, allergy: Allergy) => void;
  removeAllergyFromProfile: (profileId: string, allergyName: string) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Placeholder storage - will be replaced with backend API calls
const STORAGE_KEY = "allerfree_profiles";
const CURRENT_PROFILE_KEY = "allerfree_current_profile";

const loadProfiles = (): Profile[] => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const profiles = JSON.parse(stored);
      return profiles.map((p: any) => ({
        ...p,
        createdAt: new Date(p.createdAt),
      }));
    }
  } catch (error) {
    console.error("Error loading profiles:", error);
  }
  return [];
};

const saveProfiles = (profiles: Profile[]) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  } catch (error) {
    console.error("Error saving profiles:", error);
  }
};

const loadCurrentProfileId = (): string | null => {
  return localStorage.getItem(CURRENT_PROFILE_KEY);
};

const saveCurrentProfileId = (id: string | null) => {
  if (id) {
    localStorage.setItem(CURRENT_PROFILE_KEY, id);
  } else {
    localStorage.removeItem(CURRENT_PROFILE_KEY);
  }
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profiles, setProfiles] = useState<Profile[]>(loadProfiles());
  const [currentProfileId, setCurrentProfileId] = useState<string | null>(
    loadCurrentProfileId()
  );

  const currentProfile =
    profiles.find((p) => p.id === currentProfileId) || null;

  const addProfile = (name: string): Profile => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      allergies: [],
      createdAt: new Date(),
    };

    const updatedProfiles = [...profiles, newProfile];
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
    setCurrentProfileId(newProfile.id);
    saveCurrentProfileId(newProfile.id);

    return newProfile;
  };

  const updateProfile = (id: string, updates: Partial<Profile>) => {
    const updatedProfiles = profiles.map((p) =>
      p.id === id ? { ...p, ...updates } : p
    );
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
  };

  const deleteProfile = (id: string) => {
    const updatedProfiles = profiles.filter((p) => p.id !== id);
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);

    if (currentProfileId === id) {
      setCurrentProfileId(null);
      saveCurrentProfileId(null);
    }
  };

  const setCurrentProfile = (id: string) => {
    setCurrentProfileId(id);
    saveCurrentProfileId(id);
  };

  const addAllergyToProfile = (profileId: string, allergy: Allergy) => {
    const updatedProfiles = profiles.map((p) => {
      if (p.id === profileId) {
        const allergyExists = p.allergies.some((a) => a.name === allergy.name);
        if (!allergyExists) {
          return { ...p, allergies: [...p.allergies, allergy] };
        }
      }
      return p;
    });
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
  };

  const removeAllergyFromProfile = (profileId: string, allergyName: string) => {
    const updatedProfiles = profiles.map((p) => {
      if (p.id === profileId) {
        return {
          ...p,
          allergies: p.allergies.filter((a) => a.name !== allergyName),
        };
      }
      return p;
    });
    setProfiles(updatedProfiles);
    saveProfiles(updatedProfiles);
  };

  return (
    <ProfileContext.Provider
      value={{
        profiles,
        currentProfile,
        addProfile,
        updateProfile,
        deleteProfile,
        setCurrentProfile,
        addAllergyToProfile,
        removeAllergyFromProfile,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfiles() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfiles must be used within a ProfileProvider");
  }
  return context;
}
