import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { useProfiles } from "../contexts/ProfileContext";

const availableAllergens = [
    { name: "gluten", icon: "🌾" },
    { name: "soy", icon: "🫘" },
    { name: "sesame", icon: "⚪" }
];

function Profiles()
{
    const { currentProfile, addProfile, updateProfile, addAllergyToProfile } = useProfiles();
    const [isEditing, setIsEditing] = useState(false);
    const [profileName, setProfileName] = useState("");
    const [showAllergenModal, setShowAllergenModal] = useState(false);
    const [showSeverityModal, setShowSeverityModal] = useState(false);
    const [selectedAllergen, setSelectedAllergen] = useState<{name: string, icon: string} | null>(null);

    useEffect(() => {
        if (currentProfile) {
            // Profile is selected, load its data
            setProfileName(currentProfile.name);
            setIsEditing(false);
        } else {
            // No profile selected, show default empty state
            setProfileName("");
            setIsEditing(false);
        }
    }, [currentProfile]);

    const handleSaveName = () => {
        if (profileName.trim()) {
            if (currentProfile) {
                updateProfile(currentProfile.id, { name: profileName.trim() });
            } else {
                addProfile(profileName.trim());
            }
            setIsEditing(false);
        }
    };

    const handleAddAllergyClick = () => {
        console.log("Add allergy clicked, currentProfile:", currentProfile);
        if (currentProfile) {
            setShowAllergenModal(true);
        } else {
            alert("Please create a profile first by entering a name and clicking the checkmark.");
        }
    };

    const handleAllergenSelect = (allergen: {name: string, icon: string}) => {
        setSelectedAllergen(allergen);
        setShowAllergenModal(false);
        setShowSeverityModal(true);
    };

    const handleSeveritySelect = (severity: "mild" | "severe") => {
        if (currentProfile && selectedAllergen) {
            addAllergyToProfile(currentProfile.id, {
                name: selectedAllergen.name,
                icon: selectedAllergen.icon,
                severity: severity
            });
            setShowSeverityModal(false);
            setSelectedAllergen(null);
        }
    };

    const savedAllergies = currentProfile?.allergies || [];

    return(
        <div className="profiles-page">
            <div className="profiles-background-circle"></div>

            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', gap: '8px' }}>
                    <Link to="/">
                        <button className="simple-arrow-btn">
                            ←
                        </button>
                    </Link>
                    {!currentProfile ? (
                        <>
                            <input
                                type="text"
                                className="name-input"
                                placeholder="Enter profile name"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                autoFocus
                                style={{ marginBottom: 0 }}
                            />
                            <button className="checkmark-btn" onClick={handleSaveName}>
                                ✓
                            </button>
                        </>
                    ) : isEditing ? (
                        <>
                            <input
                                type="text"
                                className="name-input"
                                placeholder="Enter profile name"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                autoFocus
                                style={{ marginBottom: 0 }}
                            />
                            <button className="checkmark-btn" onClick={handleSaveName}>
                                ✓
                            </button>
                        </>
                    ) : (
                        <h1 className="profile-title" onClick={() => setIsEditing(true)} style={{ cursor: 'pointer', margin: 0 }}>
                            {currentProfile.name}
                        </h1>
                    )}
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
                            <div className="add-allergy-circle" onClick={handleAddAllergyClick}>
                                <span>+</span>
                            </div>
                            <p className="allergy-name">add new</p>
                        </div>
                    </div>
                </div>
            </div>

            {showAllergenModal && (
                <div className="modal-overlay" onClick={() => setShowAllergenModal(false)}>
                    <div className="modal-content allergen-modal" onClick={(e) => e.stopPropagation()}>
                        <h3 className="modal-title">Select Allergen</h3>
                        <div className="allergen-modal-grid">
                            {availableAllergens.map((allergen) => (
                                <div
                                    key={allergen.name}
                                    className="allergen-modal-item"
                                    onClick={() => handleAllergenSelect(allergen)}
                                >
                                    <div className="allergen-circle">
                                        <div className="wheat-icon">{allergen.icon}</div>
                                    </div>
                                    <p className="allergen-label">{allergen.name}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {showSeverityModal && (
                <div className="modal-overlay" onClick={() => setShowSeverityModal(false)}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <button
                            className="severity-btn mild"
                            onClick={() => handleSeveritySelect("mild")}
                        >
                            <span className="severity-icon">⚠️</span>
                            Mild Allergy
                        </button>
                        <button
                            className="severity-btn severe"
                            onClick={() => handleSeveritySelect("severe")}
                        >
                            <span className="severity-icon">❗</span>
                            Severe Allergy
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
} export default Profiles