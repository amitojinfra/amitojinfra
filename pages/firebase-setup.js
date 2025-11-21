import Layout from '../components/layout/Layout';
import FirebaseConfigForm from '../components/auth/FirebaseConfigForm';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import { hasFirebaseConfig } from '../lib/firebase/configManager';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function FirebaseSetup() {
  const { configureFirebase, firebaseConfigured } = useAuth();
  const router = useRouter();
  const [initialCheck, setInitialCheck] = useState(true);

  useEffect(() => {
    // Check if Firebase is already configured
    if (hasFirebaseConfig() && firebaseConfigured) {
      // Redirect to auth page if already configured
      const timer = setTimeout(() => {
        router.push('/auth');
      }, 2000);
      return () => clearTimeout(timer);
    }
    setInitialCheck(false);
  }, [firebaseConfigured, router]);

  const handleConfigSaved = (config) => {
    const success = configureFirebase(config);
    if (success) {
      setTimeout(() => {
        router.push('/auth');
      }, 1500);
    }
  };

  const handleCancel = () => {
    router.push('/');
  };

  if (initialCheck) {
    return (
      <Layout title="Firebase Setup - AmitojInfra" description="Configure Firebase for authentication">
        <div className="text-center">
          <div style={{ padding: '2rem', fontSize: '1.1rem', color: '#666' }}>
            Checking Firebase configuration...
          </div>
        </div>
      </Layout>
    );
  }

  if (firebaseConfigured && hasFirebaseConfig()) {
    return (
      <Layout title="Firebase Setup - AmitojInfra" description="Firebase is already configured">
        <div className="text-center">
          <div className="card" style={{ maxWidth: '500px', margin: '0 auto' }}>
            <h1>✅ Firebase Already Configured</h1>
            <p>Firebase authentication is already set up for this application.</p>
            <p>Redirecting to authentication page...</p>
            <div style={{ marginTop: '1rem' }}>
              <button onClick={() => router.push('/auth')} className="btn">
                Go to Authentication
              </button>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout title="Firebase Setup - AmitojInfra" description="Configure Firebase for authentication">
      <div className="firebase-setup-page">
        <div className="text-center mb-4">
          <h1>🔧 Firebase Configuration</h1>
          <p>Configure Firebase to enable Google authentication</p>
        </div>

        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <div className="card mb-4">
            <h2>📋 Before You Start</h2>
            <p>You'll need to:</p>
            <ol style={{ paddingLeft: '1.5rem', color: '#555' }}>
              <li>Create a Firebase project at <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>Firebase Console</a></li>
              <li>Enable Google Authentication in your Firebase project</li>
              <li>Get your project configuration values</li>
              <li>Add authorized domains (including this domain)</li>
            </ol>
            <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '1rem' }}>
              <strong>Need help?</strong> Check our <Link href="/firebase-setup-guide" style={{ color: '#0070f3' }}>detailed setup guide</Link> for step-by-step instructions.
            </p>
          </div>

          <div className="card">
            <h2>⚙️ Configuration</h2>
            <p className="mb-3">
              Paste your complete Firebase configuration JSON below. You can copy this directly from the Firebase Console.
            </p>
            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.375rem', marginBottom: '1rem', border: '1px solid #e9ecef' }}>
              <h4 style={{ margin: '0 0 0.5rem 0', color: '#495057' }}>📋 How to get your config:</h4>
              <ol style={{ paddingLeft: '1.5rem', margin: 0, color: '#6c757d', fontSize: '0.9rem' }}>
                <li>Go to Firebase Console → Project Settings → General</li>
                <li>Scroll down to "Your apps" section</li>
                <li>Click on your web app or create one</li>
                <li>Copy the <code>firebaseConfig</code> object</li>
              </ol>
            </div>
            
            <FirebaseConfigForm 
              onConfigSaved={handleConfigSaved}
              onCancel={handleCancel}
              showCancel={true}
            />
          </div>

          <div className="card mt-4">
            <h3>🔒 Privacy & Security</h3>
            <ul style={{ paddingLeft: '1.5rem', color: '#555', fontSize: '0.9rem' }}>
              <li>Configuration is stored locally in your browser</li>
              <li>Data is not sent to any external servers</li>
              <li>You can clear the configuration at any time</li>
              <li>Firebase API keys are safe for client-side use</li>
            </ul>
          </div>

          <div className="card mt-4" style={{ backgroundColor: '#f8f9fa', border: '1px solid #e9ecef' }}>
            <h3>💡 Setup Tips</h3>
            <div style={{ fontSize: '0.9rem', color: '#555' }}>
              <p><strong>Example Configuration:</strong></p>
              <pre style={{ 
                backgroundColor: '#e9ecef', 
                padding: '0.75rem', 
                borderRadius: '0.25rem', 
                fontFamily: 'Monaco, Consolas, monospace',
                fontSize: '0.8rem',
                overflow: 'auto'
              }}>
{`{
  "apiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "authDomain": "your-project-id.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "xxxxxxxxxxxx",
  "appId": "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx",
  "measurementId": "G-XXXXXXXXXX"
}`}
              </pre>
              
              <p style={{ marginTop: '1rem' }}><strong>Authorized Domains:</strong></p>
              <p>Don't forget to add these domains in Firebase Console → Authentication → Settings:</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                <li><code>localhost</code> (for development)</li>
                <li><code>amitojinfra.github.io</code> (for production)</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}