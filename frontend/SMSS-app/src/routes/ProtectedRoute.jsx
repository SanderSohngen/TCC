import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedUserType }) => {
  const { user, isLoggedIn } = useAuth();

  if (!isLoggedIn || user.user_type !== allowedUserType) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;