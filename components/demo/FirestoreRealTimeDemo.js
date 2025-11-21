import { useState } from 'react';
import { useFirestoreCollection } from '../../hooks/useFirestore';

const FirestoreRealTimeDemo = () => {
  const [category, setCategory] = useState('');
  
  // Real-time collection subscription with optional filtering
  const { documents, loading, error } = useFirestoreCollection('demo-collection', {
    where: category ? [{ field: 'category', operator: '==', value: category }] : undefined,
    orderBy: { field: 'createdAt', direction: 'desc' },
    limit: 20
  });

  const categories = ['work', 'personal', 'study', 'other'];

  return (
    <div className="realtime-demo">
      <div className="demo-container">
        <h2>Real-time Firestore Demo</h2>
        <p className="demo-description">
          This demo shows real-time updates from Firestore. Any changes made in the database 
          will automatically appear here without refreshing the page.
        </p>

        {error && (
          <div className="error-message">
            Error: {error}
          </div>
        )}

        {/* Category Filter */}
        <div className="filter-section">
          <label htmlFor="category-filter">Filter by Category:</label>
          <select
            id="category-filter"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="category-filter"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.charAt(0).toUpperCase() + cat.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {/* Real-time Status */}
        <div className="status-indicator">
          <div className={`status-dot ${loading ? 'loading' : 'connected'}`}></div>
          <span className="status-text">
            {loading ? 'Connecting to Firestore...' : 'Real-time connection active'}
          </span>
        </div>

        {/* Documents Display */}
        <div className="documents-section">
          <h3>
            Live Documents 
            {category && ` (${category})`}
            <span className="count">({documents.length})</span>
          </h3>

          {loading && documents.length === 0 ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading documents...</p>
            </div>
          ) : documents.length === 0 ? (
            <div className="empty-state">
              <p>No documents found.</p>
              <p className="hint">
                Add some documents using the Firestore Demo to see real-time updates here!
              </p>
            </div>
          ) : (
            <div className="documents-grid">
              {documents.map((doc) => (
                <div key={doc.id} className="document-tile">
                  <div className="document-header">
                    <h4>{doc.title}</h4>
                    <span className={`category-badge ${doc.category}`}>
                      {doc.category}
                    </span>
                  </div>
                  
                  {doc.description && (
                    <p className="document-description">{doc.description}</p>
                  )}
                  
                  <div className="document-footer">
                    <span className="document-id">ID: {doc.id.slice(0, 8)}...</span>
                    {doc.updatedAt && (
                      <span className="last-updated">
                        Updated: {new Date(doc.updatedAt.seconds * 1000).toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="instructions">
          <h4>How it works:</h4>
          <ul>
            <li>This component subscribes to real-time updates from Firestore</li>
            <li>Any changes to documents in the 'demo-collection' will appear instantly</li>
            <li>Try adding, editing, or deleting documents in the Firestore Demo page</li>
            <li>Use the category filter to see real-time filtering in action</li>
          </ul>
        </div>
      </div>

      <style jsx>{`
        .realtime-demo {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .demo-container {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .demo-description {
          background: #e3f2fd;
          padding: 15px;
          border-radius: 4px;
          margin: 20px 0;
          color: #1976d2;
          border-left: 4px solid #2196f3;
        }

        .error-message {
          background: #fee;
          color: #c33;
          padding: 10px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
        }

        .filter-section {
          margin: 20px 0;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 6px;
        }

        .filter-section label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        .category-filter {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          background: white;
        }

        .status-indicator {
          display: flex;
          align-items: center;
          gap: 8px;
          margin: 20px 0;
          padding: 10px;
          background: #f0f9ff;
          border-radius: 4px;
          border: 1px solid #bae6fd;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .status-dot.connected {
          background: #10b981;
          animation: pulse 2s infinite;
        }

        .status-dot.loading {
          background: #f59e0b;
          animation: blink 1s infinite;
        }

        .status-text {
          font-size: 14px;
          color: #0369a1;
        }

        .documents-section h3 {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-bottom: 20px;
        }

        .count {
          background: #e5e7eb;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 12px;
          color: #6b7280;
        }

        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 40px;
          color: #666;
        }

        .spinner {
          width: 32px;
          height: 32px;
          border: 3px solid #f3f3f3;
          border-top: 3px solid #007cba;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        .empty-state {
          text-align: center;
          padding: 40px;
          color: #666;
          background: #f9f9f9;
          border-radius: 8px;
        }

        .hint {
          color: #888;
          font-size: 14px;
          margin-top: 10px;
        }

        .documents-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }

        .document-tile {
          background: #ffffff;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 20px;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .document-tile:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .document-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 10px;
        }

        .document-header h4 {
          margin: 0;
          color: #1f2937;
          flex: 1;
          margin-right: 10px;
        }

        .category-badge {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .category-badge.work {
          background: #dbeafe;
          color: #1e40af;
        }

        .category-badge.personal {
          background: #f3e8ff;
          color: #7c3aed;
        }

        .category-badge.study {
          background: #ecfdf5;
          color: #059669;
        }

        .category-badge.other {
          background: #fef3c7;
          color: #d97706;
        }

        .document-description {
          color: #6b7280;
          font-size: 14px;
          line-height: 1.4;
          margin: 0 0 15px 0;
        }

        .document-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #9ca3af;
          padding-top: 10px;
          border-top: 1px solid #f3f4f6;
        }

        .instructions {
          background: #f8fafc;
          padding: 20px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .instructions h4 {
          margin: 0 0 10px 0;
          color: #334155;
        }

        .instructions ul {
          margin: 0;
          padding-left: 20px;
          color: #64748b;
        }

        .instructions li {
          margin-bottom: 5px;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0.3; }
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .realtime-demo {
            padding: 10px;
          }
          
          .demo-container {
            padding: 20px;
          }
          
          .documents-grid {
            grid-template-columns: 1fr;
          }
          
          .document-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
          
          .document-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default FirestoreRealTimeDemo;