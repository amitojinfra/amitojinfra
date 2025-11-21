import Layout from '../components/layout/Layout';
import FirestoreRealTimeDemo from '../components/demo/FirestoreRealTimeDemo';
import ProtectedRoute from '../components/shared/ProtectedRoute';

export default function FirestoreRealTimePage() {
  return (
    <Layout title="Real-time Firestore Demo - AmitojInfra" description="Real-time Firestore database updates demonstration">
      <ProtectedRoute>
        <div>
          <h1>Real-time Firestore Demo</h1>
          <p className="text-center mb-4">
            Experience the power of Firestore's real-time database capabilities. 
            This page automatically updates when data changes in the database.
          </p>
          
          <div className="demo-info">
            <h3>Real-time Features:</h3>
            <ul>
              <li>Automatic updates without page refresh</li>
              <li>Live connection status indicator</li>
              <li>Real-time filtering and querying</li>
              <li>Instant data synchronization</li>
              <li>Live document count updates</li>
            </ul>
            
            <div className="instructions">
              <strong>Try this:</strong> Open the Firestore Demo page in another tab and make changes. 
              Watch how this page updates automatically in real-time!
            </div>
          </div>
          
          <FirestoreRealTimeDemo />
        </div>
      </ProtectedRoute>
      
      <style jsx>{`
        .demo-info {
          background: #f0f9ff;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #0284c7;
        }
        
        .demo-info h3 {
          margin-top: 0;
          color: #0369a1;
        }
        
        .demo-info ul {
          margin: 15px 0;
          padding-left: 20px;
        }
        
        .demo-info li {
          margin-bottom: 8px;
          color: #0369a1;
        }
        
        .instructions {
          background: #ecfdf5;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #6ee7b7;
          margin-top: 15px;
          color: #065f46;
        }
        
        .instructions strong {
          color: #047857;
        }
      `}</style>
    </Layout>
  );
}