import { useState, useEffect } from 'react';
import expenseService, { 
  EXPENSE_CATEGORY_LABELS, 
  PAYMENT_MODE_LABELS 
} from '../../lib/services/expenseService';

export default function MonthlyExpenseReport({ selectedYear, selectedMonth, onDateChange }) {
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState('summary'); // 'summary' | 'daily' | 'categories'

  // Load report data when year/month changes
  useEffect(() => {
    if (selectedYear && selectedMonth) {
      loadMonthlyReport(selectedYear, selectedMonth);
    }
  }, [selectedYear, selectedMonth]);

  // Load monthly expense report
  const loadMonthlyReport = async (year, month) => {
    setLoading(true);
    setError('');

    try {
      const result = await expenseService.getMonthlyExpenseReport(year, month);
      
      if (result.success) {
        setReportData(result);
      } else {
        setError(result.error);
        setReportData(null);
      }
    } catch (err) {
      console.error('Error loading monthly report:', err);
      setError('Failed to load monthly expense report');
      setReportData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle year change
  const handleYearChange = (e) => {
    const newYear = parseInt(e.target.value);
    onDateChange(newYear, selectedMonth);
  };

  // Handle month change
  const handleMonthChange = (e) => {
    const newMonth = parseInt(e.target.value);
    onDateChange(selectedYear, newMonth);
  };

  // Generate year options (current year and previous years)
  const generateYearOptions = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let year = currentYear; year >= currentYear - 5; year--) {
      years.push(year);
    }
    return years;
  };

  // Generate month options
  const monthOptions = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Get daily expenses sorted by day
  const getDailyExpensesSorted = () => {
    if (!reportData || !reportData.dailyExpenses) return [];
    
    return Object.keys(reportData.dailyExpenses)
      .map(day => ({
        day: parseInt(day),
        ...reportData.dailyExpenses[day]
      }))
      .sort((a, b) => a.day - b.day);
  };

  // Get category expenses sorted by amount
  const getCategoryExpensesSorted = () => {
    if (!reportData || !reportData.summary.categoryBreakdown) return [];
    
    return Object.entries(reportData.summary.categoryBreakdown)
      .filter(([category, data]) => data.count > 0)
      .map(([category, data]) => ({
        category,
        label: EXPENSE_CATEGORY_LABELS[category] || category,
        ...data
      }))
      .sort((a, b) => b.amount - a.amount);
  };

  return (
    <div className="monthly-expense-report">
      <div className="report-header">
        <div className="header-content">
          <h2>Monthly Expense Report</h2>
          <p>Comprehensive analysis of monthly expenses</p>
        </div>
        <div className="date-selectors">
          <div className="selector-group">
            <label htmlFor="year-select" className="selector-label">Year:</label>
            <select
              id="year-select"
              value={selectedYear}
              onChange={handleYearChange}
              className="selector-input"
            >
              {generateYearOptions().map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <div className="selector-group">
            <label htmlFor="month-select" className="selector-label">Month:</label>
            <select
              id="month-select"
              value={selectedMonth}
              onChange={handleMonthChange}
              className="selector-input"
            >
              {monthOptions.map(month => (
                <option key={month.value} value={month.value}>{month.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading monthly report...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Report</h3>
          <p>{error}</p>
          <button 
            onClick={() => loadMonthlyReport(selectedYear, selectedMonth)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {reportData && !loading && (
        <div className="report-content">
          <div className="report-title">
            <h3>{reportData.monthName} {reportData.year}</h3>
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
                <div className="card-label">Total Transactions</div>
              </div>
            </div>

            <div className="summary-card average">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-value">{expenseService.formatCurrency(reportData.summary.averageDaily)}</div>
                <div className="card-label">Daily Average</div>
              </div>
            </div>

            <div className="summary-card payment">
              <div className="card-icon">💳</div>
              <div className="card-content">
                <div className="card-value">
                  {Math.round((reportData.summary.paymentModeBreakdown.online / reportData.summary.totalAmount) * 100)}%
                </div>
                <div className="card-label">Digital Payments</div>
              </div>
            </div>
          </div>

          {/* View Mode Tabs */}
          <div className="view-tabs">
            <button
              className={`tab ${viewMode === 'summary' ? 'active' : ''}`}
              onClick={() => setViewMode('summary')}
            >
              Summary
            </button>
            <button
              className={`tab ${viewMode === 'daily' ? 'active' : ''}`}
              onClick={() => setViewMode('daily')}
            >
              Daily Breakdown
            </button>
            <button
              className={`tab ${viewMode === 'categories' ? 'active' : ''}`}
              onClick={() => setViewMode('categories')}
            >
              Categories
            </button>
          </div>

          {/* Summary View */}
          {viewMode === 'summary' && (
            <div className="summary-view">
              <div className="summary-grid">
                <div className="summary-section">
                  <h4>Payment Mode Breakdown</h4>
                  <div className="payment-breakdown">
                    <div className="payment-item">
                      <div className="payment-info">
                        <span className="payment-label">Cash Payments</span>
                        <span className="payment-amount">
                          {expenseService.formatCurrency(reportData.summary.paymentModeBreakdown.cash)}
                        </span>
                      </div>
                      <div className="payment-bar">
                        <div 
                          className="payment-fill cash"
                          style={{ 
                            width: `${(reportData.summary.paymentModeBreakdown.cash / reportData.summary.totalAmount) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="payment-item">
                      <div className="payment-info">
                        <span className="payment-label">Online Payments</span>
                        <span className="payment-amount">
                          {expenseService.formatCurrency(reportData.summary.paymentModeBreakdown.online)}
                        </span>
                      </div>
                      <div className="payment-bar">
                        <div 
                          className="payment-fill online"
                          style={{ 
                            width: `${(reportData.summary.paymentModeBreakdown.online / reportData.summary.totalAmount) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="summary-section">
                  <h4>Top Categories</h4>
                  <div className="top-categories">
                    {getCategoryExpensesSorted().slice(0, 5).map(category => (
                      <div key={category.category} className="category-item">
                        <div className="category-info">
                          <span className="category-name">{category.label}</span>
                          <span className="category-amount">
                            {expenseService.formatCurrency(category.amount)}
                          </span>
                        </div>
                        <div className="category-details">
                          <span className="category-count">{category.count} expenses</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Daily Breakdown View */}
          {viewMode === 'daily' && (
            <div className="daily-view">
              <h4>Daily Expense Breakdown</h4>
              <div className="daily-grid">
                {getDailyExpensesSorted().map(day => (
                  <div key={day.day} className="daily-item">
                    <div className="daily-header">
                      <div className="daily-date">
                        {new Date(reportData.year, reportData.month - 1, day.day).toLocaleDateString('en-IN', {
                          weekday: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div className="daily-amount">
                        {expenseService.formatCurrency(day.totalAmount)}
                      </div>
                    </div>
                    <div className="daily-details">
                      <span className="daily-count">{day.expenses.length} expenses</span>
                      <div className="daily-bar">
                        <div 
                          className="daily-fill"
                          style={{ 
                            width: `${(day.totalAmount / Math.max(...getDailyExpensesSorted().map(d => d.totalAmount))) * 100}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Categories View */}
          {viewMode === 'categories' && (
            <div className="categories-view">
              <h4>Category-wise Analysis</h4>
              <div className="categories-grid">
                {getCategoryExpensesSorted().map(category => (
                  <div key={category.category} className="category-card">
                    <div className="category-header">
                      <div className="category-title">{category.label}</div>
                      <div className="category-amount">{expenseService.formatCurrency(category.amount)}</div>
                    </div>
                    <div className="category-stats">
                      <div className="stat">
                        <span className="stat-label">Expenses</span>
                        <span className="stat-value">{category.count}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">Average</span>
                        <span className="stat-value">{expenseService.formatCurrency(category.averageAmount)}</span>
                      </div>
                      <div className="stat">
                        <span className="stat-label">% of Total</span>
                        <span className="stat-value">
                          {Math.round((category.amount / reportData.summary.totalAmount) * 100)}%
                        </span>
                      </div>
                    </div>
                    <div className="category-progress">
                      <div 
                        className="category-progress-fill"
                        style={{ 
                          width: `${(category.amount / reportData.summary.totalAmount) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .monthly-expense-report {
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

        .date-selectors {
          display: flex;
          gap: 1rem;
        }

        .selector-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .selector-label {
          color: #333;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .selector-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          background: #fff;
        }

        .selector-input:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        .loading-state, .error-state {
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

        .error-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-state h3 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .error-state p {
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
        }

        .summary-card.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .summary-card.count {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
        }

        .summary-card.average {
          background: #f0fdf4;
          border: 1px solid #22c55e;
        }

        .summary-card.payment {
          background: #fef3c7;
          border: 1px solid #f59e0b;
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

        .view-tabs {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
          margin-bottom: 2rem;
        }

        .tab {
          padding: 1rem 1.5rem;
          border: none;
          background: none;
          cursor: pointer;
          border-bottom: 2px solid transparent;
          transition: all 0.2s ease;
          color: #666;
          font-weight: 500;
        }

        .tab:hover {
          color: #333;
          background: #f8f9fa;
        }

        .tab.active {
          color: #4285f4;
          border-bottom-color: #4285f4;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
        }

        .summary-section h4 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .payment-breakdown, .top-categories {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .payment-item, .category-item {
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #fff;
        }

        .payment-info, .category-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .payment-label, .category-name {
          font-weight: 500;
          color: #333;
        }

        .payment-amount, .category-amount {
          font-weight: 600;
          color: #4285f4;
        }

        .payment-bar, .category-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .payment-bar {
          background: #f0f0f0;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
          flex: 1;
        }

        .payment-fill {
          height: 100%;
          transition: width 0.3s ease;
        }

        .payment-fill.cash {
          background: #22c55e;
        }

        .payment-fill.online {
          background: #3b82f6;
        }

        .category-count {
          font-size: 0.8rem;
          color: #666;
        }

        .daily-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
          gap: 1rem;
        }

        .daily-item {
          padding: 1rem;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
          background: #fff;
        }

        .daily-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .daily-date {
          font-weight: 500;
          color: #333;
        }

        .daily-amount {
          font-weight: 600;
          color: #4285f4;
        }

        .daily-details {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .daily-count {
          font-size: 0.8rem;
          color: #666;
          white-space: nowrap;
        }

        .daily-bar {
          flex: 1;
          background: #f0f0f0;
          height: 6px;
          border-radius: 3px;
          overflow: hidden;
        }

        .daily-fill {
          height: 100%;
          background: linear-gradient(90deg, #4285f4, #34a853);
          transition: width 0.3s ease;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .category-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fff;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .category-title {
          font-weight: 600;
          color: #333;
          font-size: 1rem;
        }

        .category-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat {
          text-align: center;
        }

        .stat-label {
          display: block;
          font-size: 0.7rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.25rem;
        }

        .stat-value {
          display: block;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .category-progress {
          background: #f0f0f0;
          height: 4px;
          border-radius: 2px;
          overflow: hidden;
        }

        .category-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4285f4, #34a853);
          transition: width 0.3s ease;
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

          .date-selectors {
            align-self: stretch;
            justify-content: space-between;
          }

          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .summary-grid {
            grid-template-columns: 1fr;
          }

          .daily-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .category-stats {
            grid-template-columns: repeat(3, 1fr);
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}