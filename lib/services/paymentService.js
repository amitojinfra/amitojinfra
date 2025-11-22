/**
 * Payment Service - Handles all payment-related operations
 */

import firestoreService from '../firebase/firestore';
import employeeService from './employeeService';
import {
  validatePayment,
  formatPaymentForStorage,
  generatePaymentSearchKeywords,
  calculateTotalPayment
} from '../models/Payment';

class PaymentService {
  constructor() {
    this.collectionName = 'payments';
  }

  /**
   * Create a new payment record
   * @param {Object} paymentData - Payment data
   * @returns {Promise<Object>} Created payment record
   */
  async createPayment(paymentData) {
    try {
      // Validate payment data
      const validation = validatePayment(paymentData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Check if employee exists
      const employee = await employeeService.getEmployee(paymentData.employee_id);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Format data for storage
      const formattedData = formatPaymentForStorage(paymentData);
      
      // Add search keywords
      formattedData.search_keywords = generatePaymentSearchKeywords(formattedData);
      
      // Create payment document
      const docRef = await firestoreService.addDocument(this.collectionName, formattedData);
      
      return {
        id: docRef.id,
        ...formattedData
      };
    } catch (error) {
      console.error('Error creating payment:', error);
      throw error;
    }
  }

  /**
   * Get payment by ID
   * @param {string} paymentId - Payment document ID
   * @returns {Promise<Object|null>} Payment record or null
   */
  async getPaymentById(paymentId) {
    try {
      const payment = await firestoreService.getDocument(this.collectionName, paymentId);
      return payment;
    } catch (error) {
      console.error('Error getting payment by ID:', error);
      throw error;
    }
  }

  /**
   * Get all payments
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payment records
   */
  async getAllPayments(options = {}) {
    try {
      const payments = await firestoreService.getDocuments(this.collectionName);
      
      let filteredPayments = payments;

      // Filter by employee if specified
      if (options.employee_id) {
        filteredPayments = filteredPayments.filter(payment => 
          payment.employee_id === options.employee_id
        );
      }

      // Filter by date range if specified
      if (options.dateRange) {
        const { start, end } = options.dateRange;
        filteredPayments = filteredPayments.filter(payment => {
          const paymentDate = new Date(payment.payment_date);
          const startDate = new Date(start);
          const endDate = new Date(end);
          return paymentDate >= startDate && paymentDate <= endDate;
        });
      }

      // Filter by payment mode if specified
      if (options.payment_mode) {
        filteredPayments = filteredPayments.filter(payment => 
          payment.payment_mode === options.payment_mode
        );
      }

      // Filter by paid_by if specified
      if (options.paid_by) {
        filteredPayments = filteredPayments.filter(payment => 
          payment.paid_by && payment.paid_by.toLowerCase().includes(options.paid_by.toLowerCase())
        );
      }

      // Sort by payment date descending (most recent first)
      filteredPayments.sort((a, b) => new Date(b.payment_date) - new Date(a.payment_date));

      // Apply limit
      if (options.limit) {
        filteredPayments = filteredPayments.slice(0, options.limit);
      }

      return filteredPayments;
    } catch (error) {
      console.error('Error getting all payments:', error);
      throw error;
    }
  }

  /**
   * Get payments for a specific employee
   * @param {string} employeeId - Employee ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of payment records
   */
  async getEmployeePayments(employeeId, options = {}) {
    try {
      return await this.getAllPayments({
        ...options,
        employee_id: employeeId
      });
    } catch (error) {
      console.error('Error getting employee payments:', error);
      throw error;
    }
  }

  /**
   * Get payments for a specific date range
   * @param {Date|string} startDate - Start date
   * @param {Date|string} endDate - End date
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Array of payment records
   */
  async getPaymentsByDateRange(startDate, endDate, options = {}) {
    try {
      return await this.getAllPayments({
        ...options,
        dateRange: {
          start: startDate,
          end: endDate
        }
      });
    } catch (error) {
      console.error('Error getting payments by date range:', error);
      throw error;
    }
  }

  /**
   * Update payment record
   * @param {string} paymentId - Payment ID
   * @param {Object} paymentData - Updated payment data
   * @returns {Promise<Object>} Updated payment record
   */
  async updatePayment(paymentId, paymentData) {
    try {
      // Validate payment data
      const validation = validatePayment(paymentData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Check if payment exists
      const existingPayment = await this.getPaymentById(paymentId);
      if (!existingPayment) {
        throw new Error('Payment record not found');
      }

      // Check if employee exists
      const employee = await employeeService.getEmployee(paymentData.employee_id);
      if (!employee) {
        throw new Error('Employee not found');
      }

      // Format data for storage
      const formattedData = formatPaymentForStorage(paymentData);
      formattedData.updated_at = new Date().toISOString();
      
      // Add search keywords
      formattedData.search_keywords = generatePaymentSearchKeywords(formattedData);
      
      // Update payment document
      await firestoreService.updateDocument(this.collectionName, paymentId, formattedData);
      
      return {
        id: paymentId,
        ...formattedData
      };
    } catch (error) {
      console.error('Error updating payment:', error);
      throw error;
    }
  }

  /**
   * Delete payment record
   * @param {string} paymentId - Payment ID
   * @returns {Promise<boolean>} Success status
   */
  async deletePayment(paymentId) {
    try {
      // Check if payment exists
      const existingPayment = await this.getPaymentById(paymentId);
      if (!existingPayment) {
        console.warn(`Payment record ${paymentId} not found in database`);
        return false;
      }

      await firestoreService.deleteDocument(this.collectionName, paymentId);
      console.log(`Successfully deleted payment record: ${paymentId}`);
      return true;
    } catch (error) {
      console.error('Error deleting payment:', error);
      throw error;
    }
  }

  /**
   * Get payment statistics
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Payment statistics
   */
  async getPaymentStats(options = {}) {
    try {
      const payments = await this.getAllPayments(options);
      
      const stats = {
        total_payments: payments.length,
        total_amount: calculateTotalPayment(payments),
        cash_payments: payments.filter(p => p.payment_mode === 'Cash').length,
        online_payments: payments.filter(p => p.payment_mode === 'Online').length,
        cash_amount: calculateTotalPayment(payments.filter(p => p.payment_mode === 'Cash')),
        online_amount: calculateTotalPayment(payments.filter(p => p.payment_mode === 'Online')),
        unique_employees: [...new Set(payments.map(p => p.employee_id))].length,
        date_range: null
      };

      // Calculate date range if payments exist
      if (payments.length > 0) {
        const dates = payments.map(p => new Date(p.payment_date)).sort((a, b) => a - b);
        stats.date_range = {
          start: dates[0].toISOString().split('T')[0],
          end: dates[dates.length - 1].toISOString().split('T')[0]
        };
      }

      return stats;
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }

  /**
   * Search payments by text
   * @param {string} searchText - Search text
   * @param {Object} options - Additional query options
   * @returns {Promise<Array>} Array of matching payment records
   */
  async searchPayments(searchText, options = {}) {
    try {
      if (!searchText || searchText.trim() === '') {
        return await this.getAllPayments(options);
      }

      const searchTerm = searchText.toLowerCase().trim();
      const payments = await this.getAllPayments(options);
      
      // Filter payments that match search keywords
      const filteredPayments = payments.filter(payment => {
        const keywords = payment.search_keywords || [];
        return keywords.some(keyword => keyword.includes(searchTerm)) ||
               payment.employee_id.toLowerCase().includes(searchTerm) ||
               (payment.paid_by && payment.paid_by.toLowerCase().includes(searchTerm)) ||
               (payment.notes && payment.notes.toLowerCase().includes(searchTerm));
      });

      return filteredPayments;
    } catch (error) {
      console.error('Error searching payments:', error);
      throw error;
    }
  }

  /**
   * Get payment summary by employee
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of employee payment summaries
   */
  async getPaymentSummaryByEmployee(options = {}) {
    try {
      const payments = await this.getAllPayments(options);
      const employeePayments = {};

      // Group payments by employee
      for (const payment of payments) {
        if (!employeePayments[payment.employee_id]) {
          // Get employee details
          try {
            const employee = await employeeService.getEmployee(payment.employee_id);
            employeePayments[payment.employee_id] = {
              employee_id: payment.employee_id,
              employee_name: employee ? employee.name : 'Unknown Employee',
              employee_designation: employee ? employee.designation : 'N/A',
              total_amount: 0,
              payment_count: 0,
              last_payment_date: null,
              payments: []
            };
          } catch (error) {
            employeePayments[payment.employee_id] = {
              employee_id: payment.employee_id,
              employee_name: 'Unknown Employee',
              employee_designation: 'N/A',
              total_amount: 0,
              payment_count: 0,
              last_payment_date: null,
              payments: []
            };
          }
        }

        const amount = parseFloat(payment.amount) || 0;
        employeePayments[payment.employee_id].total_amount += amount;
        employeePayments[payment.employee_id].payment_count += 1;
        employeePayments[payment.employee_id].payments.push(payment);

        // Update last payment date
        const paymentDate = new Date(payment.payment_date);
        const currentLastDate = employeePayments[payment.employee_id].last_payment_date;
        if (!currentLastDate || paymentDate > new Date(currentLastDate)) {
          employeePayments[payment.employee_id].last_payment_date = payment.payment_date;
        }
      }

      // Convert to array and sort by total amount descending
      return Object.values(employeePayments).sort((a, b) => b.total_amount - a.total_amount);
    } catch (error) {
      console.error('Error getting payment summary by employee:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const paymentService = new PaymentService();
export default paymentService;