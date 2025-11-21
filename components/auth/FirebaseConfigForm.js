// Firebase Configuration Form Component
import { useState, useEffect } from 'react';
import { 
  getFirebaseConfig, 
  saveFirebaseConfig, 
  validateFirebaseConfig, 
  clearFirebaseConfig,
  getDefaultFirebaseConfig 
} from '../../lib/firebase/configManager';

const FirebaseConfigForm = ({ onConfigSaved, onCancel, showCancel = false }) => {
  const [config, setConfig] = useState(getDefaultFirebaseConfig());
  const [jsonInput, setJsonInput] = useState('');
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load existing config if available
    const existingConfig = getFirebaseConfig();
    if (existingConfig) {
      setConfig(existingConfig);
      setJsonInput(JSON.stringify(existingConfig, null, 2));
    }
  }, []);

  const handleJsonInputChange = (value) => {
    setJsonInput(value);
    setErrors([]); // Clear errors when user types
    setSuccess(false);
    
    // Try to parse JSON and update config in real-time
    try {
      if (value.trim()) {
        const parsedConfig = JSON.parse(value);
        setConfig(parsedConfig);
      }
    } catch (error) {
      // Don't update config if JSON is invalid, just wait for submit
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      // Parse JSON input
      let parsedConfig;
      try {
        parsedConfig = JSON.parse(jsonInput);
      } catch (parseError) {
        setErrors(['Invalid JSON format. Please check your configuration and try again.']);
        setLoading(false);
        return;
      }

      // Validate configuration
      const validation = validateFirebaseConfig(parsedConfig);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Save configuration
      const saved = saveFirebaseConfig(parsedConfig);
      
      if (saved) {
        setConfig(parsedConfig);
        setSuccess(true);
        setTimeout(() => {
          if (onConfigSaved) {
            onConfigSaved(parsedConfig);
          }
        }, 1000);
      } else {
        setErrors(['Failed to save configuration']);
      }
    } catch (error) {
      setErrors([error.message || 'An error occurred while saving configuration']);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the Firebase configuration?')) {
      clearFirebaseConfig();
      const defaultConfig = getDefaultFirebaseConfig();
      setConfig(defaultConfig);
      setJsonInput('');
      setSuccess(false);
      setErrors([]);
    }
  };

  const handleLoadExample = () => {
    const exampleConfig = {
      apiKey: "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
      authDomain: "your-project-id.firebaseapp.com",
      projectId: "your-project-id",
      storageBucket: "your-project-id.firebasestorage.app",
      messagingSenderId: "xxxxxxxxxxxx",
      appId: "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx",
      measurementId: "G-XXXXXXXXXX"
    };
    setJsonInput(JSON.stringify(exampleConfig, null, 2));
    setConfig(exampleConfig);
  };

  return (
    <div className="firebase-config-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="firebaseConfig" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#d32f2f' }}>
            Firebase Configuration JSON *
          </label>
          <textarea
            id="firebaseConfig"
            value={jsonInput}
            onChange={(e) => handleJsonInputChange(e.target.value)}
            placeholder={`Paste your complete Firebase configuration here:

{
  "apiKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "authDomain": "your-project-id.firebaseapp.com",
  "projectId": "your-project-id",
  "storageBucket": "your-project-id.firebasestorage.app",
  "messagingSenderId": "xxxxxxxxxxxx",
  "appId": "1:xxxxxxxxxxxx:web:xxxxxxxxxxxxxxxxxxxxxx",
  "measurementId": "G-XXXXXXXXXX"
}`}
            required
            rows={15}
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.85rem',
              fontFamily: 'Monaco, Consolas, "Courier New", monospace',
              backgroundColor: '#f8f9fa',
              resize: 'vertical',
              minHeight: '300px'
            }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.5rem' }}>
            <small style={{ color: '#666', fontSize: '0.8rem' }}>
              Get this from Firebase Console → Project Settings → General → Your apps → Config
            </small>
            <button
              type="button"
              onClick={handleLoadExample}
              style={{
                padding: '0.25rem 0.5rem',
                fontSize: '0.75rem',
                color: '#0070f3',
                background: 'none',
                border: '1px solid #0070f3',
                borderRadius: '0.25rem',
                cursor: 'pointer'
              }}
            >
              Load Example
            </button>
          </div>
        </div>

        {errors.length > 0 && (
          <div className="error-messages mb-3" style={{
            padding: '0.75rem',
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            borderRadius: '0.375rem',
            color: '#c33'
          }}>
            <strong>Please fix the following errors:</strong>
            <ul style={{ margin: '0.5rem 0 0 0', paddingLeft: '1.5rem' }}>
              {errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {success && (
          <div className="success-message mb-3" style={{
            padding: '0.75rem',
            backgroundColor: '#efe',
            border: '1px solid #cfc',
            borderRadius: '0.375rem',
            color: '#363'
          }}>
            ✅ Configuration saved successfully!
          </div>
        )}

        <div className="form-actions" style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button
            type="submit"
            disabled={loading || !jsonInput.trim()}
            className="btn"
            style={{ flex: 1, minWidth: '120px' }}
          >
            {loading ? 'Saving...' : 'Save Configuration'}
          </button>
          
          <button
            type="button"
            onClick={handleClear}
            className="btn btn-secondary"
            style={{ minWidth: '100px' }}
          >
            Clear
          </button>
          
          {showCancel && onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="btn btn-secondary"
              style={{ minWidth: '80px' }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
};

export default FirebaseConfigForm;