import { useState, useMemo } from 'react';
import { formatDate, PaymentModes } from '../../lib/models/Payment';

const PaymentList = ({ 
  payments = [], 
  employees = [],
  loading = false,
  onEdit = null,
  onDelete = null,
  showActions = true,
  showFilters = true,
  title = "Payment Records"
}) => {
  // Formatting functions
  const formatCurrency = (amount) => {
    const num = parseFloat(amount) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatPaymentDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return 'Invalid Date';
    }
  };
  const [filters, setFilters] = useState({
    employee_id: '',
    payment_mode: '',
    date_from: '',
    date_to: '',
    search: ''
  });

  const [sortConfig, setSortConfig] = useState({
    key: 'payment_date',
    direction: 'desc'
  });

  // Get employee name by ID
  const getEmployeeName = useMemo(() => {
    return (employeeId) => {
      const employee = employees.find(emp => emp.id === employeeId);
      return employee ? employee.name : 'Unknown Employee';
    };
  }, [employees]);

  // Get employee designation by ID
  const getEmployeeDesignation = useMemo(() => {
    return (employeeId) => {
      const employee = employees.find(emp => emp.id === employeeId);
      return employee ? employee.designation : '';
    };
  }, [employees]);

  // Filter and search payments
  const filteredPayments = useMemo(() => {
    let filtered = [...payments];

    // Employee filter
    if (filters.employee_id) {
      filtered = filtered.filter(payment => payment.employee_id === filters.employee_id);
    }

    // Payment mode filter
    if (filters.payment_mode) {
      filtered = filtered.filter(payment => payment.payment_mode === filters.payment_mode);
    }

    // Date range filter
    if (filters.date_from) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        const fromDate = new Date(filters.date_from);
        return paymentDate >= fromDate;
      });
    }

    if (filters.date_to) {
      filtered = filtered.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        const toDate = new Date(filters.date_to);
        return paymentDate <= toDate;
      });
    }

    // Search filter
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(payment => {
        const employeeName = getEmployeeName(payment.employee_id).toLowerCase();
        const paidBy = payment.paid_by.toLowerCase();
        const notes = (payment.notes || '').toLowerCase();
        const amount = payment.amount.toString();
        
        return employeeName.includes(searchTerm) ||
               paidBy.includes(searchTerm) ||
               notes.includes(searchTerm) ||
               amount.includes(searchTerm);
      });
    }

    return filtered;
  }, [payments, filters, getEmployeeName]);

  // Sort payments
  const sortedPayments = useMemo(() => {
    if (!sortConfig.key) return filteredPayments;

    return [...filteredPayments].sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      // Handle date sorting
      if (sortConfig.key === 'payment_date' || sortConfig.key === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numeric sorting
      if (sortConfig.key === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      }

      // Handle employee name sorting
      if (sortConfig.key === 'employee_name') {
        aValue = getEmployeeName(a.employee_id);
        bValue = getEmployeeName(b.employee_id);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });
  }, [filteredPayments, sortConfig, getEmployeeName]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalAmount = filteredPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
    const totalRecords = filteredPayments.length;
    const cashPayments = filteredPayments.filter(p => p.payment_mode === PaymentModes.CASH);
    const onlinePayments = filteredPayments.filter(p => p.payment_mode === PaymentModes.ONLINE);
    
    return {
      totalAmount,
      totalRecords,
      cashAmount: cashPayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
      onlineAmount: onlinePayments.reduce((sum, payment) => sum + parseFloat(payment.amount), 0),
      cashCount: cashPayments.length,
      onlineCount: onlinePayments.length
    };
  }, [filteredPayments]);

  // Handle filter changes
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Handle sorting
  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      employee_id: '',
      payment_mode: '',
      date_from: '',
      date_to: '',
      search: ''
    });
  };

  // Get sort icon
  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  return (
    <div className="payment-list">
      <div className="list-header">
        <h2>{title}</h2>
        <div className="list-summary">
          {loading ? (
            <span>Loading payments...</span>
          ) : (
            <span>
              Showing {sortedPayments.length} of {payments.length} payment{payments.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="filters-section">
          <div className="filters-grid">
            {/* Employee Filter */}
            <div className="filter-group">
              <label htmlFor="employee_filter">Employee</label>
              <select
                id="employee_filter"
                name="employee_id"
                value={filters.employee_id}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="">All Employees</option>
                {employees.map((employee) => (
                  <option key={employee.id} value={employee.id}>
                    {employee.name} - {employee.designation}
                  </option>
                ))}
              </select>
            </div>

            {/* Payment Mode Filter */}
            <div className="filter-group">
              <label htmlFor="mode_filter">Payment Mode</label>
              <select
                id="mode_filter"
                name="payment_mode"
                value={filters.payment_mode}
                onChange={handleFilterChange}
                className="filter-input"
              >
                <option value="">All Modes</option>
                {Object.entries(PaymentModes).map(([key, value]) => (
                  <option key={key} value={value}>
                    {value}
                  </option>
                ))}
              </select>
            </div>

            {/* Date From Filter */}
            <div className="filter-group">
              <label htmlFor="date_from_filter">From Date</label>
              <input
                type="date"
                id="date_from_filter"
                name="date_from"
                value={filters.date_from}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            {/* Date To Filter */}
            <div className="filter-group">
              <label htmlFor="date_to_filter">To Date</label>
              <input
                type="date"
                id="date_to_filter"
                name="date_to"
                value={filters.date_to}
                onChange={handleFilterChange}
                className="filter-input"
              />
            </div>

            {/* Search Filter */}
            <div className="filter-group search-group">
              <label htmlFor="search_filter">Search</label>
              <input
                type="text"
                id="search_filter"
                name="search"
                value={filters.search}
                onChange={handleFilterChange}
                placeholder="Search by employee, amount, or notes..."
                className="filter-input"
              />
            </div>

            {/* Clear Filters */}
            <div className="filter-group">
              <label>&nbsp;</label>
              <button
                type="button"
                onClick={clearFilters}
                className="btn-clear-filters"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Summary Statistics */}
      <div className="summary-stats">
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totals.totalAmount)}</div>
          <div className="stat-label">Total Amount</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totals.totalRecords}</div>
          <div className="stat-label">Total Payments</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totals.cashAmount)}</div>
          <div className="stat-label">Cash ({totals.cashCount})</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{formatCurrency(totals.onlineAmount)}</div>
          <div className="stat-label">Online ({totals.onlineCount})</div>
        </div>
      </div>

      {/* Payment Table */}
      <div className="table-container">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading payment records...</p>
          </div>
        ) : sortedPayments.length === 0 ? (
          <div className="empty-state">
            <p>No payment records found.</p>
            {Object.values(filters).some(filter => filter) && (
              <button onClick={clearFilters} className="btn-secondary">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <table className="payments-table">
            <thead>
              <tr>
                <th onClick={() => handleSort('payment_date')} className="sortable">
                  Date {getSortIcon('payment_date')}
                </th>
                <th onClick={() => handleSort('employee_name')} className="sortable">
                  Employee {getSortIcon('employee_name')}
                </th>
                <th onClick={() => handleSort('amount')} className="sortable">
                  Amount {getSortIcon('amount')}
                </th>
                <th onClick={() => handleSort('payment_mode')} className="sortable">
                  Mode {getSortIcon('payment_mode')}
                </th>
                <th onClick={() => handleSort('paid_by')} className="sortable">
                  Paid By {getSortIcon('paid_by')}
                </th>
                <th>Notes</th>
                {showActions && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {sortedPayments.map((payment) => (
                <tr key={payment.id}>
                  <td className="date-cell">
                    {formatPaymentDate(payment.payment_date)}
                  </td>
                  <td className="employee-cell">
                    <div className="employee-info">
                      <div className="employee-name">{getEmployeeName(payment.employee_id)}</div>
                      <div className="employee-designation">{getEmployeeDesignation(payment.employee_id)}</div>
                    </div>
                  </td>
                  <td className="amount-cell">
                    {formatCurrency(payment.amount)}
                  </td>
                  <td className="mode-cell">
                    <span className={`payment-mode ${payment.payment_mode.toLowerCase()}`}>
                      {payment.payment_mode}
                    </span>
                  </td>
                  <td className="paid-by-cell">
                    {payment.paid_by}
                  </td>
                  <td className="notes-cell">
                    {payment.notes && (
                      <div className="notes-content" title={payment.notes}>
                        {payment.notes.length > 50 ? 
                          `${payment.notes.substring(0, 50)}...` : 
                          payment.notes
                        }
                      </div>
                    )}
                  </td>
                  {showActions && (
                    <td className="actions-cell">
                      <div className="action-buttons">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(payment)}
                            className="btn-action btn-edit"
                            title="Edit Payment"
                          >
                            ✏️
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete(payment)}
                            className="btn-action btn-delete"
                            title="Delete Payment"
                          >
                            🗑️
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <style jsx>{`
        .payment-list {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          padding: 20px;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 1px solid #e5e7eb;
        }

        .list-header h2 {
          color: #1f2937;
          margin: 0;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .list-summary {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .filters-section {
          margin-bottom: 25px;
          padding: 20px;
          background: #f9fafb;
          border-radius: 6px;
        }

        .filters-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 15px;
        }

        .search-group {
          grid-column: span 2;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
        }

        .filter-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
          margin-bottom: 5px;
        }

        .filter-input {
          padding: 8px 12px;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .filter-input:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }

        .btn-clear-filters {
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          color: #374151;
          font-size: 0.9rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        .btn-clear-filters:hover {
          background: #e5e7eb;
        }

        .summary-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          background: #f8fafc;
          padding: 15px;
          border-radius: 6px;
          text-align: center;
          border: 1px solid #e2e8f0;
        }

        .stat-value {
          font-size: 1.2rem;
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .table-container {
          overflow-x: auto;
        }

        .payments-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        .payments-table th,
        .payments-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .payments-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
          position: sticky;
          top: 0;
        }

        .sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s;
        }

        .sortable:hover {
          background: #f3f4f6;
        }

        .date-cell {
          white-space: nowrap;
        }

        .employee-cell {
          min-width: 150px;
        }

        .employee-info {
          display: flex;
          flex-direction: column;
        }

        .employee-name {
          font-weight: 500;
          color: #1f2937;
        }

        .employee-designation {
          font-size: 0.8rem;
          color: #6b7280;
        }

        .amount-cell {
          font-weight: 600;
          color: #059669;
          text-align: right;
        }

        .payment-mode {
          padding: 4px 8px;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .payment-mode.cash {
          background: #dcfce7;
          color: #166534;
        }

        .payment-mode.online {
          background: #dbeafe;
          color: #1d4ed8;
        }

        .notes-cell {
          max-width: 200px;
        }

        .notes-content {
          color: #6b7280;
          font-size: 0.85rem;
          line-height: 1.4;
        }

        .actions-cell {
          white-space: nowrap;
        }

        .action-buttons {
          display: flex;
          gap: 8px;
        }

        .btn-action {
          padding: 6px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .btn-edit {
          background: #fef3c7;
          color: #92400e;
        }

        .btn-edit:hover {
          background: #fcd34d;
        }

        .btn-delete {
          background: #fee2e2;
          color: #dc2626;
        }

        .btn-delete:hover {
          background: #fca5a5;
        }

        .loading-state,
        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: #6b7280;
        }

        .loading-spinner {
          width: 24px;
          height: 24px;
          border: 2px solid #e5e7eb;
          border-top: 2px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 15px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .btn-secondary {
          padding: 8px 16px;
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          color: #374151;
          cursor: pointer;
          margin-top: 10px;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        @media (max-width: 768px) {
          .filters-grid {
            grid-template-columns: 1fr;
          }
          
          .search-group {
            grid-column: span 1;
          }
          
          .summary-stats {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .payments-table {
            font-size: 0.8rem;
          }
          
          .payments-table th,
          .payments-table td {
            padding: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default PaymentList;