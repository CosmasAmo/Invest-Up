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
            await checkAuth();
            setIsChecking(false);
            
            if (!isAuthenticated) {
                navigate('/login', { replace: true });
            } else if (!isAdmin) {
                navigate('/dashboard', { replace: true });
            }
        };
        verifyAuth();
    }, [checkAuth, isAdmin, isAuthenticated, navigate]);

    if (isChecking) {
        return <div>Loading...</div>;
    }

    if (!isAuthenticated || !isAdmin) {
        return null;
    }

    return children;
}

// Add PropTypes validation
AdminRoute.propTypes = {
    children: PropTypes.node.isRequired
};

export default AdminRoute; 