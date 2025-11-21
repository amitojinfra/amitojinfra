import { useState } from 'react';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import EmployeeForm from '../../components/employee/EmployeeForm';
import ProtectedRoute from '../../components/shared/ProtectedRoute';
import employeeService from '../../lib/services/employeeService';
import Link from 'next/link';

export default function NewEmployeePage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (employeeData) => {
    try {
      setLoading(true);
      const newEmployee = await employeeService.createEmployee(employeeData);
      
      // Show success message
      alert(`Employee "${newEmployee.name}" has been successfully added!`);
      
      // Redirect to employees list
      router.push('/employees');
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error; // Re-throw so the form can handle it
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/employees');
  };

  return (
    <Layout title="Add New Employee - AmitojInfra" description="Add a new employee to the organization">
      <ProtectedRoute>
        <div className="new-employee-page">
          <div className="page-header">
            <div className="breadcrumb">
              <Link href="/employees" className="breadcrumb-link">
                ← Back to Employees
              </Link>
            </div>
            <div className="header-content">
              <h1>Add New Employee</h1>
              <p>Enter the details of the new employee below</p>
            </div>
          </div>

          <div className="form-section">
            <EmployeeForm
              mode="create"
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              loading={loading}
            />
          </div>

          <div className="help-section">
            <div className="help-card">
              <h3>📋 Required Information</h3>
              <ul>
                <li><strong>Full Name:</strong> Complete name of the employee</li>
                <li><strong>Joining Date:</strong> Date when employee joined the organization</li>
              </ul>
            </div>

            <div className="help-card">
              <h3>📄 Optional Information</h3>
              <ul>
                <li><strong>Aadhar ID:</strong> 12-digit Aadhar number for verification</li>
                <li><strong>Age:</strong> Current age of the employee (18-65 years)</li>
              </ul>
            </div>

            <div className="help-card">
              <h3>💡 Tips</h3>
              <ul>
                <li>Double-check the spelling of the employee's name</li>
                <li>Aadhar ID helps with unique identification</li>
                <li>Joining date cannot be in the future</li>
                <li>All information can be updated later if needed</li>
              </ul>
            </div>
          </div>
        </div>
      </ProtectedRoute>

      <style jsx>{`
        .new-employee-page {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
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

        .form-section {
          margin-bottom: 40px;
        }

        .help-section {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 40px;
        }

        .help-card {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border-left: 4px solid #007cba;
        }

        .help-card h3 {
          margin: 0 0 15px 0;
          color: #1f2937;
          font-size: 1rem;
        }

        .help-card ul {
          margin: 0;
          padding-left: 20px;
        }

        .help-card li {
          margin-bottom: 8px;
          color: #4b5563;
          font-size: 0.9rem;
          line-height: 1.4;
        }

        .help-card li strong {
          color: #1f2937;
        }

        @media (max-width: 768px) {
          .new-employee-page {
            padding: 10px;
          }
          
          .help-section {
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