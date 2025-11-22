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
   * @param {number} hourlyRate - Hourly rate in INR
   * @param {number} dailyHours - Expected daily working hours (default: 8)
   * @returns {Object} Detailed salary calculation
   */
  async calculateSalary(employeeId, startDate, endDate, hourlyRate, dailyHours = 8) {
    try {
      // Validate inputs
      if (!employeeId || !startDate || !endDate || !hourlyRate) {
        throw new Error('Employee ID, date range, and hourly rate are required');
      }

      if (hourlyRate <= 0) {
        throw new Error('Hourly rate must be greater than 0');
      }

      if (dailyHours <= 0 || dailyHours > 24) {
        throw new Error('Daily hours must be between 1 and 24');
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
      const attendanceSummary = this.calculateAttendanceSummary(attendanceData, dailyHours);
      
      // Calculate gross salary
      const grossSalary = attendanceSummary.totalHours * hourlyRate;
      
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
          hourlyRate,
          dailyHours,
          dailyRate: hourlyRate * dailyHours
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
   * @param {number} dailyHours - Expected daily hours
   * @returns {Object} Attendance summary
   */
  calculateAttendanceSummary(attendanceRecords, dailyHours) {
    const summary = {
      totalRecords: attendanceRecords.length,
      workingDays: 0,
      totalHours: 0,
      averageHours: 0,
      fullDays: 0,
      partialDays: 0,
      overtimeHours: 0,
      undertimeHours: 0,
      attendancePercentage: 0,
      details: []
    };

    if (attendanceRecords.length === 0) {
      return summary;
    }

    let totalHours = 0;
    let workingDays = 0;
    let overtimeHours = 0;
    let undertimeHours = 0;

    attendanceRecords.forEach(record => {
      let hoursWorked = 0;
      let recordType = SALARY_RECORD_TYPES.ABSENT;
      
      // Calculate hours based on attendance status
      if (record.status === AttendanceStatus.PRESENT) {
        workingDays++;
        
        // Calculate hours worked based on check-in/check-out times if available
        if (record.check_in_time && record.check_out_time) {
          hoursWorked = this.calculateHoursWorked(record.check_in_time, record.check_out_time);
        } else {
          // Default to full day if no specific times
          hoursWorked = dailyHours;
        }
        
        recordType = hoursWorked >= dailyHours ? SALARY_RECORD_TYPES.FULL : SALARY_RECORD_TYPES.PARTIAL;
        
      } else if (record.status === AttendanceStatus.HALF_DAY) {
        workingDays++;
        hoursWorked = dailyHours / 2; // Half day = half the daily hours
        recordType = SALARY_RECORD_TYPES.PARTIAL;
        
      } else {
        // absent or any other status (AttendanceStatus.ABSENT)
        hoursWorked = 0;
        recordType = SALARY_RECORD_TYPES.ABSENT;
      }

      // Add to total hours
      totalHours += hoursWorked;

      // Classify days and calculate overtime/undertime
      if (hoursWorked >= dailyHours) {
        summary.fullDays++;
        if (hoursWorked > dailyHours) {
          overtimeHours += (hoursWorked - dailyHours);
        }
      } else if (hoursWorked > 0) {
        summary.partialDays++;
        undertimeHours += (dailyHours - hoursWorked);
      }

      // Add to details
      summary.details.push({
        date: record.date,
        status: record.status,
        checkIn: record.check_in_time || null,
        checkOut: record.check_out_time || null,
        hoursWorked: parseFloat(hoursWorked.toFixed(2)),
        type: recordType,
        overtime: hoursWorked > dailyHours ? parseFloat((hoursWorked - dailyHours).toFixed(2)) : 0
      });
    });

    summary.workingDays = workingDays;
    summary.totalHours = parseFloat(totalHours.toFixed(2));
    summary.averageHours = workingDays > 0 ? parseFloat((totalHours / workingDays).toFixed(2)) : 0;
    summary.overtimeHours = parseFloat(overtimeHours.toFixed(2));
    summary.undertimeHours = parseFloat(undertimeHours.toFixed(2));
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
   * @param {number} hourlyRate - Hourly rate
   * @param {number} dailyHours - Daily hours
   * @returns {Array} Array of salary calculations
   */
  async calculateSalaryForMultipleEmployees(employeeIds, startDate, endDate, hourlyRate, dailyHours = 8) {
    try {
      const calculations = [];
      
      for (const employeeId of employeeIds) {
        try {
          const calculation = await this.calculateSalary(employeeId, startDate, endDate, hourlyRate, dailyHours);
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
   * @param {number} hourlyRate - Hourly rate
   * @param {number} dailyHours - Daily hours
   * @returns {Object} Validation result
   */
  validateInputs(employeeId, startDate, endDate, hourlyRate, dailyHours = 8) {
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

    if (!hourlyRate || hourlyRate <= 0) {
      errors.hourlyRate = 'Valid hourly rate is required';
    }

    if (hourlyRate && (hourlyRate < 1 || hourlyRate > 10000)) {
      errors.hourlyRate = 'Hourly rate must be between ₹1 and ₹10,000';
    }

    if (!dailyHours || dailyHours <= 0 || dailyHours > 24) {
      errors.dailyHours = 'Daily hours must be between 1 and 24';
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