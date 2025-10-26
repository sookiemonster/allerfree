import './App.css'

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Results from "./pages/Results"
import Profiles from "./pages/Profiles"
import Allergies from "./pages/Allergies"
import Test from "./pages/Test"
import ProfileTest from './pages/profileTest';

function App() {
  	
	return (
		<>
			<Routes>
    			<Route path="/profileTest" element={<Home />} />
				<Route path="/results" element={<Results />} />
				<Route path="/profiles" element={<Profiles />} />
				<Route path="/allergies" element={<Allergies />} />
				<Route path="/test" element={<Test />} />
				<Route path="/" element={<ProfileTest />} />
    		</Routes>
		</>
	)
} export default App
