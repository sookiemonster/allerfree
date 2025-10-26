import "@mantine/core/styles.css";
import "./App.css";

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Profiles from "./pages/Profiles";
import Allergies from "./pages/Allergies";
import Test from "./pages/Test";

import { createTheme, MantineProvider } from "@mantine/core";
import { DetectionResultCard } from "./components";
import { flattenMenuItems, type DetectionResult } from "./types";

import { SAMPLE_JSON } from "./sample";
import DetectionResultPane from "./components/DetectionResultPane";

const theme = createTheme({});

function App() {
  const apiResponse: DetectionResult = JSON.parse(SAMPLE_JSON);
  const allitems = flattenMenuItems(apiResponse.results.Thomas);
  //   const items = apiResponse.results.Thomas.sections

  return (
    <>
      <MantineProvider theme={theme}>
        <DetectionResultPane sections={apiResponse.results.Thomas.sections} />
      </MantineProvider>
    </>
  );

  return (
    <>
      <MantineProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/allergies" element={<Allergies />} />
          <Route path="/test" element={<Test />} />
        </Routes>
      </MantineProvider>
    </>
  );
}
export default App;
