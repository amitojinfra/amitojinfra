import { useState, useEffect } from 'react';
import expenseService, { 
  EXPENSE_CATEGORY_LABELS, 
  PAYMENT_MODE_LABELS 
} from '../../lib/services/expenseService';

export default function DailyExpenseReport({ selectedDate, onDateChange }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Load report data when date changes
  useEffect(() => {
    if (selectedDate) {
      loadDailyReport(selectedDate);
    }
  }, [selectedDate]);

  // Load daily expense report
  const loadDailyReport = async (date) => {
    setLoading(true);
    setError('');

    try {
      const result = await expenseService.getDailyExpenseReport(date);
      
      if (result.success) {
        setReportData(result);
      } else {
        setError(result.error);
        setReportData(null);
      }
    } catch (err) {
      console.error('Error loading daily report:', err);
      setError('Failed to load daily expense report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle date change
  const handleDateChange = (e) => {
    const newDate = e.target.value;
    onDateChange(newDate);
  };

  // Format date for display
  const formatDisplayDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="daily-expense-report">
      <div className="report-header">
        <div className="header-content">
          <h2>Daily Expense Report</h2>
          <p>Detailed breakdown of expenses for a specific day</p>
        </div>
        <div className="date-selector">
          <label htmlFor="report-date" className="date-label">Select Date:</label>
          <input
            type="date"
            id="report-date"
            value={selectedDate}
            onChange={handleDateChange}
            className="date-input"
            max={new Date().toISOString().split('T')[0]}
          />
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading daily report...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Report</h3>
          <p>{error}</p>
          <button 
            onClick={() => loadDailyReport(selectedDate)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {reportData && !loading && (
        <div className="report-content">
          <div className="report-title">
            <h3>{formatDisplayDate(reportData.date)}</h3>
          </div>

          {/* Summary Cards */}
          <div className="summary-cards">
            <div className="summary-card total">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-value">{expenseService.formatCurrency(reportData.summary.totalAmount)}</div>
                <div className="card-label">Total Expenses</div>
              </div>
            </div>
            
            <div className="summary-card count">
              <div className="card-icon">📋</div>
              <div className="card-content">
                <div className="card-value">{reportData.summary.totalExpenses}</div>
                <div className="card-label">Number of Expenses</div>
              </div>
            </div>

            <div className="summary-card cash">
              <div className="card-icon">💵</div>
              <div className="card-content">
                <div className="card-value">{expenseService.formatCurrency(reportData.summary.paymentModeBreakdown.cash)}</div>
                <div className="card-label">Cash Payments</div>
              </div>
            </div>

            <div className="summary-card online">
              <div className="card-icon">💳</div>
              <div className="card-content">
                <div className="card-value">{expenseService.formatCurrency(reportData.summary.paymentModeBreakdown.online)}</div>
                <div className="card-label">Online Payments</div>
              </div>
            </div>
          </div>

          {reportData.expenses.length > 0 ? (
            <>
              {/* Category Breakdown */}
              <div className="category-breakdown">
                <h4>Category Breakdown</h4>
                <div className="category-grid">
                  {Object.entries(reportData.summary.categoryBreakdown)
                    .filter(([category, data]) => data.count > 0)
                    .sort(([,a], [,b]) => b.amount - a.amount)
                    .map(([category, data]) => (
                      <div key={category} className="category-item">
                        <div className="category-header">
                          <div className="category-name">
                            {EXPENSE_CATEGORY_LABELS[category] || category}
                          </div>
                          <div className="category-amount">
                            {expenseService.formatCurrency(data.amount)}
                          </div>
                        </div>
                        <div className="category-details">
                          <span className="category-count">{data.count} expenses</span>
                          <div className="category-bar">
                            <div 
                              className="category-fill"
                              style={{ 
                                width: `${(data.amount / reportData.summary.totalAmount) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Detailed Expense List */}
              <div className="expense-details">
                <h4>Detailed Expenses</h4>
                <div className="expense-table-container">
                  <table className="expense-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Amount</th>
                        <th>Vendor</th>
                        <th>Payment Mode</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reportData.expenses
                        .sort((a, b) => b.amount - a.amount)
                        .map((expense) => (
                          <tr key={expense.id}>
                            <td className="category-cell">
                              <div className="category-info">
                                {EXPENSE_CATEGORY_LABELS[expense.category] || expense.category}
                              </div>
                            </td>
                            <td className="amount-cell">
                              {expenseService.formatCurrency(expense.amount)}
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
                              {expense.description || '-'}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          ) : (
            <div className="no-expenses">
              <div className="no-expenses-icon">📋</div>
              <h4>No Expenses for This Day</h4>
              <p>No expenses were recorded for {formatDisplayDate(reportData.date)}</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .daily-expense-report {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          padding: 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .header-content h2 {
          margin: 0 0 0.5rem 0;
          color: #333;
          font-size: 1.5rem;
          font-weight: 600;
        }

        .header-content p {
          margin: 0;
          color: #666;
          font-size: 0.9rem;
        }

        .date-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .date-label {
          color: #333;
          font-weight: 500;
          font-size: 0.9rem;
          white-space: nowrap;
        }

        .date-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .date-input:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        .loading-state, .error-state, .no-expenses {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 3rem;
          text-align: center;
          color: #666;
        }

        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #4285f4;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .error-icon, .no-expenses-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-state h3, .no-expenses h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .error-state p, .no-expenses p {
          margin: 0 0 1rem 0;
          color: #666;
        }

        .report-content {
          padding: 1.5rem;
        }

        .report-title h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.25rem;
          text-align: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .summary-card {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          border: 1px solid #e0e0e0;
        }

        .summary-card.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .summary-card.count {
          background: #f0f9ff;
          border-color: #0ea5e9;
        }

        .summary-card.cash {
          background: #f0fdf4;
          border-color: #22c55e;
        }

        .summary-card.online {
          background: #fef3c7;
          border-color: #f59e0b;
        }

        .card-icon {
          font-size: 2rem;
          margin-right: 1rem;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .card-label {
          font-size: 0.8rem;
          opacity: 0.8;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-breakdown, .expense-details {
          margin-bottom: 2rem;
        }

        .category-breakdown h4, .expense-details h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .category-grid {
          display: grid;
          gap: 1rem;
        }

        .category-item {
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #fff;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .category-name {
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .category-amount {
          font-weight: 600;
          color: #4285f4;
        }

        .category-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .category-count {
          font-size: 0.8rem;
          color: #666;
          white-space: nowrap;
        }

        .category-bar {
          flex: 1;
          background: #f0f0f0;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .category-fill {
          height: 100%;
          background: linear-gradient(90deg, #4285f4, #34a853);
          transition: width 0.3s ease;
        }

        .expense-table-container {
          overflow-x: auto;
        }

        .expense-table {
          width: 100%;
          border-collapse: collapse;
          background: #fff;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          overflow: hidden;
        }

        .expense-table th,
        .expense-table td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid #e0e0e0;
        }

        .expense-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .expense-table tbody tr:hover {
          background: #f8f9fa;
        }

        .amount-cell {
          text-align: right;
          font-weight: 600;
          color: #2d3748;
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
        }

        .payment-badge.online {
          background: #eff6ff;
          color: #1e40af;
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

        .btn-primary {
          background: #4285f4;
          color: white;
        }

        .btn-primary:hover {
          background: #3367d6;
        }

        @media (max-width: 768px) {
          .report-header {
            flex-direction: column;
            gap: 1rem;
          }

          .date-selector {
            align-self: stretch;
            justify-content: space-between;
          }

          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .category-header {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.25rem;
          }

          .expense-table {
            font-size: 0.8rem;
          }

          .expense-table th,
          .expense-table td {
            padding: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}