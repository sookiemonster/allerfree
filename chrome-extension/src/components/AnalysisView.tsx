import type { RestaurantInfo } from "../types/AnalysisJob";

export default function AnalysisView({
  restaurant,
  menuCount,
  names,
  selected,
  onToggleSelection,
  onAnalyzeSelected,
  onAnalyzeAll,
  isAnalyzing,
  canAnalyzeSelected,
  canAnalyzeAll,
}: {
  restaurant: RestaurantInfo | null;
  menuCount: number;

  names: string[];
  selected: Set<string>;
  onToggleSelection: (name: string) => void;

  onAnalyzeSelected: () => void;
  onAnalyzeAll: () => void;

  isAnalyzing: boolean;
  canAnalyzeSelected: boolean;
  canAnalyzeAll: boolean;
}) {
  return (
    <>
      <div className="results-panel">
        {/* Restaurant (left) + Menus found (right) */}
        <div className="results-top-row">
          <div className="results-restaurant-summary">
            <div className="results-title">Restaurant</div>
            <div className="results-muted results-restaurant-name">
              {restaurant?.name ? restaurant.name : "Unknown"}
            </div>
          </div>

          <div className="results-menus-summary">
            <div className="results-title">Menus found</div>
            <div className="results-muted">{menuCount}</div>
          </div>
        </div>

        <div className="results-divider" />

        <div className="results-section">
          <div className="results-title">Analyze selected profiles</div>

          <ul className="results-list">
            {names.map((name) => {
              const selectedCls = selected.has(name)
                ? "results-item results-item--selected"
                : "results-item";

              return (
                <li key={name} className={selectedCls}>
                  <input
                    id={`prof-${name}`}
                    type="checkbox"
                    checked={selected.has(name)}
                    onChange={() => onToggleSelection(name)}
                  />
                  <label className="clickable" htmlFor={`prof-${name}`}>
                    {name}
                  </label>
                </li>
              );
            })}
          </ul>

          <div className="results-footer">
            <button
              className="btn"
              onClick={onAnalyzeSelected}
              disabled={!canAnalyzeSelected}
              aria-busy={isAnalyzing}
              title={
                selected.size === 0
                  ? "Select at least one profile"
                  : menuCount === 0
                  ? "No menu images found"
                  : undefined
              }
            >
              {isAnalyzing ? "Analyzing…" : "Analyze Selected"}
            </button>

            <span className="results-muted">Selected: {selected.size}</span>
          </div>
        </div>
      </div>

      {/* Analyze All button - full width, centered */}
      <button
        className="btn btn-full-width"
        onClick={onAnalyzeAll}
        disabled={!canAnalyzeAll}
        aria-busy={isAnalyzing}
        title={menuCount === 0 ? "No menu images found" : undefined}
      >
        {isAnalyzing ? "Analyzing…" : "Analyze All"}
      </button>
    </>
  );
}
