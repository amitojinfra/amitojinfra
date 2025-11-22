import { useState } from 'react';
import expenseService, { 
  EXPENSE_CATEGORY_LABELS, 
  PAYMENT_MODE_LABELS,
  EXPENSE_STATUS
} from '../../lib/services/expenseService';

export default function ExpenseList({ expenses, loading, onEdit, onDelete }) {
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Sort expenses
  const sortedExpenses = [...expenses].sort((a, b) => {
    let aValue = a[sortField];
    let bValue = b[sortField];

    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    } else if (sortField === 'amount') {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
    } else if (typeof aValue === 'string') {
      aValue = aValue.toLowerCase();
      bValue = bValue.toLowerCase();
    }

    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  // Paginate expenses
  const totalPages = Math.ceil(sortedExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedExpenses = sortedExpenses.slice(startIndex, startIndex + itemsPerPage);

  // Handle sort
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle page change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Format date
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  if (loading) {
    return (
      <div className="expense-list">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading expenses...</p>
        </div>
        <style jsx>{`
          .expense-list {
            padding: 1.5rem;
            text-align: center;
          }

          .loading-state {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 1rem;
            padding: 3rem;
            color: #666;
          }

          .loading-spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f3f3;
            border-top: 4px solid #4285f4;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (expenses.length === 0) {
    return (
      <div className="expense-list">
        <div className="empty-state">
          <div className="empty-icon">📋</div>
          <h3>No Expenses Found</h3>
          <p>No expenses match your current filters or you haven't added any expenses yet.</p>
        </div>
        <style jsx>{`
          .expense-list {
            padding: 1.5rem;
            text-align: center;
          }

          .empty-state {
            padding: 3rem;
            color: #666;
          }

          .empty-icon {
            font-size: 4rem;
            margin-bottom: 1rem;
          }

          .empty-state h3 {
            margin: 0 0 0.5rem 0;
            color: #333;
          }

          .empty-state p {
            margin: 0;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="expense-list">
      <div className="list-header">
        <h3>Expenses ({expenses.length})</h3>
        <div className="list-info">
          Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, expenses.length)} of {expenses.length}
        </div>
      </div>

      <div className="table-container">
        <table className="expense-table">
          <thead>
            <tr>
              <th 
                onClick={() => handleSort('date')}
                className={`sortable ${sortField === 'date' ? 'active' : ''}`}
              >
                Date {getSortIcon('date')}
              </th>
              <th 
                onClick={() => handleSort('category')}
                className={`sortable ${sortField === 'category' ? 'active' : ''}`}
              >
                Category {getSortIcon('category')}
              </th>
              <th 
                onClick={() => handleSort('amount')}
                className={`sortable ${sortField === 'amount' ? 'active' : ''}`}
              >
                Amount {getSortIcon('amount')}
              </th>
              <th>Vendor</th>
              <th 
                onClick={() => handleSort('paymentMode')}
                className={`sortable ${sortField === 'paymentMode' ? 'active' : ''}`}
              >
                Payment Mode {getSortIcon('paymentMode')}
              </th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedExpenses.map((expense) => (
              <tr key={expense.id}>
                <td className="date-cell">
                  {formatDate(expense.date)}
                </td>
                <td className="category-cell">
                  <div className="category-info">
                    <div className="category-name">
                      {EXPENSE_CATEGORY_LABELS[expense.category] || expense.category}
                    </div>
                  </div>
                </td>
                <td className="amount-cell">
                  <span className="amount">
                    {expenseService.formatCurrency(expense.amount)}
                  </span>
                </td>
                <td className="vendor-cell">
                  {expense.vendor || '-'}
                </td>
                <td className="payment-cell">
                  <span className={`payment-badge ${expense.paymentMode}`}>
                    {PAYMENT_MODE_LABELS[expense.paymentMode] || expense.paymentMode}
                  </span>
                </td>
                <td className="description-cell">
                  {expense.description ? (
                    <div className="description-text" title={expense.description}>
                      {expense.description.length > 50 
                        ? `${expense.description.substring(0, 50)}...` 
                        : expense.description
                      }
                    </div>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="actions-cell">
                  <div className="action-buttons">
                    <button
                      onClick={() => onEdit(expense)}
                      className="btn btn-edit"
                      title="Edit expense"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => onDelete(expense.id)}
                      className="btn btn-delete"
                      title="Delete expense"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <div className="pagination-info">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`pagination-btn ${page === currentPage ? 'active' : ''}`}
              >
                {page}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      <style jsx>{`
        .expense-list {
          padding: 0;
        }

        .list-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          background: #f8f9fa;
        }

        .list-header h3 {
          margin: 0;
          color: #333;
          font-size: 1.25rem;
          font-weight: 600;
        }

        .list-info {
          color: #666;
          font-size: 0.9rem;
        }

        .table-container {
          overflow-x: auto;
        }

        .expense-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
        }

        .expense-table th,
        .expense-table td {
          padding: 1rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
          vertical-align: middle;
        }

        .expense-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .expense-table th.sortable {
          cursor: pointer;
          user-select: none;
          transition: background-color 0.2s ease;
        }

        .expense-table th.sortable:hover {
          background: #e9ecef;
        }

        .expense-table th.sortable.active {
          background: #dee2e6;
          color: #4285f4;
        }

        .expense-table tr:hover {
          background: #f8f9fa;
        }

        .date-cell {
          font-size: 0.9rem;
          color: #666;
          white-space: nowrap;
        }

        .category-cell {
          max-width: 200px;
        }

        .category-name {
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .amount-cell {
          text-align: right;
          font-weight: 600;
          color: #2d3748;
          white-space: nowrap;
        }

        .vendor-cell {
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #666;
        }

        .payment-cell {
          white-space: nowrap;
        }

        .payment-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .payment-badge.cash {
          background: #e6fffa;
          color: #047857;
          border: 1px solid #a7f3d0;
        }

        .payment-badge.online {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #93c5fd;
        }

        .description-cell {
          max-width: 200px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .description-text {
          color: #666;
          font-size: 0.9rem;
          cursor: help;
        }

        .actions-cell {
          width: 100px;
        }

        .action-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .btn {
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-edit {
          background: #fff3cd;
          border: 1px solid #ffeaa7;
        }

        .btn-edit:hover {
          background: #ffecb5;
        }

        .btn-delete {
          background: #f8d7da;
          border: 1px solid #f5c6cb;
        }

        .btn-delete:hover {
          background: #f1b0b7;
        }

        .pagination {
          display: flex;
          justify-content: center;
          align-items: center;
          gap: 0.5rem;
          padding: 1.5rem;
          background: #f8f9fa;
          border-top: 1px solid #e0e0e0;
        }

        .pagination-info {
          display: flex;
          gap: 0.25rem;
        }

        .pagination-btn {
          padding: 0.5rem 0.75rem;
          border: 1px solid #ddd;
          background: #fff;
          color: #666;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .pagination-btn:hover:not(:disabled) {
          background: #f8f9fa;
          border-color: #bbb;
        }

        .pagination-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination-btn.active {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }

        @media (max-width: 768px) {
          .list-header {
            flex-direction: column;
            gap: 0.5rem;
            align-items: flex-start;
          }

          .expense-table {
            font-size: 0.8rem;
          }

          .expense-table th,
          .expense-table td {
            padding: 0.5rem;
          }

          .category-cell,
          .description-cell {
            max-width: 120px;
          }

          .vendor-cell {
            max-width: 100px;
          }

          .pagination {
            flex-wrap: wrap;
            gap: 0.25rem;
          }

          .pagination-btn {
            padding: 0.4rem 0.6rem;
            font-size: 0.8rem;
          }
        }
      `}</style>
    </div>
  );
}