import { Link } from "react-router-dom";
import { useState, useEffect } from "react";

type Sensitivity = "MILD" | "SEVERE";
type Allergen = {
  allergen: string;
  sensitivity: Sensitivity;
}
type Profile = {
  profile_name: string;
  allergens: Allergen[];
}
type GetSampleProfile = { type: "SAMPLE_PROFILE_DATA_RESULT"; profile: Profile; }

// UI types stay the same
type UiSeverity = "severe" | "mild";
type UiAllergy = { name: string; severity: UiSeverity; icon: string };

const toUiSeverity = (s: Sensitivity): UiSeverity => (s === "MILD" ? "mild" : "severe");

function Profiles()
{
    const [savedAllergies, setSavedAllergies] = useState([
        { name: "gluten", severity: "severe", icon: "🌾" },
        { name: "soy", severity: "severe", icon: "🫘" },
        { name: "sesame", severity: "mild", icon: "⚪" }
    ]);


    useEffect(() => {
        const port = chrome.runtime.connect({ name: "popup" });

        port.onMessage.addListener((msg: GetSampleProfile) => {
            if (msg.type === "SAMPLE_PROFILE_DATA_RESULT") {
            const profile = msg.profile;
            const uiAllergies: UiAllergy[] = (profile?.allergens ?? []).map(a => ({
                name: a.allergen,                 // <-- use `allergen`
                severity: toUiSeverity(a.sensitivity),
                icon: "😈",
            }));
            setSavedAllergies(uiAllergies);
            }
        });

        port.postMessage({ type: "GET_SAMPLE_PROFILE_DATA" });

        return () => { try { port.disconnect(); } catch {} };
    }, []);

    return(
        <div className="profiles-page">
            <div className="profiles-background-circle"></div>

            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px' }}>
                    <Link to="/">
                        <button className="simple-arrow-btn" style={{ marginRight: '20px' }}>
                            ←
                        </button>
                    </Link>
                    <h1 className="profile-title">User Profile</h1>
                </div>

                <div className="profile-section">
                    <div className="profile-picture-container">
                        <div className="profile-picture">
                            <div className="profile-icon">👤</div>
                        </div>
                    </div>
                </div>

                <div className="current-allergies-section">
                    <h2 className="current-allergies-title">Current Allergies</h2>
                </div>

                <div className="allergies-display">
                    <div className="allergies-carousel">
                        {savedAllergies.map((allergy, index) => (
                            <div key={index} className="allergy-item">
                                <div className="allergy-circle">
                                    <div className="allergy-icon">{allergy.icon}</div>
                                    {allergy.severity === "severe" && (
                                        <div className="severity-indicator severe">❗</div>
                                    )}
                                    {allergy.severity === "mild" && (
                                        <div className="severity-indicator mild">⚠️</div>
                                    )}
                                </div>
                                <p className="allergy-name">{allergy.name}</p>
                            </div>
                        ))}

                        <div className="allergy-item">
                            <Link to="/allergies">
                                <div className="add-allergy-circle">
                                    <span>+</span>
                                </div>
                            </Link>
                            <p className="allergy-name">add new</p>
                        </div>
                    </div>
                </div>

                <div className="chevron-section">
                    <div className="chevron-down">⌄</div>
                </div>
            </div>
        </div>
    )
} export default Profiles