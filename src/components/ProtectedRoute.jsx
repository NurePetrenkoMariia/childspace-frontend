import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();

    if (loading) return <div>Завантаження...</div>;
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
        const userRoles = user.roles;

        const hasRequiredRole = allowedRoles.some(role => userRoles.includes(role));

        if (!hasRequiredRole) {
            return <Navigate to="/profile" replace />;
        }
    }
    return <Outlet />;
};

export default ProtectedRoute;