// Firebase Configuration Management Utilities
// Handles storing and retrieving Firebase config from localStorage

const FIREBASE_CONFIG_KEY = 'firebase_config';

/**
 * Get Firebase configuration from localStorage
 * @returns {Object|null} Firebase configuration object or null if not found
 */
export const getFirebaseConfig = () => {
  if (typeof window === 'undefined') return null;
  
  try {
    const configStr = localStorage.getItem(FIREBASE_CONFIG_KEY);
    return configStr ? JSON.parse(configStr) : null;
  } catch (error) {
    console.error('Error reading Firebase config from localStorage:', error);
    return null;
  }
};

/**
 * Save Firebase configuration to localStorage
 * @param {Object} config - Firebase configuration object
 * @returns {boolean} Success status
 */
export const saveFirebaseConfig = (config) => {
  if (typeof window === 'undefined') return false;
  
  try {
    // Validate required fields
    const requiredFields = ['apiKey', 'appId'];
    const missingFields = requiredFields.filter(field => !config[field]);
    
    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }
    
    localStorage.setItem(FIREBASE_CONFIG_KEY, JSON.stringify(config));
    return true;
  } catch (error) {
    console.error('Error saving Firebase config to localStorage:', error);
    return false;
  }
};

/**
 * Clear Firebase configuration from localStorage
 * @returns {boolean} Success status
 */
export const clearFirebaseConfig = () => {
  if (typeof window === 'undefined') return false;
  
  try {
    localStorage.removeItem(FIREBASE_CONFIG_KEY);
    return true;
  } catch (error) {
    console.error('Error clearing Firebase config from localStorage:', error);
    return false;
  }
};

/**
 * Check if Firebase configuration exists in localStorage
 * @returns {boolean} True if config exists and has required fields
 */
export const hasFirebaseConfig = () => {
  const config = getFirebaseConfig();
  return config && config.apiKey && config.appId;
};

/**
 * Validate Firebase configuration object
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateFirebaseConfig = (config) => {
  const errors = [];
  
  if (!config) {
    return { isValid: false, errors: ['Configuration is required'] };
  }
  
  // Required fields
  if (!config.apiKey || config.apiKey.trim() === '') {
    errors.push('API Key is required');
  }
  
  if (!config.appId || config.appId.trim() === '') {
    errors.push('App ID is required');
  }
  
  // Optional but recommended fields
  if (!config.authDomain || config.authDomain.trim() === '') {
    errors.push('Auth Domain is recommended');
  }
  
  if (!config.projectId || config.projectId.trim() === '') {
    errors.push('Project ID is recommended');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get default Firebase configuration template
 * @returns {Object} Default configuration template
 */
export const getDefaultFirebaseConfig = () => ({
  apiKey: '',
  authDomain: '',
  projectId: '',
  storageBucket: '',
  messagingSenderId: '',
  appId: '',
  measurementId: ''
});