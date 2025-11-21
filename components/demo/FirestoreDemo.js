import { useState } from 'react';
import { useFirestoreCRUD } from '../../hooks/useFirestore';

const FirestoreDemo = () => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: ''
  });
  const [selectedId, setSelectedId] = useState('');
  const [documents, setDocuments] = useState([]);

  const {
    addDocument,
    updateDocument,
    deleteDocument,
    getDocuments,
    loading,
    error
  } = useFirestoreCRUD('demo-collection');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (selectedId) {
        // Update existing document
        await updateDocument(selectedId, formData);
        alert('Document updated successfully!');
      } else {
        // Add new document
        await addDocument(formData);
        alert('Document added successfully!');
      }
      
      // Clear form
      setFormData({ title: '', description: '', category: '' });
      setSelectedId('');
      
      // Refresh documents list
      fetchDocuments();
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const handleEdit = (doc) => {
    setFormData({
      title: doc.title || '',
      description: doc.description || '',
      category: doc.category || ''
    });
    setSelectedId(doc.id);
  };

  const handleDelete = async (docId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await deleteDocument(docId);
        alert('Document deleted successfully!');
        fetchDocuments();
      } catch (err) {
        alert(`Error: ${err.message}`);
      }
    }
  };

  const fetchDocuments = async () => {
    try {
      const docs = await getDocuments({
        orderBy: { field: 'createdAt', direction: 'desc' },
        limit: 10
      });
      setDocuments(docs);
    } catch (err) {
      alert(`Error fetching documents: ${err.message}`);
    }
  };

  const cancelEdit = () => {
    setFormData({ title: '', description: '', category: '' });
    setSelectedId('');
  };

  return (
    <div className="firestore-demo">
      <div className="demo-container">
        <h2>Firestore Demo</h2>
        
        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {/* Add/Edit Form */}
        <div className="form-section">
          <h3>{selectedId ? 'Edit Document' : 'Add New Document'}</h3>
          <form onSubmit={handleSubmit} className="demo-form">
            <div className="form-group">
              <label htmlFor="title">Title:</label>
              <input
                type="text"
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows="3"
              />
            </div>

            <div className="form-group">
              <label htmlFor="category">Category:</label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                required
              >
                <option value="">Select Category</option>
                <option value="work">Work</option>
                <option value="personal">Personal</option>
                <option value="study">Study</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="form-actions">
              <button type="submit" disabled={loading}>
                {loading ? 'Saving...' : (selectedId ? 'Update' : 'Add')}
              </button>
              {selectedId && (
                <button type="button" onClick={cancelEdit} className="cancel-btn">
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Documents List */}
        <div className="documents-section">
          <div className="section-header">
            <h3>Documents</h3>
            <button onClick={fetchDocuments} disabled={loading} className="refresh-btn">
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>

          {documents.length === 0 ? (
            <p className="no-documents">No documents found. Add some documents to get started!</p>
          ) : (
            <div className="documents-list">
              {documents.map((doc) => (
                <div key={doc.id} className="document-card">
                  <div className="document-content">
                    <h4>{doc.title}</h4>
                    <p className="description">{doc.description}</p>
                    <div className="document-meta">
                      <span className="category">Category: {doc.category}</span>
                      <span className="id">ID: {doc.id}</span>
                      {doc.createdAt && (
                        <span className="date">
                          Created: {new Date(doc.createdAt.seconds * 1000).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="document-actions">
                    <button 
                      onClick={() => handleEdit(doc)}
                      className="edit-btn"
                      disabled={loading}
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(doc.id)}
                      className="delete-btn"
                      disabled={loading}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .firestore-demo {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .demo-container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
        }

        .form-section {
          margin-bottom: 40px;
          padding-bottom: 30px;
          border-bottom: 1px solid #eee;
        }

        .demo-form {
          max-width: 500px;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-group label {
          display: block;
          margin-bottom: 5px;
          font-weight: 500;
          color: #333;
        }

        .form-group input,
        .form-group textarea,
        .form-group select {
          width: 100%;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .form-group input:focus,
        .form-group textarea:focus,
        .form-group select:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
        }

        .form-actions {
          display: flex;
          gap: 10px;
          margin-top: 20px;
        }

        .form-actions button {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .form-actions button[type="submit"] {
          background: #007cba;
          color: white;
        }

        .form-actions button[type="submit"]:hover:not(:disabled) {
          background: #005a87;
        }

        .cancel-btn {
          background: #666;
          color: white;
        }

        .cancel-btn:hover {
          background: #555;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .refresh-btn {
          padding: 8px 16px;
          background: #f0f0f0;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .refresh-btn:hover:not(:disabled) {
          background: #e0e0e0;
        }

        .no-documents {
          text-align: center;
          color: #666;
          padding: 40px;
          background: #f9f9f9;
          border-radius: 4px;
        }

        .documents-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .document-card {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 6px;
          background: #fafafa;
        }

        .document-content {
          flex: 1;
        }

        .document-content h4 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .description {
          margin: 0 0 15px 0;
          color: #666;
          line-height: 1.4;
        }

        .document-meta {
          display: flex;
          gap: 15px;
          font-size: 12px;
          color: #888;
        }

        .category {
          background: #e1f5fe;
          padding: 2px 8px;
          border-radius: 12px;
          color: #0277bd;
        }

        .document-actions {
          display: flex;
          gap: 8px;
          margin-left: 20px;
        }

        .document-actions button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .edit-btn {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        }

        .edit-btn:hover:not(:disabled) {
          background: #ffeaa7;
        }

        .delete-btn {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .delete-btn:hover:not(:disabled) {
          background: #f5c6cb;
        }

        button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .firestore-demo {
            padding: 10px;
          }
          
          .demo-container {
            padding: 20px;
          }
          
          .document-card {
            flex-direction: column;
            gap: 15px;
          }
          
          .document-actions {
            margin-left: 0;
          }
          
          .document-meta {
            flex-direction: column;
            gap: 5px;
          }
        }
      `}</style>
    </div>
  );
};

export default FirestoreDemo;