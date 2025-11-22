import { useState, useEffect } from 'react';
import expenseService, { 
  EXPENSE_CATEGORY_LABELS, 
  PAYMENT_MODE_LABELS 
} from '../../lib/services/expenseService';

export default function CategorySummary({ startDate, endDate, onDateChange }) {
  const [summaryData, setSummaryData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [sortBy, setSortBy] = useState('amount'); // 'amount' | 'count' | 'average'
  const [sortOrder, setSortOrder] = useState('desc'); // 'asc' | 'desc'

  // Load summary data when dates change
  useEffect(() => {
    if (startDate && endDate) {
      loadCategorySummary(startDate, endDate);
    }
  }, [startDate, endDate]);

  // Load category summary
  const loadCategorySummary = async (start, end) => {
    setLoading(true);
    setError('');

    try {
      const result = await expenseService.getCategorySummary(start, end);
      
      if (result.success) {
        setSummaryData(result);
      } else {
        setError(result.error);
        setSummaryData(null);
      }
    } catch (err) {
      console.error('Error loading category summary:', err);
      setError('Failed to load category summary');
      setSummaryData(null);
    } finally {
      setLoading(false);
    }
  };

  // Handle start date change
  const handleStartDateChange = (e) => {
    const newStartDate = e.target.value;
    onDateChange(newStartDate, endDate);
  };

  // Handle end date change
  const handleEndDateChange = (e) => {
    const newEndDate = e.target.value;
    onDateChange(startDate, newEndDate);
  };

  // Handle sort change
  const handleSortChange = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // Get sorted categories
  const getSortedCategories = () => {
    if (!summaryData || !summaryData.categorySummary) return [];
    
    return [...summaryData.categorySummary]
      .filter(category => category.count > 0)
      .sort((a, b) => {
        let aValue = a[sortBy];
        let bValue = b[sortBy];
        
        if (sortOrder === 'asc') {
          return aValue - bValue;
        } else {
          return bValue - aValue;
        }
      });
  };

  // Calculate date range info
  const getDateRangeInfo = () => {
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    return `${days} day${days === 1 ? '' : 's'}`;
  };

  // Format percentage
  const formatPercentage = (value, total) => {
    if (total === 0) return '0%';
    return `${Math.round((value / total) * 100)}%`;
  };

  // Get sort icon
  const getSortIcon = (field) => {
    if (sortBy === field) {
      return sortOrder === 'asc' ? '↑' : '↓';
    }
    return '↕';
  };

  return (
    <div className="category-summary">
      <div className="summary-header">
        <div className="header-content">
          <h2>Category-wise Summary</h2>
          <p>Analyze expenses by category for any date range</p>
        </div>
        <div className="date-range-selector">
          <div className="date-group">
            <label htmlFor="start-date" className="date-label">From:</label>
            <input
              type="date"
              id="start-date"
              value={startDate}
              onChange={handleStartDateChange}
              className="date-input"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
          <div className="date-group">
            <label htmlFor="end-date" className="date-label">To:</label>
            <input
              type="date"
              id="end-date"
              value={endDate}
              onChange={handleEndDateChange}
              className="date-input"
              min={startDate}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>
        </div>
      </div>

      {loading && (
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading category summary...</p>
        </div>
      )}

      {error && (
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Summary</h3>
          <p>{error}</p>
          <button 
            onClick={() => loadCategorySummary(startDate, endDate)}
            className="btn btn-primary"
          >
            Try Again
          </button>
        </div>
      )}

      {summaryData && !loading && (
        <div className="summary-content">
          <div className="summary-title">
            <h3>
              {new Date(startDate).toLocaleDateString('en-IN')} - {new Date(endDate).toLocaleDateString('en-IN')}
              <span className="date-range-info">({getDateRangeInfo()})</span>
            </h3>
          </div>

          {/* Overall Summary Cards */}
          <div className="overview-cards">
            <div className="overview-card total">
              <div className="card-icon">💰</div>
              <div className="card-content">
                <div className="card-value">{expenseService.formatCurrency(summaryData.totalAmount)}</div>
                <div className="card-label">Total Amount</div>
              </div>
            </div>
            
            <div className="overview-card count">
              <div className="card-icon">📊</div>
              <div className="card-content">
                <div className="card-value">{summaryData.totalExpenses}</div>
                <div className="card-label">Total Expenses</div>
              </div>
            </div>

            <div className="overview-card categories">
              <div className="card-icon">📋</div>
              <div className="card-content">
                <div className="card-value">{getSortedCategories().length}</div>
                <div className="card-label">Active Categories</div>
              </div>
            </div>

            <div className="overview-card average">
              <div className="card-icon">📈</div>
              <div className="card-content">
                <div className="card-value">
                  {summaryData.totalExpenses > 0 
                    ? expenseService.formatCurrency(summaryData.totalAmount / summaryData.totalExpenses)
                    : expenseService.formatCurrency(0)
                  }
                </div>
                <div className="card-label">Average per Expense</div>
              </div>
            </div>
          </div>

          {getSortedCategories().length > 0 ? (
            <>
              {/* Sort Controls */}
              <div className="sort-controls">
                <span className="sort-label">Sort by:</span>
                <div className="sort-buttons">
                  <button
                    className={`sort-btn ${sortBy === 'amount' ? 'active' : ''}`}
                    onClick={() => handleSortChange('amount')}
                  >
                    Amount {getSortIcon('amount')}
                  </button>
                  <button
                    className={`sort-btn ${sortBy === 'count' ? 'active' : ''}`}
                    onClick={() => handleSortChange('count')}
                  >
                    Count {getSortIcon('count')}
                  </button>
                  <button
                    className={`sort-btn ${sortBy === 'averageAmount' ? 'active' : ''}`}
                    onClick={() => handleSortChange('averageAmount')}
                  >
                    Average {getSortIcon('averageAmount')}
                  </button>
                </div>
              </div>

              {/* Category Grid */}
              <div className="categories-grid">
                {getSortedCategories().map((category, index) => (
                  <div 
                    key={category.category} 
                    className={`category-card ${selectedCategory === category.category ? 'selected' : ''}`}
                    onClick={() => setSelectedCategory(selectedCategory === category.category ? null : category.category)}
                  >
                    <div className="category-rank">#{index + 1}</div>
                    <div className="category-header">
                      <div className="category-title">{category.label}</div>
                      <div className="category-percentage">
                        {formatPercentage(category.totalAmount, summaryData.totalAmount)}
                      </div>
                    </div>
                    
                    <div className="category-amount">
                      {expenseService.formatCurrency(category.totalAmount)}
                    </div>
                    
                    <div className="category-stats">
                      <div className="stat">
                        <span className="stat-value">{category.count}</span>
                        <span className="stat-label">Expenses</span>
                      </div>
                      <div className="stat">
                        <span className="stat-value">{expenseService.formatCurrency(category.averageAmount)}</span>
                        <span className="stat-label">Average</span>
                      </div>
                    </div>
                    
                    <div className="category-progress">
                      <div 
                        className="category-progress-fill"
                        style={{ 
                          width: `${(category.totalAmount / summaryData.totalAmount) * 100}%` 
                        }}
                      ></div>
                    </div>

                    {selectedCategory === category.category && (
                      <div className="category-details">
                        <h5>Recent Expenses in this Category</h5>
                        <div className="expense-list">
                          {category.expenses.slice(0, 5).map(expense => (
                            <div key={expense.id} className="expense-item">
                              <div className="expense-info">
                                <div className="expense-date">
                                  {new Date(expense.date).toLocaleDateString('en-IN')}
                                </div>
                                <div className="expense-amount">
                                  {expenseService.formatCurrency(expense.amount)}
                                </div>
                              </div>
                              <div className="expense-details-info">
                                {expense.vendor && (
                                  <span className="expense-vendor">{expense.vendor}</span>
                                )}
                                <span className={`expense-payment ${expense.paymentMode}`}>
                                  {PAYMENT_MODE_LABELS[expense.paymentMode]}
                                </span>
                              </div>
                              {expense.description && (
                                <div className="expense-description">
                                  {expense.description.length > 60 
                                    ? `${expense.description.substring(0, 60)}...` 
                                    : expense.description
                                  }
                                </div>
                              )}
                            </div>
                          ))}
                          {category.expenses.length > 5 && (
                            <div className="more-expenses">
                              +{category.expenses.length - 5} more expenses
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-categories">
              <div className="no-categories-icon">📊</div>
              <h4>No Expenses in Date Range</h4>
              <p>No expenses were found for the selected date range.</p>
            </div>
          )}
        </div>
      )}

      <style jsx>{`
        .category-summary {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .summary-header {
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

        .date-range-selector {
          display: flex;
          gap: 1rem;
        }

        .date-group {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .date-label {
          color: #333;
          font-weight: 500;
          font-size: 0.8rem;
        }

        .date-input {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
          background: #fff;
        }

        .date-input:focus {
          outline: none;
          border-color: #4285f4;
          box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
        }

        .loading-state, .error-state, .no-categories {
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

        .error-icon, .no-categories-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }

        .error-state h3, .no-categories h4 {
          margin: 0 0 0.5rem 0;
          color: #333;
        }

        .error-state p, .no-categories p {
          margin: 0 0 1rem 0;
          color: #666;
        }

        .summary-content {
          padding: 1.5rem;
        }

        .summary-title h3 {
          margin: 0 0 1.5rem 0;
          color: #333;
          font-size: 1.25rem;
          text-align: center;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .date-range-info {
          font-size: 0.9rem;
          color: #666;
          font-weight: normal;
          margin-left: 0.5rem;
        }

        .overview-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .overview-card {
          display: flex;
          align-items: center;
          padding: 1.5rem;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .overview-card.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }

        .overview-card.count {
          background: #f0f9ff;
          border: 1px solid #0ea5e9;
        }

        .overview-card.categories {
          background: #f0fdf4;
          border: 1px solid #22c55e;
        }

        .overview-card.average {
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

        .sort-controls {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e0e0e0;
        }

        .sort-label {
          color: #333;
          font-weight: 500;
        }

        .sort-buttons {
          display: flex;
          gap: 0.5rem;
        }

        .sort-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: #fff;
          color: #666;
          cursor: pointer;
          border-radius: 4px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
        }

        .sort-btn:hover {
          background: #f8f9fa;
          border-color: #bbb;
        }

        .sort-btn.active {
          background: #4285f4;
          color: white;
          border-color: #4285f4;
        }

        .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
          gap: 1rem;
        }

        .category-card {
          padding: 1.5rem;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          background: #fff;
          cursor: pointer;
          transition: all 0.2s ease;
          position: relative;
        }

        .category-card:hover {
          border-color: #4285f4;
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }

        .category-card.selected {
          border-color: #4285f4;
          box-shadow: 0 4px 12px rgba(66, 133, 244, 0.2);
        }

        .category-rank {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: #4285f4;
          color: white;
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .category-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          margin-right: 2.5rem;
        }

        .category-title {
          font-weight: 600;
          color: #333;
          font-size: 1rem;
          line-height: 1.2;
        }

        .category-percentage {
          background: #e8f4fd;
          color: #1976d2;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .category-amount {
          font-size: 1.5rem;
          font-weight: 700;
          color: #4285f4;
          margin-bottom: 1rem;
        }

        .category-stats {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .stat {
          text-align: center;
        }

        .stat-value {
          display: block;
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
          margin-bottom: 0.25rem;
        }

        .stat-label {
          display: block;
          font-size: 0.7rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .category-progress {
          background: #f0f0f0;
          height: 4px;
          border-radius: 2px;
          overflow: hidden;
          margin-bottom: 1rem;
        }

        .category-progress-fill {
          height: 100%;
          background: linear-gradient(90deg, #4285f4, #34a853);
          transition: width 0.3s ease;
        }

        .category-details {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #e0e0e0;
        }

        .category-details h5 {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 0.9rem;
          font-weight: 600;
        }

        .expense-list {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .expense-item {
          padding: 0.75rem;
          background: #f8f9fa;
          border-radius: 4px;
          border: 1px solid #e9ecef;
        }

        .expense-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .expense-date {
          font-size: 0.8rem;
          color: #666;
        }

        .expense-amount {
          font-weight: 600;
          color: #333;
          font-size: 0.9rem;
        }

        .expense-details-info {
          display: flex;
          gap: 0.5rem;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .expense-vendor {
          font-size: 0.8rem;
          color: #666;
          background: #e9ecef;
          padding: 0.125rem 0.5rem;
          border-radius: 8px;
        }

        .expense-payment {
          font-size: 0.7rem;
          padding: 0.125rem 0.5rem;
          border-radius: 8px;
          text-transform: uppercase;
          font-weight: 500;
        }

        .expense-payment.cash {
          background: #e6fffa;
          color: #047857;
        }

        .expense-payment.online {
          background: #eff6ff;
          color: #1e40af;
        }

        .expense-description {
          font-size: 0.8rem;
          color: #666;
          font-style: italic;
        }

        .more-expenses {
          text-align: center;
          color: #666;
          font-size: 0.8rem;
          padding: 0.5rem;
          background: #f8f9fa;
          border-radius: 4px;
          font-style: italic;
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
          .summary-header {
            flex-direction: column;
            gap: 1rem;
          }

          .date-range-selector {
            align-self: stretch;
            justify-content: space-between;
          }

          .overview-cards {
            grid-template-columns: repeat(2, 1fr);
          }

          .sort-controls {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }

          .categories-grid {
            grid-template-columns: 1fr;
          }

          .category-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}