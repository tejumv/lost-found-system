import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom"; // Import useLocation

// Page Components
import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Items from "./pages/Items";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Footbar from "./components/Footbar";

// Navbar Component
import Navbar from "./components/Navbar";

// --- NEW COMPONENT TO MANAGE CONDITIONAL RENDERING ---
function AppContent() {
  const location = useLocation();

  // Define the path(s) where the Navbar should NOT be shown
  // We want to hide it on the Home page, which is at path: "/"
  const hideNavbarPaths = ['/']; 

  // Check if the current path is in the exclusion list
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  return (
    <>
      {/* 💡 Conditional Rendering */}
      {shouldShowNavbar && <Navbar />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lost" element={<Lost />} />
        <Route path="/found" element={<Found />} />
        <Route path="/items" element={<Items />} />

        <Route path="/login" element={<Login />} />
        <Route path="/contact" element={<p>Contact Details Page Placeholder</p>} />
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Note: Footbar is typically a component, not a route. 
           If you want the Footbar on all pages, it should be placed 
           outside the <Routes> block like the Navbar. */}
        <Route path="/footbar" element={<Footbar />} /> 
      </Routes>
      
      {/* You can optionally render Footbar here if you want it on all pages */}
      {/* <Footbar /> */}
    </>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <AppContent /> {/* Render the new component inside the Router */}
    </Router>
  );
}

export default App;