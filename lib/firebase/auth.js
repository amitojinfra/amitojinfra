// Firebase Authentication Service
import { 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged, 
  User 
} from 'firebase/auth';
import { getFirebaseAuth, getGoogleProvider, isFirebaseInitialized } from './firebase';

/**
 * Sign in with Google using popup
 * @returns {Promise<User>} The authenticated user
 */
export const signInWithGoogle = async () => {
  try {
    const auth = getFirebaseAuth();
    const googleProvider = getGoogleProvider();
    
    if (!auth || !googleProvider) {
      throw new Error('Firebase is not properly configured. Please configure Firebase first.');
    }
    
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    console.log('Successfully signed in:', user.displayName);
    return user;
  } catch (error) {
    console.error('Error signing in with Google:', error);
    throw error;
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOutUser = async () => {
  try {
    const auth = getFirebaseAuth();
    
    if (!auth) {
      throw new Error('Firebase auth is not initialized');
    }
    
    await signOut(auth);
    console.log('Successfully signed out');
  } catch (error) {
    console.error('Error signing out:', error);
    throw error;
  }
};

/**
 * Get the current authenticated user
 * @returns {User | null} The current user or null if not authenticated
 */
export const getCurrentUser = () => {
  const auth = getFirebaseAuth();
  return auth ? auth.currentUser : null;
};

/**
 * Listen for authentication state changes
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} Unsubscribe function or null if auth not initialized
 */
export const onAuthStateChange = (callback) => {
  const auth = getFirebaseAuth();
  
  if (!auth) {
    console.warn('Firebase auth not initialized, cannot listen for auth state changes');
    return () => {}; // Return empty unsubscribe function
  }
  
  return onAuthStateChanged(auth, callback);
};

/**
 * Check if a user is currently authenticated
 * @returns {boolean} True if user is authenticated, false otherwise
 */
export const isAuthenticated = () => {
  const auth = getFirebaseAuth();
  return auth ? auth.currentUser !== null : false;
};

/**
 * Get user profile information
 * @returns {Object | null} User profile data or null if not authenticated
 */
export const getUserProfile = () => {
  const user = getCurrentUser();
  if (!user) return null;
  
  return {
    uid: user.uid,
    displayName: user.displayName,
    email: user.email,
    photoURL: user.photoURL,
    emailVerified: user.emailVerified,
  };
};