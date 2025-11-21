/**
 * Attendance data model and validation utilities
 */

// Attendance status options
export const AttendanceStatus = {
  PRESENT: 'present',
  ABSENT: 'absent',
  HALF_DAY: 'half-day'
};

// Attendance schema definition
export const AttendanceSchema = {
  employee_id: {
    required: true,
    type: 'string'
  },
  date: {
    required: true,
    type: 'date'
  },
  status: {
    required: true,
    type: 'string',
    enum: Object.values(AttendanceStatus)
  },
  marked_by: {
    required: true,
    type: 'string'
  },
  marked_at: {
    required: true,
    type: 'timestamp'
  },
  notes: {
    required: false,
    type: 'string',
    maxLength: 500
  }
};

/**
 * Validate attendance data against schema
 * @param {Object} attendanceData - Attendance data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateAttendance = (attendanceData) => {
  const errors = {};
  let isValid = true;

  // Validate employee_id
  if (!attendanceData.employee_id || attendanceData.employee_id.trim() === '') {
    errors.employee_id = 'Employee ID is required';
    isValid = false;
  }

  // Validate date
  if (!attendanceData.date) {
    errors.date = 'Date is required';
    isValid = false;
  } else {
    const date = new Date(attendanceData.date);
    const today = new Date();
    const maxPastDate = new Date();
    maxPastDate.setMonth(maxPastDate.getMonth() - 3); // Allow marking up to 3 months back
    
    if (isNaN(date.getTime())) {
      errors.date = 'Invalid date';
      isValid = false;
    } else if (date > today) {
      errors.date = 'Cannot mark attendance for future dates';
      isValid = false;
    } else if (date < maxPastDate) {
      errors.date = 'Cannot mark attendance for dates older than 3 months';
      isValid = false;
    }
  }

  // Validate status
  if (!attendanceData.status) {
    errors.status = 'Attendance status is required';
    isValid = false;
  } else if (!Object.values(AttendanceStatus).includes(attendanceData.status)) {
    errors.status = 'Invalid attendance status';
    isValid = false;
  }

  // Validate marked_by
  if (!attendanceData.marked_by || attendanceData.marked_by.trim() === '') {
    errors.marked_by = 'Marked by information is required';
    isValid = false;
  }

  // Validate notes (optional)
  if (attendanceData.notes && attendanceData.notes.length > 500) {
    errors.notes = 'Notes cannot exceed 500 characters';
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Validate bulk attendance data
 * @param {Array} bulkAttendanceData - Array of attendance records
 * @returns {Object} Validation result with isValid, errors, and validRecords
 */
export const validateBulkAttendance = (bulkAttendanceData) => {
  const errors = [];
  const validRecords = [];
  let isValid = true;

  if (!Array.isArray(bulkAttendanceData) || bulkAttendanceData.length === 0) {
    return {
      isValid: false,
      errors: ['No attendance data provided'],
      validRecords: []
    };
  }

  bulkAttendanceData.forEach((record, index) => {
    const validation = validateAttendance(record);
    if (validation.isValid) {
      validRecords.push(record);
    } else {
      isValid = false;
      errors.push({
        index,
        employee_id: record.employee_id,
        errors: validation.errors
      });
    }
  });

  return { isValid, errors, validRecords };
};

/**
 * Format attendance data for storage
 * @param {Object} attendanceData - Raw attendance form data
 * @returns {Object} Formatted attendance data for Firestore
 */
export const formatAttendanceForStorage = (attendanceData) => {
  const formatted = {
    employee_id: attendanceData.employee_id?.trim() || '',
    date: attendanceData.date || null,
    status: attendanceData.status || AttendanceStatus.ABSENT,
    marked_by: attendanceData.marked_by?.trim() || '',
    marked_at: new Date().toISOString()
  };

  // Only include optional fields if they have values
  if (attendanceData.notes && attendanceData.notes.trim() !== '') {
    formatted.notes = attendanceData.notes.trim();
  }

  return formatted;
};

/**
 * Format attendance data for display
 * @param {Object} attendance - Attendance data
 * @param {Object} employee - Employee data (optional)
 * @returns {Object} Formatted attendance data
 */
export const formatAttendanceForDisplay = (attendance, employee = null) => {
  if (!attendance) return null;

  return {
    ...attendance,
    employee_name: employee ? employee.name : 'Unknown Employee',
    status_label: getStatusLabel(attendance.status),
    status_color: getStatusColor(attendance.status),
    date_formatted: attendance.date ? formatDate(attendance.date) : 'N/A',
    marked_at_formatted: attendance.marked_at ? 
      new Date(attendance.marked_at).toLocaleString() : 'N/A'
  };
};

/**
 * Get status label for display
 * @param {string} status - Attendance status
 * @returns {string} Display label
 */
export const getStatusLabel = (status) => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return 'Present';
    case AttendanceStatus.ABSENT:
      return 'Absent';
    case AttendanceStatus.HALF_DAY:
      return 'Half Day';
    default:
      return 'Unknown';
  }
};

/**
 * Get status color for display
 * @param {string} status - Attendance status
 * @returns {string} Color code
 */
export const getStatusColor = (status) => {
  switch (status) {
    case AttendanceStatus.PRESENT:
      return '#28a745'; // Green
    case AttendanceStatus.ABSENT:
      return '#dc3545'; // Red
    case AttendanceStatus.HALF_DAY:
      return '#ffc107'; // Yellow/Orange
    default:
      return '#6c757d'; // Gray
  }
};

/**
 * Format date for display
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted date string
 */
export const formatDate = (date) => {
  if (!date) return 'N/A';
  
  try {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return 'Invalid Date';
    
    return dateObj.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch (error) {
    return 'Invalid Date';
  }
};

/**
 * Generate attendance record ID (unique identifier)
 * @param {string} employeeId - Employee ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @returns {string} Unique attendance record ID
 */
export const generateAttendanceId = (employeeId, date) => {
  if (!employeeId || !date) {
    throw new Error('Employee ID and date are required to generate attendance ID');
  }
  
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return `${employeeId}_${dateStr}`;
};

/**
 * Parse attendance ID to get employee ID and date
 * @param {string} attendanceId - Attendance record ID
 * @returns {Object} Object with employeeId and date
 */
export const parseAttendanceId = (attendanceId) => {
  if (!attendanceId || typeof attendanceId !== 'string') {
    return { employeeId: null, date: null };
  }

  const parts = attendanceId.split('_');
  if (parts.length < 2) {
    return { employeeId: null, date: null };
  }

  const employeeId = parts[0];
  const date = parts.slice(1).join('_'); // In case employee ID contains underscore

  return { employeeId, date };
};

/**
 * Calculate attendance statistics
 * @param {Array} attendanceRecords - Array of attendance records
 * @returns {Object} Attendance statistics
 */
export const calculateAttendanceStats = (attendanceRecords) => {
  const stats = {
    total: attendanceRecords.length,
    present: 0,
    absent: 0,
    halfDay: 0,
    presentPercent: 0,
    absentPercent: 0,
    halfDayPercent: 0
  };

  if (attendanceRecords.length === 0) {
    return stats;
  }

  attendanceRecords.forEach(record => {
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
  });

  // Calculate percentages
  stats.presentPercent = Math.round((stats.present / stats.total) * 100);
  stats.absentPercent = Math.round((stats.absent / stats.total) * 100);
  stats.halfDayPercent = Math.round((stats.halfDay / stats.total) * 100);

  return stats;
};

/**
 * Get date range for attendance queries
 * @param {string} period - Period type ('today', 'week', 'month', 'custom')
 * @param {Date} customStart - Custom start date
 * @param {Date} customEnd - Custom end date
 * @returns {Object} Date range with start and end dates
 */
export const getDateRange = (period, customStart = null, customEnd = null) => {
  const today = new Date();
  const start = new Date(today);
  const end = new Date(today);

  switch (period) {
    case 'today':
      // Start and end are the same (today)
      break;
    
    case 'week':
      // Start of current week (Monday)
      const dayOfWeek = today.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      start.setDate(today.getDate() - daysToMonday);
      break;
    
    case 'month':
      // Start of current month
      start.setDate(1);
      break;
    
    case 'custom':
      if (customStart && customEnd) {
        return {
          start: new Date(customStart),
          end: new Date(customEnd)
        };
      }
      break;
  }

  // Reset time to start/end of day
  start.setHours(0, 0, 0, 0);
  end.setHours(23, 59, 59, 999);

  return { start, end };
};

/**
 * Create empty attendance record
 * @returns {Object} Empty attendance record
 */
export const createEmptyAttendance = () => ({
  employee_id: '',
  date: new Date().toISOString().split('T')[0], // Today's date
  status: AttendanceStatus.PRESENT,
  marked_by: '',
  notes: ''
});

/**
 * Check if attendance can be modified
 * @param {Object} attendance - Attendance record
 * @param {string} currentUserId - Current user ID
 * @returns {Object} Result with canModify and reason
 */
export const canModifyAttendance = (attendance, currentUserId) => {
  if (!attendance) {
    return { canModify: false, reason: 'Attendance record not found' };
  }

  const attendanceDate = new Date(attendance.date);
  const today = new Date();
  const daysDiff = Math.floor((today - attendanceDate) / (1000 * 60 * 60 * 24));

  // Can't modify attendance older than 7 days
  if (daysDiff > 7) {
    return { canModify: false, reason: 'Cannot modify attendance older than 7 days' };
  }

  // Can modify if user is admin or marked by current user
  // For now, we'll allow modification by anyone (can be enhanced with role-based access)
  return { canModify: true, reason: '' };
};