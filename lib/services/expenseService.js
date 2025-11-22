import { 
  collection, 
  addDoc, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  startAfter,
  Timestamp
} from 'firebase/firestore';
import firestoreService from '../firebase/firestore';

// Expense Categories Constants
export const EXPENSE_CATEGORIES = {
  FUEL: 'fuel',
  RAW_MATERIALS: 'raw_materials',
  GROCERIES: 'groceries',
  TEA_SNACKS: 'tea_snacks',
  SAFETY_EQUIPMENT: 'safety_equipment',
  ACCOMMODATION: 'accommodation',
  TRANSPORT: 'transport',
  EMERGENCY: 'emergency',
  SUPERVISOR_TRAVEL: 'supervisor_travel',
  OFFICE_STATIONERY: 'office_stationery'
};

export const EXPENSE_CATEGORY_LABELS = {
  [EXPENSE_CATEGORIES.FUEL]: 'Diesel/Petrol for Tractor, Hydra',
  [EXPENSE_CATEGORIES.RAW_MATERIALS]: 'Raw Materials (Cement, Sand)',
  [EXPENSE_CATEGORIES.GROCERIES]: 'Groceries for Food',
  [EXPENSE_CATEGORIES.TEA_SNACKS]: 'Tea/Snacks',
  [EXPENSE_CATEGORIES.SAFETY_EQUIPMENT]: 'Safety Gloves, Helmets, Jackets, Shoes',
  [EXPENSE_CATEGORIES.ACCOMMODATION]: 'Rooms/House Rent for Workers',
  [EXPENSE_CATEGORIES.TRANSPORT]: 'Transport Charges',
  [EXPENSE_CATEGORIES.EMERGENCY]: 'Emergency Purchases',
  [EXPENSE_CATEGORIES.SUPERVISOR_TRAVEL]: 'Supervisor Travelling',
  [EXPENSE_CATEGORIES.OFFICE_STATIONERY]: 'Office Stationery'
};

// Payment Mode Constants
export const PAYMENT_MODES = {
  CASH: 'cash',
  ONLINE: 'online'
};

export const PAYMENT_MODE_LABELS = {
  [PAYMENT_MODES.CASH]: 'Cash',
  [PAYMENT_MODES.ONLINE]: 'Online'
};

// Expense Status Constants
export const EXPENSE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected'
};

class ExpenseService {
  constructor() {
    this.collectionName = 'expenses';
  }

  // Get Firestore database instance
  get db() {
    return firestoreService.db;
  }

  // Helper method to convert Firestore timestamp to Date
  convertTimestampToDate(timestamp) {
    if (!timestamp) return null;
    return timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
  }

  // Helper method to format expense data
  formatExpenseData(expenseData) {
    return {
      ...expenseData,
      date: this.convertTimestampToDate(expenseData.date),
      createdAt: this.convertTimestampToDate(expenseData.createdAt),
      updatedAt: this.convertTimestampToDate(expenseData.updatedAt)
    };
  }

  // Validation methods
  validateExpenseData(expenseData) {
    const errors = {};

    // Validate amount
    if (!expenseData.amount || isNaN(expenseData.amount) || parseFloat(expenseData.amount) <= 0) {
      errors.amount = 'Amount must be a positive number';
    } else if (parseFloat(expenseData.amount) > 1000000) {
      errors.amount = 'Amount cannot exceed ₹10,00,000';
    }

    // Validate category
    if (!expenseData.category || !Object.values(EXPENSE_CATEGORIES).includes(expenseData.category)) {
      errors.category = 'Please select a valid category';
    }

    // Validate date
    if (!expenseData.date) {
      errors.date = 'Date is required';
    } else {
      const expenseDate = new Date(expenseData.date);
      const today = new Date();
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(today.getFullYear() - 1);

      if (expenseDate > today) {
        errors.date = 'Expense date cannot be in the future';
      } else if (expenseDate < oneYearAgo) {
        errors.date = 'Expense date cannot be more than one year old';
      }
    }

    // Validate payment mode
    if (!expenseData.paymentMode || !Object.values(PAYMENT_MODES).includes(expenseData.paymentMode)) {
      errors.paymentMode = 'Please select a valid payment mode';
    }

    // Validate vendor (optional but if provided, should not be empty)
    if (expenseData.vendor && expenseData.vendor.trim().length === 0) {
      errors.vendor = 'Vendor name cannot be empty if provided';
    } else if (expenseData.vendor && expenseData.vendor.length > 100) {
      errors.vendor = 'Vendor name cannot exceed 100 characters';
    }

    // Validate description (optional but if provided, should not be too long)
    if (expenseData.description && expenseData.description.length > 500) {
      errors.description = 'Description cannot exceed 500 characters';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Create new expense
  async createExpense(expenseData, userId) {
    try {
      // Validate data
      const validation = this.validateExpenseData(expenseData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const now = new Date();
      const expense = {
        amount: parseFloat(expenseData.amount),
        category: expenseData.category,
        vendor: expenseData.vendor || null,
        date: Timestamp.fromDate(new Date(expenseData.date)),
        description: expenseData.description || null,
        paymentMode: expenseData.paymentMode,
        status: EXPENSE_STATUS.PENDING,
        createdBy: userId,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      };

      const docRef = await addDoc(collection(this.db, this.collectionName), expense);
      
      return {
        success: true,
        id: docRef.id,
        message: 'Expense created successfully'
      };
    } catch (error) {
      console.error('Error creating expense:', error);
      return {
        success: false,
        error: error.message || 'Failed to create expense'
      };
    }
  }

  // Get expense by ID
  async getExpenseById(expenseId) {
    try {
      const docRef = doc(this.db, this.collectionName, expenseId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return {
          success: true,
          expense: this.formatExpenseData({ id: docSnap.id, ...docSnap.data() })
        };
      } else {
        return {
          success: false,
          error: 'Expense not found'
        };
      }
    } catch (error) {
      console.error('Error getting expense:', error);
      return {
        success: false,
        error: error.message || 'Failed to get expense'
      };
    }
  }

  // Get all expenses with optional filters
  async getExpenses(filters = {}) {
    try {
      let q = collection(this.db, this.collectionName);
      const constraints = [];

      // Apply filters
      if (filters.category) {
        constraints.push(where('category', '==', filters.category));
      }

      if (filters.paymentMode) {
        constraints.push(where('paymentMode', '==', filters.paymentMode));
      }

      if (filters.status) {
        constraints.push(where('status', '==', filters.status));
      }

      if (filters.startDate) {
        constraints.push(where('date', '>=', Timestamp.fromDate(new Date(filters.startDate))));
      }

      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        endDate.setHours(23, 59, 59, 999);
        constraints.push(where('date', '<=', Timestamp.fromDate(endDate)));
      }

      // Add ordering
      constraints.push(orderBy('date', 'desc'));

      // Apply limit if provided
      if (filters.limit) {
        constraints.push(limit(filters.limit));
      }

      if (constraints.length > 0) {
        q = query(q, ...constraints);
      }

      const querySnapshot = await getDocs(q);
      const expenses = [];

      querySnapshot.forEach((doc) => {
        expenses.push(this.formatExpenseData({ id: doc.id, ...doc.data() }));
      });

      return {
        success: true,
        expenses,
        total: expenses.length
      };
    } catch (error) {
      console.error('Error getting expenses:', error);
      return {
        success: false,
        error: error.message || 'Failed to get expenses',
        expenses: []
      };
    }
  }

  // Update expense
  async updateExpense(expenseId, updateData, userId) {
    try {
      // Validate data
      const validation = this.validateExpenseData(updateData);
      if (!validation.isValid) {
        throw new Error(`Validation failed: ${Object.values(validation.errors).join(', ')}`);
      }

      const docRef = doc(this.db, this.collectionName, expenseId);
      const updates = {
        amount: parseFloat(updateData.amount),
        category: updateData.category,
        vendor: updateData.vendor || null,
        date: Timestamp.fromDate(new Date(updateData.date)),
        description: updateData.description || null,
        paymentMode: updateData.paymentMode,
        updatedAt: Timestamp.fromDate(new Date()),
        updatedBy: userId
      };

      await updateDoc(docRef, updates);

      return {
        success: true,
        message: 'Expense updated successfully'
      };
    } catch (error) {
      console.error('Error updating expense:', error);
      return {
        success: false,
        error: error.message || 'Failed to update expense'
      };
    }
  }

  // Delete expense
  async deleteExpense(expenseId) {
    try {
      const docRef = doc(this.db, this.collectionName, expenseId);
      await deleteDoc(docRef);

      return {
        success: true,
        message: 'Expense deleted successfully'
      };
    } catch (error) {
      console.error('Error deleting expense:', error);
      return {
        success: false,
        error: error.message || 'Failed to delete expense'
      };
    }
  }

  // Get daily expense report
  async getDailyExpenseReport(date) {
    try {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);

      const result = await this.getExpenses({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const expenses = result.expenses;
      const summary = {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
        categoryBreakdown: {},
        paymentModeBreakdown: {
          [PAYMENT_MODES.CASH]: 0,
          [PAYMENT_MODES.ONLINE]: 0
        }
      };

      // Calculate category breakdown
      Object.values(EXPENSE_CATEGORIES).forEach(category => {
        summary.categoryBreakdown[category] = {
          count: 0,
          amount: 0
        };
      });

      expenses.forEach(expense => {
        // Category breakdown
        if (summary.categoryBreakdown[expense.category]) {
          summary.categoryBreakdown[expense.category].count++;
          summary.categoryBreakdown[expense.category].amount += expense.amount;
        }

        // Payment mode breakdown
        if (summary.paymentModeBreakdown.hasOwnProperty(expense.paymentMode)) {
          summary.paymentModeBreakdown[expense.paymentMode] += expense.amount;
        }
      });

      return {
        success: true,
        date: date,
        expenses,
        summary
      };
    } catch (error) {
      console.error('Error getting daily expense report:', error);
      return {
        success: false,
        error: error.message || 'Failed to get daily expense report'
      };
    }
  }

  // Get monthly expense report
  async getMonthlyExpenseReport(year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59, 999);

      const result = await this.getExpenses({
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString()
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const expenses = result.expenses;
      
      // Group expenses by day
      const dailyExpenses = {};
      const summary = {
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
        categoryBreakdown: {},
        paymentModeBreakdown: {
          [PAYMENT_MODES.CASH]: 0,
          [PAYMENT_MODES.ONLINE]: 0
        },
        averageDaily: 0
      };

      // Initialize category breakdown
      Object.values(EXPENSE_CATEGORIES).forEach(category => {
        summary.categoryBreakdown[category] = {
          count: 0,
          amount: 0
        };
      });

      expenses.forEach(expense => {
        const day = expense.date.getDate();
        
        // Group by day
        if (!dailyExpenses[day]) {
          dailyExpenses[day] = {
            date: expense.date.toISOString().split('T')[0],
            expenses: [],
            totalAmount: 0
          };
        }
        
        dailyExpenses[day].expenses.push(expense);
        dailyExpenses[day].totalAmount += expense.amount;

        // Category breakdown
        if (summary.categoryBreakdown[expense.category]) {
          summary.categoryBreakdown[expense.category].count++;
          summary.categoryBreakdown[expense.category].amount += expense.amount;
        }

        // Payment mode breakdown
        if (summary.paymentModeBreakdown.hasOwnProperty(expense.paymentMode)) {
          summary.paymentModeBreakdown[expense.paymentMode] += expense.amount;
        }
      });

      // Calculate average daily expense
      const daysInMonth = new Date(year, month, 0).getDate();
      summary.averageDaily = summary.totalAmount / daysInMonth;

      return {
        success: true,
        year,
        month,
        monthName: new Date(year, month - 1).toLocaleString('default', { month: 'long' }),
        dailyExpenses,
        summary
      };
    } catch (error) {
      console.error('Error getting monthly expense report:', error);
      return {
        success: false,
        error: error.message || 'Failed to get monthly expense report'
      };
    }
  }

  // Get category-wise summary
  async getCategorySummary(startDate, endDate) {
    try {
      const result = await this.getExpenses({
        startDate: startDate,
        endDate: endDate
      });

      if (!result.success) {
        throw new Error(result.error);
      }

      const expenses = result.expenses;
      const categorySummary = {};

      // Initialize categories
      Object.values(EXPENSE_CATEGORIES).forEach(category => {
        categorySummary[category] = {
          category,
          label: EXPENSE_CATEGORY_LABELS[category],
          count: 0,
          totalAmount: 0,
          averageAmount: 0,
          expenses: []
        };
      });

      // Process expenses
      expenses.forEach(expense => {
        if (categorySummary[expense.category]) {
          categorySummary[expense.category].count++;
          categorySummary[expense.category].totalAmount += expense.amount;
          categorySummary[expense.category].expenses.push(expense);
        }
      });

      // Calculate averages
      Object.keys(categorySummary).forEach(category => {
        const summary = categorySummary[category];
        if (summary.count > 0) {
          summary.averageAmount = summary.totalAmount / summary.count;
        }
      });

      return {
        success: true,
        startDate,
        endDate,
        categorySummary: Object.values(categorySummary),
        totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
        totalExpenses: expenses.length
      };
    } catch (error) {
      console.error('Error getting category summary:', error);
      return {
        success: false,
        error: error.message || 'Failed to get category summary'
      };
    }
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  }

  // Calculate total days between two dates
  calculateTotalDays(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const timeDiff = end.getTime() - start.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
  }
}

// Create and export singleton instance
const expenseService = new ExpenseService();
export default expenseService;