import { useState, useEffect } from 'react';
import { validatePayment, createEmptyPayment, PaymentModes } from '../../lib/models/Payment';

const PaymentForm = ({ 
  initialData = null, 
  employees = [],
  onSubmit, 
  onCancel, 
  loading = false, 
  mode = 'create' // 'create' or 'update'
}) => {
  const [formData, setFormData] = useState(createEmptyPayment());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        employee_id: initialData.employee_id || '',
        amount: initialData.amount || '',
        payment_date: initialData.payment_date ? 
          (typeof initialData.payment_date === 'string' ? 
            initialData.payment_date : 
            initialData.payment_date.toISOString().split('T')[0]) : '',
        payment_mode: initialData.payment_mode || '',
        paid_by: initialData.paid_by || '',
        notes: initialData.notes || ''
      });
    } else {
      setFormData(createEmptyPayment());
    }
  }, [initialData]);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle amount change with validation
  const handleAmountChange = (e) => {
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
      amount: value
    }));

    // Clear error when user starts typing
    if (errors.amount) {
      setErrors(prev => ({
        ...prev,
        amount: ''
      }));
    }
  };

  // Validate form
  const validateForm = () => {
    const validation = validatePayment(formData);
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
      await onSubmit(formData);
    } catch (error) {
      console.error('Form submission error:', error);
      // Handle specific validation errors from server
      if (error.message.includes('Validation failed:')) {
        const errorMessage = error.message.replace('Validation failed:', '').trim();
        setErrors({ general: errorMessage });
      } else if (error.message.includes('Employee not found')) {
        setErrors({ employee_id: 'Selected employee not found' });
      } else {
        setErrors({ general: error.message || 'An error occurred while saving payment data' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle cancel
  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? `${employee.name} (${employee.designation})` : 'Select Employee';
  };

  return (
    <div className="payment-form">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-header">
          <h2>{mode === 'create' ? 'Add New Payment' : 'Update Payment'}</h2>
          <p className="form-description">
            Record payment details for the employee. Fields marked with * are required.
          </p>
        </div>

        {errors.general && (
          <div className="error-banner">
            <strong>Error:</strong> {errors.general}
          </div>
        )}

        {/* Employee Selection */}
        <div className="form-group">
          <label htmlFor="employee_id" className="form-label">
            Employee *
          </label>
          <select
            id="employee_id"
            name="employee_id"
            value={formData.employee_id}
            onChange={handleInputChange}
            className={`form-input ${errors.employee_id ? 'error' : ''}`}
            required
          >
            <option value="">Select Employee</option>
            {employees.map((employee) => (
              <option key={employee.id} value={employee.id}>
                {employee.name} - {employee.designation}
              </option>
            ))}
          </select>
          {errors.employee_id && (
            <div className="error-message">{errors.employee_id}</div>
          )}
          <div className="field-hint">
            Select the employee receiving the payment
          </div>
        </div>

        {/* Payment Amount */}
        <div className="form-group">
          <label htmlFor="amount" className="form-label">
            Payment Amount (₹) *
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            value={formData.amount}
            onChange={handleAmountChange}
            className={`form-input ${errors.amount ? 'error' : ''}`}
            placeholder="Enter payment amount"
            required
          />
          {errors.amount && (
            <div className="error-message">{errors.amount}</div>
          )}
          <div className="field-hint">
            Enter the payment amount in Indian Rupees (up to ₹10,00,000)
          </div>
        </div>

        {/* Payment Date */}
        <div className="form-group">
          <label htmlFor="payment_date" className="form-label">
            Payment Date *
          </label>
          <input
            type="date"
            id="payment_date"
            name="payment_date"
            value={formData.payment_date}
            onChange={handleInputChange}
            className={`form-input ${errors.payment_date ? 'error' : ''}`}
            max={new Date().toISOString().split('T')[0]} // Can't be future date
            required
          />
          {errors.payment_date && (
            <div className="error-message">{errors.payment_date}</div>
          )}
          <div className="field-hint">
            Date when the payment was made
          </div>
        </div>

        {/* Payment Mode */}
        <div className="form-group">
          <label htmlFor="payment_mode" className="form-label">
            Payment Mode *
          </label>
          <select
            id="payment_mode"
            name="payment_mode"
            value={formData.payment_mode}
            onChange={handleInputChange}
            className={`form-input ${errors.payment_mode ? 'error' : ''}`}
            required
          >
            <option value="">Select Payment Mode</option>
            {Object.entries(PaymentModes).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          {errors.payment_mode && (
            <div className="error-message">{errors.payment_mode}</div>
          )}
          <div className="field-hint">
            Select how the payment was made
          </div>
        </div>

        {/* Paid By */}
        <div className="form-group">
          <label htmlFor="paid_by" className="form-label">
            Paid By *
          </label>
          <input
            type="text"
            id="paid_by"
            name="paid_by"
            value={formData.paid_by}
            onChange={handleInputChange}
            className={`form-input ${errors.paid_by ? 'error' : ''}`}
            placeholder="Enter name of person who made the payment"
            required
          />
          {errors.paid_by && (
            <div className="error-message">{errors.paid_by}</div>
          )}
          <div className="field-hint">
            Name of the person who authorized/made this payment
          </div>
        </div>

        {/* Notes (Optional) */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleInputChange}
            className={`form-input ${errors.notes ? 'error' : ''}`}
            placeholder="Enter any additional notes about this payment"
            rows="3"
            maxLength="500"
          />
          {errors.notes && (
            <div className="error-message">{errors.notes}</div>
          )}
          <div className="field-hint">
            Optional notes about the payment (max 500 characters)
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleCancel}
            className="btn-secondary"
            disabled={isSubmitting || loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || loading}
          >
            {isSubmitting || loading ? 
              (mode === 'create' ? 'Adding Payment...' : 'Updating Payment...') :
              (mode === 'create' ? 'Add Payment' : 'Update Payment')
            }
          </button>
        </div>
      </form>

      <style jsx>{`
        .payment-form {
          max-width: 600px;
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

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #374151;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 0.9rem;
          transition: border-color 0.2s, box-shadow 0.2s;
          box-sizing: border-box;
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

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 6px;
          font-size: 0.9rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
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

        @media (max-width: 768px) {
          .payment-form {
            padding: 10px;
          }
          
          .form {
            padding: 20px;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .btn-primary,
          .btn-secondary {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentForm;