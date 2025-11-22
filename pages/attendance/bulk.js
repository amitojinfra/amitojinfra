import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import attendanceService from '../../lib/services/attendanceService';
import employeeService from '../../lib/services/employeeService';
import AttendanceForm from '../../components/attendance/AttendanceForm';

export default function BulkAttendance() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load employees
  useEffect(() => {
    if (user) {
      loadEmployees();
    }
  }, [user]);

  const loadEmployees = async () => {
    setLoading(true);
    setError('');

    try {
      const employeesData = await employeeService.getAllEmployees();
      setEmployees(employeesData);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError('Failed to load employees. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkAttendance = async (attendanceData) => {
    setError('');
    setSuccess('');

    try {
      const results = await attendanceService.markBulkAttendance(attendanceData);
      
      // Create detailed success message
      let successMessage = `Successfully processed attendance for ${results.success} employees!`;
      
      if (results.created > 0 && results.updated > 0) {
        successMessage += ` (${results.created} new records, ${results.updated} updated)`;
      } else if (results.updated > 0) {
        successMessage += ` (${results.updated} records updated - attendance already existed for today)`;
      } else if (results.created > 0) {
        successMessage += ` (${results.created} new records created)`;
      }
      
      if (results.errors > 0) {
        successMessage += ` Note: ${results.errors} records failed to process.`;
      }
      
      setSuccess(successMessage);
      
      // Auto-redirect after success (longer delay for detailed message)
      setTimeout(() => {
        router.push('/attendance');
      }, 3000);
    } catch (err) {
      console.error('Error marking bulk attendance:', err);
      setError('Failed to mark attendance. Please try again.');
    }
  };

  const handleCancel = () => {
    router.push('/attendance');
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  return (
    <>
      <Head>
        <title>Bulk Attendance Marking - Employee Management</title>
        <meta name="description" content="Mark attendance for multiple employees at once" />
      </Head>

      <div className="bulk-attendance-page">
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <button onClick={() => router.push('/attendance')} className="breadcrumb-link">
              ← Attendance Dashboard
            </button>
          </div>
          
          <div className="header-content">
            <h1>Bulk Attendance Marking</h1>
            <p>Mark attendance for multiple employees quickly and efficiently</p>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="message error">
            <strong>Error:</strong> {error}
            <button onClick={() => setError('')} className="close-message">×</button>
          </div>
        )}

        {success && (
          <div className="message success">
            <strong>Success:</strong> {success}
          </div>
        )}

        {/* Instructions */}
        <div className="instructions">
          <h2>How to use Bulk Attendance Marking:</h2>
          <ol>
            <li>Select the date for attendance marking</li>
            <li>Choose employees by checking the boxes next to their names</li>
            <li>Use "Select All" to quickly select all employees</li>
            <li>Set a bulk status (Present/Absent/Half Day) and apply to selected employees</li>
            <li>Adjust individual employee status as needed</li>
            <li>Add optional notes if required</li>
            <li>Click "Mark Attendance" to save</li>
          </ol>
        </div>

        {/* Main Content */}
        <div className="bulk-form-container">
          {loading ? (
            <div className="loading-section">
              <div className="spinner"></div>
              <p>Loading employees...</p>
            </div>
          ) : employees.length === 0 ? (
            <div className="no-employees">
              <div className="no-employees-icon">👥</div>
              <h3>No employees found</h3>
              <p>You need to add employees before marking attendance.</p>
              <button
                onClick={() => router.push('/employees/create')}
                className="btn-primary"
              >
                Add Employees
              </button>
            </div>
          ) : (
            <AttendanceForm
              employees={employees}
              mode="bulk"
              onSubmit={handleBulkAttendance}
              onCancel={handleCancel}
              loading={loading}
            />
          )}
        </div>

        {/* Tips */}
        <div className="tips-section">
          <h3>💡 Pro Tips:</h3>
          <div className="tips-grid">
            <div className="tip">
              <div className="tip-icon">⚡</div>
              <div className="tip-content">
                <strong>Quick Selection:</strong> Use "Select All" then uncheck specific employees to save time
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">🎯</div>
              <div className="tip-content">
                <strong>Bulk Actions:</strong> Set status for multiple employees at once using the bulk controls
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">📅</div>
              <div className="tip-content">
                <strong>Date Validation:</strong> You cannot mark attendance for future dates
              </div>
            </div>
            <div className="tip">
              <div className="tip-icon">🔄</div>
              <div className="tip-content">
                <strong>Updates:</strong> You can update attendance by marking it again for the same date
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .bulk-attendance-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 20px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007cba;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .page-header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .breadcrumb {
          margin-bottom: 20px;
        }

        .breadcrumb-link {
          background: none;
          border: none;
          color: #007cba;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
          padding: 0;
        }

        .breadcrumb-link:hover {
          color: #005a87;
        }

        .header-content h1 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 2rem;
        }

        .header-content p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .message {
          padding: 15px 20px;
          border-radius: 6px;
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .message.error {
          background: #fee;
          color: #c33;
          border: 1px solid #fcc;
        }

        .message.success {
          background: #dfd;
          color: #363;
          border: 1px solid #beb;
        }

        .close-message {
          background: none;
          border: none;
          color: inherit;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          margin-left: 10px;
        }

        .instructions {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .instructions h2 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.2rem;
        }

        .instructions ol {
          margin: 0;
          padding-left: 20px;
          color: #666;
        }

        .instructions li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .bulk-form-container {
          margin-bottom: 30px;
        }

        .loading-section {
          background: white;
          padding: 60px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .loading-section .spinner {
          margin: 0 auto 20px;
        }

        .no-employees {
          background: white;
          padding: 60px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
        }

        .no-employees-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .no-employees h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .no-employees p {
          margin: 0 0 20px 0;
          color: #666;
        }

        .btn-primary {
          padding: 12px 24px;
          background: #007cba;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #005a87;
          transform: translateY(-1px);
        }

        .tips-section {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .tips-section h3 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.1rem;
        }

        .tips-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .tip {
          display: flex;
          align-items: flex-start;
          gap: 12px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .tip-icon {
          font-size: 1.2rem;
          flex-shrink: 0;
        }

        .tip-content {
          font-size: 0.9rem;
          line-height: 1.4;
          color: #666;
        }

        .tip-content strong {
          color: #333;
        }

        @media (max-width: 768px) {
          .bulk-attendance-page {
            padding: 10px;
          }

          .page-header {
            padding: 20px;
          }

          .header-content h1 {
            font-size: 1.5rem;
          }

          .instructions {
            padding: 20px;
          }

          .tips-grid {
            grid-template-columns: 1fr;
          }

          .tip {
            padding: 12px;
          }
        }
      `}</style>
    </>
  );
}