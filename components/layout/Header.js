import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';

const Header = () => {
  const router = useRouter();
  const { user, logout, loading, firebaseConfigured } = useAuth();

  const isActive = (pathname) => {
    if (pathname === '/attendance') {
      return router.pathname.startsWith('/attendance') ? 'active' : '';
    }
    if (pathname === '/employees') {
      return router.pathname.startsWith('/employees') ? 'active' : '';
    }
    if (pathname === '/payments') {
      return router.pathname.startsWith('/payments') ? 'active' : '';
    }
    return router.pathname === pathname ? 'active' : '';
  };

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="header">
      <div className="container">
        <nav className="nav">
          <Link href="/" className="nav-brand">
            AmitojInfra
          </Link>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
            <ul className="nav-links">
              <li>
                <Link href="/" className={isActive('/')}>
                  Home
                </Link>
              </li>
              {user && (
                <>
                  <li>
                    <Link href="/dashboard" className={isActive('/dashboard')}>
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link href="/employees" className={isActive('/employees')}>
                      Employees
                    </Link>
                  </li>
                  <li>
                    <Link href="/attendance" className={isActive('/attendance')}>
                      Attendance
                    </Link>
                  </li>
                  <li>
                    <Link href="/payments" className={isActive('/payments')}>
                      Payments
                    </Link>
                  </li>
                </>
              )}
            </ul>
            
            <div className="auth-section">
              {!loading && (
                <>
                  {user ? (
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '0.75rem' 
                    }}>
                      {user.photoURL && (
                        <div style={{ position: 'relative', width: '32px', height: '32px' }}>
                          <Image
                            src={user.photoURL}
                            alt={user.displayName || 'User'}
                            width={32}
                            height={32}
                            style={{
                              borderRadius: '50%',
                              objectFit: 'cover'
                            }}
                            unoptimized
                          />
                        </div>
                      )}
                      <span style={{ 
                        fontSize: '0.875rem', 
                        color: '#333',
                        maxWidth: '120px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {user.displayName || user.email}
                      </span>
                      <button
                        onClick={handleLogout}
                        style={{
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.75rem',
                          backgroundColor: '#f8f9fa',
                          border: '1px solid #dee2e6',
                          borderRadius: '0.25rem',
                          cursor: 'pointer',
                          color: '#666'
                        }}
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <>
                      {!firebaseConfigured ? (
                        <Link 
                          href="/firebase-setup" 
                          className={`${isActive('/firebase-setup')} auth-link`}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            borderRadius: '0.25rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Setup Firebase
                        </Link>
                      ) : (
                        <Link 
                          href="/auth" 
                          className={`${isActive('/auth')} auth-link`}
                          style={{
                            padding: '0.5rem 1rem',
                            backgroundColor: '#0070f3',
                            color: 'white',
                            borderRadius: '0.25rem',
                            textDecoration: 'none',
                            fontSize: '0.875rem',
                            fontWeight: '500'
                          }}
                        >
                          Sign In
                        </Link>
                      )}
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Header;