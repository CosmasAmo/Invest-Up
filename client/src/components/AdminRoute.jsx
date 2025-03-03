import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import PropTypes from 'prop-types';

function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, checkAuth } = useStore();
    const [isChecking, setIsChecking] = useState(true);
    const navigate = useNavigate();
    useSessionTimeout();

    useEffect(() => {
        const verifyAuth = async () => {
            console.log('AdminRoute: Verifying authentication...');
            await checkAuth();
            
            console.log('AdminRoute: Auth check complete. isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin);
            
            // Get admin status from localStorage as a fallback
            const localIsAdmin = localStorage.getItem('is_admin') === 'true';
            console.log('AdminRoute: Admin status from localStorage:', localIsAdmin);
            
            setIsChecking(false);
            
            if (!isAuthenticated) {
                console.log('AdminRoute: Not authenticated, redirecting to login');
                navigate('/login', { replace: true });
            } else if (!isAdmin && !localIsAdmin) {
                console.log('AdminRoute: Not an admin, redirecting to dashboard');
                navigate('/dashboard', { replace: true });
            } else {
                console.log('AdminRoute: Admin access granted');
            }
        };
        verifyAuth();
    }, [checkAuth, isAdmin, isAuthenticated, navigate]);

    if (isChecking) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-white text-xl">Verifying admin access...</div>
        </div>;
    }

    // Check both the store state and localStorage
    const localIsAdmin = localStorage.getItem('is_admin') === 'true';
    if (!isAuthenticated || (!isAdmin && !localIsAdmin)) {
        return null;
    }

    return children;
}

// Add PropTypes validation
AdminRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default AdminRoute; 