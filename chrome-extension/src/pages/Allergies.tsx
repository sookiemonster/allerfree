import { Link } from "react-router-dom";
import { useState } from "react";

function Allergies()
{
    const [showModal, setShowModal] = useState(false);
    const [selectedAllergen, setSelectedAllergen] = useState("");

    const allergens = [
        "gluten", "gluten", "gluten",
        "gluten", "gluten", "gluten",
        "gluten", "gluten", "gluten"
    ];

    const handleAllergenClick = (allergen: string) => {
        setSelectedAllergen(allergen);
        setShowModal(true);
    };

    const handleSeveritySelect = (severity: string) => {
        console.log(`Selected ${severity} for ${selectedAllergen}`);
        setShowModal(false);
    };

    return(
        <div className="allergies-page">
            <div className="allergies-background-circle"></div>

            <div style={{ position: 'relative', zIndex: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                    <Link to="/profiles">
                        <button className="simple-arrow-btn" style={{ marginRight: '20px' }}>
                            ←
                        </button>
                    </Link>
                    <h1 className="allergies-title">Select Your Allergies</h1>
                </div>

                <div className="allergens-grid">
                    {allergens.map((allergen, index) => (
                        <div key={index} className="allergen-item">
                            <div className="allergen-circle" onClick={() => handleAllergenClick(allergen)}>
                                <div className="wheat-icon">🌾</div>
                                <div className="add-allergen-btn">+</div>
                            </div>
                            <p className="allergen-label">{allergen}</p>
                        </div>
                    ))}
                </div>
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
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
} export default Allergies