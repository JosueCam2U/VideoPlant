import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../../hooks/useAuth.js';
import Spinner from '../../atoms/Spinner/index.jsx';
import styles from './ProtectedRoute.module.css';

export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  const location = useLocation();
  if (loading) return <section className={styles.pending}><Spinner /></section>;
  if (!isAuthenticated) return <Navigate to="/auth" state={{ from: location }} replace />;
  return children;
}
