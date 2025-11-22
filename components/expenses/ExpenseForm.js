import { useState, useEffect } from 'react';
import expenseService, { 
  EXPENSE_CATEGORIES, 
  EXPENSE_CATEGORY_LABELS, 
  PAYMENT_MODES, 
  PAYMENT_MODE_LABELS 
} from '../../lib/services/expenseService';

export default function ExpenseForm({ initialData, onSubmit, onCancel, loading }) {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    vendor: '',
    date: '',
    description: '',
    paymentMode: ''
  });
  const [errors, setErrors] = useState({});
  const [validating, setValidating] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        amount: initialData.amount?.toString() || '',
        category: initialData.category || '',
        vendor: initialData.vendor || '',
        date: initialData.date ? initialData.date.toISOString().split('T')[0] : '',
        description: initialData.description || '',
        paymentMode: initialData.paymentMode || ''
      });
    } else {
      // Set default date to today
      const today = new Date();
      setFormData(prev => ({
        ...prev,
        date: today.toISOString().split('T')[0]
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

    // Clear specific field error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setValidating(true);
    setErrors({});

    try {
      // Validate form data
      const validation = expenseService.validateExpenseData(formData);
      
      if (!validation.isValid) {
        setErrors(validation.errors);
        setValidating(false);
        return;
      }

      // Submit form data
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting form:', error);
      setErrors({ general: 'Failed to submit form. Please try again.' });
    } finally {
      setValidating(false);
    }
  };

  // Reset form
  const handleReset = () => {
    setFormData({
      amount: '',
      category: '',
      vendor: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      paymentMode: ''
    });
    setErrors({});
  };

  return (
    <div className="expense-form">
      <form onSubmit={handleSubmit} className="form">
        {/* General Error */}
        {errors.general && (
          <div className="form-error">
            {errors.general}
          </div>
        )}

        <div className="form-grid">
          {/* Amount */}
          <div className="form-group">
            <label htmlFor="amount" className="form-label">
              Amount (₹) *
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className={`form-input ${errors.amount ? 'error' : ''}`}
              placeholder="Enter amount"
              min="0.01"
              max="1000000"
              step="0.01"
              required
            />
            {errors.amount && (
              <div className="error-message">{errors.amount}</div>
            )}
            <div className="field-hint">
              Enter the expense amount in Indian Rupees
            </div>
          </div>

          {/* Category */}
          <div className="form-group">
            <label htmlFor="category" className="form-label">
              Category *
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className={`form-select ${errors.category ? 'error' : ''}`}
              required
            >
              <option value="">Select Category</option>
              {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.category && (
              <div className="error-message">{errors.category}</div>
            )}
            <div className="field-hint">
              Choose the most appropriate expense category
            </div>
          </div>

          {/* Payment Mode */}
          <div className="form-group">
            <label htmlFor="paymentMode" className="form-label">
              Payment Mode *
            </label>
            <select
              id="paymentMode"
              name="paymentMode"
              value={formData.paymentMode}
              onChange={handleInputChange}
              className={`form-select ${errors.paymentMode ? 'error' : ''}`}
              required
            >
              <option value="">Select Payment Mode</option>
              {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
            {errors.paymentMode && (
              <div className="error-message">{errors.paymentMode}</div>
            )}
            <div className="field-hint">
              How was the payment made?
            </div>
          </div>

          {/* Date */}
          <div className="form-group">
            <label htmlFor="date" className="form-label">
              Date *
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className={`form-input ${errors.date ? 'error' : ''}`}
              required
            />
            {errors.date && (
              <div className="error-message">{errors.date}</div>
            )}
            <div className="field-hint">
              When was this expense incurred?
            </div>
          </div>

          {/* Vendor */}
          <div className="form-group full-width">
            <label htmlFor="vendor" className="form-label">
              Vendor (Optional)
            </label>
            <input
              type="text"
              id="vendor"
              name="vendor"
              value={formData.vendor}
              onChange={handleInputChange}
              className={`form-input ${errors.vendor ? 'error' : ''}`}
              placeholder="Enter vendor name"
              maxLength="100"
            />
            {errors.vendor && (
              <div className="error-message">{errors.vendor}</div>
            )}
            <div className="field-hint">
              Name of the vendor or supplier (optional)
            </div>
          </div>

          {/* Description */}
          <div className="form-group full-width">
            <label htmlFor="description" className="form-label">
              Description (Optional)
            </label>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className={`form-textarea ${errors.description ? 'error' : ''}`}
              placeholder="Enter additional details about this expense..."
              rows="3"
              maxLength="500"
            />
            {errors.description && (
              <div className="error-message">{errors.description}</div>
            )}
            <div className="field-hint">
              Additional details or notes about this expense (optional)
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={handleReset}
            className="btn btn-outline"
            disabled={loading || validating}
          >
            Reset
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-outline"
            disabled={loading || validating}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || validating}
          >
            {loading || validating ? 'Saving...' : (initialData ? 'Update Expense' : 'Add Expense')}
          </button>
        </div>
      </form>

      <style jsx>{`
        .expense-form {
          padding: 1.5rem;
        }

        .form {
          max-width: 800px;
        }

        .form-error {
          background-color: #fee;
          color: #c53030;
          border: 1px solid #fed7d7;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
        }

        .form-group.full-width {
          grid-column: 1 / -1;
        }

        .form-label {
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-input, .form-select, .form-textarea {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.2s ease, box-shadow 0.2s ease;
          background: #fff;
        }

        .form-input:focus, .form-select:focus, .form-textarea:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        .form-input.error, .form-select.error, .form-textarea.error {
          border-color: #e53e3e;
          box-shadow: 0 0 0 2px rgba(229, 62, 62, 0.2);
        }

        .form-textarea {
          resize: vertical;
          min-height: 80px;
        }

        .error-message {
          color: #e53e3e;
          font-size: 0.8rem;
          margin-top: 0.25rem;
        }

        .field-hint {
          color: #666;
          font-size: 0.8rem;
          margin-top: 0.25rem;
          font-style: italic;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .btn-primary {
          background: #4285f4;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #3367d6;
        }

        .btn-outline {
          background: transparent;
          color: #666;
          border: 1px solid #ddd;
        }

        .btn-outline:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #bbb;
        }

        @media (max-width: 768px) {
          .expense-form {
            padding: 1rem;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .form-actions {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}