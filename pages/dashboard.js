import Layout from '../components/layout/Layout';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import UserProfile from '../components/auth/UserProfile';
import { useAuth } from '../contexts/AuthContext';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <Layout title="Dashboard - AmitojInfra" description="Your personal AmitojInfra dashboard">
      <ProtectedRoute>
        <div className="dashboard-page">
          <div className="text-center mb-4">
            <h1>Dashboard</h1>
            <p>Welcome to your personalized AmitojInfra dashboard</p>
          </div>

          <div className="grid">
            <div className="card">
              <h2>Your Profile</h2>
              <UserProfile showLogout={false} />
            </div>

            <div className="card">
              <h2>Account Stats</h2>
              <div style={{ color: '#666' }}>
                <p><strong>Account Status:</strong> Active</p>
                <p><strong>Member Since:</strong> {new Date().toLocaleDateString()}</p>
                <p><strong>Last Login:</strong> {new Date().toLocaleString()}</p>
                <p><strong>Email Verified:</strong> {user?.emailVerified ? 'Yes' : 'No'}</p>
              </div>
            </div>

            <div className="card">
              <h2>Quick Actions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <button className="btn" style={{ textAlign: 'left' }}>
                  📊 View Analytics
                </button>
                <button className="btn btn-secondary" style={{ textAlign: 'left' }}>
                  ⚙️ Account Settings
                </button>
                <button className="btn btn-secondary" style={{ textAlign: 'left' }}>
                  📞 Contact Support
                </button>
                <button className="btn btn-secondary" style={{ textAlign: 'left' }}>
                  📄 Download Reports
                </button>
              </div>
            </div>

            <div className="card">
              <h2>Recent Activity</h2>
              <div style={{ color: '#666' }}>
                <div style={{ 
                  padding: '0.75rem 0', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Signed in</span>
                  <span style={{ fontSize: '0.875rem' }}>Just now</span>
                </div>
                <div style={{ 
                  padding: '0.75rem 0', 
                  borderBottom: '1px solid #eee',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Profile updated</span>
                  <span style={{ fontSize: '0.875rem' }}>Today</span>
                </div>
                <div style={{ 
                  padding: '0.75rem 0',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <span>Account created</span>
                  <span style={{ fontSize: '0.875rem' }}>Today</span>
                </div>
              </div>
            </div>

            <div className="card">
              <h2>Services</h2>
              <p>Access your subscribed services and features:</p>
              <ul style={{ paddingLeft: '1.5rem', color: '#555' }}>
                <li>Infrastructure Monitoring</li>
                <li>Cloud Management</li>
                <li>24/7 Support Access</li>
                <li>Priority Assistance</li>
                <li>Custom Analytics</li>
              </ul>
            </div>

            <div className="card">
              <h2>Notifications</h2>
              <div style={{ 
                padding: '1rem',
                backgroundColor: '#e7f3ff',
                borderRadius: '0.5rem',
                border: '1px solid #b3d9ff'
              }}>
                <p style={{ margin: 0, color: '#0066cc' }}>
                  🎉 Welcome to AmitojInfra! Your account has been successfully set up.
                </p>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    </Layout>
  );
}