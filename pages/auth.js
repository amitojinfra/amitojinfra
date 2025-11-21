import Layout from '../components/layout/Layout';
import GoogleLoginButton from '../components/auth/GoogleLoginButton';
import UserProfile from '../components/auth/UserProfile';
import { useAuth } from '../contexts/AuthContext';

export default function Auth() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Layout title="Authentication - AmitojInfra" description="Sign in to your AmitojInfra account">
        <div className="text-center">
          <div style={{ 
            padding: '2rem',
            fontSize: '1.1rem',
            color: '#666'
          }}>
            Loading...
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Authentication - AmitojInfra" description="Sign in to your AmitojInfra account">
      <div className="auth-page">
        <div className="text-center mb-4">
          <h1>Authentication</h1>
          <p>Access your AmitojInfra account and personalized services</p>
        </div>

        {!user ? (
          <div className="auth-section">
            <div className="card" style={{ maxWidth: '400px', margin: '0 auto' }}>
              <h2 className="text-center">Sign In</h2>
              <p className="text-center mb-3" style={{ color: '#666' }}>
                Sign in with your Google account to access exclusive features and services.
              </p>
              
              <div className="text-center">
                <GoogleLoginButton text="Sign in with Google" />
              </div>
              
              <div className="mt-3" style={{ 
                fontSize: '0.875rem', 
                color: '#666',
                textAlign: 'center',
                lineHeight: '1.4'
              }}>
                <p>By signing in, you agree to our terms of service and privacy policy.</p>
              </div>
            </div>
            
            <div className="card mt-4" style={{ maxWidth: '400px', margin: '2rem auto 0' }}>
              <h3>Why Sign In?</h3>
              <ul style={{ paddingLeft: '1.5rem', color: '#555' }}>
                <li>Access personalized dashboard</li>
                <li>Save your preferences and settings</li>
                <li>Get priority support</li>
                <li>Receive updates and notifications</li>
                <li>Access exclusive resources</li>
              </ul>
            </div>
          </div>
        ) : (
          <div className="user-section">
            <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
              <h2 className="text-center mb-3">Welcome Back!</h2>
              <UserProfile />
              
              <div className="mt-4">
                <h3>Your Account Features</h3>
                <div className="grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                  <div className="feature-item" style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0070f3' }}>Dashboard</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                      Access your personalized dashboard
                    </p>
                  </div>
                  
                  <div className="feature-item" style={{
                    padding: '1rem',
                    backgroundColor: '#f8f9fa',
                    borderRadius: '0.5rem',
                    textAlign: 'center'
                  }}>
                    <h4 style={{ margin: '0 0 0.5rem 0', color: '#0070f3' }}>Support</h4>
                    <p style={{ margin: 0, fontSize: '0.875rem', color: '#666' }}>
                      Get priority customer support
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}