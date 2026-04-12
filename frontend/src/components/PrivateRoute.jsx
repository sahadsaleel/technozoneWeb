import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function PrivateRoute() {
  const { user, loading } = useAuth();

  if (loading) return null; // wait for token verification, no flash

  return user ? <Outlet /> : <Navigate to="/login" replace />;
}