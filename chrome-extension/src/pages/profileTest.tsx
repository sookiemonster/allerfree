// src/popup/profileTest.tsx

import { useEffect, useState } from "react";
import { seedSampleProfiles, getAllProfiles } from "../helpers/profiles";
import type { ProfilesMap } from "../types/profiles";

export default function ProfileTest() {
    const [profiles, setProfiles] = useState<ProfilesMap>({});
    const [selected, setSelected] = useState<Set<string>>(new Set());
    const [isSeeding, setIsSeeding] = useState<boolean>(false);
    const [seedMsg, setSeedMsg] = useState<string>("");

    // Load profiles on mount
    useEffect(() => {
        void fetchProfiles();
    }, []);

    async function fetchProfiles() {
        const all = await getAllProfiles();
        setProfiles(all);
        // prune selections of any keys that no longer exist
        setSelected(prev => {
            const next = new Set<string>();
            for (const k of prev) if (k in all) next.add(k);
            return next;
        });
    }

    async function onSeedProfiles() {
        setIsSeeding(true);
        setSeedMsg("");
        try {
            const wrote = await seedSampleProfiles(true);
            await fetchProfiles();
            const count = Object.keys(profiles).length;
            setSeedMsg(wrote ? `Seeded ${count} profiles.` : `Skipped: profiles already exist (${count}).`);
        } catch (e) {
            setSeedMsg("Error seeding profiles");
            console.error(e);
        } finally {
            setIsSeeding(false);
        }
    }

    function toggleSelection(name: string) {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(name)) next.delete(name);
            else next.add(name);
            return next;
        });
    }

    const names = Object.keys(profiles);

    return (
        <div style={{ padding: 12 }}>
            <h1>Profile Test</h1>

            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                <button onClick={onSeedProfiles} disabled={isSeeding} aria-busy={isSeeding}>
                    {isSeeding ? "Seeding…" : "Seed Sample Profiles"}
                </button>
                <button onClick={fetchProfiles} disabled={isSeeding} title="Reload from storage">
                    Refresh
                </button>
                {seedMsg && <span style={{ fontSize: 12, color: "#555" }}>{seedMsg}</span>}
            </div>

            <div style={{ marginBottom: 8, color: "#555", fontSize: 12 }}>
                {names.length === 0 ? "No profiles found." : `Profiles: ${names.length}`}
            </div>

            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: 6 }}>
                {names.map((name) => (
                    <li key={name} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <input
                            id={`prof-${name}`}
                            type="checkbox"
                            checked={selected.has(name)}
                            onChange={() => toggleSelection(name)}
                        />
                        <label htmlFor={`prof-${name}`} style={{ cursor: "pointer" }}>
                            {name}
                        </label>
                    </li>
                ))}
            </ul>

            {/* Optional: show currently selected */}
            {selected.size > 0 && (
                <pre
                    style={{
                        whiteSpace: "pre-wrap",
                        marginTop: 12,
                        maxHeight: 200,
                        overflowY: "auto",
                        padding: 8,
                        borderRadius: 6,
                    }}
                >
{JSON.stringify(Array.from(selected), null, 2)}
                </pre>
            )}
        </div>
    );
}
