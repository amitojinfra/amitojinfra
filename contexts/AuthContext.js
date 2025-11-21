// Authentication Context
import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChange, signInWithGoogle, signOutUser, getUserProfile } from '../lib/firebase/auth';
import { hasFirebaseConfig, getFirebaseConfig } from '../lib/firebase/configManager';
import { reinitializeFirebase, isFirebaseInitialized } from '../lib/firebase/firebase';

// Create the AuthContext
const AuthContext = createContext({});

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// AuthProvider component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);

  useEffect(() => {
    // Check if Firebase is configured
    const checkFirebaseConfig = () => {
      const configured = hasFirebaseConfig();
      setFirebaseConfigured(configured);
      
      if (!configured) {
        setLoading(false);
        return null;
      }
      
      return configured;
    };

    // Listen for authentication state changes if Firebase is configured
    let unsubscribe = () => {};
    
    if (checkFirebaseConfig()) {
      try {
        unsubscribe = onAuthStateChange((firebaseUser) => {
          if (firebaseUser) {
            // User is signed in
            setUser({
              uid: firebaseUser.uid,
              displayName: firebaseUser.displayName,
              email: firebaseUser.email,
              photoURL: firebaseUser.photoURL,
              emailVerified: firebaseUser.emailVerified,
            });
          } else {
            // User is signed out
            setUser(null);
          }
          setLoading(false);
        });
      } catch (error) {
        console.error('Failed to set up auth state listener:', error);
        setError('Failed to initialize authentication');
        setLoading(false);
      }
    }

    // Cleanup subscription on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [firebaseConfigured]);

  // Configure Firebase
  const configureFirebase = (config) => {
    try {
      reinitializeFirebase(config);
      setFirebaseConfigured(true);
      setError(null);
      return true;
    } catch (error) {
      setError('Failed to configure Firebase: ' + error.message);
      return false;
    }
  };

  // Login with Google
  const loginWithGoogle = async () => {
    if (!firebaseConfigured) {
      setError('Firebase is not configured. Please configure Firebase first.');
      return;
    }

    try {
      setError(null);
      setLoading(true);
      await signInWithGoogle();
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      setError(error.message);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      setError(null);
      await signOutUser();
      // User state will be updated by onAuthStateChanged
    } catch (error) {
      setError(error.message);
      console.error('Logout error:', error);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    firebaseConfigured,
    configureFirebase,
    loginWithGoogle,
    logout,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};