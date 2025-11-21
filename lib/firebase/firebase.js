// Firebase App Initialization (Dynamic)
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getFirebaseConfig, hasFirebaseConfig } from './configManager';

let app = null;
let auth = null;
let db = null;
let googleProvider = null;

/**
 * Initialize Firebase with dynamic configuration
 * @param {Object} config - Optional config override
 * @returns {Object} Firebase app instance
 */
export const initializeFirebase = (config = null) => {
  try {
    const firebaseConfig = config || getFirebaseConfig();
    
    if (!firebaseConfig || !firebaseConfig.apiKey || !firebaseConfig.appId) {
      throw new Error('Firebase configuration is missing required fields (apiKey, appId)');
    }

    // Initialize Firebase app
    app = initializeApp(firebaseConfig);

    // Initialize Firebase Authentication
    auth = getAuth(app);

    // Initialize Firestore
    db = getFirestore(app);

    // Initialize Google Auth Provider
    googleProvider = new GoogleAuthProvider();
    googleProvider.setCustomParameters({
      prompt: 'select_account',
    });

    console.log('Firebase initialized successfully with Auth and Firestore');
    return app;
  } catch (error) {
    console.error('Failed to initialize Firebase:', error);
    throw error;
  }
};

/**
 * Get Firebase auth instance (initialize if needed)
 * @returns {Auth|null} Firebase auth instance or null if not configured
 */
export const getFirebaseAuth = () => {
  if (!auth && hasFirebaseConfig()) {
    try {
      initializeFirebase();
    } catch (error) {
      console.error('Failed to initialize Firebase auth:', error);
      return null;
    }
  }
  return auth;
};

/**
 * Get Firestore instance (initialize if needed)
 * @returns {Firestore|null} Firestore instance or null if not configured
 */
export const getFirebaseFirestore = () => {
  if (!db && hasFirebaseConfig()) {
    try {
      initializeFirebase();
    } catch (error) {
      console.error('Failed to initialize Firestore:', error);
      return null;
    }
  }
  return db;
};

/**
 * Get Google auth provider (initialize if needed)
 * @returns {GoogleAuthProvider|null} Google auth provider or null if not configured
 */
export const getGoogleProvider = () => {
  if (!googleProvider && hasFirebaseConfig()) {
    try {
      initializeFirebase();
    } catch (error) {
      console.error('Failed to initialize Google provider:', error);
      return null;
    }
  }
  return googleProvider;
};

/**
 * Check if Firebase is initialized
 * @returns {boolean} True if Firebase is initialized
 */
export const isFirebaseInitialized = () => {
  return app !== null && auth !== null && db !== null;
};

/**
 * Reinitialize Firebase with new configuration
 * @param {Object} newConfig - New Firebase configuration
 * @returns {Object} Firebase app instance
 */
export const reinitializeFirebase = (newConfig) => {
  // Reset existing instances
  app = null;
  db = null;
  auth = null;
  googleProvider = null;
  
  return initializeFirebase(newConfig);
};

// Auto-initialize if configuration exists
if (hasFirebaseConfig()) {
  try {
    initializeFirebase();
  } catch (error) {
    console.warn('Firebase auto-initialization failed:', error.message);
  }
}

// Export current instances (may be null if not initialized)
export { auth, googleProvider };
export default app;