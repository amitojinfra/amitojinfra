import attendanceService from './attendanceService';
import paymentService from './paymentService';
import employeeService from './employeeService';
import { AttendanceStatus } from '../models/Attendance';

// Salary calculation constants
const SALARY_RECORD_TYPES = {
  FULL: 'full',
  PARTIAL: 'partial',
  ABSENT: 'absent'
};

const SALARY_STATUS = {
  DUE: 'due',
  OVERPAID: 'overpaid'
};

/**
 * Salary Calculation Service
 * Handles salary calculations based on attendance and payment data
 */
class SalaryService {
  
  /**
   * Calculate salary for an employee for a specific date range
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {number} dailyRate - Daily rate in INR (default: 750)
   * @returns {Object} Detailed salary calculation
   */
  async calculateSalary(employeeId, startDate, endDate, dailyRate = 750) {
    try {
      // Validate inputs
      if (!employeeId || !startDate || !endDate || !dailyRate) {
        throw new Error('Employee ID, date range, and daily rate are required');
      }

      if (dailyRate <= 0) {
        throw new Error('Daily rate must be greater than 0');
      }

      // Get employee details
      const employee = await employeeService.getEmployee(employeeId);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Get attendance data for the date range
      const attendanceData = await this.getAttendanceForDateRange(employeeId, startDate, endDate);
      
      // Get payment data for the date range  
      const paymentData = await this.getPaymentsForDateRange(employeeId, startDate, endDate);

      // Calculate attendance summary
      const attendanceSummary = this.calculateAttendanceSummary(attendanceData);
      
      // Calculate gross salary based on working days
      const grossSalary = attendanceSummary.workingDays * dailyRate;
      
      // Calculate total payments made
      const totalPayments = paymentData.reduce((sum, payment) => sum + parseFloat(payment.amount), 0);
      
      // Calculate net salary (gross - payments)
      const netSalary = grossSalary - totalPayments;

      // Generate detailed calculation
      const calculation = {
        employee: {
          id: employee.id,
          name: employee.name,
          designation: employee.designation,
          employee_code: employee.employee_code
        },
        period: {
          startDate,
          endDate,
          totalDays: this.calculateTotalDays(startDate, endDate),
          workingDays: attendanceSummary.workingDays
        },
        rates: {
          dailyRate
        },
        attendance: attendanceSummary,
        financial: {
          grossSalary: parseFloat(grossSalary.toFixed(2)),
          totalPayments: parseFloat(totalPayments.toFixed(2)),
          netSalary: parseFloat(netSalary.toFixed(2)),
          netSalaryStatus: netSalary >= 0 ? SALARY_STATUS.DUE : SALARY_STATUS.OVERPAID
        },
        payments: paymentData,
        attendanceRecords: attendanceData,
        calculatedAt: new Date().toISOString()
      };

      return calculation;

    } catch (error) {
      console.error('Error calculating salary:', error);
      throw error;
    }
  }

  /**
   * Get attendance records for date range
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Array} Attendance records
   */
  async getAttendanceForDateRange(employeeId, startDate, endDate) {
    try {
      const allAttendance = await attendanceService.getAllAttendance();
      
      return allAttendance.filter(record => {
        const recordDate = new Date(record.date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return record.employee_id === employeeId && 
               recordDate >= start && 
               recordDate <= end;
      });
    } catch (error) {
      console.error('Error fetching attendance data:', error);
      return [];
    }
  }

  /**
   * Get payment records for date range
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {Array} Payment records
   */
  async getPaymentsForDateRange(employeeId, startDate, endDate) {
    try {
      const allPayments = await paymentService.getAllPayments();
      
      return allPayments.filter(payment => {
        const paymentDate = new Date(payment.payment_date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        
        return payment.employee_id === employeeId && 
               paymentDate >= start && 
               paymentDate <= end;
      });
    } catch (error) {
      console.error('Error fetching payment data:', error);
      return [];
    }
  }

  /**
   * Calculate attendance summary
   * @param {Array} attendanceRecords - Array of attendance records
   * @returns {Object} Attendance summary
   */
  calculateAttendanceSummary(attendanceRecords) {
    const summary = {
      totalRecords: attendanceRecords.length,
      workingDays: 0,
      fullDays: 0,
      halfDays: 0,
      absentDays: 0,
      attendancePercentage: 0,
      details: []
    };

    if (attendanceRecords.length === 0) {
      return summary;
    }

    let workingDays = 0;
    let fullDays = 0;
    let halfDays = 0;
    let absentDays = 0;

    attendanceRecords.forEach(record => {
      let recordType = SALARY_RECORD_TYPES.ABSENT;
      let dayValue = 0; // 0 for absent, 0.5 for half day, 1 for full day
      
      // Calculate working days based on attendance status
      if (record.status === AttendanceStatus.PRESENT) {
        workingDays++;
        fullDays++;
        recordType = SALARY_RECORD_TYPES.FULL;
        dayValue = 1;
        
      } else if (record.status === AttendanceStatus.HALF_DAY) {
        workingDays += 0.5; // Half day counts as 0.5 working day
        halfDays++;
        recordType = SALARY_RECORD_TYPES.PARTIAL;
        dayValue = 0.5;
        
      } else {
        // absent or any other status (AttendanceStatus.ABSENT)
        absentDays++;
        recordType = SALARY_RECORD_TYPES.ABSENT;
        dayValue = 0;
      }

      // Add to details
      summary.details.push({
        date: record.date,
        status: record.status,
        type: recordType,
        dayValue: dayValue,
        checkIn: record.check_in_time || null,
        checkOut: record.check_out_time || null
      });
    });

    summary.workingDays = parseFloat(workingDays.toFixed(1));
    summary.fullDays = fullDays;
    summary.halfDays = halfDays;
    summary.absentDays = absentDays;
    summary.attendancePercentage = attendanceRecords.length > 0 ? 
      parseFloat(((workingDays / attendanceRecords.length) * 100).toFixed(1)) : 0;

    return summary;
  }

  /**
   * Calculate hours worked between check-in and check-out times
   * @param {string} checkIn - Check-in time (HH:MM format)
   * @param {string} checkOut - Check-out time (HH:MM format)
   * @returns {number} Hours worked
   */
  calculateHoursWorked(checkIn, checkOut) {
    try {
      if (!checkIn || !checkOut) return 0;

      const [inHour, inMinute] = checkIn.split(':').map(Number);
      const [outHour, outMinute] = checkOut.split(':').map(Number);

      const checkInMinutes = inHour * 60 + inMinute;
      let checkOutMinutes = outHour * 60 + outMinute;

      // Handle next day checkout (if checkout is earlier than checkin)
      if (checkOutMinutes < checkInMinutes) {
        checkOutMinutes += 24 * 60; // Add 24 hours
      }

      const totalMinutes = checkOutMinutes - checkInMinutes;
      return Math.max(0, totalMinutes / 60); // Convert to hours

    } catch (error) {
      console.error('Error calculating hours worked:', error);
      return 0;
    }
  }

  /**
   * Calculate total days between two dates
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @returns {number} Total days
   */
  calculateTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end - start);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 to include both start and end dates
  }

  /**
   * Get salary calculations for multiple employees
   * @param {Array} employeeIds - Array of employee IDs
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {number} dailyRate - Daily rate
   * @returns {Array} Array of salary calculations
   */
  async calculateSalaryForMultipleEmployees(employeeIds, startDate, endDate, dailyRate = 750) {
    try {
      const calculations = [];
      
      for (const employeeId of employeeIds) {
        try {
          const calculation = await this.calculateSalary(employeeId, startDate, endDate, dailyRate);
          calculations.push(calculation);
        } catch (error) {
          console.error(`Error calculating salary for employee ${employeeId}:`, error);
          calculations.push({
            employee: { id: employeeId },
            error: error.message
          });
        }
      }
      
      return calculations;
    } catch (error) {
      console.error('Error calculating salary for multiple employees:', error);
      throw error;
    }
  }

  /**
   * Get salary summary statistics
   * @param {Object} calculation - Salary calculation object
   * @returns {Object} Summary statistics
   */
  getSalarySummary(calculation) {
    return {
      employeeName: calculation.employee.name,
      totalDays: calculation.period.totalDays,
      workingDays: calculation.attendance.workingDays,
      attendanceRate: calculation.attendance.attendancePercentage,
      totalHours: calculation.attendance.totalHours,
      grossSalary: calculation.financial.grossSalary,
      totalPayments: calculation.financial.totalPayments,
      netSalary: calculation.financial.netSalary,
      netSalaryStatus: calculation.financial.netSalaryStatus
    };
  }

  /**
   * Format currency amount
   * @param {number} amount - Amount to format
   * @returns {string} Formatted currency
   */
  formatCurrency(amount) {
    return `₹${parseFloat(amount).toLocaleString('en-IN', { 
      minimumFractionDigits: 2, 
      maximumFractionDigits: 2 
    })}`;
  }

  /**
   * Format hours
   * @param {number} hours - Hours to format
   * @returns {string} Formatted hours
   */
  formatHours(hours) {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  }

  /**
   * Validate salary calculation inputs
   * @param {string} employeeId - Employee ID
   * @param {string} startDate - Start date
   * @param {string} endDate - End date
   * @param {number} dailyRate - Daily rate
   * @returns {Object} Validation result
   */
  validateInputs(employeeId, startDate, endDate, dailyRate = 750) {
    const errors = {};

    if (!employeeId || employeeId.trim() === '') {
      errors.employeeId = 'Employee selection is required';
    }

    if (!startDate) {
      errors.startDate = 'Start date is required';
    }

    if (!endDate) {
      errors.endDate = 'End date is required';
    }

    if (startDate && endDate && new Date(startDate) > new Date(endDate)) {
      errors.dateRange = 'Start date must be before or equal to end date';
    }

    if (!dailyRate || dailyRate <= 0) {
      errors.dailyRate = 'Valid daily rate is required';
    }

    if (dailyRate && (dailyRate < 1 || dailyRate > 50000)) {
      errors.dailyRate = 'Daily rate must be between ₹1 and ₹50,000';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

// Create and export singleton instance
const salaryService = new SalaryService();
export default salaryService;

// Export constants for use in UI components
export { SALARY_RECORD_TYPES, SALARY_STATUS };