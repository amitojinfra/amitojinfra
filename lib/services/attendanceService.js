/**
 * Attendance service for managing attendance data in Firestore
 * Uses simple queries to avoid composite index requirements
 */
import firestoreService from '../firebase/firestore';
import employeeService from './employeeService';
import { 
  validateAttendance, 
  validateBulkAttendance,
  formatAttendanceForStorage, 
  generateAttendanceId,
  parseAttendanceId,
  AttendanceStatus,
  getDateRange
} from '../models/Attendance';

/**
 * Attendance service for managing attendance data in Firestore
 */
class AttendanceService {
  constructor() {
    this.collectionName = 'attendance';
  }

  /**
   * Mark attendance for a single employee
   * @param {Object} attendanceData - Attendance data
   * @returns {Promise<Object>} Created attendance record
   */
  async markAttendance(attendanceData) {
    try {
      // Validate attendance data
      const validation = validateAttendance(attendanceData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Check if employee exists
      const employee = await employeeService.getEmployee(attendanceData.employee_id);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Generate unique attendance ID
      const attendanceId = generateAttendanceId(attendanceData.employee_id, attendanceData.date);
      
      // Check if attendance already exists for this employee and date
      const existingAttendance = await this.getAttendanceById(attendanceId);
      if (existingAttendance) {
        // Update existing attendance
        return await this.updateAttendance(attendanceId, attendanceData);
      }

      // Format data for storage
      const formattedData = formatAttendanceForStorage(attendanceData);
      
      // Include our custom attendance ID as a field
      formattedData.attendance_id = attendanceId;
      
      // Create attendance document
      const docRef = await firestoreService.addDocument(this.collectionName, formattedData);
      
      return {
        id: docRef.id,
        attendance_id: attendanceId,
        ...formattedData
      };
    } catch (error) {
      console.error('Error marking attendance:', error);
      throw error;
    }
  }

  /**
   * Mark attendance for multiple employees (bulk operation)
   * @param {Array} attendanceDataArray - Array of attendance data
   * @returns {Promise<Object>} Result with success and error counts
   */
  async markBulkAttendance(attendanceDataArray) {
    try {
      // Validate bulk attendance data
      const validation = validateBulkAttendance(attendanceDataArray);
      
      const results = {
        total: attendanceDataArray.length,
        success: 0,
        errors: 0,
        successRecords: [],
        errorRecords: []
      };

      // Process each attendance record
      for (let i = 0; i < attendanceDataArray.length; i++) {
        try {
          const attendanceData = attendanceDataArray[i];
          const result = await this.markAttendance(attendanceData);
          results.success++;
          results.successRecords.push({
            index: i,
            employee_id: attendanceData.employee_id,
            result
          });
        } catch (error) {
          results.errors++;
          results.errorRecords.push({
            index: i,
            employee_id: attendanceDataArray[i].employee_id,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error marking bulk attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance record by ID
   * @param {string} attendanceId - Attendance ID (employee_id_date)
   * @returns {Promise<Object|null>} Attendance record or null
   */
  async getAttendanceById(attendanceId) {
    try {
      // Since we're storing with auto-generated IDs, we need to search by attendance_id field
      const attendanceRecords = await firestoreService.getDocuments(this.collectionName, {
        where: [
          { field: 'attendance_id', operator: '==', value: attendanceId }
        ],
        limit: 1
      });

      return attendanceRecords.length > 0 ? attendanceRecords[0] : null;
    } catch (error) {
      console.error('Error getting attendance by ID:', error);
      throw error;
    }
  }

  /**
   * Update attendance record
   * @param {string} attendanceId - Attendance ID
   * @param {Object} attendanceData - Updated attendance data
   * @returns {Promise<Object>} Updated attendance record
   */
  async updateAttendance(attendanceId, attendanceData) {
    try {
      // Validate attendance data
      const validation = validateAttendance(attendanceData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Find existing attendance record
      const existingAttendance = await this.getAttendanceById(attendanceId);
      if (!existingAttendance) {
        throw new Error('Attendance record not found');
      }

      // Format data for storage
      const formattedData = formatAttendanceForStorage(attendanceData);
      formattedData.attendance_id = attendanceId;
      formattedData.updated_at = new Date().toISOString();
      
      // Update the document
      await firestoreService.updateDocument(this.collectionName, existingAttendance.id, formattedData);
      
      return {
        ...existingAttendance,
        ...formattedData
      };
    } catch (error) {
      console.error('Error updating attendance:', error);
      throw error;
    }
  }

  /**
   * Delete attendance record
   * @param {string} attendanceId - Attendance ID (could be Firestore document ID or custom attendance_id)
   * @returns {Promise<boolean>} Returns true if deleted, false if not found
   */
  async deleteAttendance(attendanceId) {
    try {
      console.log(`Attempting to delete attendance record: ${attendanceId}`);
      
      // First, try to delete by Firestore document ID directly
      try {
        const docRef = await firestoreService.getDocument(this.collectionName, attendanceId);
        if (docRef) {
          await firestoreService.deleteDocument(this.collectionName, attendanceId);
          console.log(`Successfully deleted attendance record by document ID: ${attendanceId}`);
          return true;
        }
      } catch (directDeleteError) {
        console.log(`Direct deletion failed, trying by attendance_id field: ${directDeleteError.message}`);
      }

      // If direct deletion failed, try to find by attendance_id field
      const existingAttendance = await this.getAttendanceById(attendanceId);
      if (!existingAttendance) {
        console.warn(`Attendance record ${attendanceId} not found in database`);
        return false; // Record doesn't exist, but don't throw error
      }

      // Delete the record using the Firestore document ID
      await firestoreService.deleteDocument(this.collectionName, existingAttendance.id);
      console.log(`Successfully deleted attendance record by lookup: ${attendanceId} (doc ID: ${existingAttendance.id})`);
      return true;
    } catch (error) {
      console.error(`Error deleting attendance record ${attendanceId}:`, error);
      // If it's a "not found" error, don't propagate it
      if (error.message && (error.message.includes('not found') || error.message.includes('No document'))) {
        console.warn(`Attendance record ${attendanceId} not found during deletion`);
        return false;
      }
      throw error;
    }
  }

  /**
   * Get attendance records for a specific employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options (dateRange, status, limit)
   * @returns {Promise<Array>} Array of attendance records
   */
  async getEmployeeAttendance(employeeId, options = {}) {
    try {
      // Get all attendance records for the employee
      const attendanceRecords = await firestoreService.getDocuments(this.collectionName, {
        where: [
          { field: 'employee_id', operator: '==', value: employeeId }
        ]
      });

      // Apply client-side filtering
      let filteredRecords = attendanceRecords;

      // Filter by date range
      if (options.dateRange) {
        const { start, end } = options.dateRange;
        filteredRecords = filteredRecords.filter(record => {
          const recordDate = new Date(record.date);
          return recordDate >= start && recordDate <= end;
        });
      }

      // Filter by status
      if (options.status) {
        filteredRecords = filteredRecords.filter(record => record.status === options.status);
      }

      // Sort by date descending
      filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

      // Apply limit
      if (options.limit) {
        filteredRecords = filteredRecords.slice(0, options.limit);
      }

      return filteredRecords;
    } catch (error) {
      console.error('Error getting employee attendance:', error);
      throw error;
    }
  }

  /**
   * Get attendance records for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of attendance records
   */
  async getAttendanceByDate(date) {
    try {
      // Get all attendance records (simple query to avoid composite index)
      const allRecords = await firestoreService.getDocuments(this.collectionName);
      
      // Filter by date client-side
      const dateRecords = allRecords.filter(record => record.date === date);
      
      // Sort by employee name (we'll need to get employee data)
      const recordsWithEmployees = await Promise.all(
        dateRecords.map(async (record) => {
          try {
            const employee = await employeeService.getEmployee(record.employee_id);
            return {
              ...record,
              employee_name: employee ? employee.name : 'Unknown Employee'
            };
          } catch (error) {
            return {
              ...record,
              employee_name: 'Unknown Employee'
            };
          }
        })
      );

      // Sort by employee name
      recordsWithEmployees.sort((a, b) => 
        (a.employee_name || '').localeCompare(b.employee_name || '')
      );

      return recordsWithEmployees;
    } catch (error) {
      console.error('Error getting attendance by date:', error);
      throw error;
    }
  }

  /**
   * Get attendance records for date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of attendance records
   */
  async getAttendanceByDateRange(startDate, endDate) {
    try {
      // Get all attendance records
      const allRecords = await firestoreService.getDocuments(this.collectionName);
      
      // Filter by date range client-side
      const rangeRecords = allRecords.filter(record => {
        const recordDate = new Date(record.date);
        return recordDate >= startDate && recordDate <= endDate;
      });

      // Sort by date descending, then by employee name
      rangeRecords.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.employee_name || '').localeCompare(b.employee_name || '');
      });

      return rangeRecords;
    } catch (error) {
      console.error('Error getting attendance by date range:', error);
      throw error;
    }
  }

  /**
   * Get all attendance records
   * @returns {Promise<Array>} Array of all attendance records
   */
  async getAllAttendance() {
    try {
      // Get all attendance records
      const allRecords = await firestoreService.getDocuments(this.collectionName);
      
      // Sort by date descending, then by employee name
      allRecords.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return (a.employee_name || '').localeCompare(b.employee_name || '');
      });

      return allRecords;
    } catch (error) {
      console.error('Error getting all attendance records:', error);
      throw error;
    }
  }

  /**
   * Get attendance statistics
   * @param {Object} options - Options (employeeId, dateRange)
   * @returns {Promise<Object>} Attendance statistics
   */
  async getAttendanceStats(options = {}) {
    try {
      let attendanceRecords;

      if (options.employeeId) {
        attendanceRecords = await this.getEmployeeAttendance(options.employeeId, {
          dateRange: options.dateRange
        });
      } else {
        if (options.dateRange) {
          attendanceRecords = await this.getAttendanceByDateRange(
            options.dateRange.start, 
            options.dateRange.end
          );
        } else {
          // Get all records
          attendanceRecords = await firestoreService.getDocuments(this.collectionName);
        }
      }

      const stats = {
        total: attendanceRecords.length,
        present: 0,
        absent: 0,
        halfDay: 0,
        presentPercent: 0,
        absentPercent: 0,
        halfDayPercent: 0,
        byDate: {},
        byEmployee: {}
      };

      if (attendanceRecords.length === 0) {
        return stats;
      }

      // Calculate basic statistics
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

        // Group by date
        if (!stats.byDate[record.date]) {
          stats.byDate[record.date] = { present: 0, absent: 0, halfDay: 0, total: 0 };
        }
        stats.byDate[record.date][record.status === 'half-day' ? 'halfDay' : record.status]++;
        stats.byDate[record.date].total++;

        // Group by employee
        if (!stats.byEmployee[record.employee_id]) {
          stats.byEmployee[record.employee_id] = { present: 0, absent: 0, halfDay: 0, total: 0 };
        }
        stats.byEmployee[record.employee_id][record.status === 'half-day' ? 'halfDay' : record.status]++;
        stats.byEmployee[record.employee_id].total++;
      });

      // Calculate percentages
      stats.presentPercent = Math.round((stats.present / stats.total) * 100);
      stats.absentPercent = Math.round((stats.absent / stats.total) * 100);
      stats.halfDayPercent = Math.round((stats.halfDay / stats.total) * 100);

      return stats;
    } catch (error) {
      console.error('Error getting attendance stats:', error);
      throw error;
    }
  }

  /**
   * Get employees with no attendance for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @returns {Promise<Array>} Array of employees without attendance
   */
  async getEmployeesWithoutAttendance(date) {
    try {
      // Get all active employees
      const allEmployees = await employeeService.getAllEmployees();
      
      // Get attendance records for the date
      const attendanceRecords = await this.getAttendanceByDate(date);
      const attendedEmployeeIds = attendanceRecords.map(record => record.employee_id);
      
      // Filter employees without attendance
      const employeesWithoutAttendance = allEmployees.filter(
        employee => !attendedEmployeeIds.includes(employee.id)
      );

      return employeesWithoutAttendance;
    } catch (error) {
      console.error('Error getting employees without attendance:', error);
      throw error;
    }
  }

  /**
   * Subscribe to attendance changes
   * @param {Function} callback - Callback function for updates
   * @param {Object} options - Query options
   * @returns {Function} Unsubscribe function
   */
  subscribeToAttendance(callback, options = {}) {
    try {
      // Subscribe to all attendance records and filter client-side
      const wrappedCallback = (allRecords) => {
        let filteredRecords = allRecords;

        // Apply filters client-side
        if (options.employeeId) {
          filteredRecords = filteredRecords.filter(record => 
            record.employee_id === options.employeeId
          );
        }

        if (options.date) {
          filteredRecords = filteredRecords.filter(record => 
            record.date === options.date
          );
        }

        if (options.dateRange) {
          const { start, end } = options.dateRange;
          filteredRecords = filteredRecords.filter(record => {
            const recordDate = new Date(record.date);
            return recordDate >= start && recordDate <= end;
          });
        }

        // Sort by date descending
        filteredRecords.sort((a, b) => new Date(b.date) - new Date(a.date));

        callback(filteredRecords);
      };

      return firestoreService.subscribeToCollection(
        this.collectionName,
        wrappedCallback
      );
    } catch (error) {
      console.error('Error subscribing to attendance:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const attendanceService = new AttendanceService();
export default attendanceService;

// Also export the class
export { AttendanceService };