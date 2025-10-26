// src/types/profiles.ts

export type Sensitivity = "MILD" | "HIGH" ;

export type Allergen = {
    sensitivity: Sensitivity;
    allergen: string;
};

export type Profile = {
    name: string;
    allergens: Allergen[];
};

export type ProfilesMap = Record<string, Profile>;
