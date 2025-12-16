import React from "react";

export default function MiniNav({
  isResults,
  onToggle,
}: {
  isResults: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      className={
        "results-nav-mini " +
        (isResults ? "results-nav-mini--left" : "results-nav-mini--right")
      }
    >
      <button className="nav-link" onClick={onToggle}>
        {isResults ? (
          <>
            <span className="nav-link__arrow">←</span>
            <span>Back to Analysis</span>
          </>
        ) : (
          <>
            <span>Go to Results</span>
            <span className="nav-link__arrow">→</span>
          </>
        )}
      </button>
    </div>
  );
}
