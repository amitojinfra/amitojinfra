import { useState, useEffect, useMemo } from 'react';
import { AttendanceStatus } from '../../lib/models/Attendance';

const AttendanceList = ({ 
  attendanceRecords = [], 
  employees = [],
  loading = false,
  onEdit,
  onDelete,
  onRefresh 
}) => {
  const [filters, setFilters] = useState({
    date: '',
    employee: '',
    status: '',
    dateRange: {
      start: '',
      end: ''
    }
  });
  const [sortBy, setSortBy] = useState('date');
  const [sortOrder, setSortOrder] = useState('desc');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'grid'
  const [selectedRecords, setSelectedRecords] = useState(new Set());

  // Create employee lookup map
  const employeeMap = useMemo(() => {
    return employees.reduce((map, employee) => {
      map[employee.id] = employee;
      return map;
    }, {});
  }, [employees]);

  // Filter and sort attendance records
  const filteredAndSortedRecords = useMemo(() => {
    let filtered = attendanceRecords.filter(record => {
      // Date filter
      if (filters.date && record.date !== filters.date) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && record.date < filters.dateRange.start) {
        return false;
      }
      if (filters.dateRange.end && record.date > filters.dateRange.end) {
        return false;
      }

      // Employee filter
      if (filters.employee && record.employee_id !== filters.employee) {
        return false;
      }

      // Status filter
      if (filters.status && record.status !== filters.status) {
        return false;
      }

      return true;
    });

    // Sort records
    filtered.sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case 'date':
          aValue = new Date(a.date);
          bValue = new Date(b.date);
          break;
        case 'employee':
          aValue = employeeMap[a.employee_id]?.name || '';
          bValue = employeeMap[b.employee_id]?.name || '';
          break;
        case 'status':
          aValue = a.status;
          bValue = b.status;
          break;
        case 'marked_at':
          aValue = new Date(a.marked_at);
          bValue = new Date(b.marked_at);
          break;
        default:
          aValue = a[sortBy];
          bValue = b[sortBy];
      }

      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [attendanceRecords, filters, sortBy, sortOrder, employeeMap]);

  // Calculate statistics
  const statistics = useMemo(() => {
    const stats = {
      total: filteredAndSortedRecords.length,
      present: 0,
      absent: 0,
      halfDay: 0,
      uniqueEmployees: new Set(),
      uniqueDates: new Set()
    };

    filteredAndSortedRecords.forEach(record => {
      switch (record.status) {
        case AttendanceStatus.PRESENT:
          stats.present++;
          break;
        case AttendanceStatus.ABSENT:
          stats.absent++;
          break;
        case AttendanceStatus.HALF_DAY:
          stats.halfDay++;
          break;
      }
      stats.uniqueEmployees.add(record.employee_id);
      stats.uniqueDates.add(record.date);
    });

    return {
      ...stats,
      uniqueEmployees: stats.uniqueEmployees.size,
      uniqueDates: stats.uniqueDates.size,
      attendanceRate: stats.total > 0 ? ((stats.present + stats.halfDay * 0.5) / stats.total * 100).toFixed(1) : 0
    };
  }, [filteredAndSortedRecords]);

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleDateRangeChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };

  // Handle sorting
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
  };

  // Handle record selection
  const handleRecordSelect = (recordId) => {
    const newSelected = new Set(selectedRecords);
    if (newSelected.has(recordId)) {
      newSelected.delete(recordId);
    } else {
      newSelected.add(recordId);
    }
    setSelectedRecords(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedRecords.size === filteredAndSortedRecords.length) {
      setSelectedRecords(new Set());
    } else {
      setSelectedRecords(new Set(filteredAndSortedRecords.map(r => r.id)));
    }
  };

  // Clear filters
  const clearFilters = () => {
    setFilters({
      date: '',
      employee: '',
      status: '',
      dateRange: {
        start: '',
        end: ''
      }
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case AttendanceStatus.PRESENT:
        return '#28a745';
      case AttendanceStatus.ABSENT:
        return '#dc3545';
      case AttendanceStatus.HALF_DAY:
        return '#ffc107';
      default:
        return '#6c757d';
    }
  };

  const getStatusBadge = (status) => {
    const color = getStatusColor(status);
    return (
      <span 
        className="status-badge" 
        style={{ backgroundColor: color }}
      >
        {status === AttendanceStatus.PRESENT && '✓ Present'}
        {status === AttendanceStatus.ABSENT && '✗ Absent'}
        {status === AttendanceStatus.HALF_DAY && '◐ Half Day'}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="attendance-list loading">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading attendance records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="attendance-list">
      {/* Header */}
      <div className="list-header">
        <div className="header-content">
          <h2>Attendance Records</h2>
          <div className="header-actions">
            <button
              onClick={onRefresh}
              className="btn-refresh"
              disabled={loading}
            >
              🔄 Refresh
            </button>
            <div className="view-toggle">
              <button
                className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                onClick={() => setViewMode('list')}
              >
                📋 List
              </button>
              <button
                className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
              >
                ⊞ Grid
              </button>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="statistics">
          <div className="stat-item">
            <span className="stat-label">Total Records:</span>
            <span className="stat-value">{statistics.total}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Present:</span>
            <span className="stat-value present">{statistics.present}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Absent:</span>
            <span className="stat-value absent">{statistics.absent}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Half Day:</span>
            <span className="stat-value half-day">{statistics.halfDay}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Attendance Rate:</span>
            <span className="stat-value">{statistics.attendanceRate}%</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Employees:</span>
            <span className="stat-value">{statistics.uniqueEmployees}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Dates:</span>
            <span className="stat-value">{statistics.uniqueDates}</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="filter-row">
          <div className="filter-group">
            <label>Specific Date:</label>
            <input
              type="date"
              value={filters.date}
              onChange={(e) => handleFilterChange('date', e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label>Date Range:</label>
            <div className="date-range">
              <input
                type="date"
                value={filters.dateRange.start}
                onChange={(e) => handleDateRangeChange('start', e.target.value)}
                className="filter-input"
                placeholder="Start"
              />
              <span>to</span>
              <input
                type="date"
                value={filters.dateRange.end}
                onChange={(e) => handleDateRangeChange('end', e.target.value)}
                className="filter-input"
                placeholder="End"
              />
            </div>
          </div>

          <div className="filter-group">
            <label>Employee:</label>
            <select
              value={filters.employee}
              onChange={(e) => handleFilterChange('employee', e.target.value)}
              className="filter-select"
            >
              <option value="">All Employees</option>
              {employees.map(employee => (
                <option key={employee.id} value={employee.id}>
                  {employee.name}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="filter-select"
            >
              <option value="">All Status</option>
              <option value={AttendanceStatus.PRESENT}>Present</option>
              <option value={AttendanceStatus.ABSENT}>Absent</option>
              <option value={AttendanceStatus.HALF_DAY}>Half Day</option>
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="btn-clear-filters"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Results */}
      <div className="results">
        <div className="results-header">
          <div className="results-info">
            Showing {filteredAndSortedRecords.length} of {attendanceRecords.length} records
          </div>
          
          {filteredAndSortedRecords.length > 0 && (
            <div className="bulk-actions">
              <label className="select-all">
                <input
                  type="checkbox"
                  checked={selectedRecords.size === filteredAndSortedRecords.length}
                  onChange={handleSelectAll}
                />
                Select All
              </label>
              {selectedRecords.size > 0 && (
                <div className="selected-actions">
                  <span>({selectedRecords.size} selected)</span>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(Array.from(selectedRecords))}
                      className="btn-delete-selected"
                    >
                      Delete Selected
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {filteredAndSortedRecords.length === 0 ? (
          <div className="no-records">
            <div className="no-records-icon">📋</div>
            <h3>No attendance records found</h3>
            <p>
              {attendanceRecords.length === 0 
                ? "No attendance records have been created yet."
                : "No records match the current filters."
              }
            </p>
            {attendanceRecords.length > 0 && (
              <button onClick={clearFilters} className="btn-clear-filters">
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <>
            {viewMode === 'list' ? (
              /* List View */
              <div className="table-container">
                <table className="attendance-table">
                  <thead>
                    <tr>
                      <th>
                        <input
                          type="checkbox"
                          checked={selectedRecords.size === filteredAndSortedRecords.length}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('date')}
                      >
                        Date {sortBy === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('employee')}
                      >
                        Employee {sortBy === 'employee' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('status')}
                      >
                        Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th 
                        className="sortable"
                        onClick={() => handleSort('marked_at')}
                      >
                        Marked At {sortBy === 'marked_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th>Marked By</th>
                      <th>Notes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAndSortedRecords.map(record => {
                      const employee = employeeMap[record.employee_id];
                      const isSelected = selectedRecords.has(record.id);

                      return (
                        <tr key={record.id} className={isSelected ? 'selected' : ''}>
                          <td>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => handleRecordSelect(record.id)}
                            />
                          </td>
                          <td>{formatDate(record.date)}</td>
                          <td>
                            <div className="employee-cell">
                              <div className="employee-name">
                                {employee?.name || 'Unknown Employee'}
                              </div>
                              {employee?.id && (
                                <div className="employee-id">
                                  ID: {employee.id.slice(0, 8)}...
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{getStatusBadge(record.status)}</td>
                          <td>{formatTime(record.marked_at)}</td>
                          <td>{record.marked_by}</td>
                          <td>
                            <div className="notes-cell">
                              {record.notes ? (
                                <span title={record.notes}>
                                  {record.notes.length > 30 
                                    ? `${record.notes.substring(0, 30)}...`
                                    : record.notes
                                  }
                                </span>
                              ) : (
                                <span className="no-notes">-</span>
                              )}
                            </div>
                          </td>
                          <td>
                            <div className="actions">
                              {onEdit && (
                                <button
                                  onClick={() => onEdit(record)}
                                  className="btn-action edit"
                                  title="Edit"
                                >
                                  ✏️
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  onClick={() => onDelete([record.id])}
                                  className="btn-action delete"
                                  title="Delete"
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              /* Grid View */
              <div className="attendance-grid">
                {filteredAndSortedRecords.map(record => {
                  const employee = employeeMap[record.employee_id];
                  const isSelected = selectedRecords.has(record.id);

                  return (
                    <div 
                      key={record.id} 
                      className={`attendance-card ${isSelected ? 'selected' : ''}`}
                    >
                      <div className="card-header">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleRecordSelect(record.id)}
                        />
                        <div className="card-date">{formatDate(record.date)}</div>
                        {getStatusBadge(record.status)}
                      </div>

                      <div className="card-body">
                        <div className="employee-info">
                          <div className="employee-name">
                            {employee?.name || 'Unknown Employee'}
                          </div>
                          {employee?.id && (
                            <div className="employee-id">
                              ID: {employee.id.slice(0, 8)}...
                            </div>
                          )}
                        </div>

                        <div className="attendance-details">
                          <div className="detail-item">
                            <span className="label">Marked At:</span>
                            <span className="value">{formatTime(record.marked_at)}</span>
                          </div>
                          <div className="detail-item">
                            <span className="label">Marked By:</span>
                            <span className="value">{record.marked_by}</span>
                          </div>
                          {record.notes && (
                            <div className="detail-item notes">
                              <span className="label">Notes:</span>
                              <span className="value">{record.notes}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="card-actions">
                        {onEdit && (
                          <button
                            onClick={() => onEdit(record)}
                            className="btn-action edit"
                          >
                            Edit
                          </button>
                        )}
                        {onDelete && (
                          <button
                            onClick={() => onDelete([record.id])}
                            className="btn-action delete"
                          >
                            Delete
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>

      <style jsx>{`
        .attendance-list {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 20px;
        }

        .attendance-list.loading {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 400px;
        }

        .loading-spinner {
          text-align: center;
        }

        .spinner {
          border: 4px solid #f3f3f3;
          border-top: 4px solid #007cba;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          animation: spin 1s linear infinite;
          margin: 0 auto 20px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .list-header {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .header-content h2 {
          margin: 0;
          color: #333;
        }

        .header-actions {
          display: flex;
          gap: 10px;
          align-items: center;
        }

        .btn-refresh {
          padding: 8px 16px;
          background: #17a2b8;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        }

        .btn-refresh:hover {
          background: #138496;
        }

        .view-toggle {
          display: flex;
          border: 1px solid #ddd;
          border-radius: 4px;
          overflow: hidden;
        }

        .view-btn {
          padding: 8px 12px;
          background: white;
          border: none;
          cursor: pointer;
          font-size: 12px;
        }

        .view-btn.active {
          background: #007cba;
          color: white;
        }

        .statistics {
          display: flex;
          flex-wrap: wrap;
          gap: 20px;
          padding: 15px;
          background: #f8f9fa;
          border-radius: 6px;
          border: 1px solid #e9ecef;
        }

        .stat-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .stat-label {
          font-size: 0.8rem;
          color: #666;
        }

        .stat-value {
          font-weight: 600;
          font-size: 1.1rem;
          color: #333;
        }

        .stat-value.present {
          color: #28a745;
        }

        .stat-value.absent {
          color: #dc3545;
        }

        .stat-value.half-day {
          color: #ffc107;
        }

        .filters {
          background: white;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          margin-bottom: 20px;
        }

        .filter-row {
          display: flex;
          flex-wrap: wrap;
          gap: 15px;
          align-items: end;
        }

        .filter-group {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .filter-group label {
          font-size: 0.9rem;
          font-weight: 500;
          color: #333;
        }

        .filter-input,
        .filter-select {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }

        .date-range {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .date-range span {
          color: #666;
          font-size: 0.9rem;
        }

        .btn-clear-filters {
          padding: 8px 16px;
          background: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
          height: fit-content;
        }

        .btn-clear-filters:hover {
          background: #545b62;
        }

        .results {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .results-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px 20px;
          border-bottom: 1px solid #eee;
          background: #f8f9fa;
        }

        .results-info {
          font-size: 0.9rem;
          color: #666;
        }

        .bulk-actions {
          display: flex;
          align-items: center;
          gap: 15px;
        }

        .select-all {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .selected-actions {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .btn-delete-selected {
          padding: 6px 12px;
          background: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-delete-selected:hover {
          background: #c82333;
        }

        .no-records {
          text-align: center;
          padding: 60px 20px;
        }

        .no-records-icon {
          font-size: 3rem;
          margin-bottom: 20px;
        }

        .no-records h3 {
          margin: 0 0 10px 0;
          color: #666;
        }

        .no-records p {
          margin: 0 0 20px 0;
          color: #999;
        }

        .table-container {
          overflow-x: auto;
        }

        .attendance-table {
          width: 100%;
          border-collapse: collapse;
        }

        .attendance-table th,
        .attendance-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #eee;
        }

        .attendance-table th {
          background: #f8f9fa;
          font-weight: 600;
          color: #333;
          position: sticky;
          top: 0;
        }

        .attendance-table th.sortable {
          cursor: pointer;
          user-select: none;
        }

        .attendance-table th.sortable:hover {
          background: #e9ecef;
        }

        .attendance-table tr.selected {
          background: #e3f2fd;
        }

        .attendance-table tr:hover:not(.selected) {
          background: #f8f9fa;
        }

        .employee-cell {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }

        .employee-name {
          font-weight: 500;
          color: #333;
        }

        .employee-id {
          font-size: 0.8rem;
          color: #666;
        }

        .notes-cell {
          max-width: 200px;
        }

        .no-notes {
          color: #999;
          font-style: italic;
        }

        .status-badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 12px;
          color: white;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .actions {
          display: flex;
          gap: 6px;
        }

        .btn-action {
          padding: 6px 8px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }

        .btn-action.edit {
          background: #ffc107;
          color: #212529;
        }

        .btn-action.delete {
          background: #dc3545;
          color: white;
        }

        .btn-action:hover {
          opacity: 0.8;
        }

        .attendance-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 20px;
          padding: 20px;
        }

        .attendance-card {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
        }

        .attendance-card:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .attendance-card.selected {
          border-color: #007cba;
          background: #e3f2fd;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background: #f8f9fa;
          border-bottom: 1px solid #eee;
        }

        .card-date {
          font-weight: 600;
          color: #333;
        }

        .card-body {
          padding: 15px;
        }

        .employee-info {
          margin-bottom: 15px;
        }

        .attendance-details {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 10px;
        }

        .detail-item.notes {
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
        }

        .detail-item .label {
          font-size: 0.8rem;
          color: #666;
          font-weight: 500;
          flex-shrink: 0;
        }

        .detail-item .value {
          font-size: 0.9rem;
          color: #333;
          text-align: right;
        }

        .detail-item.notes .value {
          text-align: left;
          font-size: 0.8rem;
          line-height: 1.4;
        }

        .card-actions {
          display: flex;
          gap: 10px;
          padding: 15px;
          border-top: 1px solid #eee;
          background: #f8f9fa;
        }

        .card-actions .btn-action {
          flex: 1;
          padding: 8px 12px;
          font-size: 14px;
        }

        @media (max-width: 768px) {
          .attendance-list {
            padding: 0 10px;
          }

          .header-content {
            flex-direction: column;
            align-items: stretch;
            gap: 15px;
          }

          .header-actions {
            justify-content: space-between;
          }

          .statistics {
            justify-content: center;
          }

          .filter-row {
            flex-direction: column;
            align-items: stretch;
          }

          .date-range {
            flex-direction: column;
            align-items: stretch;
          }

          .results-header {
            flex-direction: column;
            align-items: stretch;
            gap: 10px;
          }

          .bulk-actions {
            justify-content: space-between;
          }

          .attendance-grid {
            grid-template-columns: 1fr;
            padding: 10px;
          }

          .table-container {
            font-size: 0.8rem;
          }

          .attendance-table th,
          .attendance-table td {
            padding: 8px 4px;
          }
        }
      `}</style>
    </div>
  );
};

export default AttendanceList;