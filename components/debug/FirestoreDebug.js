import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getFirebaseAuth } from '../../lib/firebase/firebase';

const FirestoreDebug = () => {
  const { user, firebaseConfigured } = useAuth();
  const [authState, setAuthState] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const auth = getFirebaseAuth();
        if (auth) {
          const currentUser = auth.currentUser;
          setAuthState({
            hasAuth: true,
            currentUser: currentUser ? {
              uid: currentUser.uid,
              email: currentUser.email,
              displayName: currentUser.displayName,
              emailVerified: currentUser.emailVerified
            } : null,
            authReady: true
          });
        } else {
          setAuthState({
            hasAuth: false,
            currentUser: null,
            authReady: false
          });
        }
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthState({
          hasAuth: false,
          currentUser: null,
          authReady: false,
          error: error.message
        });
      }
      setLoading(false);
    };

    if (firebaseConfigured) {
      checkAuthState();
    } else {
      setLoading(false);
    }
  }, [firebaseConfigured]);

  if (loading) {
    return <div>Checking authentication state...</div>;
  }

  return (
    <div className="debug-panel">
      <h3>🔍 Firestore Debug Information</h3>
      
      <div className="debug-section">
        <h4>Firebase Configuration</h4>
        <div className="debug-item">
          <span className="label">Firebase Configured:</span>
          <span className={`value ${firebaseConfigured ? 'success' : 'error'}`}>
            {firebaseConfigured ? '✅ Yes' : '❌ No'}
          </span>
        </div>
      </div>

      <div className="debug-section">
        <h4>Authentication State</h4>
        <div className="debug-item">
          <span className="label">Auth Context User:</span>
          <span className={`value ${user ? 'success' : 'error'}`}>
            {user ? '✅ Authenticated' : '❌ Not authenticated'}
          </span>
        </div>
        
        {user && (
          <>
            <div className="debug-item">
              <span className="label">User ID:</span>
              <span className="value">{user.uid}</span>
            </div>
            <div className="debug-item">
              <span className="label">Email:</span>
              <span className="value">{user.email}</span>
            </div>
            <div className="debug-item">
              <span className="label">Display Name:</span>
              <span className="value">{user.displayName || 'Not set'}</span>
            </div>
          </>
        )}

        {authState && (
          <>
            <div className="debug-item">
              <span className="label">Firebase Auth Ready:</span>
              <span className={`value ${authState.authReady ? 'success' : 'error'}`}>
                {authState.authReady ? '✅ Ready' : '❌ Not ready'}
              </span>
            </div>
            
            <div className="debug-item">
              <span className="label">Firebase Current User:</span>
              <span className={`value ${authState.currentUser ? 'success' : 'error'}`}>
                {authState.currentUser ? '✅ Authenticated' : '❌ Not authenticated'}
              </span>
            </div>

            {authState.error && (
              <div className="debug-item">
                <span className="label">Auth Error:</span>
                <span className="value error">{authState.error}</span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="debug-section">
        <h4>Common Permission Issues</h4>
        <div className="troubleshooting">
          <div className="issue">
            <strong>❌ "Missing or insufficient permissions"</strong>
            <p>This usually means your Firestore security rules are denying access.</p>
            <div className="solution">
              <strong>Solution:</strong> Update your Firestore rules in Firebase Console
            </div>
          </div>
          
          <div className="issue">
            <strong>🔒 Default Firestore Rules (Too Restrictive)</strong>
            <pre className="code">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if false; // ❌ This denies all access
    }
  }
}`}
            </pre>
          </div>
          
          <div className="issue">
            <strong>✅ Recommended Rules for Development</strong>
            <pre className="code">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null; // ✅ Allow authenticated users
    }
  }
}`}
            </pre>
          </div>
          
          <div className="issue">
            <strong>✅ More Secure Rules for Production</strong>
            <pre className="code">
{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /demo-collection/{docId} {
      allow read, write: if request.auth != null && request.auth.uid != null;
    }
    // Add more specific rules for other collections
  }
}`}
            </pre>
          </div>
        </div>
      </div>

      <div className="debug-section">
        <h4>Steps to Fix Permissions</h4>
        <ol className="steps">
          <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
          <li>Select your project</li>
          <li>Go to <strong>Firestore Database</strong></li>
          <li>Click on <strong>Rules</strong> tab</li>
          <li>Replace the rules with the recommended rules above</li>
          <li>Click <strong>Publish</strong></li>
          <li>Wait for the rules to deploy (usually takes a few seconds)</li>
          <li>Try adding a document again</li>
        </ol>
      </div>

      <style jsx>{`
        .debug-panel {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 8px;
          padding: 20px;
          margin: 20px 0;
          font-family: monospace;
          font-size: 14px;
        }

        .debug-section {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e9ecef;
        }

        .debug-section:last-child {
          border-bottom: none;
        }

        .debug-section h4 {
          margin: 0 0 10px 0;
          color: #495057;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .debug-item {
          display: flex;
          margin-bottom: 8px;
          align-items: center;
        }

        .label {
          font-weight: bold;
          width: 200px;
          color: #6c757d;
        }

        .value {
          flex: 1;
        }

        .value.success {
          color: #28a745;
        }

        .value.error {
          color: #dc3545;
        }

        .troubleshooting {
          background: white;
          padding: 15px;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }

        .issue {
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #f1f3f4;
        }

        .issue:last-child {
          border-bottom: none;
          margin-bottom: 0;
        }

        .issue strong {
          display: block;
          margin-bottom: 8px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .issue p {
          margin: 5px 0;
          color: #6c757d;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .solution {
          background: #d4edda;
          padding: 8px 12px;
          border-radius: 4px;
          margin-top: 8px;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .code {
          background: #f8f9fa;
          border: 1px solid #e9ecef;
          border-radius: 4px;
          padding: 12px;
          margin: 8px 0;
          overflow-x: auto;
          font-size: 12px;
          line-height: 1.4;
        }

        .steps {
          background: white;
          padding: 15px 15px 15px 35px;
          border-radius: 4px;
          border: 1px solid #e9ecef;
          font-family: -apple-system, BlinkMacSystemFont, sans-serif;
        }

        .steps li {
          margin-bottom: 8px;
          color: #495057;
        }

        .steps a {
          color: #007cba;
          text-decoration: none;
        }

        .steps a:hover {
          text-decoration: underline;
        }

        .steps strong {
          color: #212529;
        }
      `}</style>
    </div>
  );
};

export default FirestoreDebug;