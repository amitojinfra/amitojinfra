/**
 * Payment data model and validation utilities
 */

// Payment mode options
export const PaymentModes = {
  CASH: 'Cash',
  ONLINE: 'Online'
};

// Payment schema definition
export const PaymentSchema = {
  employee_id: {
    required: true,
    type: 'string'
  },
  amount: {
    required: true,
    type: 'number',
    min: 0.01
  },
  payment_date: {
    required: true,
    type: 'date'
  },
  payment_mode: {
    required: true,
    type: 'string',
    enum: Object.values(PaymentModes)
  },
  paid_by: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
  },
  notes: {
    required: false,
    type: 'string',
    maxLength: 500
  }
};

/**
 * Validate payment data against schema
 * @param {Object} paymentData - Payment data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validatePayment = (paymentData) => {
  const errors = {};
  let isValid = true;

  // Validate employee_id
  if (!paymentData.employee_id || paymentData.employee_id.trim() === '') {
    errors.employee_id = 'Employee is required';
    isValid = false;
  }

  // Validate amount
  if (!paymentData.amount || paymentData.amount === '') {
    errors.amount = 'Payment amount is required';
    isValid = false;
  } else {
    const amount = parseFloat(paymentData.amount);
    if (isNaN(amount) || amount <= 0) {
      errors.amount = 'Payment amount must be greater than 0';
      isValid = false;
    } else if (amount > 1000000) {
      errors.amount = 'Payment amount cannot exceed 10,00,000';
      isValid = false;
    }
  }

  // Validate payment_date
  if (!paymentData.payment_date) {
    errors.payment_date = 'Payment date is required';
    isValid = false;
  } else {
    const paymentDate = new Date(paymentData.payment_date);
    const today = new Date();
    const minDate = new Date('2020-01-01');
    
    if (isNaN(paymentDate.getTime())) {
      errors.payment_date = 'Invalid payment date';
      isValid = false;
    } else if (paymentDate > today) {
      errors.payment_date = 'Payment date cannot be in the future';
      isValid = false;
    } else if (paymentDate < minDate) {
      errors.payment_date = 'Payment date cannot be before 2020';
      isValid = false;
    }
  }

  // Validate payment_mode
  if (!paymentData.payment_mode || paymentData.payment_mode.trim() === '') {
    errors.payment_mode = 'Payment mode is required';
    isValid = false;
  } else if (!Object.values(PaymentModes).includes(paymentData.payment_mode)) {
    errors.payment_mode = 'Please select a valid payment mode';
    isValid = false;
  }

  // Validate paid_by
  if (!paymentData.paid_by || paymentData.paid_by.trim() === '') {
    errors.paid_by = 'Paid by name is required';
    isValid = false;
  } else if (paymentData.paid_by.trim().length < 2) {
    errors.paid_by = 'Paid by name must be at least 2 characters long';
    isValid = false;
  } else if (paymentData.paid_by.trim().length > 100) {
    errors.paid_by = 'Paid by name must not exceed 100 characters';
    isValid = false;
  }

  // Validate notes (optional)
  if (paymentData.notes && paymentData.notes.trim().length > 500) {
    errors.notes = 'Notes must not exceed 500 characters';
    isValid = false;
  }

  return { isValid, errors };
};

/**
 * Format payment data for display
 * @param {Object} payment - Payment data
 * @returns {Object} Formatted payment data
 */
export const formatPaymentForDisplay = (payment) => {
  if (!payment) return null;

  return {
    ...payment,
    amount: payment.amount ? `₹${parseFloat(payment.amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '₹0.00',
    payment_date: payment.payment_date ? formatDate(payment.payment_date) : 'N/A',
    payment_mode: payment.payment_mode || 'N/A',
    paid_by: payment.paid_by?.trim() || 'N/A',
    notes: payment.notes?.trim() || '',
    formatted_payment_date: payment.payment_date ? new Date(payment.payment_date).toLocaleDateString() : 'N/A'
  };
};

/**
 * Format payment data for storage
 * @param {Object} paymentData - Raw payment form data
 * @returns {Object} Formatted payment data for Firestore
 */
export const formatPaymentForStorage = (paymentData) => {
  const formatted = {
    employee_id: paymentData.employee_id?.trim() || '',
    amount: parseFloat(paymentData.amount) || 0,
    payment_date: paymentData.payment_date || null,
    payment_mode: paymentData.payment_mode?.trim() || '',
    paid_by: paymentData.paid_by?.trim() || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };

  // Only include notes if they have values
  if (paymentData.notes && paymentData.notes.trim() !== '') {
    formatted.notes = paymentData.notes.trim();
  }

  return formatted;
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
 * Generate payment ID
 * @param {string} employeeId - Employee ID
 * @param {string} date - Date in YYYY-MM-DD format
 * @param {number} sequence - Sequence number for multiple payments on same date
 * @returns {string} Unique payment record ID
 */
export const generatePaymentId = (employeeId, date, sequence = 1) => {
  if (!employeeId || !date) {
    throw new Error('Employee ID and date are required to generate payment ID');
  }
  
  const dateStr = typeof date === 'string' ? date : date.toISOString().split('T')[0];
  return `${employeeId}_${dateStr}_${sequence}`;
};

/**
 * Generate payment search keywords for better searchability
 * @param {Object} payment - Payment data
 * @returns {Array} Array of search keywords
 */
export const generatePaymentSearchKeywords = (payment) => {
  const keywords = [];
  
  if (payment.employee_id) {
    keywords.push(payment.employee_id.toLowerCase());
  }
  
  if (payment.paid_by) {
    keywords.push(payment.paid_by.toLowerCase());
    // Add individual words from paid_by name
    const nameWords = payment.paid_by.toLowerCase().split(' ');
    keywords.push(...nameWords);
  }
  
  if (payment.payment_mode) {
    keywords.push(payment.payment_mode.toLowerCase());
  }
  
  // Add payment date components
  if (payment.payment_date) {
    const date = new Date(payment.payment_date);
    keywords.push(date.getFullYear().toString());
    keywords.push(date.toLocaleDateString('en-IN', { month: 'long' }).toLowerCase());
  }
  
  if (payment.notes) {
    const noteWords = payment.notes.toLowerCase().split(' ');
    keywords.push(...noteWords);
  }
  
  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Default empty payment object
 */
export const createEmptyPayment = () => ({
  employee_id: '',
  amount: '',
  payment_date: new Date().toISOString().split('T')[0],
  payment_mode: '',
  paid_by: '',
  notes: ''
});

/**
 * Calculate total payment amount from array of payments
 * @param {Array} payments - Array of payment objects
 * @returns {number} Total amount
 */
export const calculateTotalPayment = (payments) => {
  if (!Array.isArray(payments) || payments.length === 0) return 0;
  
  return payments.reduce((total, payment) => {
    const amount = parseFloat(payment.amount) || 0;
    return total + amount;
  }, 0);
};

/**
 * Group payments by date
 * @param {Array} payments - Array of payment objects
 * @returns {Object} Payments grouped by date
 */
export const groupPaymentsByDate = (payments) => {
  if (!Array.isArray(payments)) return {};
  
  return payments.reduce((groups, payment) => {
    const date = payment.payment_date;
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(payment);
    return groups;
  }, {});
};

/**
 * Group payments by employee
 * @param {Array} payments - Array of payment objects
 * @returns {Object} Payments grouped by employee_id
 */
export const groupPaymentsByEmployee = (payments) => {
  if (!Array.isArray(payments)) return {};
  
  return payments.reduce((groups, payment) => {
    const employeeId = payment.employee_id;
    if (!groups[employeeId]) {
      groups[employeeId] = [];
    }
    groups[employeeId].push(payment);
    return groups;
  }, {});
};