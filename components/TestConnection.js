import { useState, useEffect } from 'react';
import Link from 'next/link';
import employeeService from '../lib/services/employeeService';
import attendanceService from '../lib/services/attendanceService';
import { useAuth } from '../contexts/AuthContext';
import { hasFirebaseConfig } from '../lib/firebase/configManager';

/**
 * Test component to verify employee-attendance connection
 */
const TestConnection = () => {
  const { user, loading: authLoading } = useAuth();
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [connectionDetails, setConnectionDetails] = useState({});

  useEffect(() => {
    if (!authLoading) {
      testConnection();
    }
  }, [authLoading]); // eslint-disable-line react-hooks/exhaustive-deps

  const testConnection = async () => {
    setLoading(true);
    setError('');

    try {
      // Check basic requirements
      const details = {
        firebaseConfigured: hasFirebaseConfig(),
        userAuthenticated: !!user,
        userEmail: user?.email || 'Not logged in',
        timestamp: new Date().toISOString()
      };

      console.log('Connection test details:', details);
      setConnectionDetails(details);

      if (!details.firebaseConfigured) {
        throw new Error('Firebase is not configured. Please set up Firebase configuration first.');
      }

      if (!details.userAuthenticated) {
        throw new Error('User is not authenticated. Please sign in first.');
      }

      console.log('Testing employee service connection...');
      let employeesData = [];
      try {
        employeesData = await employeeService.getAllEmployees();
        console.log('✅ Employees loaded:', employeesData.length);
        setEmployees(employeesData);
      } catch (empError) {
        console.error('❌ Employee service error:', empError);
        throw new Error(`Employee service failed: ${empError.message}`);
      }

      console.log('Testing attendance service connection...');
      let attendanceData = [];
      try {
        attendanceData = await attendanceService.getAllAttendance();
        console.log('✅ Attendance records loaded:', attendanceData.length);
        setAttendance(attendanceData);
      } catch (attError) {
        console.error('❌ Attendance service error:', attError);
        throw new Error(`Attendance service failed: ${attError.message}`);
      }

      if (employeesData.length === 0) {
        setError('⚠️ No employees found. Please add employees first to test attendance functionality.');
      } else {
        console.log('✅ All tests passed successfully!');
      }
    } catch (err) {
      console.error('❌ Connection test failed:', err);
      setError(`Connection test failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <div style={{ marginBottom: '10px' }}>Testing connections...</div>
        <div>Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: '20px', 
      border: '1px solid #ddd', 
      borderRadius: '8px', 
      margin: '20px',
      backgroundColor: error ? '#fee' : '#efe'
    }}>
      <h3>🔗 Employee-Attendance Connection Test</h3>
      
      {error ? (
        <div style={{ color: '#c33', marginBottom: '15px' }}>
          <strong>Error:</strong> {error}
        </div>
      ) : (
        <div style={{ color: '#363', marginBottom: '15px' }}>
          <strong>✅ Connection successful!</strong>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <h4>👥 Employees ({employees.length})</h4>
          {employees.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {employees.slice(0, 5).map(emp => (
                <li key={emp.id} style={{ marginBottom: '5px' }}>
                  <strong>{emp.name}</strong>
                  {emp.aadhar_id && <span> (Aadhar: {emp.aadhar_id.slice(0, 4)}****{emp.aadhar_id.slice(-4)})</span>}
                </li>
              ))}
              {employees.length > 5 && (
                <li style={{ color: '#666', fontStyle: 'italic' }}>
                  ...and {employees.length - 5} more
                </li>
              )}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              No employees found. 
              <Link href="/employees/new" style={{ color: '#007cba', marginLeft: '5px' }}>
                Add employees first
              </Link>
            </p>
          )}
        </div>

        <div>
          <h4>📋 Attendance Records ({attendance.length})</h4>
          {attendance.length > 0 ? (
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              {attendance.slice(0, 5).map(record => {
                const employee = employees.find(emp => emp.id === record.employee_id);
                return (
                  <li key={record.id} style={{ marginBottom: '5px' }}>
                    <strong>{employee?.name || 'Unknown Employee'}</strong>
                    <span style={{ 
                      marginLeft: '10px',
                      padding: '2px 6px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      backgroundColor: record.status === 'present' ? '#d4edda' : 
                                     record.status === 'absent' ? '#f8d7da' : '#fff3cd'
                    }}>
                      {record.status} on {record.date}
                    </span>
                  </li>
                );
              })}
              {attendance.length > 5 && (
                <li style={{ color: '#666', fontStyle: 'italic' }}>
                  ...and {attendance.length - 5} more
                </li>
              )}
            </ul>
          ) : (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              No attendance records found.
              {employees.length > 0 && (
                <Link href="/attendance/bulk" style={{ color: '#007cba', marginLeft: '5px' }}>
                  Mark attendance
                </Link>
              )}
            </p>
          )}
        </div>
      </div>

      <div style={{ marginTop: '20px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '4px' }}>
        <h4>🔗 Connection Status:</h4>
        <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li style={{ color: connectionDetails.firebaseConfigured ? '#28a745' : '#dc3545' }}>
            {connectionDetails.firebaseConfigured ? '✅' : '❌'} Firebase: {connectionDetails.firebaseConfigured ? 'Configured' : 'Not Configured'}
          </li>
          <li style={{ color: connectionDetails.userAuthenticated ? '#28a745' : '#dc3545' }}>
            {connectionDetails.userAuthenticated ? '✅' : '❌'} Authentication: {connectionDetails.userAuthenticated ? `Signed in as ${connectionDetails.userEmail}` : 'Not signed in'}
          </li>
          <li style={{ color: error ? '#dc3545' : '#28a745' }}>
            {error ? '❌' : '✅'} Employee Service: {error ? 'Failed' : `Connected (${employees.length} employees loaded)`}
          </li>
          <li style={{ color: error ? '#dc3545' : '#28a745' }}>
            {error ? '❌' : '✅'} Attendance Service: {error ? 'Failed' : `Connected (${attendance.length} records loaded)`}
          </li>
          {!error && (
            <li style={{ color: '#28a745' }}>
              ✅ Data Linking: {attendance.filter(record => 
                employees.some(emp => emp.id === record.employee_id)
              ).length} attendance records properly linked to employees
            </li>
          )}
        </ul>
        {connectionDetails.timestamp && (
          <p style={{ fontSize: '0.8rem', color: '#666', margin: '10px 0 0 0' }}>
            Last tested: {new Date(connectionDetails.timestamp).toLocaleString()}
          </p>
        )}
      </div>

      {error && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#fff3cd', borderRadius: '4px', border: '1px solid #ffeaa7' }}>
          <h4>🛠️ Troubleshooting Steps:</h4>
          <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
            {!connectionDetails.firebaseConfigured && (
              <li>
                <strong>Configure Firebase:</strong> Go to{' '}
                <Link href="/firebase-setup" style={{ color: '#007cba' }}>Firebase Setup</Link>{' '}
                to configure your Firebase project.
              </li>
            )}
            {!connectionDetails.userAuthenticated && (
              <li>
                <strong>Sign In:</strong> Go to{' '}
                <Link href="/auth" style={{ color: '#007cba' }}>Sign In</Link>{' '}
                to authenticate with your account.
              </li>
            )}
            {connectionDetails.firebaseConfigured && connectionDetails.userAuthenticated && (
              <>
                <li><strong>Check Browser Console:</strong> Open Developer Tools (F12) and check the Console tab for detailed error messages.</li>
                <li><strong>Check Network:</strong> Ensure you have a stable internet connection and can access Firebase services.</li>
                <li><strong>Check Firestore Rules:</strong> Make sure your Firestore security rules allow read/write access for authenticated users.</li>
                <li><strong>Check Firebase Project:</strong> Verify that your Firebase project is active and Firestore is enabled.</li>
              </>
            )}
          </ol>
        </div>
      )}

      <div style={{ marginTop: '15px', textAlign: 'center' }}>
        <button 
          onClick={testConnection}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#6c757d' : '#007cba',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? '🔄 Testing...' : '🔄 Retest Connection'}
        </button>
      </div>
    </div>
  );
};

export default TestConnection;