import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import attendanceService from '../../lib/services/attendanceService';
import employeeService from '../../lib/services/employeeService';
import AttendanceList from '../../components/attendance/AttendanceList';

export default function AttendanceReports() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reportType, setReportType] = useState('all'); // 'all', 'monthly', 'weekly', 'custom'
  const [dateRange, setDateRange] = useState({
    start: '',
    end: ''
  });

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/auth/login');
    }
  }, [user, authLoading, router]);

  // Load initial data
  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  // Set default date ranges based on report type
  useEffect(() => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    switch (reportType) {
      case 'weekly':
        const weekStart = new Date(now);
        weekStart.setDate(now.getDate() - now.getDay()); // Start of week
        setDateRange({
          start: weekStart.toISOString().split('T')[0],
          end: today
        });
        break;
        
      case 'monthly':
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        setDateRange({
          start: monthStart.toISOString().split('T')[0],
          end: today
        });
        break;
        
      case 'custom':
        // Keep existing range or set reasonable defaults
        if (!dateRange.start && !dateRange.end) {
          const monthAgo = new Date(now);
          monthAgo.setMonth(now.getMonth() - 1);
          setDateRange({
            start: monthAgo.toISOString().split('T')[0],
            end: today
          });
        }
        break;
        
      default:
        setDateRange({ start: '', end: '' });
    }
  }, [reportType, dateRange.start, dateRange.end]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      // Load employees and attendance records in parallel
      const [employeesData, attendanceData] = await Promise.all([
        employeeService.getAllEmployees(),
        attendanceService.getAllAttendance()
      ]);

      setEmployees(employeesData);
      setAttendanceRecords(attendanceData);

      // Calculate statistics for the selected period
      const filteredRecords = getFilteredRecords(attendanceData);
      const stats = calculateStatistics(filteredRecords, employeesData);
      setStatistics(stats);
    } catch (err) {
      console.error('Error loading data:', err);
      setError('Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredRecords = (records = attendanceRecords) => {
    let filtered = records;

    if (reportType !== 'all') {
      if (dateRange.start) {
        filtered = filtered.filter(record => record.date >= dateRange.start);
      }
      if (dateRange.end) {
        filtered = filtered.filter(record => record.date <= dateRange.end);
      }
    }

    return filtered;
  };

  const calculateStatistics = (records, employeesList) => {
    const stats = {
      totalRecords: records.length,
      present: records.filter(r => r.status === 'present').length,
      absent: records.filter(r => r.status === 'absent').length,
      halfDay: records.filter(r => r.status === 'half-day').length,
      uniqueEmployees: new Set(records.map(r => r.employee_id)).size,
      uniqueDates: new Set(records.map(r => r.date)).size,
      employeeStats: {},
      dateStats: {}
    };

    // Calculate attendance rate
    stats.attendanceRate = stats.totalRecords > 0 
      ? ((stats.present + stats.halfDay * 0.5) / stats.totalRecords * 100).toFixed(1)
      : 0;

    // Calculate per-employee statistics
    employeesList.forEach(employee => {
      const empRecords = records.filter(r => r.employee_id === employee.id);
      stats.employeeStats[employee.id] = {
        name: employee.name,
        total: empRecords.length,
        present: empRecords.filter(r => r.status === 'present').length,
        absent: empRecords.filter(r => r.status === 'absent').length,
        halfDay: empRecords.filter(r => r.status === 'half-day').length,
        attendanceRate: empRecords.length > 0 
          ? ((empRecords.filter(r => r.status === 'present').length + 
              empRecords.filter(r => r.status === 'half-day').length * 0.5) / empRecords.length * 100).toFixed(1)
          : 0
      };
    });

    // Calculate per-date statistics
    const dateMap = {};
    records.forEach(record => {
      if (!dateMap[record.date]) {
        dateMap[record.date] = {
          total: 0,
          present: 0,
          absent: 0,
          halfDay: 0
        };
      }
      dateMap[record.date].total++;
      dateMap[record.date][record.status === 'present' ? 'present' : 
                            record.status === 'absent' ? 'absent' : 'halfDay']++;
    });

    stats.dateStats = Object.entries(dateMap).map(([date, data]) => ({
      date,
      ...data,
      attendanceRate: data.total > 0 
        ? ((data.present + data.halfDay * 0.5) / data.total * 100).toFixed(1)
        : 0
    })).sort((a, b) => new Date(b.date) - new Date(a.date));

    return stats;
  };

  const handleDeleteAttendance = async (recordIds) => {
    if (!window.confirm(`Are you sure you want to delete ${recordIds.length} attendance record(s)?`)) {
      return;
    }

    setError('');
    
    try {
      console.log('Deleting attendance records:', recordIds);
      
      // Delete all records and track results
      const deleteResults = await Promise.all(
        recordIds.map(async (id) => {
          try {
            const deleted = await attendanceService.deleteAttendance(id);
            return { id, success: true, deleted };
          } catch (error) {
            console.error(`Failed to delete record ${id}:`, error);
            return { id, success: false, error: error.message };
          }
        })
      );

      // Count successful deletions
      const successCount = deleteResults.filter(result => result.success && result.deleted).length;
      const notFoundCount = deleteResults.filter(result => result.success && !result.deleted).length;
      const errorCount = deleteResults.filter(result => !result.success).length;

      console.log(`Deletion results: ${successCount} deleted, ${notFoundCount} not found, ${errorCount} errors`);

      // Reload data regardless of some failures
      await loadData();

      // Show appropriate message
      if (errorCount > 0) {
        setError(`Some records could not be deleted. ${successCount} deleted successfully, ${errorCount} failed.`);
      } else if (notFoundCount > 0 && successCount === 0) {
        setError(`No records were found to delete. They may have already been removed.`);
      } else if (notFoundCount > 0) {
        // Some success, some not found - this is usually fine
        console.log(`${successCount} records deleted, ${notFoundCount} were already removed.`);
      }
    } catch (err) {
      console.error('Error during bulk deletion:', err);
      setError('Failed to delete attendance records. Please try again.');
    }
  };

  const handleDateRangeChange = (field, value) => {
    setDateRange(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const applyDateRange = () => {
    const filteredRecords = getFilteredRecords();
    const stats = calculateStatistics(filteredRecords, employees);
    setStatistics(stats);
  };

  const exportData = () => {
    const filteredRecords = getFilteredRecords();
    
    // Create CSV content
    const headers = ['Date', 'Employee Name', 'Employee ID', 'Status', 'Marked By', 'Marked At', 'Notes'];
    const rows = filteredRecords.map(record => {
      const employee = employees.find(emp => emp.id === record.employee_id);
      return [
        record.date,
        employee?.name || 'Unknown',
        record.employee_id,
        record.status,
        record.marked_by,
        new Date(record.marked_at).toLocaleString(),
        record.notes || ''
      ];
    });

    const csvContent = [headers, ...rows]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    // Download CSV
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `attendance-report-${reportType}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  if (authLoading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const filteredRecords = getFilteredRecords();

  return (
    <>
      <Head>
        <title>Attendance Reports - Employee Management</title>
        <meta name="description" content="View detailed attendance reports and analytics" />
      </Head>

      <div className="reports-page">
        {/* Header */}
        <div className="page-header">
          <div className="breadcrumb">
            <button onClick={() => router.push('/attendance')} className="breadcrumb-link">
              ← Attendance Dashboard
            </button>
          </div>
          
          <div className="header-content">
            <h1>Attendance Reports & Analytics</h1>
            <p>Comprehensive attendance data analysis and reporting</p>
          </div>

          <div className="header-actions">
            <button onClick={exportData} className="btn-export">
              📊 Export CSV
            </button>
            <button onClick={loadData} className="btn-refresh" disabled={loading}>
              🔄 Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        {/* Report Controls */}
        <div className="report-controls">
          <div className="control-section">
            <h3>Report Period</h3>
            <div className="report-type-tabs">
              <button
                className={`tab-btn ${reportType === 'all' ? 'active' : ''}`}
                onClick={() => setReportType('all')}
              >
                All Time
              </button>
              <button
                className={`tab-btn ${reportType === 'weekly' ? 'active' : ''}`}
                onClick={() => setReportType('weekly')}
              >
                This Week
              </button>
              <button
                className={`tab-btn ${reportType === 'monthly' ? 'active' : ''}`}
                onClick={() => setReportType('monthly')}
              >
                This Month
              </button>
              <button
                className={`tab-btn ${reportType === 'custom' ? 'active' : ''}`}
                onClick={() => setReportType('custom')}
              >
                Custom Range
              </button>
            </div>
          </div>

          {reportType === 'custom' && (
            <div className="control-section">
              <h3>Custom Date Range</h3>
              <div className="date-range-controls">
                <div className="date-input">
                  <label>From:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => handleDateRangeChange('start', e.target.value)}
                  />
                </div>
                <div className="date-input">
                  <label>To:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => handleDateRangeChange('end', e.target.value)}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <button onClick={applyDateRange} className="btn-apply">
                  Apply
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics Overview */}
        {statistics && (
          <div className="statistics-overview">
            <h2>Overview Statistics</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">📊</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.totalRecords}</div>
                  <div className="stat-label">Total Records</div>
                </div>
              </div>
              
              <div className="stat-card present">
                <div className="stat-icon">✅</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.present}</div>
                  <div className="stat-label">Present</div>
                </div>
              </div>
              
              <div className="stat-card absent">
                <div className="stat-icon">❌</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.absent}</div>
                  <div className="stat-label">Absent</div>
                </div>
              </div>
              
              <div className="stat-card half-day">
                <div className="stat-icon">◐</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.halfDay}</div>
                  <div className="stat-label">Half Day</div>
                </div>
              </div>
              
              <div className="stat-card rate">
                <div className="stat-icon">📈</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.attendanceRate}%</div>
                  <div className="stat-label">Attendance Rate</div>
                </div>
              </div>
              
              <div className="stat-card employees">
                <div className="stat-icon">👥</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.uniqueEmployees}</div>
                  <div className="stat-label">Employees</div>
                </div>
              </div>
              
              <div className="stat-card dates">
                <div className="stat-icon">📅</div>
                <div className="stat-info">
                  <div className="stat-value">{statistics.uniqueDates}</div>
                  <div className="stat-label">Days Covered</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Employee Performance */}
        {statistics && statistics.employeeStats && Object.keys(statistics.employeeStats).length > 0 && (
          <div className="employee-performance">
            <h2>Employee Performance</h2>
            <div className="performance-table">
              <table>
                <thead>
                  <tr>
                    <th>Employee</th>
                    <th>Total Days</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Half Days</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(statistics.employeeStats)
                    .sort((a, b) => parseFloat(b.attendanceRate) - parseFloat(a.attendanceRate))
                    .map((emp, index) => (
                      <tr key={index}>
                        <td className="employee-name">{emp.name}</td>
                        <td>{emp.total}</td>
                        <td className="present">{emp.present}</td>
                        <td className="absent">{emp.absent}</td>
                        <td className="half-day">{emp.halfDay}</td>
                        <td className="rate">
                          <div className="rate-bar">
                            <div 
                              className="rate-fill" 
                              style={{width: `${emp.attendanceRate}%`}}
                            ></div>
                            <span>{emp.attendanceRate}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Daily Breakdown */}
        {statistics && statistics.dateStats && statistics.dateStats.length > 0 && (
          <div className="daily-breakdown">
            <h2>Daily Breakdown</h2>
            <div className="daily-table">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Total Marked</th>
                    <th>Present</th>
                    <th>Absent</th>
                    <th>Half Days</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics.dateStats.slice(0, 20).map((day, index) => (
                    <tr key={index}>
                      <td className="date">
                        {new Date(day.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td>{day.total}</td>
                      <td className="present">{day.present}</td>
                      <td className="absent">{day.absent}</td>
                      <td className="half-day">{day.halfDay}</td>
                      <td className="rate">
                        <div className="rate-bar">
                          <div 
                            className="rate-fill" 
                            style={{width: `${day.attendanceRate}%`}}
                          ></div>
                          <span>{day.attendanceRate}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Detailed Records */}
        <div className="detailed-records">
          <h2>Detailed Records</h2>
          <AttendanceList
            attendanceRecords={filteredRecords}
            employees={employees}
            loading={loading}
            onDelete={handleDeleteAttendance}
            onRefresh={loadData}
          />
        </div>
      </div>

      <style jsx>{`
        .reports-page {
          max-width: 1200px;
          margin: 0 auto;
          padding: 20px;
          min-height: 100vh;
          background: #f5f5f5;
        }

        .loading-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          gap: 20px;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007cba;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .page-header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 20px;
        }

        .breadcrumb {
          width: 100%;
          margin-bottom: 15px;
        }

        .breadcrumb-link {
          background: none;
          border: none;
          color: #007cba;
          cursor: pointer;
          font-size: 14px;
          text-decoration: underline;
          padding: 0;
        }

        .breadcrumb-link:hover {
          color: #005a87;
        }

        .header-content h1 {
          margin: 0 0 10px 0;
          color: #333;
          font-size: 2rem;
        }

        .header-content p {
          margin: 0;
          color: #666;
          font-size: 1rem;
        }

        .header-actions {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .btn-export,
        .btn-refresh {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-export {
          background: #28a745;
          color: white;
        }

        .btn-export:hover {
          background: #218838;
          transform: translateY(-1px);
        }

        .btn-refresh {
          background: #17a2b8;
          color: white;
        }

        .btn-refresh:hover:not(:disabled) {
          background: #138496;
        }

        .btn-refresh:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-banner {
          background: #fee;
          color: #c33;
          padding: 15px 20px;
          border-radius: 6px;
          margin-bottom: 20px;
          border: 1px solid #fcc;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .close-error {
          background: none;
          border: none;
          color: #c33;
          cursor: pointer;
          font-size: 18px;
          padding: 0;
          margin-left: 10px;
        }

        .report-controls {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .control-section {
          margin-bottom: 25px;
        }

        .control-section:last-child {
          margin-bottom: 0;
        }

        .control-section h3 {
          margin: 0 0 15px 0;
          color: #333;
          font-size: 1.1rem;
        }

        .report-type-tabs {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 6px;
          overflow: hidden;
        }

        .tab-btn {
          flex: 1;
          padding: 12px 20px;
          border: none;
          background: white;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          border-right: 1px solid #ddd;
        }

        .tab-btn:last-child {
          border-right: none;
        }

        .tab-btn:hover {
          background: #f8f9fa;
        }

        .tab-btn.active {
          background: #007cba;
          color: white;
        }

        .date-range-controls {
          display: flex;
          align-items: end;
          gap: 15px;
          flex-wrap: wrap;
        }

        .date-input {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .date-input label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
        }

        .date-input input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .btn-apply {
          padding: 8px 16px;
          background: #007cba;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
        }

        .btn-apply:hover {
          background: #005a87;
        }

        .statistics-overview,
        .employee-performance,
        .daily-breakdown,
        .detailed-records {
          background: white;
          padding: 25px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .statistics-overview h2,
        .employee-performance h2,
        .daily-breakdown h2,
        .detailed-records h2 {
          margin: 0 0 20px 0;
          color: #333;
          font-size: 1.3rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 15px;
          border-radius: 8px;
          border: 1px solid #e9ecef;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card.present {
          background: linear-gradient(135deg, #d4edda 0%, #c3e6cb 100%);
        }

        .stat-card.absent {
          background: linear-gradient(135deg, #f8d7da 0%, #f5c6cb 100%);
        }

        .stat-card.half-day {
          background: linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%);
        }

        .stat-card.rate {
          background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
        }

        .stat-card.employees {
          background: linear-gradient(135deg, #f3e5f5 0%, #e1bee7 100%);
        }

        .stat-card.dates {
          background: linear-gradient(135deg, #e8f5e8 0%, #c8e6c9 100%);
        }

        .stat-icon {
          font-size: 1.5rem;
          opacity: 0.8;
        }

        .stat-value {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 2px;
          color: #333;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
        }

        .performance-table,
        .daily-table {
          overflow-x: auto;
        }

        .performance-table table,
        .daily-table table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 10px;
        }

        .performance-table th,
        .performance-table td,
        .daily-table th,
        .daily-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .performance-table th,
        .daily-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
        }

        .employee-name,
        .date {
          font-weight: 500;
        }

        .present {
          color: #28a745;
          font-weight: 500;
        }

        .absent {
          color: #dc3545;
          font-weight: 500;
        }

        .half-day {
          color: #ffc107;
          font-weight: 500;
        }

        .rate {
          min-width: 120px;
        }

        .rate-bar {
          position: relative;
          background: #e9ecef;
          border-radius: 10px;
          height: 20px;
          overflow: hidden;
        }

        .rate-fill {
          height: 100%;
          background: linear-gradient(90deg, #28a745 0%, #20c997 100%);
          border-radius: 10px;
          transition: width 0.3s ease;
        }

        .rate-bar span {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 0.75rem;
          font-weight: 500;
          color: #333;
          text-shadow: 0 0 3px rgba(255, 255, 255, 0.8);
        }

        @media (max-width: 768px) {
          .reports-page {
            padding: 10px;
          }

          .page-header {
            padding: 20px;
            flex-direction: column;
            align-items: stretch;
          }

          .header-actions {
            justify-content: center;
          }

          .report-type-tabs {
            flex-direction: column;
          }

          .tab-btn {
            border-right: none;
            border-bottom: 1px solid #ddd;
          }

          .tab-btn:last-child {
            border-bottom: none;
          }

          .date-range-controls {
            flex-direction: column;
            align-items: stretch;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          }

          .stat-card {
            padding: 12px;
          }

          .stat-value {
            font-size: 1.2rem;
          }

          .performance-table,
          .daily-table {
            font-size: 0.8rem;
          }

          .performance-table th,
          .performance-table td,
          .daily-table th,
          .daily-table td {
            padding: 8px 4px;
          }
        }
      `}</style>
    </>
  );
}