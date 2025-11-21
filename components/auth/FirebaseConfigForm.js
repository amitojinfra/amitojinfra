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
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load existing config if available
    const existingConfig = getFirebaseConfig();
    if (existingConfig) {
      setConfig(existingConfig);
    }
  }, []);

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value.trim()
    }));
    setErrors([]); // Clear errors when user types
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors([]);
    setSuccess(false);

    try {
      // Validate configuration
      const validation = validateFirebaseConfig(config);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setLoading(false);
        return;
      }

      // Save configuration
      const saved = saveFirebaseConfig(config);
      
      if (saved) {
        setSuccess(true);
        setTimeout(() => {
          if (onConfigSaved) {
            onConfigSaved(config);
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
      setConfig(getDefaultFirebaseConfig());
      setSuccess(false);
      setErrors([]);
    }
  };

  return (
    <div className="firebase-config-form">
      <form onSubmit={handleSubmit}>
        <div className="form-group mb-3">
          <label htmlFor="apiKey" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#d32f2f' }}>
            API Key *
          </label>
          <input
            type="text"
            id="apiKey"
            value={config.apiKey}
            onChange={(e) => handleInputChange('apiKey', e.target.value)}
            placeholder="Enter your Firebase API Key"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          />
          <small style={{ color: '#666', fontSize: '0.8rem' }}>
            Required: Get this from Firebase Console → Project Settings → General
          </small>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="appId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#d32f2f' }}>
            App ID *
          </label>
          <input
            type="text"
            id="appId"
            value={config.appId}
            onChange={(e) => handleInputChange('appId', e.target.value)}
            placeholder="Enter your Firebase App ID"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          />
          <small style={{ color: '#666', fontSize: '0.8rem' }}>
            Required: Get this from Firebase Console → Project Settings → General
          </small>
        </div>

        <div className="form-group mb-3">
          <label htmlFor="authDomain" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Auth Domain
          </label>
          <input
            type="text"
            id="authDomain"
            value={config.authDomain}
            onChange={(e) => handleInputChange('authDomain', e.target.value)}
            placeholder="your-project-id.firebaseapp.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="projectId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Project ID
          </label>
          <input
            type="text"
            id="projectId"
            value={config.projectId}
            onChange={(e) => handleInputChange('projectId', e.target.value)}
            placeholder="your-project-id"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="storageBucket" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Storage Bucket
          </label>
          <input
            type="text"
            id="storageBucket"
            value={config.storageBucket}
            onChange={(e) => handleInputChange('storageBucket', e.target.value)}
            placeholder="your-project-id.appspot.com"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div className="form-group mb-3">
          <label htmlFor="messagingSenderId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Messaging Sender ID
          </label>
          <input
            type="text"
            id="messagingSenderId"
            value={config.messagingSenderId}
            onChange={(e) => handleInputChange('messagingSenderId', e.target.value)}
            placeholder="123456789012"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          />
        </div>

        <div className="form-group mb-4">
          <label htmlFor="measurementId" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
            Measurement ID (Optional)
          </label>
          <input
            type="text"
            id="measurementId"
            value={config.measurementId}
            onChange={(e) => handleInputChange('measurementId', e.target.value)}
            placeholder="G-XXXXXXXXXX"
            style={{
              width: '100%',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '0.375rem',
              fontSize: '0.9rem',
              fontFamily: 'monospace'
            }}
          />
          <small style={{ color: '#666', fontSize: '0.8rem' }}>
            Optional: For Google Analytics integration
          </small>
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
            disabled={loading}
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