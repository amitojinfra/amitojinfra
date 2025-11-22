import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import ExpenseForm from '../../components/expenses/ExpenseForm';
import ExpenseList from '../../components/expenses/ExpenseList';
import expenseService, { EXPENSE_CATEGORIES, EXPENSE_CATEGORY_LABELS, PAYMENT_MODES, PAYMENT_MODE_LABELS } from '../../lib/services/expenseService';

export default function ExpenseManagement() {
  const router = useRouter();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    paymentMode: '',
    startDate: '',
    endDate: ''
  });
  const [quickStats, setQuickStats] = useState({
    totalExpenses: 0,
    totalAmount: 0,
    todayAmount: 0,
    monthAmount: 0
  });

  // Load expenses on component mount
  useEffect(() => {
    const initializeData = async () => {
      await loadExpenses();
      await loadQuickStats();
    };
    initializeData();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Load expenses with filters
  const loadExpenses = async (appliedFilters = filters) => {
    setLoading(true);
    setError('');

    try {
      const result = await expenseService.getExpenses(appliedFilters);
      
      if (result.success) {
        setExpenses(result.expenses);
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error loading expenses:', err);
      setError('Failed to load expenses');
    } finally {
      setLoading(false);
    }
  };

  // Load quick statistics
  const loadQuickStats = async () => {
    try {
      const today = new Date();
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      // Get today's expenses
      const todayResult = await expenseService.getDailyExpenseReport(today.toISOString().split('T')[0]);
      
      // Get this month's expenses
      const monthResult = await expenseService.getMonthlyExpenseReport(today.getFullYear(), today.getMonth() + 1);
      
      // Get all expenses for total count
      const allResult = await expenseService.getExpenses({});

      setQuickStats({
        totalExpenses: allResult.success ? allResult.total : 0,
        totalAmount: allResult.success ? allResult.expenses.reduce((sum, exp) => sum + exp.amount, 0) : 0,
        todayAmount: todayResult.success ? todayResult.summary.totalAmount : 0,
        monthAmount: monthResult.success ? monthResult.summary.totalAmount : 0
      });
    } catch (err) {
      console.error('Error loading quick stats:', err);
    }
  };

  // Handle form submission
  const handleFormSubmit = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let result;
      
      if (editingExpense) {
        result = await expenseService.updateExpense(editingExpense.id, formData, 'current-user');
      } else {
        result = await expenseService.createExpense(formData, 'current-user');
      }

      if (result.success) {
        setSuccess(result.message);
        setShowForm(false);
        setEditingExpense(null);
        loadExpenses();
        loadQuickStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error saving expense:', err);
      setError('Failed to save expense');
    } finally {
      setLoading(false);
    }
  };

  // Handle edit expense
  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowForm(true);
  };

  // Handle delete expense
  const handleDeleteExpense = async (expenseId) => {
    if (!confirm('Are you sure you want to delete this expense?')) {
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await expenseService.deleteExpense(expenseId);
      
      if (result.success) {
        setSuccess(result.message);
        loadExpenses();
        loadQuickStats();
      } else {
        setError(result.error);
      }
    } catch (err) {
      console.error('Error deleting expense:', err);
      setError('Failed to delete expense');
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    loadExpenses(newFilters);
  };

  // Clear messages
  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Cancel form
  const handleCancelForm = () => {
    setShowForm(false);
    setEditingExpense(null);
    clearMessages();
  };

  return (
    <Layout>
      <Head>
        <title>Expense Management - Infrastructure Pole Deployment</title>
        <meta name="description" content="Manage expenses for infrastructure pole deployment operations" />
      </Head>

      <div className="expense-management">
        <div className="page-header">
          <div className="header-content">
            <h1>Expense Management</h1>
            <p>Track and manage expenses for infrastructure pole deployment operations</p>
          </div>
          <div className="header-actions">
            <Link href="/expenses/reports" className="btn btn-outline">
              View Reports
            </Link>
            <button 
              className="btn btn-primary"
              onClick={() => setShowForm(true)}
              disabled={loading}
            >
              Add New Expense
            </button>
          </div>
        </div>

        {/* Quick Statistics */}
        <div className="quick-stats">
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-value">{quickStats.totalExpenses}</div>
              <div className="stat-label">Total Expenses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{expenseService.formatCurrency(quickStats.totalAmount)}</div>
              <div className="stat-label">Total Amount</div>
            </div>
            <div className="stat-card highlight">
              <div className="stat-value">{expenseService.formatCurrency(quickStats.todayAmount)}</div>
              <div className="stat-label">Today's Expenses</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{expenseService.formatCurrency(quickStats.monthAmount)}</div>
              <div className="stat-label">This Month</div>
            </div>
          </div>
        </div>

        {/* Messages */}
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
            <button onClick={clearMessages} className="alert-close">&times;</button>
          </div>
        )}

        {success && (
          <div className="alert alert-success">
            <span>{success}</span>
            <button onClick={clearMessages} className="alert-close">&times;</button>
          </div>
        )}

        {/* Expense Form */}
        {showForm && (
          <div className="form-section">
            <div className="section-header">
              <h2>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</h2>
              <button 
                className="btn btn-outline btn-sm"
                onClick={handleCancelForm}
              >
                Cancel
              </button>
            </div>
            
            <ExpenseForm
              initialData={editingExpense}
              onSubmit={handleFormSubmit}
              onCancel={handleCancelForm}
              loading={loading}
            />
          </div>
        )}

        {/* Filters */}
        <div className="filters-section">
          <div className="filters-header">
            <h3>Filter Expenses</h3>
          </div>
          
          <div className="filters-grid">
            <div className="filter-group">
              <label htmlFor="category-filter" className="filter-label">Category</label>
              <select
                id="category-filter"
                value={filters.category}
                onChange={(e) => handleFilterChange({ ...filters, category: e.target.value })}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="payment-filter" className="filter-label">Payment Mode</label>
              <select
                id="payment-filter"
                value={filters.paymentMode}
                onChange={(e) => handleFilterChange({ ...filters, paymentMode: e.target.value })}
                className="filter-select"
              >
                <option value="">All Payment Modes</option>
                {Object.entries(PAYMENT_MODE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label htmlFor="start-date-filter" className="filter-label">From Date</label>
              <input
                type="date"
                id="start-date-filter"
                value={filters.startDate}
                onChange={(e) => handleFilterChange({ ...filters, startDate: e.target.value })}
                className="filter-input"
              />
            </div>

            <div className="filter-group">
              <label htmlFor="end-date-filter" className="filter-label">To Date</label>
              <input
                type="date"
                id="end-date-filter"
                value={filters.endDate}
                onChange={(e) => handleFilterChange({ ...filters, endDate: e.target.value })}
                className="filter-input"
              />
            </div>

            <div className="filter-actions">
              <button
                className="btn btn-outline btn-sm"
                onClick={() => handleFilterChange({ category: '', paymentMode: '', startDate: '', endDate: '' })}
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Expense List */}
        <div className="list-section">
          <ExpenseList
            expenses={expenses}
            loading={loading}
            onEdit={handleEditExpense}
            onDelete={handleDeleteExpense}
          />
        </div>
      </div>

      <style jsx>{`
        .expense-management {
          padding: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .header-content h1 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 2.5rem;
          font-weight: 600;
        }

        .header-content p {
          margin: 0;
          color: #666;
          font-size: 1.1rem;
        }

        .header-actions {
          display: flex;
          gap: 1rem;
          align-items: center;
        }

        .quick-stats {
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: #fff;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          text-align: center;
          border: 1px solid #e0e0e0;
        }

        .stat-card.highlight {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #666;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-card.highlight .stat-label {
          color: rgba(255, 255, 255, 0.9);
        }

        .alert {
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .alert-error {
          background-color: #fee;
          color: #c53030;
          border: 1px solid #fed7d7;
        }

        .alert-success {
          background-color: #f0fff4;
          color: #2f855a;
          border: 1px solid #c6f6d5;
        }

        .alert-close {
          background: none;
          border: none;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0;
          margin-left: 1rem;
        }

        .form-section, .filters-section, .list-section {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .section-header, .filters-header {
          background: #f8f9fa;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .section-header h2, .filters-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          padding: 1.5rem;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-label {
          margin-bottom: 0.5rem;
          color: #333;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .filter-select, .filter-input {
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          background: #fff;
        }

        .filter-select:focus, .filter-input:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        .filter-actions {
          display: flex;
          align-items: end;
        }

        .btn {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          text-decoration: none;
          display: inline-flex;
          align-items: center;
          justify-content: center;
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
          color: #4285f4;
          border: 1px solid #4285f4;
        }

        .btn-outline:hover:not(:disabled) {
          background: #4285f4;
          color: white;
        }

        .btn-sm {
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        @media (max-width: 768px) {
          .expense-management {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .header-actions {
            justify-content: stretch;
          }

          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .filters-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </Layout>
  );
}