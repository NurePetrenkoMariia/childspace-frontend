import { Navigate, Outlet} from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

const ProtectedRoute = () => {
    const { user, loading } = useAuth();

    if (loading) return <div>Завантаження...</div>; 
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;