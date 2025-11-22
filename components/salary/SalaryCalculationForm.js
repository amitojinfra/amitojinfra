import { useState, useEffect } from 'react';
import salaryService from '../../lib/services/salaryService';

const SalaryCalculationForm = ({ 
  employees = [],
  onCalculate,
  loading = false,
  initialData = null
}) => {
  const [formData, setFormData] = useState({
    employeeId: '',
    startDate: '',
    endDate: '',
    dailyRate: '750'
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with initial data or defaults
  useEffect(() => {
    if (initialData) {
      setFormData({
        employeeId: initialData.employeeId || '',
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        dailyRate: initialData.dailyRate || '750'
      });
    } else {
      // Set default date range (current month)
      const now = new Date();
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      setFormData(prev => ({
        ...prev,
        startDate: firstDay.toISOString().split('T')[0],
        endDate: lastDay.toISOString().split('T')[0]
      }));
    }
  }, [initialData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle daily rate change with validation
  const handleDailyRateChange = (e) => {
    let value = e.target.value;
    
    // Remove any non-numeric characters except decimal point
    value = value.replace(/[^0-9.]/g, '');
    
    // Ensure only one decimal point
    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }
    
    // Limit decimal places to 2
    if (parts[1] && parts[1].length > 2) {
      value = parts[0] + '.' + parts[1].substring(0, 2);
    }

    setFormData(prev => ({
      ...prev,
      dailyRate: value
    }));

    // Clear error
    if (errors.dailyRate) {
      setErrors(prev => ({
        ...prev,
        dailyRate: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const validation = salaryService.validateInputs(
      formData.employeeId,
      formData.startDate,
      formData.endDate,
      parseFloat(formData.dailyRate)
    );

    setErrors(validation.errors);
    return validation.isValid;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const calculationData = {
        employeeId: formData.employeeId,
        startDate: formData.startDate,
        endDate: formData.endDate,
        dailyRate: parseFloat(formData.dailyRate)
      };

      await onCalculate(calculationData);
    } catch (error) {
      console.error('Salary calculation error:', error);
      setErrors({ general: error.message || 'An error occurred during calculation' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.name} (${employee.designation})` : '';
  };

  // Calculate expected total days
  const getTotalDays = () => {
    if (formData.startDate && formData.endDate) {
      return salaryService.calculateTotalDays(formData.startDate, formData.endDate);
    }
    return 0;
  };

  // Calculate expected gross salary
  const getExpectedGrossSalary = () => {
    const totalDays = getTotalDays();
    const dailyRate = parseFloat(formData.dailyRate) || 0;
    return (totalDays * dailyRate).toFixed(2);
  };

  return (
    <div className="salary-calculation-form">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-header">
          <h2>Salary Calculation</h2>
          <p className="form-description">
            Calculate employee salary based on attendance and payment records for the selected period.
          </p>
        </div>

        {errors.general && (
          <div className="error-banner">
            <strong>Error:</strong> {errors.general}
          </div>
        )}

        <div className="form-grid">
          {/* Employee Selection */}
          <div className="form-group full-width">
            <label htmlFor="employeeId" className="form-label">
              Select Employee *
            </label>
            <select
              id="employeeId"
              name="employeeId"
              value={formData.employeeId}
              onChange={handleInputChange}
              className={`form-input ${errors.employeeId ? 'error' : ''}`}
              required
            >
              <option value="">Choose an employee</option>
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.name} - {employee.designation} ({employee.employee_code})
                </option>
              ))}
            </select>
            {errors.employeeId && (
              <div className="error-message">{errors.employeeId}</div>
            )}
          </div>

          {/* Date Range */}
          <div className="form-group">
            <label htmlFor="startDate" className="form-label">
              Start Date *
            </label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              value={formData.startDate}
              onChange={handleInputChange}
              className={`form-input ${errors.startDate ? 'error' : ''}`}
              required
            />
            {errors.startDate && (
              <div className="error-message">{errors.startDate}</div>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="endDate" className="form-label">
              End Date *
            </label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              value={formData.endDate}
              onChange={handleInputChange}
              className={`form-input ${errors.endDate ? 'error' : ''}`}
              min={formData.startDate}
              required
            />
            {errors.endDate && (
              <div className="error-message">{errors.endDate}</div>
            )}
            {errors.dateRange && (
              <div className="error-message">{errors.dateRange}</div>
            )}
          </div>

          {/* Daily Rate */}
          <div className="form-group full-width">
            <label htmlFor="dailyRate" className="form-label">
              Daily Rate (₹) *
            </label>
            <input
              type="text"
              id="dailyRate"
              name="dailyRate"
              value={formData.dailyRate}
              onChange={handleDailyRateChange}
              className={`form-input ${errors.dailyRate ? 'error' : ''}`}
              placeholder="750"
              required
            />
            {errors.dailyRate && (
              <div className="error-message">{errors.dailyRate}</div>
            )}
            <div className="field-hint">
              Enter the daily rate in Indian Rupees (₹1 - ₹50,000). Default is ₹750 per day.
            </div>
          </div>
        </div>

        {/* Calculation Preview */}
        {formData.startDate && formData.endDate && formData.dailyRate && (
          <div className="calculation-preview">
            <h3>Calculation Preview</h3>
            <div className="preview-grid">
              <div className="preview-item">
                <span className="preview-label">Total Days:</span>
                <span className="preview-value">{getTotalDays()} days</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Daily Rate:</span>
                <span className="preview-value">₹{formData.dailyRate}/day</span>
              </div>
              <div className="preview-item">
                <span className="preview-label">Expected Gross Salary:</span>
                <span className="preview-value highlight">₹{getExpectedGrossSalary()}</span>
              </div>
            </div>
            <div className="preview-note">
              <strong>Note:</strong> This is an estimate based on full attendance. 
              Actual calculation will consider real attendance data and existing payments.
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 
              'Calculating Salary...' : 
              'Calculate Salary'
            }
          </button>
        </div>
      </form>

      <style jsx>{`
        .salary-calculation-form {
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }

        .form {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 30px;
        }

        .form-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .form-header h2 {
          color: #1f2937;
          margin-bottom: 8px;
          font-size: 1.8rem;
          font-weight: 600;
        }

        .form-description {
          color: #6b7280;
          font-size: 0.9rem;
          margin: 0;
          line-height: 1.5;
        }

        .error-banner {
          background: #fee;
          border: 1px solid #fcc;
          border-radius: 4px;
          padding: 12px;
          margin-bottom: 20px;
          color: #c33;
          font-size: 0.9rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: span 2;
        }

        .form-label {
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .form-input {
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }

        .form-input.error {
          border-color: #ef4444;
          box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
        }

        .error-message {
          color: #ef4444;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .field-hint {
          color: #6b7280;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .calculation-preview {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 30px;
        }

        .calculation-preview h3 {
          color: #1f2937;
          margin: 0 0 15px 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .preview-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 15px;
        }

        .preview-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: white;
          border-radius: 4px;
          border: 1px solid #e5e7eb;
        }

        .preview-label {
          font-size: 0.85rem;
          color: #6b7280;
          font-weight: 500;
        }

        .preview-value {
          font-size: 0.9rem;
          color: #1f2937;
          font-weight: 600;
        }

        .preview-value.highlight {
          color: #059669;
          font-size: 1rem;
        }

        .preview-note {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 4px;
          padding: 10px;
          font-size: 0.85rem;
          color: #92400e;
        }

        .form-actions {
          display: flex;
          justify-content: center;
        }

        .btn-primary {
          padding: 12px 32px;
          background: #3b82f6;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }

        .btn-primary:hover:not(:disabled) {
          background: #2563eb;
          transform: translateY(-1px);
        }

        .btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .salary-calculation-form {
            padding: 10px;
          }
          
          .form {
            padding: 20px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .form-group.full-width {
            grid-column: span 1;
          }
          
          .preview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SalaryCalculationForm;