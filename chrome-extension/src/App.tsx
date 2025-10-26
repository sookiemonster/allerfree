import './App.css'

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"
import Results from "./pages/Results"
import Profiles from "./pages/Profiles"
import Test from "./pages/Test"

function App() {

	return (
		<>
			<Routes>
    			<Route path="/" element={<Home />} />
				<Route path="/results" element={<Results />} />
				<Route path="/profiles" element={<Profiles />} />
				<Route path="/test" element={<Test />} />
    		</Routes>
		</>
	)
} export default App
