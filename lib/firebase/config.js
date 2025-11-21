// Firebase Configuration
// Configuration is now loaded from localStorage via user input

import { getFirebaseConfig, getDefaultFirebaseConfig } from './configManager';

/**
 * Get Firebase configuration from localStorage or return default template
 * @returns {Object} Firebase configuration object
 */
const getConfig = () => {
  const storedConfig = getFirebaseConfig();
  
  if (storedConfig) {
    return storedConfig;
  }
  
  // Fallback to environment variables if available (for backward compatibility)
  const envConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: "amitoj-infra.firebaseapp.com",//process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: "amitoj-infra", //process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:"amitoj-infra.firebasestorage.app", // process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: "600242827600", // process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: "G-RE586Y7G69" // process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  };
  
  // Check if any environment variables are set
  const hasEnvVars = Object.values(envConfig).some(value => value && value !== '');
  
  if (hasEnvVars) {
    return envConfig;
  }
  
  // Return default template if no config is available
  return getDefaultFirebaseConfig();
};

const firebaseConfig = getConfig();

export default firebaseConfig;