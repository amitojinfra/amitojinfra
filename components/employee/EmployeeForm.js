import { useState, useEffect } from 'react';
import { validateEmployee, createEmptyEmployee, EmployeeDesignations } from '../../lib/models/Employee';

const EmployeeForm = ({ 
  initialData = null, 
  onSubmit, 
  onCancel, 
  loading = false, 
  mode = 'create' // 'create' or 'update'
}) => {
  const [formData, setFormData] = useState(createEmptyEmployee());
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        designation: initialData.designation || '',
        aadhar_id: initialData.aadhar_id || '',
        joining_date: initialData.joining_date ? 
          (typeof initialData.joining_date === 'string' ? 
            initialData.joining_date : 
            initialData.joining_date.toISOString().split('T')[0]) : '',
        age: initialData.age || ''
      });
    } else {
      setFormData(createEmptyEmployee());
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

  // Validate form
  const validateForm = () => {
    const validation = validateEmployee(formData);
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
      } else if (error.message.includes('Aadhar ID already exists')) {
        setErrors({ aadhar_id: 'This Aadhar ID is already registered with another employee' });
      } else {
        setErrors({ general: error.message || 'An error occurred while saving employee data' });
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

  // Format Aadhar ID input
  const handleAadharChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 12) {
      value = value.substring(0, 12); // Limit to 12 digits
    }
    setFormData(prev => ({
      ...prev,
      aadhar_id: value
    }));

    // Clear error when user starts typing
    if (errors.aadhar_id) {
      setErrors(prev => ({
        ...prev,
        aadhar_id: ''
      }));
    }
  };

  // Format age input
  const handleAgeChange = (e) => {
    let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
    if (value.length > 2) {
      value = value.substring(0, 2); // Limit to 2 digits
    }
    setFormData(prev => ({
      ...prev,
      age: value
    }));

    // Clear error when user starts typing
    if (errors.age) {
      setErrors(prev => ({
        ...prev,
        age: ''
      }));
    }
  };

  return (
    <div className="employee-form">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-header">
          <h2>{mode === 'create' ? 'Add New Employee' : 'Update Employee'}</h2>
          <p className="form-description">
            Fill in the employee details below. Fields marked with * are required.
          </p>
        </div>

        {errors.general && (
          <div className="error-banner">
            <strong>Error:</strong> {errors.general}
          </div>
        )}

        {/* Name Field */}
        <div className="form-group">
          <label htmlFor="name" className="form-label">
            Full Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            className={`form-input ${errors.name ? 'error' : ''}`}
            placeholder="Enter employee's full name"
            required
          />
          {errors.name && (
            <div className="error-message">{errors.name}</div>
          )}
        </div>

        {/* Designation Field */}
        <div className="form-group">
          <label htmlFor="designation" className="form-label">
            Designation *
          </label>
          <select
            id="designation"
            name="designation"
            value={formData.designation}
            onChange={handleInputChange}
            className={`form-input ${errors.designation ? 'error' : ''}`}
            required
          >
            <option value="">Select designation</option>
            {Object.entries(EmployeeDesignations).map(([key, value]) => (
              <option key={key} value={value}>
                {value}
              </option>
            ))}
          </select>
          {errors.designation && (
            <div className="error-message">{errors.designation}</div>
          )}
          <div className="field-hint">
            Select the employee's job designation
          </div>
        </div>

        {/* Aadhar ID Field */}
        <div className="form-group">
          <label htmlFor="aadhar_id" className="form-label">
            Aadhar ID (Optional)
          </label>
          <input
            type="text"
            id="aadhar_id"
            name="aadhar_id"
            value={formData.aadhar_id}
            onChange={handleAadharChange}
            className={`form-input ${errors.aadhar_id ? 'error' : ''}`}
            placeholder="Enter 12-digit Aadhar number"
            maxLength="12"
          />
          {errors.aadhar_id && (
            <div className="error-message">{errors.aadhar_id}</div>
          )}
          <div className="field-hint">
            12-digit Aadhar number (optional but recommended for verification)
          </div>
        </div>

        {/* Joining Date Field */}
        <div className="form-group">
          <label htmlFor="joining_date" className="form-label">
            Joining Date *
          </label>
          <input
            type="date"
            id="joining_date"
            name="joining_date"
            value={formData.joining_date}
            onChange={handleInputChange}
            className={`form-input ${errors.joining_date ? 'error' : ''}`}
            max={new Date().toISOString().split('T')[0]} // Can't be future date
            required
          />
          {errors.joining_date && (
            <div className="error-message">{errors.joining_date}</div>
          )}
          <div className="field-hint">
            Date when employee joined the organization
          </div>
        </div>

        {/* Age Field */}
        <div className="form-group">
          <label htmlFor="age" className="form-label">
            Age (Optional)
          </label>
          <input
            type="text"
            id="age"
            name="age"
            value={formData.age}
            onChange={handleAgeChange}
            className={`form-input ${errors.age ? 'error' : ''}`}
            placeholder="Enter age in years"
            maxLength="2"
          />
          {errors.age && (
            <div className="error-message">{errors.age}</div>
          )}
          <div className="field-hint">
            Age in years (18-65)
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
              (mode === 'create' ? 'Adding Employee...' : 'Updating Employee...') :
              (mode === 'create' ? 'Add Employee' : 'Update Employee')
            }
          </button>
        </div>
      </form>

      <style jsx>{`
        .employee-form {
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }

        .form {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .form-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .form-header h2 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 1.5rem;
        }

        .form-description {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .error-banner {
          background: #fee;
          color: #c33;
          padding: 12px;
          border-radius: 4px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-label {
          display: block;
          margin-bottom: 6px;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .form-input {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
        }

        .form-input.error {
          border-color: #dc3545;
        }

        .form-input.error:focus {
          border-color: #dc3545;
          box-shadow: 0 0 0 2px rgba(220, 53, 69, 0.2);
        }

        .error-message {
          color: #dc3545;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .field-hint {
          color: #666;
          font-size: 0.8rem;
          margin-top: 4px;
        }

        .form-actions {
          display: flex;
          gap: 12px;
          justify-content: flex-end;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
        }

        .btn-primary,
        .btn-secondary {
          padding: 12px 24px;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s, transform 0.1s;
        }

        .btn-primary {
          background: #007cba;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #005a87;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #666;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e9ecef;
          transform: translateY(-1px);
        }

        .btn-primary:disabled,
        .btn-secondary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .employee-form {
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

export default EmployeeForm;