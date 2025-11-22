import { useState } from 'react';
import salaryService from '../../lib/services/salaryService';

const SalaryReport = ({ 
  salaryData = null, 
  onBack = null,
  onRecalculate = null 
}) => {
  const [showAttendanceDetails, setShowAttendanceDetails] = useState(false);
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);

  if (!salaryData) {
    return (
      <div className="salary-report">
        <div className="no-data">
          <p>No salary calculation data available.</p>
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              Back to Form
            </button>
          )}
        </div>
      </div>
    );
  }

  // Format currency
  const formatCurrency = (amount) => {
    return salaryService.formatCurrency(amount);
  };

  // Format hours
  const formatHours = (hours) => {
    return salaryService.formatHours(hours);
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format percentage
  const formatPercentage = (value) => {
    return `${value}%`;
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Get status color class
  const getStatusClass = (status) => {
    switch (status) {
      case 'due':
        return 'status-due';
      case 'overpaid':
        return 'status-overpaid';
      default:
        return '';
    }
  };

  const { employee, period, rates, attendance, financial, payments, attendanceRecords } = salaryData;

  return (
    <div className="salary-report">
      {/* Report Header */}
      <div className="report-header">
        <div className="header-content">
          <h1>Salary Calculation Report</h1>
          <div className="report-info">
            <span>Generated on: {formatDate(salaryData.calculatedAt)}</span>
          </div>
        </div>
        <div className="header-actions">
          {onBack && (
            <button onClick={onBack} className="btn-secondary">
              ← Back to Form
            </button>
          )}
          {onRecalculate && (
            <button onClick={onRecalculate} className="btn-primary">
              Recalculate
            </button>
          )}
          <button onClick={handlePrint} className="btn-print">
            🖨️ Print Report
          </button>
        </div>
      </div>

      {/* Employee Information */}
      <div className="report-section">
        <h2>Employee Information</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Name:</span>
            <span className="info-value">{employee.name}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Employee Code:</span>
            <span className="info-value">{employee.employee_code}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Designation:</span>
            <span className="info-value">{employee.designation}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Employee ID:</span>
            <span className="info-value">{employee.id}</span>
          </div>
        </div>
      </div>

      {/* Period Information */}
      <div className="report-section">
        <h2>Calculation Period</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Start Date:</span>
            <span className="info-value">{formatDate(period.startDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">End Date:</span>
            <span className="info-value">{formatDate(period.endDate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Total Days:</span>
            <span className="info-value">{period.totalDays} days</span>
          </div>
          <div className="info-item">
            <span className="info-label">Working Days:</span>
            <span className="info-value">{period.workingDays} days</span>
          </div>
        </div>
      </div>

      {/* Rate Information */}
      <div className="report-section">
        <h2>Rate Configuration</h2>
        <div className="info-grid">
          <div className="info-item">
            <span className="info-label">Hourly Rate:</span>
            <span className="info-value">{formatCurrency(rates.hourlyRate)}</span>
          </div>
          <div className="info-item">
            <span className="info-label">Expected Daily Hours:</span>
            <span className="info-value">{rates.dailyHours} hours</span>
          </div>
          <div className="info-item">
            <span className="info-label">Daily Rate:</span>
            <span className="info-value">{formatCurrency(rates.dailyRate)}</span>
          </div>
        </div>
      </div>

      {/* Attendance Summary */}
      <div className="report-section">
        <h2>Attendance Summary</h2>
        <div className="summary-cards">
          <div className="summary-card">
            <div className="card-value">{attendance.totalRecords}</div>
            <div className="card-label">Total Records</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{attendance.workingDays}</div>
            <div className="card-label">Working Days</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{formatHours(attendance.totalHours)}</div>
            <div className="card-label">Total Hours</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{formatPercentage(attendance.attendancePercentage)}</div>
            <div className="card-label">Attendance Rate</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{attendance.fullDays}</div>
            <div className="card-label">Full Days</div>
          </div>
          <div className="summary-card">
            <div className="card-value">{attendance.partialDays}</div>
            <div className="card-label">Partial Days</div>
          </div>
        </div>

        {attendance.overtimeHours > 0 && (
          <div className="overtime-info">
            <span className="overtime-label">Overtime Hours:</span>
            <span className="overtime-value">{formatHours(attendance.overtimeHours)}</span>
          </div>
        )}

        {attendance.undertimeHours > 0 && (
          <div className="undertime-info">
            <span className="undertime-label">Undertime Hours:</span>
            <span className="undertime-value">{formatHours(attendance.undertimeHours)}</span>
          </div>
        )}

        {/* Attendance Details Toggle */}
        <div className="details-toggle">
          <button
            onClick={() => setShowAttendanceDetails(!showAttendanceDetails)}
            className="toggle-button"
          >
            {showAttendanceDetails ? '▼' : '▶'} View Attendance Details
          </button>
        </div>

        {/* Attendance Details */}
        {showAttendanceDetails && (
          <div className="attendance-details">
            <table className="details-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Status</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Type</th>
                  <th>Overtime</th>
                </tr>
              </thead>
              <tbody>
                {attendance.details.map((record, index) => (
                  <tr key={index} className={`status-${record.status.toLowerCase()}`}>
                    <td>{formatDate(record.date)}</td>
                    <td>
                      <span className={`status-badge ${record.status.toLowerCase()}`}>
                        {record.status}
                      </span>
                    </td>
                    <td>{record.checkIn || '-'}</td>
                    <td>{record.checkOut || '-'}</td>
                    <td>{record.hoursWorked > 0 ? formatHours(record.hoursWorked) : '-'}</td>
                    <td>
                      <span className={`type-badge ${record.type}`}>
                        {record.type}
                      </span>
                    </td>
                    <td>{record.overtime > 0 ? formatHours(record.overtime) : '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Financial Summary */}
      <div className="report-section">
        <h2>Financial Summary</h2>
        <div className="financial-summary">
          <div className="financial-item">
            <span className="financial-label">Gross Salary:</span>
            <span className="financial-value gross">{formatCurrency(financial.grossSalary)}</span>
          </div>
          <div className="financial-item">
            <span className="financial-label">Total Payments:</span>
            <span className="financial-value payments">-{formatCurrency(financial.totalPayments)}</span>
          </div>
          <div className="financial-separator"></div>
          <div className="financial-item final">
            <span className="financial-label">Net Salary:</span>
            <span className={`financial-value net ${getStatusClass(financial.netSalaryStatus)}`}>
              {formatCurrency(Math.abs(financial.netSalary))}
              <span className="status-text">
                ({financial.netSalaryStatus === 'due' ? 'Due' : 'Overpaid'})
              </span>
            </span>
          </div>
        </div>

        {/* Payment Details Toggle */}
        {payments.length > 0 && (
          <div className="details-toggle">
            <button
              onClick={() => setShowPaymentDetails(!showPaymentDetails)}
              className="toggle-button"
            >
              {showPaymentDetails ? '▼' : '▶'} View Payment Details ({payments.length} payments)
            </button>
          </div>
        )}

        {/* Payment Details */}
        {showPaymentDetails && payments.length > 0 && (
          <div className="payment-details">
            <table className="details-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Amount</th>
                  <th>Mode</th>
                  <th>Paid By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment) => (
                  <tr key={payment.id}>
                    <td>{formatDate(payment.payment_date)}</td>
                    <td className="amount">{formatCurrency(payment.amount)}</td>
                    <td>
                      <span className={`payment-mode ${payment.payment_mode.toLowerCase()}`}>
                        {payment.payment_mode}
                      </span>
                    </td>
                    <td>{payment.paid_by}</td>
                    <td>{payment.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Calculation Notes */}
      <div className="report-section">
        <h2>Calculation Notes</h2>
        <div className="calculation-notes">
          <ul>
            <li>Gross salary is calculated as: Total Hours Worked × Hourly Rate</li>
            <li>Net salary is calculated as: Gross Salary - Total Payments Made</li>
            <li>Only attendance records marked as "Present" are considered for salary calculation</li>
            <li>Overtime hours are included in the total hours calculation</li>
            <li>Partial days are calculated based on actual check-in and check-out times</li>
            <li>All payments made within the selected date range are considered</li>
            {financial.netSalaryStatus === 'overpaid' && (
              <li className="note-warning">
                <strong>Note:</strong> Employee has been overpaid by {formatCurrency(Math.abs(financial.netSalary))}
              </li>
            )}
          </ul>
        </div>
      </div>

      <style jsx>{`
        .salary-report {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          background: white;
        }

        .no-data {
          text-align: center;
          padding: 40px;
          color: #6b7280;
        }

        .report-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }

        .header-content h1 {
          color: #1f2937;
          margin: 0 0 8px 0;
          font-size: 1.8rem;
          font-weight: 700;
        }

        .report-info {
          color: #6b7280;
          font-size: 0.9rem;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-primary,
        .btn-secondary,
        .btn-print {
          padding: 10px 16px;
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

        .btn-primary:hover {
          background: #2563eb;
        }

        .btn-secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .btn-secondary:hover {
          background: #e5e7eb;
        }

        .btn-print {
          background: #059669;
          color: white;
        }

        .btn-print:hover {
          background: #047857;
        }

        .report-section {
          margin-bottom: 30px;
          padding: 25px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .report-section h2 {
          color: #1f2937;
          margin: 0 0 20px 0;
          font-size: 1.3rem;
          font-weight: 600;
          border-bottom: 1px solid #e5e7eb;
          padding-bottom: 8px;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 15px;
        }

        .info-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          background: #f8fafc;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
        }

        .info-label {
          font-weight: 500;
          color: #6b7280;
          font-size: 0.9rem;
        }

        .info-value {
          font-weight: 600;
          color: #1f2937;
          font-size: 0.9rem;
        }

        .summary-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .summary-card {
          text-align: center;
          padding: 20px 15px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
        }

        .card-value {
          font-size: 1.5rem;
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 5px;
        }

        .card-label {
          font-size: 0.8rem;
          color: #6b7280;
          font-weight: 500;
        }

        .overtime-info,
        .undertime-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 10px 15px;
          margin-bottom: 10px;
          border-radius: 6px;
        }

        .overtime-info {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
        }

        .overtime-label,
        .overtime-value {
          color: #166534;
          font-weight: 500;
        }

        .undertime-info {
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .undertime-label,
        .undertime-value {
          color: #dc2626;
          font-weight: 500;
        }

        .details-toggle {
          margin: 15px 0;
        }

        .toggle-button {
          background: #f3f4f6;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          padding: 8px 12px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #374151;
        }

        .toggle-button:hover {
          background: #e5e7eb;
        }

        .attendance-details,
        .payment-details {
          margin-top: 15px;
          overflow-x: auto;
        }

        .details-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }

        .details-table th,
        .details-table td {
          padding: 8px 12px;
          text-align: left;
          border-bottom: 1px solid #e5e7eb;
        }

        .details-table th {
          background: #f9fafb;
          font-weight: 600;
          color: #374151;
        }

        .status-badge {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 500;
        }

        .status-badge.present {
          background: #dcfce7;
          color: #166534;
        }

        .status-badge.absent {
          background: #fee2e2;
          color: #dc2626;
        }

        .type-badge {
          padding: 2px 6px;
          border-radius: 8px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .type-badge.full {
          background: #dcfce7;
          color: #166534;
        }

        .type-badge.partial {
          background: #fef3c7;
          color: #92400e;
        }

        .type-badge.absent {
          background: #fee2e2;
          color: #dc2626;
        }

        .payment-mode {
          padding: 3px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
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

        .financial-summary {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          padding: 20px;
        }

        .financial-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }

        .financial-item.final {
          margin-bottom: 0;
          padding-top: 12px;
          font-size: 1.1rem;
        }

        .financial-label {
          font-weight: 500;
          color: #374151;
        }

        .financial-value {
          font-weight: 600;
        }

        .financial-value.gross {
          color: #059669;
        }

        .financial-value.payments {
          color: #dc2626;
        }

        .financial-value.net.status-due {
          color: #059669;
        }

        .financial-value.net.status-overpaid {
          color: #dc2626;
        }

        .financial-separator {
          height: 1px;
          background: #d1d5db;
          margin: 15px 0;
        }

        .status-text {
          font-size: 0.8rem;
          margin-left: 8px;
          opacity: 0.8;
        }

        .calculation-notes ul {
          margin: 0;
          padding-left: 20px;
          color: #6b7280;
        }

        .calculation-notes li {
          margin-bottom: 8px;
          line-height: 1.5;
        }

        .note-warning {
          background: #fef3c7;
          border: 1px solid #fcd34d;
          border-radius: 4px;
          padding: 8px 12px;
          color: #92400e !important;
          list-style: none;
          margin-left: -20px;
          margin-top: 15px;
        }

        .amount {
          text-align: right;
          font-weight: 600;
        }

        @media print {
          .header-actions {
            display: none;
          }
          
          .details-toggle {
            display: none;
          }
          
          .attendance-details,
          .payment-details {
            display: block !important;
          }
        }

        @media (max-width: 768px) {
          .salary-report {
            padding: 10px;
          }
          
          .report-header {
            flex-direction: column;
            gap: 15px;
          }
          
          .header-actions {
            width: 100%;
            justify-content: stretch;
          }
          
          .btn-primary,
          .btn-secondary,
          .btn-print {
            flex: 1;
          }
          
          .summary-cards {
            grid-template-columns: repeat(2, 1fr);
          }
          
          .info-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SalaryReport;