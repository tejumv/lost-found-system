import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext"; // Import AuthProvider
import ProtectedRoute from "./components/ProtectedRoute"; // You'll create this

// Page Components
import Home from "./pages/Home";
import Lost from "./pages/Lost";
import Found from "./pages/Found";
import Items from "./pages/Items";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Footbar from "./components/Footbar";
import Login1 from "./pages/Login1";
// ✅ Correct paths based on your folder structure
import AdminLogin from './admin/pages/AdminLogin';
import AdminDashboard from './admin/pages/AdminDashboard';
import PendingItems from './admin/pages/PendingItems';
import AllItems from './admin/pages/AllItems';
import Users from './admin/pages/Users';
import Reports from './admin/pages/Reports';
import Settings from './admin/pages/Settings';
import Analytics from './admin/pages/Analytics';

// Navbar Component
import Navbar from "./components/Navbar";

// --- NEW COMPONENT TO MANAGE CONDITIONAL RENDERING ---
function AppContent() {
  const location = useLocation();

  // Define the path(s) where the Navbar should NOT be shown
  // We want to hide it on the Home page, which is at path: "/"
  const hideNavbarPaths = ['/', '/login', '/login1', '/admin/login'];

  // Check if the current path is in the exclusion list
  const shouldShowNavbar = !hideNavbarPaths.includes(location.pathname) && !location.pathname.startsWith('/admin');

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
        <Route path="/login1" element={<Login1 />} />
        <Route path="/contact" element={<p>Contact Details Page Placeholder</p>} />
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Admin Routes */}
        <Route path="/admin/login" element={<AdminLogin />} />

        {/* PROTECTED ADMIN ROUTES */}
        <Route path="/admin/dashboard" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />

        <Route path="/admin/pending" element={
          <ProtectedRoute>
            <PendingItems />
          </ProtectedRoute>
        } />

        <Route path="/admin/all-items" element={
          <ProtectedRoute>
            <AllItems />
          </ProtectedRoute>
        } />

        <Route path="/admin/users" element={
          <ProtectedRoute>
            <Users />
          </ProtectedRoute>
        } />

        <Route path="/admin/reports" element={
          <ProtectedRoute>
            <Reports />
          </ProtectedRoute>
        } />

        <Route path="/admin/settings" element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>
        } />

        <Route path="/admin/analytics" element={
          <ProtectedRoute>
            <Analytics />
          </ProtectedRoute>
        } />

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
    <AuthProvider> {/* Wrap everything with AuthProvider */}
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;