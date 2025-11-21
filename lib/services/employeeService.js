import firestoreService from '../firebase/firestore';
import { 
  validateEmployee, 
  formatEmployeeForStorage, 
  generateEmployeeSearchKeywords 
} from '../models/Employee';

/**
 * Employee service for managing employee data in Firestore
 */
class EmployeeService {
  constructor() {
    this.collectionName = 'employees';
  }

  /**
   * Add a new employee
   * @param {Object} employeeData - Employee data
   * @returns {Promise<Object>} Created employee with ID
   */
  async createEmployee(employeeData) {
    try {
      // Validate employee data
      const validation = validateEmployee(employeeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Check for duplicate Aadhar ID if provided
      if (employeeData.aadhar_id && employeeData.aadhar_id.trim() !== '') {
        const existingEmployee = await this.findByAadharId(employeeData.aadhar_id.trim());
        if (existingEmployee) {
          throw new Error('An employee with this Aadhar ID already exists');
        }
      }

      // Format data for storage
      const formattedData = formatEmployeeForStorage(employeeData);
      
      // Add search keywords for better searchability
      formattedData.searchKeywords = generateEmployeeSearchKeywords(formattedData);
      
      // Add employee status
      formattedData.status = 'active';
      
      // Create employee document
      const docRef = await firestoreService.addDocument(this.collectionName, formattedData);
      
      return {
        id: docRef.id,
        ...formattedData
      };
    } catch (error) {
      console.error('Error creating employee:', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   * @param {string} employeeId - Employee ID
   * @returns {Promise<Object|null>} Employee data or null
   */
  async getEmployee(employeeId) {
    try {
      return await firestoreService.getDocument(this.collectionName, employeeId);
    } catch (error) {
      console.error('Error getting employee:', error);
      throw error;
    }
  }

  /**
   * Update employee data
   * @param {string} employeeId - Employee ID
   * @param {Object} employeeData - Updated employee data
   * @returns {Promise<void>}
   */
  async updateEmployee(employeeId, employeeData) {
    try {
      // Validate employee data
      const validation = validateEmployee(employeeData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      // Check for duplicate Aadhar ID if provided and changed
      if (employeeData.aadhar_id && employeeData.aadhar_id.trim() !== '') {
        const existingEmployee = await this.findByAadharId(employeeData.aadhar_id.trim());
        if (existingEmployee && existingEmployee.id !== employeeId) {
          throw new Error('An employee with this Aadhar ID already exists');
        }
      }

      // Format data for storage
      const formattedData = formatEmployeeForStorage(employeeData);
      
      // Update search keywords
      formattedData.searchKeywords = generateEmployeeSearchKeywords(formattedData);
      
      // Update employee document
      await firestoreService.updateDocument(this.collectionName, employeeId, formattedData);
    } catch (error) {
      console.error('Error updating employee:', error);
      throw error;
    }
  }

  /**
   * Delete employee (soft delete by setting status to inactive)
   * @param {string} employeeId - Employee ID
   * @returns {Promise<void>}
   */
  async deleteEmployee(employeeId) {
    try {
      await firestoreService.updateDocument(this.collectionName, employeeId, {
        status: 'inactive',
        deletedAt: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error deleting employee:', error);
      throw error;
    }
  }

  /**
   * Permanently delete employee
   * @param {string} employeeId - Employee ID
   * @returns {Promise<void>}
   */
  async permanentlyDeleteEmployee(employeeId) {
    try {
      await firestoreService.deleteDocument(this.collectionName, employeeId);
    } catch (error) {
      console.error('Error permanently deleting employee:', error);
      throw error;
    }
  }

  /**
   * Get all active employees
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of employees
   */
  async getAllEmployees(options = {}) {
    try {
      // Use simple query to avoid composite index requirement
      const queryOptions = {
        where: [
          { field: 'status', operator: '==', value: 'active' }
        ],
        // Remove orderBy to avoid composite index requirement
        // We'll sort client-side instead
        ...options
      };

      const employees = await firestoreService.getDocuments(this.collectionName, queryOptions);
      
      // Sort client-side by createdAt descending
      return employees.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime; // Descending order (newest first)
      });
    } catch (error) {
      console.error('Error getting all employees:', error);
      throw error;
    }
  }

  /**
   * Search employees by name or Aadhar ID
   * @param {string} searchTerm - Search term
   * @returns {Promise<Array>} Array of matching employees
   */
  async searchEmployees(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllEmployees();
      }

      const term = searchTerm.toLowerCase().trim();
      
      // Get all active employees and filter client-side for now
      // (Firestore doesn't support full-text search natively)
      const allEmployees = await this.getAllEmployees();
      
      return allEmployees.filter(employee => {
        // Search in name
        if (employee.name && employee.name.toLowerCase().includes(term)) {
          return true;
        }
        
        // Search in Aadhar ID
        if (employee.aadhar_id && employee.aadhar_id.includes(term)) {
          return true;
        }
        
        // Search in search keywords
        if (employee.searchKeywords && employee.searchKeywords.some(keyword => 
          keyword.includes(term)
        )) {
          return true;
        }
        
        return false;
      });
    } catch (error) {
      console.error('Error searching employees:', error);
      throw error;
    }
  }

  /**
   * Find employee by Aadhar ID
   * @param {string} aadharId - Aadhar ID
   * @returns {Promise<Object|null>} Employee or null
   */
  async findByAadharId(aadharId) {
    try {
      if (!aadharId || aadharId.trim() === '') {
        return null;
      }

      // Use single field query to avoid composite index
      const employees = await firestoreService.getDocuments(this.collectionName, {
        where: [
          { field: 'aadhar_id', operator: '==', value: aadharId.trim() }
        ],
        limit: 1
      });

      // Filter active employees client-side
      const activeEmployees = employees.filter(emp => emp.status === 'active');
      return activeEmployees.length > 0 ? activeEmployees[0] : null;
    } catch (error) {
      console.error('Error finding employee by Aadhar ID:', error);
      throw error;
    }
  }

  /**
   * Get employees by joining date range
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @returns {Promise<Array>} Array of employees
   */
  async getEmployeesByJoiningDateRange(startDate, endDate) {
    try {
      const employees = await this.getAllEmployees();
      
      return employees.filter(employee => {
        if (!employee.joining_date) return false;
        
        const joiningDate = new Date(employee.joining_date);
        return joiningDate >= startDate && joiningDate <= endDate;
      });
    } catch (error) {
      console.error('Error getting employees by joining date range:', error);
      throw error;
    }
  }

  /**
   * Get employees by age range
   * @param {number} minAge - Minimum age
   * @param {number} maxAge - Maximum age
   * @returns {Promise<Array>} Array of employees
   */
  async getEmployeesByAgeRange(minAge, maxAge) {
    try {
      const employees = await this.getAllEmployees();
      
      return employees.filter(employee => {
        if (!employee.age) return false;
        return employee.age >= minAge && employee.age <= maxAge;
      });
    } catch (error) {
      console.error('Error getting employees by age range:', error);
      throw error;
    }
  }

  /**
   * Get employee statistics
   * @returns {Promise<Object>} Employee statistics
   */
  async getEmployeeStats() {
    try {
      const employees = await this.getAllEmployees();
      
      const stats = {
        total: employees.length,
        withAadhar: employees.filter(emp => emp.aadhar_id).length,
        withAge: employees.filter(emp => emp.age).length,
        avgAge: 0,
        newestHire: null,
        oldestHire: null,
        ageDistribution: {
          '18-25': 0,
          '26-35': 0,
          '36-45': 0,
          '46-55': 0,
          '56-65': 0
        }
      };

      if (employees.length > 0) {
        // Calculate average age
        const employeesWithAge = employees.filter(emp => emp.age);
        if (employeesWithAge.length > 0) {
          stats.avgAge = Math.round(
            employeesWithAge.reduce((sum, emp) => sum + emp.age, 0) / employeesWithAge.length
          );
        }

        // Find newest and oldest hires
        const sortedByJoining = employees
          .filter(emp => emp.joining_date)
          .sort((a, b) => new Date(b.joining_date) - new Date(a.joining_date));
        
        if (sortedByJoining.length > 0) {
          stats.newestHire = sortedByJoining[0];
          stats.oldestHire = sortedByJoining[sortedByJoining.length - 1];
        }

        // Age distribution
        employeesWithAge.forEach(emp => {
          const age = emp.age;
          if (age >= 18 && age <= 25) stats.ageDistribution['18-25']++;
          else if (age >= 26 && age <= 35) stats.ageDistribution['26-35']++;
          else if (age >= 36 && age <= 45) stats.ageDistribution['36-45']++;
          else if (age >= 46 && age <= 55) stats.ageDistribution['46-55']++;
          else if (age >= 56 && age <= 65) stats.ageDistribution['56-65']++;
        });
      }

      return stats;
    } catch (error) {
      console.error('Error getting employee stats:', error);
      throw error;
    }
  }

  /**
   * Subscribe to employees collection changes
   * @param {Function} callback - Callback function for updates
   * @param {Object} options - Query options
   * @returns {Function} Unsubscribe function
   */
  subscribeToEmployees(callback, options = {}) {
    try {
      const queryOptions = {
        where: [
          { field: 'status', operator: '==', value: 'active' }
        ],
        // Remove orderBy to avoid composite index requirement
        ...options
      };

      // Wrap the callback to sort client-side
      const wrappedCallback = (employees) => {
        const sortedEmployees = employees.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime; // Descending order (newest first)
        });
        callback(sortedEmployees);
      };

      return firestoreService.subscribeToCollection(
        this.collectionName,
        wrappedCallback,
        queryOptions
      );
    } catch (error) {
      console.error('Error subscribing to employees:', error);
      throw error;
    }
  }

  /**
   * Subscribe to single employee changes
   * @param {string} employeeId - Employee ID
   * @param {Function} callback - Callback function for updates
   * @returns {Function} Unsubscribe function
   */
  subscribeToEmployee(employeeId, callback) {
    try {
      return firestoreService.subscribeToDocument(
        this.collectionName,
        employeeId,
        callback
      );
    } catch (error) {
      console.error('Error subscribing to employee:', error);
      throw error;
    }
  }

  /**
   * Batch create employees
   * @param {Array} employeesData - Array of employee data
   * @returns {Promise<Array>} Array of created employees
   */
  async batchCreateEmployees(employeesData) {
    try {
      const results = [];
      const errors = [];

      for (let i = 0; i < employeesData.length; i++) {
        try {
          const employee = await this.createEmployee(employeesData[i]);
          results.push({ index: i, success: true, employee });
        } catch (error) {
          errors.push({ index: i, error: error.message, data: employeesData[i] });
        }
      }

      return { results, errors };
    } catch (error) {
      console.error('Error batch creating employees:', error);
      throw error;
    }
  }
}

// Create and export singleton instance
const employeeService = new EmployeeService();
export default employeeService;

// Also export the class for creating custom instances if needed
export { EmployeeService };