// Global selected profile
let currentSelectedProfile = "Kelly";

// Placeholder profiles map
const SAMPLE_PROFILES = {
  Kyle:   { 
    profile_name: "Kyle",   
    allergens: [] 
  },
  Kelly:  { 
    profile_name: "Kelly",  
    allergens: [
      { sensitivity: "SEVERE", allergen: "gluten" },
      { sensitivity: "SEVERE", allergen: "gluten" },
    ] 
  },
  Daniel: { 
    profile_name: "Daniel", 
    allergens: [
      { sensitivity: "SEVERE", allergen: "gluten" },
      { sensitivity: "SEVERE", allergen: "nuts" },
      { sensitivity: "SEVERE", allergen: "shellfish" },
    ] 
  },
  Thomas: { 
    profile_name: "Thomas", 
    allergens: [
      { sensitivity: "MILD", allergen: "gluten" },
      { sensitivity: "MILD", allergen: "shellfish" },
    ] 
  },
};

// Returns JSON with a single profile
export function getSampleProfileData() {
  return {
    profile: SAMPLE_PROFILES[currentSelectedProfile],
  };
}

function getAllSampleProfileData()
{
    return{
        profiles: SAMPLE_PROFILES,
    }
}