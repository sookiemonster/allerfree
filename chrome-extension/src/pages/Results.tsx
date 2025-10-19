import { useState } from "react";

function NavToggle({
  isResults,
  onToggle,
}: {
  isResults: boolean;
  onToggle: () => void;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <button onClick={onToggle}>
        {isResults ? "Go to Start Analysis Process" : "Go to Results"}
      </button>
    </div>
  );
}

function Results() {
  // false = show "Start Analysis Process" first
  const [isResults, setIsResults] = useState<boolean>(false);

  const toggle = () => setIsResults((v) => !v);

  return (
    <>
      <NavToggle isResults={isResults} onToggle={toggle} />
      {/* Always render small navigator to switch views */}
      {isResults ? <h1>Results</h1> : <h1>Start Analysis Process</h1>}
    </>
  );
}

export default Results;
