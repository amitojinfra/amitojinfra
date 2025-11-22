import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import PaymentForm from '../../components/payment/PaymentForm';
import PaymentList from '../../components/payment/PaymentList';
import paymentService from '../../lib/services/paymentService';
import employeeService from '../../lib/services/employeeService';

export default function PaymentManagement() {
  const router = useRouter();
  const [payments, setPayments] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Load data on component mount
  useEffect(() => {
    loadData();
  }, []);

  // Load payments and employees
  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const [paymentsData, employeesData] = await Promise.all([
        paymentService.getAllPayments(),
        employeeService.getAllEmployees()
      ]);
      
      setPayments(paymentsData);
      setEmployees(employeesData);
    } catch (error) {
      console.error('Error loading data:', error);
      setError(`Failed to load data: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle payment creation
  const handleCreatePayment = async (paymentData) => {
    try {
      setFormLoading(true);
      setError('');
      
      const newPayment = await paymentService.createPayment(paymentData);
      
      // Add the new payment to the list
      setPayments(prev => [newPayment, ...prev]);
      
      // Close form and show success message
      setShowForm(false);
      setSuccessMessage('Payment record created successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error; // Let the form handle the error display
    } finally {
      setFormLoading(false);
    }
  };

  // Handle payment update
  const handleUpdatePayment = async (paymentData) => {
    try {
      setFormLoading(true);
      setError('');
      
      const updatedPayment = await paymentService.updatePayment(editingPayment.id, paymentData);
      
      // Update the payment in the list
      setPayments(prev => 
        prev.map(payment => 
          payment.id === editingPayment.id ? updatedPayment : payment
        )
      );
      
      // Close form and show success message
      setShowForm(false);
      setEditingPayment(null);
      setSuccessMessage('Payment record updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error; // Let the form handle the error display
    } finally {
      setFormLoading(false);
    }
  };

  // Handle payment deletion
  const handleDeletePayment = async (payment) => {
    if (!window.confirm(`Are you sure you want to delete this payment record?\n\nEmployee: ${getEmployeeName(payment.employee_id)}\nAmount: ₹${payment.amount}\nDate: ${formatDate(payment.payment_date)}\n\nThis action cannot be undone.`)) {
      return;
    }

    try {
      setError('');
      
      await paymentService.deletePayment(payment.id);
      
      // Remove the payment from the list
      setPayments(prev => prev.filter(p => p.id !== payment.id));
      
      setSuccessMessage('Payment record deleted successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (error) {
      console.error('Error deleting payment:', error);
      setError(`Failed to delete payment: ${error.message}`);
    }
  };

  // Handle edit payment
  const handleEditPayment = (payment) => {
    setEditingPayment(payment);
    setShowForm(true);
  };

  // Handle form cancel
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPayment(null);
  };

  // Handle new payment button
  const handleNewPayment = () => {
    setEditingPayment(null);
    setShowForm(true);
  };

  // Get employee name by ID
  const getEmployeeName = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    return employee ? employee.name : 'Unknown Employee';
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN');
  };

  // Clear error message
  const clearError = () => {
    setError('');
  };

  // Clear success message
  const clearSuccessMessage = () => {
    setSuccessMessage('');
  };

  return (
    <div className="payment-management">
      {/* Page Header */}
      <div className="page-header">
        <div className="header-content">
          <h1>Payment Management</h1>
          <p className="page-description">
            Manage employee payments, track payment history, and generate reports.
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
            onClick={handleNewPayment}
            className="btn-primary"
            disabled={loading}
          >
            Add Payment
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
        {showForm ? (
          <div className="form-section">
            <PaymentForm
              initialData={editingPayment}
              employees={employees}
              onSubmit={editingPayment ? handleUpdatePayment : handleCreatePayment}
              onCancel={handleFormCancel}
              loading={formLoading}
              mode={editingPayment ? 'update' : 'create'}
            />
          </div>
        ) : (
          <div className="list-section">
            <PaymentList
              payments={payments}
              employees={employees}
              loading={loading}
              onEdit={handleEditPayment}
              onDelete={handleDeletePayment}
              showActions={true}
              showFilters={true}
              title="Payment Records"
            />
          </div>
        )}
      </div>

      {/* Loading Overlay */}
      {loading && (
        <div className="loading-overlay">
          <div className="loading-spinner"></div>
          <p>Loading payment data...</p>
        </div>
      )}

      <style jsx>{`
        .payment-management {
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
          padding: 12px 24px;
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

        .form-section,
        .list-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .loading-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          color: white;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 3px solid rgba(255, 255, 255, 0.3);
          border-top: 3px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .loading-overlay p {
          font-size: 1.1rem;
          margin: 0;
        }

        @media (max-width: 768px) {
          .payment-management {
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
          }
          
          .btn-primary,
          .btn-secondary {
            flex: 1;
          }
          
          .header-content h1 {
            font-size: 1.5rem;
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
        }
      `}</style>
    </div>
  );
}