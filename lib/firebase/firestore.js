import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  arrayUnion,
  arrayRemove,
  increment,
  writeBatch
} from 'firebase/firestore';

import { getFirebaseFirestore } from './firebase';

/**
 * Firestore service for database operations
 */
class FirestoreService {
  constructor() {
    this.db = null;
  }

  /**
   * Initialize Firestore instance
   * @returns {Firestore} Firestore instance
   */
  getDB() {
    if (!this.db) {
      this.db = getFirebaseFirestore();
    }
    return this.db;
  }

  /**
   * Add a document to a collection
   * @param {string} collectionName - Name of the collection
   * @param {Object} data - Document data
   * @returns {Promise<DocumentReference>} Document reference
   */
  async addDocument(collectionName, data) {
    try {
      const db = this.getDB();
      if (!db) {
        throw new Error('Firestore database is not initialized. Please check your Firebase configuration.');
      }
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Document written with ID: ', docRef.id);
      return docRef;
    } catch (error) {
      console.error('Error adding document: ', error);
      
      // Provide more helpful error messages
      if (error.code === 'permission-denied') {
        const enhancedError = new Error(
          'Permission denied: Your Firestore security rules are preventing this write operation. ' +
          'Please check that you are authenticated and your Firestore rules allow writes for authenticated users. ' +
          'Original error: ' + error.message
        );
        enhancedError.code = error.code;
        enhancedError.originalError = error;
        throw enhancedError;
      } else if (error.code === 'unauthenticated') {
        const enhancedError = new Error(
          'Authentication required: You must be signed in to write to Firestore. ' +
          'Please sign in and try again. Original error: ' + error.message
        );
        enhancedError.code = error.code;
        enhancedError.originalError = error;
        throw enhancedError;
      }
      
      throw error;
    }
  }

  /**
   * Get a document by ID
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @returns {Promise<Object|null>} Document data or null if not found
   */
  async getDocument(collectionName, docId) {
    try {
      const db = this.getDB();
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data()
        };
      } else {
        console.log('No such document!');
        return null;
      }
    } catch (error) {
      console.error('Error getting document: ', error);
      throw error;
    }
  }

  /**
   * Get all documents from a collection
   * @param {string} collectionName - Name of the collection
   * @param {Object} options - Query options (where, orderBy, limit)
   * @returns {Promise<Array>} Array of documents
   */
  async getDocuments(collectionName, options = {}) {
    try {
      const db = this.getDB();
      let collectionRef = collection(db, collectionName);
      let q = collectionRef;

      // Apply where clauses
      if (options.where) {
        options.where.forEach(whereClause => {
          q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
        });
      }

      // Apply order by
      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
      }

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return documents;
    } catch (error) {
      console.error('Error getting documents: ', error);
      throw error;
    }
  }

  /**
   * Update a document
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @param {Object} data - Updated data
   * @returns {Promise<void>}
   */
  async updateDocument(collectionName, docId, data) {
    try {
      const db = this.getDB();
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: serverTimestamp()
      });
      console.log('Document updated successfully');
    } catch (error) {
      console.error('Error updating document: ', error);
      throw error;
    }
  }

  /**
   * Delete a document
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @returns {Promise<void>}
   */
  async deleteDocument(collectionName, docId) {
    try {
      const db = this.getDB();
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      console.log('Document deleted successfully');
    } catch (error) {
      console.error('Error deleting document: ', error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates for a collection
   * @param {string} collectionName - Name of the collection
   * @param {Function} callback - Callback function to handle updates
   * @param {Object} options - Query options (where, orderBy, limit)
   * @returns {Function} Unsubscribe function
   */
  subscribeToCollection(collectionName, callback, options = {}) {
    try {
      const db = this.getDB();
      let collectionRef = collection(db, collectionName);
      let q = collectionRef;

      // Apply where clauses
      if (options.where) {
        options.where.forEach(whereClause => {
          q = query(q, where(whereClause.field, whereClause.operator, whereClause.value));
        });
      }

      // Apply order by
      if (options.orderBy) {
        q = query(q, orderBy(options.orderBy.field, options.orderBy.direction || 'asc'));
      }

      // Apply limit
      if (options.limit) {
        q = query(q, limit(options.limit));
      }

      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const documents = [];
        querySnapshot.forEach((doc) => {
          documents.push({
            id: doc.id,
            ...doc.data()
          });
        });
        callback(documents);
      }, (error) => {
        console.error('Error in real-time listener: ', error);
        callback([]);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up real-time listener: ', error);
      throw error;
    }
  }

  /**
   * Listen to real-time updates for a single document
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @param {Function} callback - Callback function to handle updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToDocument(collectionName, docId, callback) {
    try {
      const db = this.getDB();
      const docRef = doc(db, collectionName, docId);

      const unsubscribe = onSnapshot(docRef, (doc) => {
        if (doc.exists()) {
          callback({
            id: doc.id,
            ...doc.data()
          });
        } else {
          callback(null);
        }
      }, (error) => {
        console.error('Error in real-time document listener: ', error);
        callback(null);
      });

      return unsubscribe;
    } catch (error) {
      console.error('Error setting up document real-time listener: ', error);
      throw error;
    }
  }

  /**
   * Add item to array field
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @param {string} fieldName - Array field name
   * @param {any} value - Value to add
   * @returns {Promise<void>}
   */
  async addToArrayField(collectionName, docId, fieldName, value) {
    try {
      const db = this.getDB();
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [fieldName]: arrayUnion(value),
        updatedAt: serverTimestamp()
      });
      console.log('Item added to array field successfully');
    } catch (error) {
      console.error('Error adding to array field: ', error);
      throw error;
    }
  }

  /**
   * Remove item from array field
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @param {string} fieldName - Array field name
   * @param {any} value - Value to remove
   * @returns {Promise<void>}
   */
  async removeFromArrayField(collectionName, docId, fieldName, value) {
    try {
      const db = this.getDB();
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [fieldName]: arrayRemove(value),
        updatedAt: serverTimestamp()
      });
      console.log('Item removed from array field successfully');
    } catch (error) {
      console.error('Error removing from array field: ', error);
      throw error;
    }
  }

  /**
   * Increment a numeric field
   * @param {string} collectionName - Name of the collection
   * @param {string} docId - Document ID
   * @param {string} fieldName - Numeric field name
   * @param {number} value - Value to increment by (default: 1)
   * @returns {Promise<void>}
   */
  async incrementField(collectionName, docId, fieldName, value = 1) {
    try {
      const db = this.getDB();
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        [fieldName]: increment(value),
        updatedAt: serverTimestamp()
      });
      console.log('Field incremented successfully');
    } catch (error) {
      console.error('Error incrementing field: ', error);
      throw error;
    }
  }

  /**
   * Get server timestamp
   * @returns {FieldValue} Server timestamp
   */
  getServerTimestamp() {
    return serverTimestamp();
  }

  /**
   * Batch operations helper
   * @param {Array} operations - Array of operations
   * @returns {Promise<void>}
   */
  async batchOperations(operations) {
    try {
      const db = this.getDB();
      const batch = writeBatch(db);

      operations.forEach(operation => {
        const { type, collectionName, docId, data } = operation;
        const docRef = doc(db, collectionName, docId);

        switch (type) {
          case 'set':
            batch.set(docRef, {
              ...data,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp()
            });
            break;
          case 'update':
            batch.update(docRef, {
              ...data,
              updatedAt: serverTimestamp()
            });
            break;
          case 'delete':
            batch.delete(docRef);
            break;
          default:
            console.warn(`Unknown batch operation type: ${type}`);
        }
      });

      await batch.commit();
      console.log('Batch operations completed successfully');
    } catch (error) {
      console.error('Error in batch operations: ', error);
      throw error;
    }
  }
}

// Create and export a singleton instance
const firestoreService = new FirestoreService();
export default firestoreService;

// Also export the class for creating custom instances if needed
export { FirestoreService };