import Layout from '../components/layout/Layout';
import FirestoreDemo from '../components/demo/FirestoreDemo';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import FirestoreDebug from '../components/debug/FirestoreDebug';

export default function FirestoreDemoPage() {
  return (
    <Layout title="Firestore Demo - AmitojInfra" description="Interactive Firestore database demonstration">
      <ProtectedRoute>
        <div>
          <h1>Firestore Database Demo</h1>
          <p className="text-center mb-4">
            This interactive demo showcases Firebase Firestore database operations including 
            create, read, update, and delete (CRUD) functionality.
          </p>
          
          <div className="demo-info">
            <h3>What you can do:</h3>
            <ul>
              <li>Add new documents to the Firestore database</li>
              <li>Edit existing documents</li>
              <li>Delete documents</li>
              <li>View all documents with metadata</li>
              <li>Experience real-time database operations</li>
            </ul>
            
            <div className="note">
              <strong>Note:</strong> This demo uses your configured Firebase project. 
              Make sure you have configured your Firebase settings and have Firestore enabled.
            </div>
          </div>
          
          <FirestoreDebug />
          
          <FirestoreDemo />
        </div>
      </ProtectedRoute>
      
      <style jsx>{`
        .demo-info {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          border-left: 4px solid #007cba;
        }
        
        .demo-info h3 {
          margin-top: 0;
          color: #333;
        }
        
        .demo-info ul {
          margin: 15px 0;
          padding-left: 20px;
        }
        
        .demo-info li {
          margin-bottom: 8px;
          color: #555;
        }
        
        .note {
          background: #fff3cd;
          padding: 12px;
          border-radius: 4px;
          border: 1px solid #ffeaa7;
          margin-top: 15px;
        }
        
        .note strong {
          color: #856404;
        }
      `}</style>
    </Layout>
  );
}