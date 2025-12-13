import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";

// Page Components
import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Items from "./pages/Items";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportItem from "./pages/ReportItem";
import HelpForm from "./pages/Help";
import Profile from "./pages/Profile";
import Footbar from "./components/Footbar";
import Login1 from "./pages/Login1";
import MyItems from "./pages/MyItems";
// Navbar Component
import Navbar from "./components/Navbar";

// --- PRIVATE ROUTE COMPONENT ---
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// --- NEW COMPONENT TO MANAGE CONDITIONAL RENDERING ---
function AppContent() {
  const location = useLocation();

  // Define the path(s) where the Navbar should NOT be shown
  const hideNavbarPaths = ['/', '/login', '/login1', '/contact', '/contact?firstName=Lindsay&lastName=Doe&email=lindsay.doe%40email.com&state=Select+state&employees=Number+of+Employees'];

  // Check if the current path is in the exclusion list
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname);

  // Define paths where Footbar should NOT be shown
  const hideFootbarPaths = ['/', '/login', '/login1', '/contact'];
  const shouldShowFootbar = !hideFootbarPaths.includes(location.pathname);

  return (
    <>
      {/* Conditional Rendering for Navbar */}
      {shouldShowNavbar && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/lost" element={<Lost />} />
        <Route path="/found" element={<Found />} />
        <Route path="/items" element={<Items />} />
        <Route path="/login" element={<Login />} />
        <Route path="/login1" element={<Login1 />} />
        <Route path="/contact" element={<HelpForm />} />

        {/* PROTECTED ROUTES - Require Login */}
        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-items"
          element={
            <PrivateRoute>
              <MyItems />
            </PrivateRoute>
          }
        />
        <Route
          path="/report-item"
          element={
            <PrivateRoute>
              <ReportItem />
            </PrivateRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />
      </Routes>

      {/* Conditional Rendering for Footbar */}
      {shouldShowFootbar && <Footbar />}
    </>
  );
}

// --- MAIN APP COMPONENT ---
function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}

export default App;