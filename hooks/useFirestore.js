import { useState, useEffect } from 'react';
import firestoreService from '../lib/firebase/firestore';

/**
 * Custom hook for Firestore document operations
 * @param {string} collectionName - Collection name
 * @param {string} docId - Document ID
 * @returns {Object} Document data, loading state, and error
 */
export const useFirestoreDocument = (collectionName, docId) => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !docId) {
      setLoading(false);
      return;
    }

    let unsubscribe;

    const fetchDocument = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time listener
        unsubscribe = firestoreService.subscribeToDocument(
          collectionName,
          docId,
          (doc) => {
            setDocument(doc);
            setLoading(false);
          }
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchDocument();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, docId]);

  return { document, loading, error };
};

/**
 * Custom hook for Firestore collection operations
 * @param {string} collectionName - Collection name
 * @param {Object} options - Query options
 * @returns {Object} Documents array, loading state, and error
 */
export const useFirestoreCollection = (collectionName, options = {}) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return;
    }

    let unsubscribe;

    const fetchCollection = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time listener
        unsubscribe = firestoreService.subscribeToCollection(
          collectionName,
          (docs) => {
            setDocuments(docs);
            setLoading(false);
          },
          options
        );
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchCollection();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [collectionName, options]);

  return { documents, loading, error };
};

/**
 * Custom hook for Firestore CRUD operations
 * @param {string} collectionName - Collection name
 * @returns {Object} CRUD operation functions and loading states
 */
export const useFirestoreCRUD = (collectionName) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addDocument = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const docRef = await firestoreService.addDocument(collectionName, data);
      setLoading(false);
      return docRef;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const updateDocument = async (docId, data) => {
    try {
      setLoading(true);
      setError(null);
      await firestoreService.updateDocument(collectionName, docId, data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const deleteDocument = async (docId) => {
    try {
      setLoading(true);
      setError(null);
      await firestoreService.deleteDocument(collectionName, docId);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getDocument = async (docId) => {
    try {
      setLoading(true);
      setError(null);
      const doc = await firestoreService.getDocument(collectionName, docId);
      setLoading(false);
      return doc;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  const getDocuments = async (options = {}) => {
    try {
      setLoading(true);
      setError(null);
      const docs = await firestoreService.getDocuments(collectionName, options);
      setLoading(false);
      return docs;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  };

  return {
    addDocument,
    updateDocument,
    deleteDocument,
    getDocument,
    getDocuments,
    loading,
    error
  };
};