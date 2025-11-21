import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { useAuth } from '../../contexts/AuthContext';
import attendanceService from '../../lib/services/attendanceService';
import employeeService from '../../lib/services/employeeService';
import AttendanceForm from '../../components/attendance/AttendanceForm';
import AttendanceList from '../../components/attendance/AttendanceList';
import TestConnection from '../../components/TestConnection';

export default function AttendanceDashboard() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [employees, setEmployees] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'mark', 'bulk', 'reports'
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

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
  }, [user]);

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      console.log('Starting to load attendance data...');
      
      // Load employees first
      console.log('Loading employees...');
      let employeesData = [];
      try {
        employeesData = await employeeService.getAllEmployees();
        console.log('Employees loaded successfully:', employeesData.length);
        setEmployees(employeesData);
      } catch (empError) {
        console.error('Error loading employees:', empError);
        throw new Error(`Failed to load employees: ${empError.message}`);
      }

      // Load attendance records
      console.log('Loading attendance records...');
      let attendanceData = [];
      try {
        attendanceData = await attendanceService.getAllAttendance();
        console.log('Attendance records loaded successfully:', attendanceData.length);
        setAttendanceRecords(attendanceData);
      } catch (attError) {
        console.error('Error loading attendance records:', attError);
        throw new Error(`Failed to load attendance records: ${attError.message}`);
      }

      // Calculate today's statistics
      console.log('Calculating statistics...');
      try {
        const today = new Date().toISOString().split('T')[0];
        const todayStats = await attendanceService.getAttendanceStats(today);
        console.log('Statistics calculated successfully:', todayStats);
        setStatistics(todayStats);
      } catch (statsError) {
        console.error('Error calculating statistics:', statsError);
        // Don't fail the entire load for statistics error
        setStatistics(null);
      }

      console.log('All data loaded successfully!');
    } catch (err) {
      console.error('Error loading attendance data:', err);
      setError(err.message || 'Failed to load attendance data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAttendance = async (attendanceData) => {
    try {
      if (Array.isArray(attendanceData)) {
        // Bulk attendance
        await attendanceService.markBulkAttendance(attendanceData);
      } else {
        // Single attendance (if needed)
        await attendanceService.markAttendance(attendanceData);
      }

      // Reload data
      await loadData();
      
      // Switch back to dashboard view
      setCurrentView('dashboard');
    } catch (err) {
      console.error('Error marking attendance:', err);
      setError('Failed to mark attendance. Please try again.');
    }
  };

  const handleDeleteAttendance = async (recordIds) => {
    if (!window.confirm(`Are you sure you want to delete ${recordIds.length} attendance record(s)?`)) {
      return;
    }

    try {
      await Promise.all(recordIds.map(id => attendanceService.deleteAttendance(id)));
      await loadData();
    } catch (err) {
      console.error('Error deleting attendance:', err);
      setError('Failed to delete attendance records. Please try again.');
    }
  };

  const getTodayAttendance = () => {
    const today = new Date().toISOString().split('T')[0];
    return attendanceRecords.filter(record => record.date === today);
  };

  const getRecentAttendance = () => {
    const recent = new Date();
    recent.setDate(recent.getDate() - 7); // Last 7 days
    const recentDate = recent.toISOString().split('T')[0];
    
    return attendanceRecords
      .filter(record => record.date >= recentDate)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 10);
  };

  const getQuickStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const todayRecords = attendanceRecords.filter(record => record.date === today);
    
    const present = todayRecords.filter(r => r.status === 'present').length;
    const absent = todayRecords.filter(r => r.status === 'absent').length;
    const halfDay = todayRecords.filter(r => r.status === 'half-day').length;
    const total = employees.length;
    const marked = todayRecords.length;
    const pending = total - marked;
    
    return {
      total,
      marked,
      pending,
      present,
      absent,
      halfDay,
      attendanceRate: marked > 0 ? ((present + halfDay * 0.5) / marked * 100).toFixed(1) : 0
    };
  };

  if (authLoading || loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Loading attendance dashboard...</p>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect
  }

  const quickStats = getQuickStats();
  const todayAttendance = getTodayAttendance();
  const recentAttendance = getRecentAttendance();

  return (
    <>
      <Head>
        <title>Attendance Dashboard - Employee Management</title>
        <meta name="description" content="Manage employee attendance, mark bulk attendance, and view attendance reports" />
      </Head>

      <div className="attendance-dashboard">
        {error && (
          <div className="error-banner">
            <strong>Error:</strong> {error}
            <button onClick={() => setError('')} className="close-error">×</button>
          </div>
        )}

        {/* Header */}
        <div className="dashboard-header">
          <div className="header-content">
            <h1>Attendance Dashboard</h1>
            <p>Manage employee attendance for {new Date().toLocaleDateString()}</p>
          </div>
          
          <div className="header-actions">
            <button
              onClick={() => setCurrentView('mark')}
              className="btn-primary"
            >
              📝 Mark Attendance
            </button>
            <button
              onClick={() => setCurrentView('bulk')}
              className="btn-secondary"
            >
              📋 Bulk Mark
            </button>
            <button
              onClick={() => setCurrentView('reports')}
              className="btn-secondary"
            >
              📊 View Reports
            </button>
            <button
              onClick={loadData}
              className="btn-refresh"
              disabled={loading}
            >
              🔄 Refresh
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="view-navigation">
          <button
            className={`nav-btn ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            🏠 Dashboard
          </button>
          <button
            className={`nav-btn ${currentView === 'mark' ? 'active' : ''}`}
            onClick={() => setCurrentView('mark')}
          >
            📝 Mark Attendance
          </button>
          <button
            className={`nav-btn ${currentView === 'bulk' ? 'active' : ''}`}
            onClick={() => setCurrentView('bulk')}
          >
            📋 Bulk Mark
          </button>
          <button
            className={`nav-btn ${currentView === 'reports' ? 'active' : ''}`}
            onClick={() => setCurrentView('reports')}
          >
            📊 Reports
          </button>
        </div>

        {/* Connection Test (only show if no employees found) */}
        {employees.length === 0 && !loading && (
          <TestConnection />
        )}

        {/* Main Content */}
        <div className="dashboard-content">
          {currentView === 'dashboard' && (
            <div className="dashboard-view">
              {/* Quick Stats */}
              <div className="quick-stats">
                <div className="stats-grid">
                  <div className="stat-card total">
                    <div className="stat-icon">👥</div>
                    <div className="stat-info">
                      <div className="stat-value">{quickStats.total}</div>
                      <div className="stat-label">Total Employees</div>
                    </div>
                  </div>
                  
                  <div className="stat-card marked">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <div className="stat-value">{quickStats.marked}</div>
                      <div className="stat-label">Marked Today</div>
                    </div>
                  </div>
                  
                  <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-info">
                      <div className="stat-value">{quickStats.pending}</div>
                      <div className="stat-label">Pending</div>
                    </div>
                  </div>
                  
                  <div className="stat-card present">
                    <div className="stat-icon">✅</div>
                    <div className="stat-info">
                      <div className="stat-value">{quickStats.present}</div>
                      <div className="stat-label">Present</div>
                    </div>
                  </div>
                  
                  <div className="stat-card absent">
                    <div className="stat-icon">❌</div>
                    <div className="stat-info">
                      <div className="stat-value">{quickStats.absent}</div>
                      <div className="stat-label">Absent</div>
                    </div>
                  </div>
                  
                  <div className="stat-card half-day">
                    <div className="stat-icon">◐</div>
                    <div className="stat-info">
                      <div className="stat-value">{quickStats.halfDay}</div>
                      <div className="stat-label">Half Day</div>
                    </div>
                  </div>
                  
                  <div className="stat-card rate">
                    <div className="stat-icon">📈</div>
                    <div className="stat-info">
                      <div className="stat-value">{quickStats.attendanceRate}%</div>
                      <div className="stat-label">Attendance Rate</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Today's Attendance */}
              <div className="today-section">
                <div className="section-header">
                  <h2>Today's Attendance ({new Date().toLocaleDateString()})</h2>
                  <div className="section-actions">
                    <button
                      onClick={() => setCurrentView('bulk')}
                      className="btn-primary"
                    >
                      Mark Bulk Attendance
                    </button>
                  </div>
                </div>
                
                {todayAttendance.length > 0 ? (
                  <AttendanceList
                    attendanceRecords={todayAttendance}
                    employees={employees}
                    loading={loading}
                    onDelete={handleDeleteAttendance}
                    onRefresh={loadData}
                  />
                ) : (
                  <div className="no-attendance">
                    <div className="no-attendance-icon">📅</div>
                    <h3>No attendance marked today</h3>
                    <p>Start by marking attendance for your employees.</p>
                    <button
                      onClick={() => setCurrentView('bulk')}
                      className="btn-primary"
                    >
                      Mark Attendance
                    </button>
                  </div>
                )}
              </div>

              {/* Recent Activity */}
              {recentAttendance.length > 0 && (
                <div className="recent-section">
                  <div className="section-header">
                    <h2>Recent Activity (Last 7 Days)</h2>
                    <button
                      onClick={() => setCurrentView('reports')}
                      className="btn-secondary"
                    >
                      View All Reports
                    </button>
                  </div>
                  
                  <AttendanceList
                    attendanceRecords={recentAttendance}
                    employees={employees}
                    loading={loading}
                    onDelete={handleDeleteAttendance}
                    onRefresh={loadData}
                  />
                </div>
              )}
            </div>
          )}

          {currentView === 'mark' && (
            <div className="mark-view">
              <div className="view-header">
                <h2>Mark Individual Attendance</h2>
                <p>Select an employee and mark their attendance for a specific date.</p>
              </div>
              
              {/* Single attendance form would go here */}
              <div className="coming-soon">
                <h3>Individual Attendance Marking</h3>
                <p>This feature is coming soon. Please use bulk marking for now.</p>
                <button
                  onClick={() => setCurrentView('bulk')}
                  className="btn-primary"
                >
                  Go to Bulk Marking
                </button>
              </div>
            </div>
          )}

          {currentView === 'bulk' && (
            <div className="bulk-view">
              <div className="view-header">
                <h2>Bulk Attendance Marking</h2>
                <p>Mark attendance for multiple employees at once.</p>
              </div>
              
              <AttendanceForm
                employees={employees}
                selectedDate={selectedDate}
                mode="bulk"
                onSubmit={handleMarkAttendance}
                onCancel={() => setCurrentView('dashboard')}
                loading={loading}
              />
            </div>
          )}

          {currentView === 'reports' && (
            <div className="reports-view">
              <div className="view-header">
                <h2>Attendance Reports</h2>
                <p>View and analyze attendance data across different time periods.</p>
              </div>
              
              <AttendanceList
                attendanceRecords={attendanceRecords}
                employees={employees}
                loading={loading}
                onDelete={handleDeleteAttendance}
                onRefresh={loadData}
              />
            </div>
          )}
        </div>
      </div>

      <style jsx>{`
        .attendance-dashboard {
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

        .error-banner {
          background: #fee;
          color: #c33;
          padding: 12px 16px;
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

        .dashboard-header {
          background: white;
          padding: 30px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-content h1 {
          margin: 0 0 8px 0;
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

        .btn-primary,
        .btn-secondary,
        .btn-refresh {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .btn-primary {
          background: #007cba;
          color: white;
        }

        .btn-primary:hover:not(:disabled) {
          background: #005a87;
          transform: translateY(-1px);
        }

        .btn-secondary {
          background: #f8f9fa;
          color: #666;
          border: 1px solid #ddd;
        }

        .btn-secondary:hover:not(:disabled) {
          background: #e9ecef;
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

        .view-navigation {
          display: flex;
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
          overflow: hidden;
        }

        .nav-btn {
          flex: 1;
          padding: 15px 20px;
          border: none;
          background: white;
          color: #666;
          cursor: pointer;
          font-size: 14px;
          font-weight: 500;
          transition: all 0.2s;
          border-right: 1px solid #eee;
        }

        .nav-btn:last-child {
          border-right: none;
        }

        .nav-btn:hover {
          background: #f8f9fa;
        }

        .nav-btn.active {
          background: #007cba;
          color: white;
        }

        .dashboard-content {
          background: white;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .dashboard-view {
          padding: 0;
        }

        .quick-stats {
          padding: 30px;
          border-bottom: 1px solid #eee;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          gap: 15px;
          padding: 20px;
          border-radius: 8px;
          border: 1px solid #eee;
          transition: all 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .stat-card.total {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          border: none;
        }

        .stat-card.marked {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
          color: white;
          border: none;
        }

        .stat-card.pending {
          background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
          color: #333;
          border: none;
        }

        .stat-card.present {
          background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
          color: #333;
          border: none;
        }

        .stat-card.absent {
          background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
          color: #333;
          border: none;
        }

        .stat-card.half-day {
          background: linear-gradient(135deg, #ffeaa7 0%, #fab1a0 100%);
          color: #333;
          border: none;
        }

        .stat-card.rate {
          background: linear-gradient(135deg, #74b9ff 0%, #0984e3 100%);
          color: white;
          border: none;
        }

        .stat-icon {
          font-size: 2rem;
          opacity: 0.8;
        }

        .stat-value {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 4px;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        .today-section,
        .recent-section {
          border-bottom: 1px solid #eee;
        }

        .today-section:last-child,
        .recent-section:last-child {
          border-bottom: none;
        }

        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 30px 30px 20px;
        }

        .section-header h2 {
          margin: 0;
          color: #333;
          font-size: 1.3rem;
        }

        .section-actions {
          display: flex;
          gap: 10px;
        }

        .no-attendance {
          text-align: center;
          padding: 60px 30px;
          color: #666;
        }

        .no-attendance-icon {
          font-size: 4rem;
          margin-bottom: 20px;
        }

        .no-attendance h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .no-attendance p {
          margin: 0 0 20px 0;
        }

        .mark-view,
        .bulk-view,
        .reports-view {
          padding: 30px;
        }

        .view-header {
          margin-bottom: 30px;
          text-align: center;
        }

        .view-header h2 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .view-header p {
          margin: 0;
          color: #666;
        }

        .coming-soon {
          text-align: center;
          padding: 60px 20px;
          background: #f8f9fa;
          border-radius: 8px;
          border: 1px solid #eee;
        }

        .coming-soon h3 {
          margin: 0 0 10px 0;
          color: #333;
        }

        .coming-soon p {
          margin: 0 0 20px 0;
          color: #666;
        }

        @media (max-width: 768px) {
          .attendance-dashboard {
            padding: 10px;
          }

          .dashboard-header {
            flex-direction: column;
            align-items: stretch;
            gap: 20px;
            padding: 20px;
          }

          .header-content {
            text-align: center;
          }

          .header-actions {
            justify-content: center;
            flex-wrap: wrap;
          }

          .view-navigation {
            overflow-x: auto;
          }

          .nav-btn {
            white-space: nowrap;
            min-width: 120px;
          }

          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 15px;
          }

          .stat-card {
            padding: 15px;
          }

          .stat-icon {
            font-size: 1.5rem;
          }

          .stat-value {
            font-size: 1.4rem;
          }

          .section-header {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
            padding: 20px;
          }

          .mark-view,
          .bulk-view,
          .reports-view {
            padding: 20px;
          }
        }
      `}</style>
    </>
  );
}