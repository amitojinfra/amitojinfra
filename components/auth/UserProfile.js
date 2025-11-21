// User Profile Component
import Image from 'next/image';
import { useAuth } from '../../contexts/AuthContext';

const UserProfile = ({ showLogout = true, className = "user-profile" }) => {
  const { user, logout, loading } = useAuth();

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className={className} style={{
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem',
      backgroundColor: '#f8f9fa',
      borderRadius: '0.5rem',
      border: '1px solid #e9ecef'
    }}>
      {user.photoURL && (
        <div style={{ position: 'relative', width: '48px', height: '48px' }}>
          <Image
            src={user.photoURL}
            alt={user.displayName || 'User'}
            width={48}
            height={48}
            style={{
              borderRadius: '50%',
              objectFit: 'cover'
            }}
            unoptimized
          />
        </div>
      )}
      
      <div className="user-info" style={{ flex: 1 }}>
        <h3 style={{ 
          margin: '0 0 0.25rem 0', 
          fontSize: '1.1rem',
          color: '#333'
        }}>
          {user.displayName || 'User'}
        </h3>
        <p style={{ 
          margin: 0, 
          fontSize: '0.875rem',
          color: '#666'
        }}>
          {user.email}
        </p>
        {user.emailVerified && (
          <span style={{
            fontSize: '0.75rem',
            color: '#28a745',
            fontWeight: '500'
          }}>
            ✓ Verified
          </span>
        )}
      </div>
      
      {showLogout && (
        <button
          onClick={handleLogout}
          disabled={loading}
          className="btn btn-secondary"
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.875rem',
            minWidth: 'auto'
          }}
        >
          {loading ? 'Signing out...' : 'Sign Out'}
        </button>
      )}
    </div>
  );
};

export default UserProfile;