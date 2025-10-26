import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useProfiles } from "../contexts/ProfileContext";

function Home()
{
    const navigate = useNavigate();
    const { profiles, setCurrentProfile } = useProfiles();
    const [selectedProfileId, setSelectedProfileId] = useState("");

    const handleProceed = () => {
        if (selectedProfileId) {
            setCurrentProfile(selectedProfileId);
            navigate("/profiles");
        }
    };

    const handleCreateNew = () => {
        navigate("/profiles");
    };

    return(
        <div className="home-page">
            <div className="home-content">
                <img src="/wheat-icon.png" alt="Wheat icon" className="home-wheat-icon" />
                <h1 className="home-title">Allerfree</h1>

                <select
                    className="profile-dropdown"
                    value={selectedProfileId}
                    onChange={(e) => setSelectedProfileId(e.target.value)}
                >
                    <option value="">Select a profile</option>
                    {profiles.map((profile) => (
                        <option key={profile.id} value={profile.id}>
                            {profile.name}
                        </option>
                    ))}
                </select>

                <button
                    className="create-profile-btn"
                    onClick={handleCreateNew}
                >
                    Create New Profile
                </button>

                <button
                    className="circle-arrow-btn"
                    onClick={handleProceed}
                    disabled={!selectedProfileId}
                >
                    →
                </button>
            </div>
        </div>
    )
} export default Home