import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../../components/layout/Layout';
import EmployeeForm from '../../../components/employee/EmployeeForm';
import ProtectedRoute from '../../../components/shared/ProtectedRoute';
import employeeService from '../../../lib/services/simpleEmployeeService';
import Link from 'next/link';

export default function EditEmployeePage() {
  const [employee, setEmployee] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const { id } = router.query;

  // Load employee data
  useEffect(() => {
    if (id) {
      loadEmployee(id);
    }
  }, [id]);

  const loadEmployee = async (employeeId) => {
    try {
      setLoading(true);
      setError(null);
      const employeeData = await employeeService.getEmployee(employeeId);
      
      if (!employeeData) {
        setError('Employee not found');
        return;
      }
      
      setEmployee(employeeData);
    } catch (err) {
      console.error('Error loading employee:', err);
      setError(err.message || 'Failed to load employee data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (employeeData) => {
    try {
      setSaving(true);
      await employeeService.updateEmployee(id, employeeData);
      
      // Show success message
      alert(`Employee "${employeeData.name}" has been successfully updated!`);
      
      // Redirect to employees list
      router.push('/employees');
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error; // Re-throw so the form can handle it
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    router.push('/employees');
  };

  if (loading) {
    return (
      <Layout title="Edit Employee - AmitojInfra" description="Edit employee information">
        <ProtectedRoute>
          <div className="loading-page">
            <div className="loading-spinner"></div>
            <p>Loading employee data...</p>
          </div>
        </ProtectedRoute>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout title="Edit Employee - AmitojInfra" description="Edit employee information">
        <ProtectedRoute>
          <div className="error-page">
            <div className="error-content">
              <h1>Error Loading Employee</h1>
              <p>{error}</p>
              <div className="error-actions">
                <button onClick={() => loadEmployee(id)} className="retry-btn">
                  Try Again
                </button>
                <Link href="/employees" className="back-btn">
                  Back to Employees
                </Link>
              </div>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout title="Employee Not Found - AmitojInfra" description="Employee not found">
        <ProtectedRoute>
          <div className="not-found-page">
            <div className="not-found-content">
              <h1>Employee Not Found</h1>
              <p>The employee you're looking for doesn't exist or may have been deleted.</p>
              <Link href="/employees" className="back-btn">
                Back to Employees
              </Link>
            </div>
          </div>
        </ProtectedRoute>
      </Layout>
    );
  }

  return (
    <Layout title={`Edit ${employee.name} - AmitojInfra`} description="Edit employee information">
      <ProtectedRoute>
        <div className="edit-employee-page">
          <div className="page-header">
            <div className="breadcrumb">
              <Link href="/employees" className="breadcrumb-link">
                ← Back to Employees
              </Link>
            </div>
            <div className="header-content">
              <h1>Edit Employee</h1>
              <p>Update information for <strong>{employee.name}</strong></p>
            </div>
          </div>

          <div className="employee-info-card">
            <div className="info-grid">
              <div className="info-item">
                <span className="info-label">Employee ID:</span>
                <span className="info-value">{employee.id}</span>
              </div>
              <div className="info-item">
                <span className="info-label">Added on:</span>
                <span className="info-value">
                  {employee.createdAt ? 
                    new Date(employee.createdAt.seconds ? 
                      employee.createdAt.seconds * 1000 : 
                      employee.createdAt
                    ).toLocaleDateString() : 
                    'Unknown'
                  }
                </span>
              </div>
              {employee.updatedAt && (
                <div className="info-item">
                  <span className="info-label">Last updated:</span>
                  <span className="info-value">
                    {new Date(employee.updatedAt.seconds ? 
                      employee.updatedAt.seconds * 1000 : 
                      employee.updatedAt
                    ).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="form-section">
            <EmployeeForm
              initialData={employee}
              mode="update"
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={saving}
            />
          </div>

          <div className="warning-section">
            <div className="warning-card">
              <h3>⚠️ Important Notes</h3>
              <ul>
                <li>Changes will be saved immediately after clicking "Update Employee"</li>
                <li>If you change the Aadhar ID, make sure it doesn't conflict with another employee</li>
                <li>Employee ID cannot be changed once created</li>
                <li>All changes are logged and tracked for audit purposes</li>
              </ul>
            </div>
          </div>
        </div>
      </ProtectedRoute>

      <style jsx>{`
        .edit-employee-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
        }

        .loading-page,
        .error-page,
        .not-found-page {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
          text-align: center;
          color: #666;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007cba;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        .error-content,
        .not-found-content {
          max-width: 400px;
        }

        .error-content h1,
        .not-found-content h1 {
          color: #dc3545;
          margin-bottom: 15px;
        }

        .error-actions {
          display: flex;
          gap: 10px;
          justify-content: center;
          margin-top: 20px;
        }

        .retry-btn,
        .back-btn {
          padding: 10px 20px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
          display: inline-block;
        }

        .retry-btn {
          background: #007cba;
          color: white;
        }

        .retry-btn:hover {
          background: #005a87;
        }

        .back-btn {
          background: #6c757d;
          color: white;
        }

        .back-btn:hover {
          background: #5a6268;
        }

        .page-header {
          margin-bottom: 30px;
        }

        .breadcrumb {
          margin-bottom: 15px;
        }

        .breadcrumb-link {
          color: #007cba;
          text-decoration: none;
          font-size: 14px;
          font-weight: 500;
        }

        .breadcrumb-link:hover {
          text-decoration: underline;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 1.8rem;
        }

        .header-content p {
          margin: 0;
          color: #6b7280;
          font-size: 1rem;
        }

        .employee-info-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          border-left: 4px solid #17a2b8;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .info-value {
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .form-section {
          margin-bottom: 40px;
        }

        .warning-section {
          margin-top: 40px;
        }

        .warning-card {
          background: #fff3cd;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #ffeaa7;
          border-left: 4px solid #ffc107;
        }

        .warning-card h3 {
          margin: 0 0 15px 0;
          color: #856404;
          font-size: 1rem;
        }

        .warning-card ul {
          margin: 0;
          padding-left: 20px;
        }

        .warning-card li {
          margin-bottom: 8px;
          color: #856404;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .edit-employee-page {
            padding: 10px;
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .info-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
          
          .header-content h1 {
            font-size: 1.5rem;
          }
          
          .error-actions {
            flex-direction: column;
          }
        }
      `}</style>
    </Layout>
  );
}