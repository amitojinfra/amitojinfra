import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { AttendanceStatus, createEmptyAttendance } from '../../lib/models/Attendance';

const AttendanceForm = ({ 
  employees = [], 
  selectedDate = null,
  mode = 'single', // 'single' or 'bulk'
  onSubmit, 
  onCancel, 
  loading = false 
}) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    date: selectedDate || new Date().toISOString().split('T')[0],
    employees: [],
    bulkStatus: AttendanceStatus.PRESENT,
    notes: ''
  });
  const [selectedEmployees, setSelectedEmployees] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  // Initialize form data
  useEffect(() => {
    if (selectedDate) {
      setFormData(prev => ({
        ...prev,
        date: selectedDate
      }));
    }
  }, [selectedDate]);

  // Update employees list when employees prop changes
  useEffect(() => {
    if (employees.length > 0 && mode === 'bulk') {
      const employeeAttendance = employees.map(employee => ({
        ...createEmptyAttendance(),
        employee_id: employee.id,
        employee_name: employee.name,
        date: formData.date,
        status: AttendanceStatus.PRESENT,
        marked_by: user?.uid || user?.email || 'admin'
      }));
      
      setFormData(prev => ({
        ...prev,
        employees: employeeAttendance
      }));
    }
  }, [employees, mode, user, formData.date]);

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setFormData(prev => ({
      ...prev,
      date: newDate,
      employees: prev.employees.map(emp => ({
        ...emp,
        date: newDate
      }))
    }));

    // Clear errors when date changes
    if (errors.date) {
      setErrors(prev => ({ ...prev, date: '' }));
    }
  };

  // Handle bulk status change
  const handleBulkStatusChange = (e) => {
    const newStatus = e.target.value;
    setFormData(prev => ({
      ...prev,
      bulkStatus: newStatus,
      employees: prev.employees.map(emp => 
        selectedEmployees.has(emp.employee_id) ? 
          { ...emp, status: newStatus } : emp
      )
    }));
  };

  // Handle individual employee status change
  const handleEmployeeStatusChange = (employeeId, status) => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.map(emp => 
        emp.employee_id === employeeId ? { ...emp, status } : emp
      )
    }));
  };

  // Handle employee selection
  const handleEmployeeSelect = (employeeId) => {
    const newSelected = new Set(selectedEmployees);
    if (newSelected.has(employeeId)) {
      newSelected.delete(employeeId);
    } else {
      newSelected.add(employeeId);
    }
    setSelectedEmployees(newSelected);
    setSelectAll(newSelected.size === employees.length);
  };

  // Handle select all
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedEmployees(new Set());
    } else {
      setSelectedEmployees(new Set(employees.map(emp => emp.id)));
    }
    setSelectAll(!selectAll);
  };

  // Apply bulk status to selected employees
  const applyBulkStatus = () => {
    setFormData(prev => ({
      ...prev,
      employees: prev.employees.map(emp => 
        selectedEmployees.has(emp.employee_id) ? 
          { ...emp, status: formData.bulkStatus } : emp
      )
    }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.date) {
      newErrors.date = 'Date is required';
    } else {
      const selectedDate = new Date(formData.date);
      const today = new Date();
      if (selectedDate > today) {
        newErrors.date = 'Cannot mark attendance for future dates';
      }
    }

    if (mode === 'bulk' && selectedEmployees.size === 0) {
      newErrors.employees = 'Please select at least one employee';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      if (mode === 'bulk') {
        // Filter only selected employees
        const selectedAttendance = formData.employees.filter(emp => 
          selectedEmployees.has(emp.employee_id)
        );
        
        await onSubmit(selectedAttendance);
      } else {
        // Single employee mode (not implemented in this component yet)
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ general: error.message || 'An error occurred while marking attendance' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return '#d4edda';
      case AttendanceStatus.ABSENT:
        return '#f8d7da';
      case AttendanceStatus.HALF_DAY:
        return '#fff3cd';
      default:
        return '#f8f9fa';
    }
  };

  const getStatusBorderColor = (status) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return '#c3e6cb';
      case AttendanceStatus.ABSENT:
        return '#f5c6cb';
      case AttendanceStatus.HALF_DAY:
        return '#ffeaa7';
      default:
        return '#dee2e6';
    }
  };

  return (
    <div className="attendance-form">
      <form onSubmit={handleSubmit} className="form">
        <div className="form-header">
          <h2>{mode === 'bulk' ? 'Mark Bulk Attendance' : 'Mark Attendance'}</h2>
          <p className="form-description">
            Mark attendance for employees on the selected date
          </p>
        </div>

        {errors.general && (
          <div className="error-banner">
            <strong>Error:</strong> {errors.general}
          </div>
        )}

        {/* Date Selection */}
        <div className="form-group">
          <label htmlFor="date" className="form-label">
            Attendance Date *
          </label>
          <input
            type="date"
            id="date"
            value={formData.date}
            onChange={handleDateChange}
            className={`form-input ${errors.date ? 'error' : ''}`}
            max={new Date().toISOString().split('T')[0]}
            required
          />
          {errors.date && (
            <div className="error-message">{errors.date}</div>
          )}
        </div>

        {mode === 'bulk' && (
          <>
            {/* Bulk Controls */}
            <div className="bulk-controls">
              <div className="bulk-actions">
                <div className="select-all">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={selectAll}
                      onChange={handleSelectAll}
                    />
                    <span>Select All ({employees.length} employees)</span>
                  </label>
                </div>
                
                <div className="bulk-status">
                  <select
                    value={formData.bulkStatus}
                    onChange={handleBulkStatusChange}
                    className="bulk-status-select"
                  >
                    <option value={AttendanceStatus.PRESENT}>Mark as Present</option>
                    <option value={AttendanceStatus.ABSENT}>Mark as Absent</option>
                    <option value={AttendanceStatus.HALF_DAY}>Mark as Half Day</option>
                  </select>
                  
                  <button
                    type="button"
                    onClick={applyBulkStatus}
                    className="apply-bulk-btn"
                    disabled={selectedEmployees.size === 0}
                  >
                    Apply to Selected ({selectedEmployees.size})
                  </button>
                </div>
              </div>

              {errors.employees && (
                <div className="error-message">{errors.employees}</div>
              )}
            </div>

            {/* Employee List */}
            <div className="employee-list">
              <div className="list-header">
                <h3>Employees ({employees.length})</h3>
                <div className="selected-count">
                  Selected: {selectedEmployees.size} / {employees.length}
                </div>
              </div>

              <div className="employee-grid">
                {formData.employees.map((empAttendance, index) => {
                  const employee = employees.find(emp => emp.id === empAttendance.employee_id);
                  if (!employee) return null;

                  const isSelected = selectedEmployees.has(employee.id);

                  return (
                    <div 
                      key={employee.id} 
                      className={`employee-item ${isSelected ? 'selected' : ''}`}
                      style={{
                        backgroundColor: getStatusColor(empAttendance.status),
                        borderColor: getStatusBorderColor(empAttendance.status)
                      }}
                    >
                      <div className="employee-header">
                        <label className="checkbox-label">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleEmployeeSelect(employee.id)}
                          />
                          <span className="employee-name">{employee.name}</span>
                        </label>
                      </div>

                      <div className="employee-info">
                        <div className="employee-id">ID: {employee.id.slice(0, 8)}...</div>
                        {employee.aadhar_id && (
                          <div className="employee-aadhar">
                            Aadhar: {employee.aadhar_id.slice(0, 4)}****{employee.aadhar_id.slice(-4)}
                          </div>
                        )}
                      </div>

                      <div className="status-controls">
                        <div className="status-buttons">
                          {Object.values(AttendanceStatus).map(status => (
                            <button
                              key={status}
                              type="button"
                              className={`status-btn ${empAttendance.status === status ? 'active' : ''}`}
                              onClick={() => handleEmployeeStatusChange(employee.id, status)}
                              data-status={status}
                            >
                              {status === AttendanceStatus.PRESENT && '✓ Present'}
                              {status === AttendanceStatus.ABSENT && '✗ Absent'}
                              {status === AttendanceStatus.HALF_DAY && '◐ Half Day'}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {/* Notes */}
        <div className="form-group">
          <label htmlFor="notes" className="form-label">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            className="form-textarea"
            placeholder="Add any additional notes about attendance..."
            rows="3"
            maxLength="500"
          />
          <div className="field-hint">
            {formData.notes.length}/500 characters
          </div>
        </div>

        {/* Form Actions */}
        <div className="form-actions">
          <button
            type="button"
            onClick={onCancel}
            className="btn-secondary"
            disabled={isSubmitting || loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting || loading || (mode === 'bulk' && selectedEmployees.size === 0)}
          >
            {isSubmitting || loading ? 
              'Marking Attendance...' :
              `Mark Attendance${mode === 'bulk' ? ` (${selectedEmployees.size})` : ''}`
            }
          </button>
        </div>
      </form>

      <style jsx>{`
        .attendance-form {
          max-width: 1000px;
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

        .form-input,
        .form-textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
          transition: border-color 0.2s, box-shadow 0.2s;
        }

        .form-input:focus,
        .form-textarea:focus {
          outline: none;
          border-color: #007cba;
          box-shadow: 0 0 0 2px rgba(0, 124, 186, 0.2);
        }

        .form-input.error,
        .form-textarea.error {
          border-color: #dc3545;
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

        .bulk-controls {
          background: #f8f9fa;
          padding: 20px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #e9ecef;
        }

        .bulk-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 15px;
        }

        .checkbox-label {
          display: flex;
          align-items: center;
          cursor: pointer;
          font-weight: 500;
        }

        .checkbox-label input[type="checkbox"] {
          margin-right: 8px;
        }

        .bulk-status {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .bulk-status-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .apply-bulk-btn {
          padding: 8px 16px;
          background: #17a2b8;
          color: white;
          border: none;
          border-radius: 4px;
          font-size: 14px;
          cursor: pointer;
          font-weight: 500;
        }

        .apply-bulk-btn:hover:not(:disabled) {
          background: #138496;
        }

        .apply-bulk-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .employee-list {
          margin-bottom: 20px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #e9ecef;
        }

        .list-header h3 {
          margin: 0;
          color: #333;
        }

        .selected-count {
          font-size: 0.9rem;
          color: #666;
          font-weight: 500;
        }

        .employee-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 15px;
        }

        .employee-item {
          border: 2px solid;
          border-radius: 8px;
          padding: 15px;
          transition: all 0.2s;
        }

        .employee-item.selected {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .employee-header {
          margin-bottom: 10px;
        }

        .employee-name {
          font-weight: 600;
          color: #333;
        }

        .employee-info {
          margin-bottom: 15px;
          font-size: 0.8rem;
          color: #666;
        }

        .employee-info div {
          margin-bottom: 2px;
        }

        .status-controls {
          margin-top: 10px;
        }

        .status-buttons {
          display: flex;
          gap: 6px;
        }

        .status-btn {
          flex: 1;
          padding: 6px 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          font-size: 0.75rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .status-btn:hover {
          background: #f8f9fa;
        }

        .status-btn.active[data-status="present"] {
          background: #28a745;
          color: white;
          border-color: #28a745;
        }

        .status-btn.active[data-status="absent"] {
          background: #dc3545;
          color: white;
          border-color: #dc3545;
        }

        .status-btn.active[data-status="half-day"] {
          background: #ffc107;
          color: #212529;
          border-color: #ffc107;
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
          .attendance-form {
            padding: 10px;
          }
          
          .form {
            padding: 20px;
          }
          
          .bulk-actions {
            flex-direction: column;
            align-items: stretch;
          }
          
          .employee-grid {
            grid-template-columns: 1fr;
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

export default AttendanceForm;