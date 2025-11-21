import Layout from '../components/layout/Layout';
import Link from 'next/link';

export default function FirebaseSetupGuide() {
  return (
    <Layout title="Firebase Setup Guide - AmitojInfra" description="Step-by-step guide to configure Firebase">
      <div className="setup-guide-page">
        <div className="text-center mb-4">
          <h1>📚 Firebase Setup Guide</h1>
          <p>Complete step-by-step instructions to configure Firebase authentication</p>
        </div>

        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <div className="card">
            <h2>Step 1: Create Firebase Project</h2>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>Go to <a href="https://console.firebase.google.com/" target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3' }}>Firebase Console</a></li>
              <li>Click <strong>"Create a project"</strong> or <strong>"Add project"</strong></li>
              <li>Enter project name (e.g., "amitojinfra-app")</li>
              <li>Choose whether to enable Google Analytics (optional)</li>
              <li>Click <strong>"Create project"</strong></li>
            </ol>
          </div>

          <div className="card">
            <h2>Step 2: Enable Google Authentication</h2>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>In your Firebase project, go to <strong>Authentication</strong> in the left sidebar</li>
              <li>Click <strong>"Get started"</strong></li>
              <li>Go to <strong>"Sign-in method"</strong> tab</li>
              <li>Click on <strong>"Google"</strong></li>
              <li>Toggle <strong>"Enable"</strong></li>
              <li>Set the project support email</li>
              <li>Click <strong>"Save"</strong></li>
            </ol>
          </div>

          <div className="card">
            <h2>Step 3: Get Configuration Values</h2>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>Go to <strong>Project Settings</strong> (gear icon)</li>
              <li>Scroll down to <strong>"Your apps"</strong> section</li>
              <li>Click the web icon <code>&lt;/&gt;</code></li>
              <li>Enter app nickname: "amitojinfra-web"</li>
              <li>Click <strong>"Register app"</strong></li>
              <li><strong>Copy the config object</strong> - you'll need these values!</li>
            </ol>
            
            <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: '0.5rem', marginTop: '1rem' }}>
              <p><strong>You'll see something like this:</strong></p>
              <pre style={{ fontSize: '0.8rem', overflow: 'auto' }}>{`const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef123456789",
  measurementId: "G-XXXXXXXXXX"
};`}</pre>
            </div>
          </div>

          <div className="card">
            <h2>Step 4: Configure Authorized Domains</h2>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>In Firebase Console, go to <strong>Authentication</strong> → <strong>Settings</strong> → <strong>Authorized domains</strong></li>
              <li>Add your domains:
                <ul style={{ marginTop: '0.5rem' }}>
                  <li><code>localhost</code> (for development)</li>
                  <li><code>amitojinfra.github.io</code> (for GitHub Pages)</li>
                  <li>Any custom domain you plan to use</li>
                </ul>
              </li>
              <li>Click <strong>"Add domain"</strong> for each one</li>
            </ol>
          </div>

          <div className="card">
            <h2>Step 5: Configure in Application</h2>
            <ol style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li>Go to our <Link href="/firebase-setup" style={{ color: '#0070f3' }}>Firebase Configuration page</Link></li>
              <li>Enter your <strong>API Key</strong> and <strong>App ID</strong> (required)</li>
              <li>Optionally fill in other configuration values</li>
              <li>Click <strong>"Save Configuration"</strong></li>
              <li>Test authentication on the <Link href="/auth" style={{ color: '#0070f3' }}>Authentication page</Link></li>
            </ol>
          </div>

          <div className="card" style={{ backgroundColor: '#fff3cd', border: '1px solid #ffeaa7' }}>
            <h2>⚠️ Important Notes</h2>
            <ul style={{ paddingLeft: '1.5rem', lineHeight: '1.6' }}>
              <li><strong>API Keys are safe:</strong> Firebase API keys are designed to be public</li>
              <li><strong>Domain restrictions:</strong> Security is enforced through authorized domains</li>
              <li><strong>Local storage:</strong> Configuration is stored in your browser only</li>
              <li><strong>Required fields:</strong> Only API Key and App ID are absolutely required</li>
            </ul>
          </div>

          <div className="card" style={{ backgroundColor: '#d1ecf1', border: '1px solid #bee5eb' }}>
            <h2>🔧 Troubleshooting</h2>
            <div style={{ lineHeight: '1.6' }}>
              <p><strong>Error: "Firebase: Error (auth/unauthorized-domain)"</strong></p>
              <p style={{ marginLeft: '1rem', color: '#666' }}>
                → Add your domain to authorized domains in Firebase Console
              </p>

              <p><strong>Error: "Configuration is missing required fields"</strong></p>
              <p style={{ marginLeft: '1rem', color: '#666' }}>
                → Make sure API Key and App ID are filled in correctly
              </p>

              <p><strong>Google Sign-in popup blocked</strong></p>
              <p style={{ marginLeft: '1rem', color: '#666' }}>
                → Allow popups in browser settings for this domain
              </p>
            </div>
          </div>

          <div className="text-center mt-4">
            <Link href="/firebase-setup" className="btn" style={{ marginRight: '1rem' }}>
              Configure Firebase Now
            </Link>
            <Link href="/auth" className="btn btn-secondary">
              Go to Authentication
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}