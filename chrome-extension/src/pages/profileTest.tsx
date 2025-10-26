// src/popup/profileTest.tsx

import { useEffect, useState } from "react";
import {
    seedSampleProfiles,
    getAllProfiles,
    addProfile,
    addAllergenToProfile,
    removeAllergenFromProfile,
} from "../helpers/profiles";
import type { ProfilesMap } from "../types/profiles";
import type { Allergen } from "../types/profiles";

type Page = "list" | "add" | "edit";

export default function ProfileTest() {
    const [page, setPage] = useState<Page>("list");

    const [profiles, setProfiles] = useState<ProfilesMap>({});
    const [selected, setSelected] = useState<Set<string>>(new Set());

    // list page state
    const [isSeeding, setIsSeeding] = useState<boolean>(false);
    const [seedMsg, setSeedMsg] = useState<string>("");

    // add page state
    const [newName, setNewName] = useState<string>("");
    const [adding, setAdding] = useState<boolean>(false);
    const [addMsg, setAddMsg] = useState<string>("");

    // edit page state
    const [editKey, setEditKey] = useState<string>("");
    const [editBusy, setEditBusy] = useState<boolean>(false);
    const [editMsg, setEditMsg] = useState<string>("");

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
        // if the current editKey was removed, clear it
        if (editKey && !(editKey in all)) setEditKey("");
    }

    // ----- Page 1: List / seed -----
    async function onSeedProfiles() {
        setIsSeeding(true);
        setSeedMsg("");
        try {
            const wrote = await seedSampleProfiles(true); // force overwrite for testing
            await fetchProfiles();
            const count = Object.keys(profiles).length;
            setSeedMsg(wrote ? `Seeded ${count} profiles.` : `Skipped (already exists).`);
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

    // ----- Page 2: Add profile -----
    async function onAddProfile() {
        const key = newName.trim();
        if (!key) {
            setAddMsg("Enter a profile name.");
            return;
        }
        setAdding(true);
        setAddMsg("");
        try {
            const wrote = await addProfile(key, false);
            if (!wrote) {
                setAddMsg(`Profile "${key}" already exists.`);
            } else {
                setAddMsg(`Created profile "${key}".`);
                setNewName("");
                await fetchProfiles();
            }
        } catch (e) {
            setAddMsg("Error creating profile.");
            console.error(e);
        } finally {
            setAdding(false);
        }
    }

    // ----- Page 3: Edit allergens -----
    async function applyAllergen(op: "add-high" | "add-mild" | "remove", allergenName: Allergen["allergen"]) {
        if (!editKey) {
            setEditMsg("Pick a profile first.");
            return;
        }
        setEditBusy(true);
        setEditMsg("");
        try {
            if (op === "remove") {
                const changed = await removeAllergenFromProfile(editKey, allergenName);
                setEditMsg(changed ? `Removed ${allergenName}.` : `${allergenName} not present.`);
            } else {
                const sensitivity = op === "add-high" ? "HIGH" : "MILD";
                const changed = await addAllergenToProfile(
                    editKey,
                    { allergen: allergenName, sensitivity },
                    { dedupe: true, replaceSensitivity: true }
                );
                setEditMsg(changed ? `Set ${allergenName} → ${sensitivity}.` : `No change for ${allergenName}.`);
            }
            await fetchProfiles();
        } catch (e) {
            setEditMsg("Error updating allergens.");
            console.error(e);
        } finally {
            setEditBusy(false);
        }
    }

    const names = Object.keys(profiles).sort();

    return (
        <div style={{ padding: 12 }}>
            <h1>Profile Test</h1>

            {/* Nav */}
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <button onClick={() => setPage("list")} disabled={page === "list"}>List / Seed</button>
                <button onClick={() => setPage("add")} disabled={page === "add"}>Add Profile</button>
                <button onClick={() => setPage("edit")} disabled={page === "edit"}>Edit Allergens</button>
            </div>

            {/* Page content */}
            {page === "list" && (
                <>
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
                </>
            )}

            {page === "add" && (
                <>
                    <h2 style={{ marginBottom: 8 }}>Create New Profile</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                        <input
                            placeholder="Profile name"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            disabled={adding}
                        />
                        <button onClick={onAddProfile} disabled={adding || !newName.trim()}>
                            {adding ? "Creating…" : "Create Profile"}
                        </button>
                        {addMsg && <span style={{ fontSize: 12, color: "#555" }}>{addMsg}</span>}
                    </div>

                    {names.length > 0 && (
                        <div style={{ marginTop: 16, fontSize: 12, color: "#555" }}>
                            Existing: {names.join(", ")}
                        </div>
                    )}
                </>
            )}

            {page === "edit" && (
                <>
                    <h2 style={{ marginBottom: 8 }}>Edit Allergens</h2>
                    <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
                        <label htmlFor="profile-select">Profile:</label>
                        <select
                            id="profile-select"
                            value={editKey}
                            onChange={(e) => setEditKey(e.target.value)}
                            disabled={editBusy}
                        >
                            <option value="">-- choose --</option>
                            {names.map((n) => (
                                <option key={n} value={n}>{n}</option>
                            ))}
                        </select>
                        <button onClick={fetchProfiles} disabled={editBusy}>Refresh</button>
                        {editMsg && <span style={{ fontSize: 12, color: "#555" }}>{editMsg}</span>}
                    </div>

                    <div style={{ display: "grid", gap: 10, maxWidth: 420 }}>
                        {/* Gluten */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ width: 90 }}>gluten</span>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("add-high", "gluten")}>
                                Add HIGH
                            </button>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("add-mild", "gluten")}>
                                Add MILD
                            </button>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("remove", "gluten")}>
                                Remove
                            </button>
                        </div>

                        {/* tree_nuts */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ width: 90 }}>tree_nuts</span>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("add-high", "tree_nuts")}>
                                Add HIGH
                            </button>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("add-mild", "tree_nuts")}>
                                Add MILD
                            </button>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("remove", "tree_nuts")}>
                                Remove
                            </button>
                        </div>

                        {/* shellfish */}
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                            <span style={{ width: 90 }}>shellfish</span>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("add-high", "shellfish")}>
                                Add HIGH
                            </button>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("add-mild", "shellfish")}>
                                Add MILD
                            </button>
                            <button disabled={!editKey || editBusy} onClick={() => applyAllergen("remove", "shellfish")}>
                                Remove
                            </button>
                        </div>
                    </div>

                    {/* Show current allergens for selected profile */}
                    {editKey && profiles[editKey] && (
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
{JSON.stringify(profiles[editKey].allergens, null, 2)}
                        </pre>
                    )}
                </>
            )}
        </div>
    );
}
