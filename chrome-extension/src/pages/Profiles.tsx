import { Link } from "react-router-dom";
import { useState } from "react";
import { useProfiles } from "../contexts/ProfileContext";

const availableAllergens = [
    { name: "gluten", icon: "🌾" },
    { name: "soy", icon: "🫘" },
    { name: "sesame", icon: "⚪" }
];

function Profiles()
{
    const { profiles, currentProfile, setCurrentProfile, addAllergyToProfile, removeAllergyFromProfile } = useProfiles();
    const [showAllergenModal, setShowAllergenModal] = useState(false);
    const [showSeverityModal, setShowSeverityModal] = useState(false);
    const [selectedAllergen, setSelectedAllergen] = useState<{name: string, icon: string} | null>(null);
    const [isEditingExisting, setIsEditingExisting] = useState(false);

    const handleProfileChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const profileId = e.target.value;
        if (profileId) {
            setCurrentProfile(profileId);
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
        const isAlreadyAdded = savedAllergies.some(a => a.name === allergen.name);
        if (isAlreadyAdded) {
            return; // Don't allow selecting already added allergens
        }
        setSelectedAllergen(allergen);
        setIsEditingExisting(false);
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

    const handleExistingAllergyClick = (allergy: { name: string, icon: string }) => {
        if (currentProfile) {
            setSelectedAllergen(allergy);
            setIsEditingExisting(true);
            setShowSeverityModal(true);
        }
    };

    const handleDeleteAllergy = () => {
        if (currentProfile && selectedAllergen) {
            removeAllergyFromProfile(currentProfile.id, selectedAllergen.name);
            setShowSeverityModal(false);
            setSelectedAllergen(null);
            setIsEditingExisting(false);
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
                </div>

                <div className="profile-section">
                    <div className="profile-picture-container">
                        <div className="profile-picture">
                            <div className="profile-icon">👤</div>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '8px' }}>
                    <h2 className="current-allergies-title">Current Allergies</h2>
                </div>

                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                    <select
                        className="profile-dropdown"
                        value={currentProfile?.id || ""}
                        onChange={handleProfileChange}
                    >
                        <option value="">Select a profile</option>
                        {profiles.map((profile) => (
                            <option key={profile.id} value={profile.id}>
                                {profile.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="allergies-display">
                    <div className="allergies-carousel">
                        {savedAllergies.map((allergy, index) => (
                            <div key={index} className="allergy-item">
                                <div
                                    className="allergy-circle"
                                    onClick={() => handleExistingAllergyClick({ name: allergy.name, icon: allergy.icon })}
                                    style={{ cursor: 'pointer' }}
                                >
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
                            {availableAllergens.map((allergen) => {
                                const isAlreadyAdded = savedAllergies.some(a => a.name === allergen.name);
                                return (
                                    <div
                                        key={allergen.name}
                                        className={`allergen-modal-item ${isAlreadyAdded ? 'disabled' : ''}`}
                                        onClick={() => handleAllergenSelect(allergen)}
                                        style={{ opacity: isAlreadyAdded ? 0.4 : 1, cursor: isAlreadyAdded ? 'not-allowed' : 'pointer' }}
                                    >
                                        <div className="allergen-circle">
                                            <div className="wheat-icon">{allergen.icon}</div>
                                        </div>
                                        <p className="allergen-label">{allergen.name}</p>
                                    </div>
                                );
                            })}
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
                        {isEditingExisting && (
                            <button
                                className="severity-btn delete"
                                onClick={handleDeleteAllergy}
                            >
                                Delete Allergy
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
} export default Profiles