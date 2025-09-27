import './App.css'

import { Routes, Route, Link } from "react-router-dom";
import Home from "./pages/Home"
import Results from "./pages/Results"
import Profiles from "./pages/Profiles"
import Allergies from "./pages/Allergies"
import Test from "./pages/Test"

function App() {
  	
	return (
		<>
			<nav>
				<Link to="/">Home</Link>
				<Link to="/results">Results</Link>
				<Link to="/profiles">Profiles</Link>
				<Link to="/allergies">Allergies</Link>
				<Link to="/test">KyleScriptCommunicationTest</Link>
    		</nav>
			<Routes> 
    			<Route path="/" element={<Home />} />
				<Route path="/results" element={<Results />} />
				<Route path="/profiles" element={<Profiles />} />
				<Route path="/allergies" element={<Allergies />} />
				<Route path="/test" element={<Test />} />
    		</Routes>
		</>
	)
} export default App
