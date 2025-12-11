import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";


// OPTION 1: If files are in src/admin/pages/
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import PendingItems from './admin/pages/PendingItems';
import AllItems from './admin/pages/AllItems';
import Users from './admin/pages/Users';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';
import Analytics from './admin/pages/Analytics';

import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Items from "./pages/Items";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ReportItem from "./pages/ReportItem";
import Footbar from "./components/Footbar";
import Login1 from "./pages/Login1";
import HelpForm from "./pages/Help";

// Navbar Component
import Navbar from "./components/Navbar";

// --- PRIVATE ROUTE COMPONENT ---
const PrivateRoute = ({ children }) => {
  // Check if user is logged in (has token in localStorage)
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" />;
};

// --- NEW COMPONENT TO MANAGE CONDITIONAL RENDERING ---
function AppContent() {
  const location = useLocation();

  // Define the path(s) where the Navbar should NOT be shown
  const hideNavbarPaths = ['/', '/login', '/login1', '/contact', '/contact?firstName=Lindsay&lastName=Doe&email=lindsay.doe%40email.com&state=Select+state&employees=Number+of+Employees'];
  // Check if the current path is in the exclusion list
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname) && !location.pathname.startsWith('/admin');

  return (
    <>
      {/* 💡 Conditional Rendering */}
      {shouldShowNavbar && <Navbar />}

      <Routes>
        {/* ========== ADMIN ROUTES ========== */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/pending" element={<PendingItems />} />
        <Route path="/admin/all-items" element={<AllItems />} />
        <Route path="/admin/users" element={<Users />} />
        <Route path="/admin/reports" element={<Reports />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/analytics" element={<Analytics />} />

        {/* ========== YOUR EXISTING ROUTES ========== */}
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
          path="/report-item"
          element={
            <PrivateRoute>
              <ReportItem />
            </PrivateRoute>
          }
        />

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