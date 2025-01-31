import { Navigate } from 'react-router-dom';
import useStore from '../store/useStore';

export function PrivateRoute({ children }) {
  const { isAuthenticated, isVerified, userData } = useStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (!isVerified && userData && !userData.isAccountVerified) {
    return <Navigate to="/email-verify" />;
  }

  return children;
}

export function PublicRoute({ children }) {
  const { isAuthenticated, userData, isLoading } = useStore();

  if (isLoading && isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (isAuthenticated && userData) {
    if (userData.isAdmin) {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}