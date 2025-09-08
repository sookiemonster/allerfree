import './App.css'

import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home"

function App() {
  	
	return (
		<Routes> 
    		<Route path="/" element={<Home />} />
			{/* <Route path="/club" element={<Club />} />
			<Route path="/event" element={<Event />} />
			<Route path="/auth" element={<Auth />} /> */}
    	</Routes>
	)
} export default App
