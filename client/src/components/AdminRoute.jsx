import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useStore from '../store/useStore';
import { useSessionTimeout } from '../hooks/useSessionTimeout';
import axiosInstance from '../api/axios';
import PropTypes from 'prop-types';

function AdminRoute({ children }) {
    const { isAuthenticated, isAdmin, checkAuth, isLoading } = useStore();
    const [isChecking, setIsChecking] = useState(true);
    const [checkError, setCheckError] = useState(null);
    const [authCompleted, setAuthCompleted] = useState(false);
    const navigate = useNavigate();
    useSessionTimeout();

    useEffect(() => {
        const verifyAuth = async () => {
            try {
                console.log('AdminRoute: Verifying authentication...');
                console.log('AdminRoute: Initial state - isAuthenticated:', isAuthenticated, 'isAdmin:', isAdmin, 'isLoading:', isLoading);
                
                // Wait for store to finish loading if it's still loading
                if (isLoading) {
                    console.log('AdminRoute: Store is still loading, waiting...');
                    return;
                }
                
                // First, check our store state
                const authResult = await checkAuth();
                console.log('AdminRoute: Auth check result:', authResult);
                
                // Get the updated state after checkAuth completes
                const currentState = useStore.getState();
                console.log('AdminRoute: State after auth check - isAuthenticated:', currentState.isAuthenticated, 'isAdmin:', currentState.isAdmin);
                
                // Then make a direct check to the admin endpoint as a secondary verification
                const response = await axiosInstance.get('/api/admin/dashboard');
                console.log('Admin check response:', response.data);
                
                if (!response.data.success) {
                    throw new Error('Admin verification failed');
                }
                
                // Get admin status from multiple sources after auth check
                const localIsAdmin = localStorage.getItem('is_admin') === 'true';
                const userDataIsAdmin = currentState.userData?.isAdmin === true;
                const finalIsAdmin = currentState.isAdmin || localIsAdmin || userDataIsAdmin;
                
                console.log('AdminRoute: Final admin status:', finalIsAdmin);
                console.log('AdminRoute: Final auth status:', currentState.isAuthenticated);
                
                setAuthCompleted(true);
                setIsChecking(false);
                
                if (!currentState.isAuthenticated) {
                    console.log('AdminRoute: Not authenticated, redirecting to login');
                    navigate('/login', { replace: true });
                } else if (!finalIsAdmin) {
                    console.log('AdminRoute: Not an admin, redirecting to dashboard');
                    navigate('/dashboard', { replace: true });
                } else {
                    console.log('AdminRoute: Admin access granted');
                }
            } catch (error) {
                console.error('Admin verification error:', error);
                setCheckError(error.message);
                setAuthCompleted(true);
                setIsChecking(false);
                
                // On admin verification error, redirect to login
                setTimeout(() => {
                    navigate('/login', { replace: true });
                }, 2000);
            }
        };
        verifyAuth();
    }, [checkAuth, navigate, isLoading]);

    // Show loading state if we're checking auth
    if (isChecking) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-white text-xl">Verifying admin access...</div>
        </div>;
    }

    if (checkError) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="bg-red-500/10 text-red-500 p-4 rounded-lg max-w-md">
                <p className="mb-4">Admin access verification failed: {checkError}</p>
                <p className="text-sm">Redirecting to login...</p>
            </div>
        </div>;
    }

    // Only render children if authentication check is completed and user is authenticated and admin
    if (!authCompleted) {
        return <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="text-white text-xl">Loading...</div>
        </div>;
    }

    // Get the current state after auth check
    const currentState = useStore.getState();
    const localIsAdmin = localStorage.getItem('is_admin') === 'true';
    const userDataIsAdmin = currentState.userData?.isAdmin === true;
    const finalIsAdmin = currentState.isAdmin || localIsAdmin || userDataIsAdmin;
    
    if (!currentState.isAuthenticated || !finalIsAdmin) {
        return null;
    }

    return children;
}

// Add PropTypes validation
AdminRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default AdminRoute; 