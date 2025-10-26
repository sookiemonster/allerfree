import "@mantine/core/styles.css";
import "./App.css";

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Results from "./pages/Results";
import Profiles from "./pages/Profiles";
import Allergies from "./pages/Allergies";
import Test from "./pages/Test";
import ProfileTest from "./pages/profileTest";

import { createTheme, MantineProvider } from "@mantine/core";
const theme = createTheme({});

function App() {
  return (
    <>
      <MantineProvider theme={theme}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/results" element={<Results />} />
          <Route path="/profiles" element={<Profiles />} />
          <Route path="/allergies" element={<Allergies />} />
          <Route path="/test" element={<Test />} />
          <Route path="/profileTest" element={<ProfileTest />} />
        </Routes>
      </MantineProvider>
    </>
  );
}
export default App;
