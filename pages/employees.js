import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Layout from '../components/layout/Layout';
import EmployeeList from '../components/employee/EmployeeList';
import ProtectedRoute from '../components/shared/ProtectedRoute';
import employeeService from '../lib/services/employeeService';
import Link from 'next/link';

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);
  const router = useRouter();

  // Load employees
  useEffect(() => {
    loadEmployees();
    loadStats();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      const employeeData = await employeeService.getAllEmployees();
      setEmployees(employeeData);
    } catch (err) {
      console.error('Error loading employees:', err);
      setError(err.message || 'Failed to load employees');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await employeeService.getEmployeeStats();
      setStats(statsData);
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleEdit = (employee) => {
    router.push(`/employees/${employee.id}/edit`);
  };

  const handleDelete = async (employeeId) => {
    try {
      await employeeService.deleteEmployee(employeeId);
      // Reload employees after deletion
      await loadEmployees();
      await loadStats();
    } catch (err) {
      console.error('Error deleting employee:', err);
      alert(`Error deleting employee: ${err.message}`);
    }
  };

  const handleSearch = async (searchTerm) => {
    try {
      setLoading(true);
      setError(null);
      const searchResults = await employeeService.searchEmployees(searchTerm);
      setEmployees(searchResults);
    } catch (err) {
      console.error('Error searching employees:', err);
      setError(err.message || 'Failed to search employees');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout title="Employee Management - AmitojInfra" description="Manage employee records and information">
      <ProtectedRoute>
        <div className="employees-page">
          <div className="page-header">
            <div className="header-content">
              <h1>Employee Management</h1>
              <p>Manage your organization's employee records and information</p>
            </div>
            <div className="header-actions">
              <Link href="/employees/new" className="add-employee-btn">
                ➕ Add New Employee
              </Link>
            </div>
          </div>

          {error && (
            <div className="error-banner">
              <strong>Error:</strong> {error}
              <button onClick={loadEmployees} className="retry-btn">
                Try Again
              </button>
            </div>
          )}

          {/* Statistics */}
          {stats && (
            <div className="stats-section">
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-number">{stats.total}</div>
                  <div className="stat-label">Total Employees</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.withAadhar}</div>
                  <div className="stat-label">With Aadhar ID</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.avgAge || 'N/A'}</div>
                  <div className="stat-label">Average Age</div>
                </div>
                <div className="stat-card">
                  <div className="stat-number">{stats.withAge}</div>
                  <div className="stat-label">Age Recorded</div>
                </div>
              </div>
              
              {stats.newestHire && (
                <div className="recent-info">
                  <div className="recent-item">
                    <strong>Newest Hire:</strong> {stats.newestHire.name} 
                    ({new Date(stats.newestHire.joining_date).toLocaleDateString()})
                  </div>
                  {stats.oldestHire && stats.oldestHire.id !== stats.newestHire.id && (
                    <div className="recent-item">
                      <strong>Senior Most:</strong> {stats.oldestHire.name} 
                      ({new Date(stats.oldestHire.joining_date).toLocaleDateString()})
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Employee List */}
          <div className="employee-list-section">
            <EmployeeList
              employees={employees}
              loading={loading}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSearch={handleSearch}
              showActions={true}
            />
          </div>
        </div>
      </ProtectedRoute>

      <style jsx>{`
        .employees-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
          color: #1f2937;
          font-size: 2rem;
        }

        .header-content p {
          margin: 0;
          color: #6b7280;
          font-size: 1rem;
        }

        .header-actions {
          flex-shrink: 0;
        }

        .add-employee-btn {
          display: inline-block;
          padding: 12px 20px;
          background: #10b981;
          color: white;
          text-decoration: none;
          border-radius: 6px;
          font-weight: 500;
          font-size: 14px;
          transition: background-color 0.2s, transform 0.1s;
        }

        .add-employee-btn:hover {
          background: #059669;
          transform: translateY(-1px);
        }

        .error-banner {
          background: #fee;
          color: #c33;
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .retry-btn {
          background: #dc3545;
          color: white;
          border: none;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          cursor: pointer;
        }

        .retry-btn:hover {
          background: #c82333;
        }

        .stats-section {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 30px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-card {
          text-align: center;
          padding: 20px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          color: #007cba;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6c757d;
          font-weight: 500;
        }

        .recent-info {
          display: flex;
          gap: 30px;
          padding-top: 15px;
          border-top: 1px solid #e9ecef;
          flex-wrap: wrap;
        }

        .recent-item {
          font-size: 0.9rem;
          color: #495057;
        }

        .recent-item strong {
          color: #212529;
        }

        .employee-list-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        @media (max-width: 768px) {
          .employees-page {
            padding: 10px;
          }
          
          .page-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }
          
          .header-actions {
            align-self: flex-start;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .recent-info {
            flex-direction: column;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          
          .header-content h1 {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </Layout>
  );
}