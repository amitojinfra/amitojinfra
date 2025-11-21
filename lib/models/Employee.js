/**
 * Employee data model and validation utilities
 */

// Employee schema definition
export const EmployeeSchema = {
  name: {
    required: true,
    type: 'string',
    minLength: 2,
    maxLength: 100
  },
  aadhar_id: {
    required: false,
    type: 'string',
    pattern: /^\d{12}$/, // 12 digit Aadhar number
    format: 'aadhar'
  },
  joining_date: {
    required: true,
    type: 'date'
  },
  age: {
    required: false,
    type: 'number',
    min: 18,
    max: 65
  }
};

/**
 * Validate employee data against schema
 * @param {Object} employeeData - Employee data to validate
 * @returns {Object} Validation result with isValid and errors
 */
export const validateEmployee = (employeeData) => {
  const errors = {};
  let isValid = true;

  // Validate name
  if (!employeeData.name || employeeData.name.trim() === '') {
    errors.name = 'Name is required';
    isValid = false;
  } else if (employeeData.name.trim().length < 2) {
    errors.name = 'Name must be at least 2 characters long';
    isValid = false;
  } else if (employeeData.name.trim().length > 100) {
    errors.name = 'Name must not exceed 100 characters';
    isValid = false;
  }

  // Validate Aadhar ID (optional)
  if (employeeData.aadhar_id && employeeData.aadhar_id.trim() !== '') {
    const aadharRegex = /^\d{12}$/;
    if (!aadharRegex.test(employeeData.aadhar_id.trim())) {
      errors.aadhar_id = 'Aadhar ID must be exactly 12 digits';
      isValid = false;
    }
  }

  // Validate joining date
  if (!employeeData.joining_date) {
    errors.joining_date = 'Joining date is required';
    isValid = false;
  } else {
    const joiningDate = new Date(employeeData.joining_date);
    const today = new Date();
    const minDate = new Date('1990-01-01');
    
    if (isNaN(joiningDate.getTime())) {
      errors.joining_date = 'Invalid joining date';
      isValid = false;
    } else if (joiningDate > today) {
      errors.joining_date = 'Joining date cannot be in the future';
      isValid = false;
    } else if (joiningDate < minDate) {
      errors.joining_date = 'Joining date cannot be before 1990';
      isValid = false;
    }
  }

  // Validate age (optional)
  if (employeeData.age !== undefined && employeeData.age !== null && employeeData.age !== '') {
    const age = parseInt(employeeData.age);
    if (isNaN(age) || age < 18 || age > 65) {
      errors.age = 'Age must be between 18 and 65';
      isValid = false;
    }
  }

  return { isValid, errors };
};

/**
 * Format employee data for display
 * @param {Object} employee - Employee data
 * @returns {Object} Formatted employee data
 */
export const formatEmployeeForDisplay = (employee) => {
  if (!employee) return null;

  return {
    ...employee,
    name: employee.name?.trim() || 'N/A',
    aadhar_id: employee.aadhar_id ? formatAadharId(employee.aadhar_id) : 'Not provided',
    joining_date: employee.joining_date ? formatDate(employee.joining_date) : 'N/A',
    age: employee.age ? `${employee.age} years` : 'Not specified',
    formatted_joining_date: employee.joining_date ? new Date(employee.joining_date).toLocaleDateString() : 'N/A'
  };
};

/**
 * Format employee data for storage
 * @param {Object} employeeData - Raw employee form data
 * @returns {Object} Formatted employee data for Firestore
 */
export const formatEmployeeForStorage = (employeeData) => {
  const formatted = {
    name: employeeData.name?.trim() || '',
    joining_date: employeeData.joining_date || null
  };

  // Only include optional fields if they have values
  if (employeeData.aadhar_id && employeeData.aadhar_id.trim() !== '') {
    formatted.aadhar_id = employeeData.aadhar_id.trim();
  }

  if (employeeData.age !== undefined && employeeData.age !== null && employeeData.age !== '') {
    formatted.age = parseInt(employeeData.age);
  }

  return formatted;
};

/**
 * Format Aadhar ID for display (mask middle digits)
 * @param {string} aadharId - Aadhar ID
 * @returns {string} Formatted Aadhar ID
 */
export const formatAadharId = (aadharId) => {
  if (!aadharId || aadharId.length !== 12) return aadharId;
  return `${aadharId.substring(0, 4)}-****-${aadharId.substring(8)}`;
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
 * Calculate years of service
 * @param {string|Date} joiningDate - Joining date
 * @returns {string} Years of service
 */
export const calculateYearsOfService = (joiningDate) => {
  if (!joiningDate) return 'N/A';
  
  try {
    const joining = new Date(joiningDate);
    const today = new Date();
    
    if (isNaN(joining.getTime())) return 'N/A';
    
    const diffTime = Math.abs(today - joining);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const years = Math.floor(diffDays / 365);
    const months = Math.floor((diffDays % 365) / 30);
    
    if (years === 0 && months === 0) {
      return 'Less than a month';
    } else if (years === 0) {
      return `${months} month${months > 1 ? 's' : ''}`;
    } else if (months === 0) {
      return `${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `${years} year${years > 1 ? 's' : ''}, ${months} month${months > 1 ? 's' : ''}`;
    }
  } catch (error) {
    return 'N/A';
  }
};

/**
 * Generate employee search keywords for better searchability
 * @param {Object} employee - Employee data
 * @returns {Array} Array of search keywords
 */
export const generateEmployeeSearchKeywords = (employee) => {
  const keywords = [];
  
  if (employee.name) {
    // Add full name
    keywords.push(employee.name.toLowerCase());
    
    // Add individual words from name
    const nameWords = employee.name.toLowerCase().split(' ');
    keywords.push(...nameWords);
  }
  
  if (employee.aadhar_id) {
    keywords.push(employee.aadhar_id);
  }
  
  // Add joining year
  if (employee.joining_date) {
    const year = new Date(employee.joining_date).getFullYear();
    keywords.push(year.toString());
  }
  
  return [...new Set(keywords)]; // Remove duplicates
};

/**
 * Default empty employee object
 */
export const createEmptyEmployee = () => ({
  name: '',
  aadhar_id: '',
  joining_date: '',
  age: ''
});

/**
 * Employee status based on joining date
 * @param {string|Date} joiningDate - Joining date
 * @returns {Object} Status information
 */
export const getEmployeeStatus = (joiningDate) => {
  if (!joiningDate) return { status: 'unknown', label: 'Unknown', color: '#6c757d' };
  
  try {
    const joining = new Date(joiningDate);
    const today = new Date();
    const diffDays = Math.floor((today - joining) / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { status: 'future', label: 'Future Joining', color: '#17a2b8' };
    } else if (diffDays <= 90) {
      return { status: 'new', label: 'New Employee', color: '#28a745' };
    } else if (diffDays <= 365) {
      return { status: 'recent', label: 'Recent Hire', color: '#ffc107' };
    } else {
      return { status: 'experienced', label: 'Experienced', color: '#007bff' };
    }
  } catch (error) {
    return { status: 'unknown', label: 'Unknown', color: '#6c757d' };
  }
};