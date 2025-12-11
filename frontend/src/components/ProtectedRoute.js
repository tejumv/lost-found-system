// src/components/ProtectedRoute.js
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children }) => {
    const { admin, loading } = useAuth();

    if (loading) {
        // Show loading spinner while checking auth
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '100vh' 
            }}>
                <div>Loading...</div>
            </div>
        );
    }

    if (!admin) {
        // Redirect to admin login if not authenticated
        return <Navigate to="/admin/login" replace />;
    }

    // If authenticated, render the children (protected component)
    return children;
};

export default ProtectedRoute;