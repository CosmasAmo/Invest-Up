import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useStore from '../store/useStore';

const TIMEOUT_DURATION = 30 * 60 * 1000; // 30 minutes

export function useSessionTimeout() {
    const navigate = useNavigate();
    const { logout } = useStore();

    useEffect(() => {
        let timeoutId;

        const resetTimeout = () => {
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(async () => {
                await logout();
                navigate('/login');
            }, TIMEOUT_DURATION);
        };

        const events = ['mousedown', 'keydown', 'scroll', 'touchstart'];
        events.forEach(event => document.addEventListener(event, resetTimeout));
        resetTimeout();

        return () => {
            if (timeoutId) clearTimeout(timeoutId);
            events.forEach(event => document.removeEventListener(event, resetTimeout));
        };
    }, [logout, navigate]);
} 