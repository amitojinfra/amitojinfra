/**
 * Simplified Employee Service that avoids composite index requirements
 * This version uses client-side filtering and sorting to avoid Firestore index issues
 */
import firestoreService from '../firebase/firestore';
import { 
  validateEmployee, 
  formatEmployeeForStorage, 
  generateEmployeeSearchKeywords 
} from '../models/Employee';

/**
 * Simplified Employee service for managing employee data in Firestore
 * Avoids composite indexes by doing filtering and sorting client-side
 */
class SimpleEmployeeService {
  constructor() {
    this.collectionName = 'employees';
  }

  /**
   * Add a new employee (same as before)
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
   * Get employee by ID (same as before)
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
   * Update employee data (same as before)
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
   * Delete employee (soft delete)
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
   * Get all employees - simplified to avoid composite index
   */
  async getAllEmployees() {
    try {
      // Get all employees without any filtering to avoid index issues
      const allEmployees = await firestoreService.getDocuments(this.collectionName);
      
      // Filter active employees client-side
      const activeEmployees = allEmployees.filter(emp => emp.status === 'active' || !emp.status);
      
      // Sort by createdAt descending (newest first)
      return activeEmployees.sort((a, b) => {
        const aTime = a.createdAt?.seconds || 0;
        const bTime = b.createdAt?.seconds || 0;
        return bTime - aTime;
      });
    } catch (error) {
      console.error('Error getting all employees:', error);
      throw error;
    }
  }

  /**
   * Search employees - simplified
   */
  async searchEmployees(searchTerm) {
    try {
      if (!searchTerm || searchTerm.trim() === '') {
        return await this.getAllEmployees();
      }

      const term = searchTerm.toLowerCase().trim();
      
      // Get all active employees
      const allEmployees = await this.getAllEmployees();
      
      // Filter by search term
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
   * Find employee by Aadhar ID - simplified
   */
  async findByAadharId(aadharId) {
    try {
      if (!aadharId || aadharId.trim() === '') {
        return null;
      }

      // Get all employees and filter client-side to avoid composite index
      const allEmployees = await this.getAllEmployees();
      
      // Find employee with matching Aadhar ID
      return allEmployees.find(emp => emp.aadhar_id === aadharId.trim()) || null;
    } catch (error) {
      console.error('Error finding employee by Aadhar ID:', error);
      throw error;
    }
  }

  /**
   * Get employee statistics
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
   * Subscribe to employees collection - simplified
   */
  subscribeToEmployees(callback) {
    try {
      // Subscribe to all documents in the collection
      const wrappedCallback = (allEmployees) => {
        // Filter active employees client-side
        const activeEmployees = allEmployees.filter(emp => emp.status === 'active' || !emp.status);
        
        // Sort by createdAt descending
        const sortedEmployees = activeEmployees.sort((a, b) => {
          const aTime = a.createdAt?.seconds || 0;
          const bTime = b.createdAt?.seconds || 0;
          return bTime - aTime;
        });
        
        callback(sortedEmployees);
      };

      return firestoreService.subscribeToCollection(
        this.collectionName,
        wrappedCallback
      );
    } catch (error) {
      console.error('Error subscribing to employees:', error);
      throw error;
    }
  }

  /**
   * Subscribe to single employee changes
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
}

// Create and export singleton instance
const employeeService = new SimpleEmployeeService();
export default employeeService;

// Also export the class
export { SimpleEmployeeService };