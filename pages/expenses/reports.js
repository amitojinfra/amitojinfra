import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../../components/layout/Layout';
import DailyExpenseReport from '../../components/expenses/DailyExpenseReport';
import MonthlyExpenseReport from '../../components/expenses/MonthlyExpenseReport';
import CategorySummary from '../../components/expenses/CategorySummary';

export default function ExpenseReports() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('daily');
  
  // Daily report state
  const [dailyDate, setDailyDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Monthly report state
  const [monthlyYear, setMonthlyYear] = useState(new Date().getFullYear());
  const [monthlyMonth, setMonthlyMonth] = useState(new Date().getMonth() + 1);
  
  // Category summary state
  const [categoryStartDate, setCategoryStartDate] = useState(() => {
    const date = new Date();
    date.setDate(date.getDate() - 30); // Default to last 30 days
    return date.toISOString().split('T')[0];
  });
  const [categoryEndDate, setCategoryEndDate] = useState(new Date().toISOString().split('T')[0]);

  // Handle URL query params for active tab
  useEffect(() => {
    if (router.query.tab) {
      setActiveTab(router.query.tab);
    }
  }, [router.query.tab]);

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    router.push({
      pathname: router.pathname,
      query: { ...router.query, tab }
    }, undefined, { shallow: true });
  };

  // Handle daily date change
  const handleDailyDateChange = (date) => {
    setDailyDate(date);
  };

  // Handle monthly date change
  const handleMonthlyDateChange = (year, month) => {
    setMonthlyYear(year);
    setMonthlyMonth(month);
  };

  // Handle category date range change
  const handleCategoryDateChange = (startDate, endDate) => {
    setCategoryStartDate(startDate);
    setCategoryEndDate(endDate);
  };

  // Quick date range presets for category summary
  const handleQuickDatePreset = (preset) => {
    const today = new Date();
    let startDate, endDate;

    switch (preset) {
      case 'today':
        startDate = endDate = today.toISOString().split('T')[0];
        break;
      case 'week':
        startDate = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
        endDate = today;
        break;
      case 'month':
        startDate = new Date(today.getFullYear(), today.getMonth(), 1);
        endDate = today;
        break;
      case 'quarter':
        const quarterStart = new Date(today.getFullYear(), Math.floor(today.getMonth() / 3) * 3, 1);
        startDate = quarterStart;
        endDate = today;
        break;
      case 'year':
        startDate = new Date(today.getFullYear(), 0, 1);
        endDate = today;
        break;
      default:
        startDate = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
        endDate = today;
    }

    setCategoryStartDate(startDate.toISOString().split('T')[0]);
    setCategoryEndDate(endDate.toISOString().split('T')[0]);
  };

  return (
    <Layout>
      <Head>
        <title>Expense Reports & Dashboard - Infrastructure Pole Deployment</title>
        <meta name="description" content="Comprehensive expense reports and analytics dashboard" />
      </Head>

      <div className="expense-reports">
        <div className="page-header">
          <div className="header-content">
            <h1>Expense Reports & Dashboard</h1>
            <p>Comprehensive analytics and insights into your expense data</p>
          </div>
          <div className="header-actions">
            <Link href="/expenses" className="btn btn-outline">
              Back to Expenses
            </Link>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="report-tabs">
          <div className="tabs-container">
            <button
              className={`tab ${activeTab === 'daily' ? 'active' : ''}`}
              onClick={() => handleTabChange('daily')}
            >
              <span className="tab-icon">📅</span>
              <span className="tab-label">Daily Report</span>
            </button>
            <button
              className={`tab ${activeTab === 'monthly' ? 'active' : ''}`}
              onClick={() => handleTabChange('monthly')}
            >
              <span className="tab-icon">📊</span>
              <span className="tab-label">Monthly Report</span>
            </button>
            <button
              className={`tab ${activeTab === 'categories' ? 'active' : ''}`}
              onClick={() => handleTabChange('categories')}
            >
              <span className="tab-icon">🏷️</span>
              <span className="tab-label">Category Analysis</span>
            </button>
          </div>
        </div>

        {/* Report Content */}
        <div className="report-content">
          {activeTab === 'daily' && (
            <div className="report-section">
              <DailyExpenseReport
                selectedDate={dailyDate}
                onDateChange={handleDailyDateChange}
              />
            </div>
          )}

          {activeTab === 'monthly' && (
            <div className="report-section">
              <MonthlyExpenseReport
                selectedYear={monthlyYear}
                selectedMonth={monthlyMonth}
                onDateChange={handleMonthlyDateChange}
              />
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="report-section">
              {/* Quick Date Presets */}
              <div className="quick-presets">
                <div className="presets-header">
                  <h3>Quick Date Ranges</h3>
                </div>
                <div className="presets-grid">
                  <button
                    className="preset-btn"
                    onClick={() => handleQuickDatePreset('today')}
                  >
                    Today
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => handleQuickDatePreset('week')}
                  >
                    Last 7 Days
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => handleQuickDatePreset('month')}
                  >
                    This Month
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => handleQuickDatePreset('quarter')}
                  >
                    This Quarter
                  </button>
                  <button
                    className="preset-btn"
                    onClick={() => handleQuickDatePreset('year')}
                  >
                    This Year
                  </button>
                </div>
              </div>

              <CategorySummary
                startDate={categoryStartDate}
                endDate={categoryEndDate}
                onDateChange={handleCategoryDateChange}
              />
            </div>
          )}
        </div>

        {/* Help Section */}
        <div className="help-section">
          <div className="help-content">
            <h3>📋 Reports Guide</h3>
            <div className="help-grid">
              <div className="help-item">
                <div className="help-icon">📅</div>
                <div className="help-text">
                  <h4>Daily Report</h4>
                  <p>View detailed breakdown of expenses for any specific day, including category-wise analysis and payment methods.</p>
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">📊</div>
                <div className="help-text">
                  <h4>Monthly Report</h4>
                  <p>Comprehensive monthly analysis with daily trends, category breakdowns, and spending patterns.</p>
                </div>
              </div>
              <div className="help-item">
                <div className="help-icon">🏷️</div>
                <div className="help-text">
                  <h4>Category Analysis</h4>
                  <p>Compare spending across different expense categories for any custom date range with detailed insights.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .expense-reports {
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
        }

        .report-tabs {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 2rem;
          overflow: hidden;
        }

        .tabs-container {
          display: flex;
          border-bottom: 1px solid #e0e0e0;
        }

        .tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1.5rem;
          border: none;
          background: #f8f9fa;
          cursor: pointer;
          transition: all 0.2s ease;
          border-bottom: 3px solid transparent;
        }

        .tab:hover {
          background: #e9ecef;
        }

        .tab.active {
          background: #fff;
          border-bottom-color: #4285f4;
          color: #4285f4;
        }

        .tab-icon {
          font-size: 1.5rem;
        }

        .tab-label {
          font-weight: 500;
          font-size: 1rem;
        }

        .report-content {
          margin-bottom: 2rem;
        }

        .report-section {
          animation: fadeIn 0.3s ease;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .quick-presets {
          background: #fff;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 1rem;
          overflow: hidden;
        }

        .presets-header {
          padding: 1rem 1.5rem;
          background: #f8f9fa;
          border-bottom: 1px solid #e0e0e0;
        }

        .presets-header h3 {
          margin: 0;
          color: #333;
          font-size: 1rem;
          font-weight: 600;
        }

        .presets-grid {
          display: flex;
          gap: 0.5rem;
          padding: 1rem 1.5rem;
          flex-wrap: wrap;
        }

        .preset-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: #fff;
          color: #666;
          cursor: pointer;
          border-radius: 20px;
          font-size: 0.9rem;
          transition: all 0.2s ease;
          white-space: nowrap;
        }

        .preset-btn:hover {
          background: #f8f9fa;
          border-color: #4285f4;
          color: #4285f4;
        }

        .help-section {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          border-radius: 8px;
          padding: 2rem;
          color: white;
        }

        .help-content h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.5rem;
          font-weight: 600;
          text-align: center;
        }

        .help-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }

        .help-item {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
        }

        .help-icon {
          font-size: 2rem;
          flex-shrink: 0;
        }

        .help-text h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .help-text p {
          margin: 0;
          opacity: 0.9;
          line-height: 1.5;
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

        .btn-outline {
          background: transparent;
          color: #4285f4;
          border: 1px solid #4285f4;
        }

        .btn-outline:hover {
          background: #4285f4;
          color: white;
        }

        @media (max-width: 768px) {
          .expense-reports {
            padding: 1rem;
          }

          .page-header {
            flex-direction: column;
            gap: 1rem;
            align-items: stretch;
          }

          .tabs-container {
            flex-direction: column;
          }

          .tab {
            padding: 1rem;
            justify-content: flex-start;
            border-left: 3px solid transparent;
            border-bottom: none;
          }

          .tab.active {
            border-left-color: #4285f4;
            border-bottom-color: transparent;
          }

          .presets-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .help-grid {
            grid-template-columns: 1fr;
          }

          .help-item {
            flex-direction: column;
            text-align: center;
          }
        }
      `}</style>
    </Layout>
  );
}