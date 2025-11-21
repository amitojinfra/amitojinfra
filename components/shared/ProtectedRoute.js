// Protected Route Component
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

const ProtectedRoute = ({ 
  children, 
  fallback = null, 
  redirectTo = '/auth',
  requireAuth = true 
}) => {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && requireAuth && !user) {
      router.push(redirectTo);
    }
  }, [user, loading, router, redirectTo, requireAuth]);

  // Show loading state
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '200px',
        fontSize: '1.1rem',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  // If auth is required but user is not authenticated
  if (requireAuth && !user) {
    return fallback || (
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        color: '#666'
      }}>
        <p>Redirecting to sign in...</p>
      </div>
    );
  }

  // If auth is not required OR user is authenticated
  return children;
};

export default ProtectedRoute;