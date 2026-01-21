
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedLayout = () => {
    const { isAuthenticated, isLoading, mustChangePassword } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (mustChangePassword) {
        // If we strictly implement the force password change logic
        // we might redirect to a specific page or allow rendering but with a modal.
        // For now, let's assume if they must change password, they can access the layout 
        // effectively but the context might trigger a modal,
        // OR we redirect them to /change-password
        // return <Navigate to="/change-password" replace />;
        // NOTE: Keeping it simple for now as per instructions to just HAVE the UI ready.
        // The modal logic inside AuthContext/App might be better. 
    }

    return <Outlet />;
};

export default ProtectedLayout;
