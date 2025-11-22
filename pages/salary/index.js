import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import SalaryCalculationForm from '../../components/salary/SalaryCalculationForm';
import SalaryReport from '../../components/salary/SalaryReport';
import salaryService from '../../lib/services/salaryService';
import employeeService from '../../lib/services/employeeService';

export default function SalaryCalculation() {
  const router = useRouter();
  
  // State management
  const [employees, setEmployees] = useState([]);
  const [salaryData, setSalaryData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [calculating, setCalculating] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showReport, setShowReport] = useState(false);

  // Load employees on component mount
  useEffect(() => {
    loadEmployees();
  }, []);

  // Load employees
  const loadEmployees = async () => {
    try {
      setLoading(true);
      setError('');
      
      const employeesData = await employeeService.getAllEmployees();
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading employees:', error);
      setError(`Failed to load employees: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle salary calculation
  const handleCalculate = async (calculationData) => {
    try {
      setCalculating(true);
      setError('');
      setSalaryData(null);
      
      const result = await salaryService.calculateSalary(
        calculationData.employeeId,
        calculationData.startDate,
        calculationData.endDate,
        calculationData.hourlyRate,
        calculationData.dailyHours
      );
      
      setSalaryData(result);
      setShowReport(true);
      setSuccessMessage('Salary calculation completed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error calculating salary:', error);
      setError(`Salary calculation failed: ${error.message}`);
      
      // Handle specific error cases
      if (error.message.includes('Employee not found')) {
        setError('Selected employee not found. Please refresh the page and try again.');
      } else if (error.message.includes('No attendance data')) {
        setError('No attendance data found for the selected employee and date range.');
      } else if (error.message.includes('Invalid date range')) {
        setError('Invalid date range selected. Please check your dates and try again.');
      }
      
      setShowReport(false);
      setSalaryData(null);
    } finally {
      setCalculating(false);
    }
  };

  // Handle back to form
  const handleBackToForm = () => {
    setShowReport(false);
    setError('');
    setSuccessMessage('');
  };

  // Handle recalculate
  const handleRecalculate = () => {
    setShowReport(false);
    setSalaryData(null);
    setError('');
    setSuccessMessage('');
  };

  // Clear error message
  const clearError = () => {
    setError('');
  };

  // Clear success message
  const clearSuccessMessage = () => {
    setSuccessMessage('');
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  return (
    <div className="salary-calculation-page">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Salary Calculation</h1>
          <p className="page-description">
            Calculate employee salaries based on attendance records and payment history for any date range.
          </p>
        </div>
        <div className="header-actions">
          <button
            onClick={() => router.push('/employees')}
            className="btn-secondary"
          >
            Manage Employees
          </button>
          <button
            onClick={() => router.push('/attendance')}
            className="btn-secondary"
          >
            View Attendance
          </button>
          <button
            onClick={() => router.push('/payments')}
            className="btn-secondary"
          >
            View Payments
          </button>
        </div>
      </div>

      {/* Status Messages */}
      {error && (
        <div className="message-banner error-banner">
          <div className="message-content">
            <strong>Error:</strong> {error}
          </div>
          <button onClick={clearError} className="message-close">×</button>
        </div>
      )}

      {successMessage && (
        <div className="message-banner success-banner">
          <div className="message-content">
            <strong>Success:</strong> {successMessage}
          </div>
          <button onClick={clearSuccessMessage} className="message-close">×</button>
        </div>
      )}

      {/* Main Content */}
      <div className="main-content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading employees...</p>
          </div>
        ) : employees.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">👥</div>
            <h3>No Employees Found</h3>
            <p>You need to add employees before calculating salaries.</p>
            <button
              onClick={() => router.push('/employees/new')}
              className="btn-primary"
            >
              Add First Employee
            </button>
          </div>
        ) : showReport && salaryData ? (
          // Show salary report
          <SalaryReport
            salaryData={salaryData}
            onBack={handleBackToForm}
            onRecalculate={handleRecalculate}
          />
        ) : (
          // Show calculation form
          <div className="form-container">
            <SalaryCalculationForm
              employees={employees}
              onCalculate={handleCalculate}
              loading={calculating}
            />
            
            {/* Quick Stats */}
            <div className="quick-stats">
              <h3>Quick Statistics</h3>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-value">{employees.length}</div>
                  <div className="stat-label">Total Employees</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {employees.filter(emp => emp.designation === 'Worker').length}
                  </div>
                  <div className="stat-label">Workers</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {employees.filter(emp => emp.designation === 'Supervisor').length}
                  </div>
                  <div className="stat-label">Supervisors</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value">
                    {employees.filter(emp => emp.designation === 'Manager').length}
                  </div>
                  <div className="stat-label">Managers</div>
                </div>
              </div>
            </div>

            {/* Instructions */}
            <div className="instructions">
              <h3>How to Calculate Salary</h3>
              <div className="instruction-steps">
                <div className="step">
                  <div className="step-number">1</div>
                  <div className="step-content">
                    <h4>Select Employee</h4>
                    <p>Choose the employee for whom you want to calculate salary.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">2</div>
                  <div className="step-content">
                    <h4>Set Date Range</h4>
                    <p>Select the start and end dates for the salary calculation period.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">3</div>
                  <div className="step-content">
                    <h4>Enter Rate Information</h4>
                    <p>Specify the hourly rate and expected daily working hours.</p>
                  </div>
                </div>
                <div className="step">
                  <div className="step-number">4</div>
                  <div className="step-content">
                    <h4>Calculate</h4>
                    <p>Click calculate to generate a detailed salary report based on attendance and payments.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Calculating Overlay */}
      {calculating && (
        <div className="calculating-overlay">
          <div className="calculating-spinner"></div>
          <p>Calculating salary...</p>
          <div className="calculating-details">
            <span>• Loading attendance data</span>
            <span>• Fetching payment records</span>
            <span>• Computing salary breakdown</span>
          </div>
        </div>
      )}

      <style jsx>{`
        .salary-calculation-page {
          min-height: 100vh;
          background: #f8fafc;
          padding: 20px;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          color: #1f2937;
          margin: 0 0 8px 0;
          font-size: 2rem;
          font-weight: 700;
        }

        .page-description {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
          line-height: 1.5;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-primary {
          background: #3b82f6;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .message-banner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 12px 20px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 0.9rem;
        }

        .error-banner {
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #dc2626;
        }

        .success-banner {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
        }

        .message-content {
          flex: 1;
        }

        .message-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          color: inherit;
          opacity: 0.7;
          transition: opacity 0.2s;
        }

        .message-close:hover {
          opacity: 1;
        }

        .main-content {
          max-width: 1200px;
          margin: 0 auto;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 60px 20px;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid #e5e7eb;
          border-top: 3px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .empty-state {
          color: #6b7280;
        }

        .empty-icon {
          font-size: 3rem;
          margin-bottom: 15px;
        }

        .empty-state h3 {
          color: #1f2937;
          margin-bottom: 10px;
        }

        .form-container {
          display: grid;
          grid-template-columns: 1fr;
          gap: 30px;
        }

        .quick-stats {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 25px;
        }

        .quick-stats h3 {
          color: #1f2937;
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
        }

        .stat-card {
          text-align: center;
          padding: 20px 15px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #3b82f6;
          margin-bottom: 5px;
        }

        .stat-label {
          font-size: 0.9rem;
          color: #6b7280;
          font-weight: 500;
        }

        .instructions {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 25px;
        }

        .instructions h3 {
          color: #1f2937;
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
        }

        .instruction-steps {
          display: grid;
          gap: 20px;
        }

        .step {
          display: flex;
          align-items: flex-start;
          gap: 15px;
        }

        .step-number {
          width: 32px;
          height: 32px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.9rem;
          flex-shrink: 0;
        }

        .step-content h4 {
          color: #1f2937;
          margin: 0 0 5px 0;
          font-size: 1rem;
          font-weight: 600;
        }

        .step-content p {
          color: #6b7280;
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .calculating-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          color: white;
        }

        .calculating-spinner {
          width: 50px;
          height: 50px;
          border: 4px solid rgba(255, 255, 255, 0.3);
          border-top: 4px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        .calculating-overlay p {
          font-size: 1.2rem;
          margin: 0 0 15px 0;
          font-weight: 500;
        }

        .calculating-details {
          display: flex;
          flex-direction: column;
          gap: 5px;
          font-size: 0.9rem;
          opacity: 0.8;
          text-align: center;
        }

        @media (max-width: 768px) {
          .salary-calculation-page {
            padding: 10px;
          }
          
          .page-header {
            flex-direction: column;
            gap: 20px;
            padding: 20px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: stretch;
            flex-wrap: wrap;
          }
          
          .btn-primary,
          .btn-secondary {
            flex: 1;
            min-width: 120px;
          }
          
          .header-content h1 {
            font-size: 1.5rem;
          }
          
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .instruction-steps {
            gap: 15px;
          }
          
          .step {
            flex-direction: column;
            text-align: center;
            gap: 10px;
          }
        }

        @media (max-width: 480px) {
          .header-actions {
            flex-direction: column;
          }
          
          .btn-primary,
          .btn-secondary {
            width: 100%;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}