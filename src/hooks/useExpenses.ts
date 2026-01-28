import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Expense, Budget, CategoryId, MonthlySpending } from '@/types/expense';
import { getSampleExpenses } from '@/lib/sampleData';

const API_BASE = 'http://localhost:5000/api';

const DEFAULT_BUDGET: Budget = {
  monthly: 50000,
  categoryBudgets: {
    food: 10000,
    travel: 5000,
    shopping: 8000,
    rent: 15000,
    utilities: 3000,
    entertainment: 5000,
    health: 3000,
    other: 1000
  }
};

export const useExpenses = () => {
  const { token } = useAuth();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budget, setBudget] = useState<Budget>(DEFAULT_BUDGET);
  const [isLoading, setIsLoading] = useState(true);

  const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  });

  // Load data from backend on mount or when token changes
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const headers = getAuthHeaders();
        console.log('Loading expenses with token:', token?.substring(0, 20) + '...');
        
        // Fetch expenses
        const expensesRes = await fetch(`${API_BASE}/expenses`, { headers });
        console.log('Expenses response status:', expensesRes.status);
        
        if (expensesRes.ok) {
          const expensesData = await expensesRes.json();
          console.log('Received expenses:', expensesData);
          // Convert database format to frontend format
          const formattedExpenses: Expense[] = expensesData.map((exp: any) => {
            // Ensure date is a string in YYYY-MM-DD format
            let dateStr = exp.date;
            if (dateStr instanceof Date) {
              dateStr = dateStr.toISOString().split('T')[0];
            } else if (typeof dateStr === 'string' && dateStr.includes('T')) {
              dateStr = dateStr.split('T')[0];
            }
            
            // Ensure amount is a number
            const amount = typeof exp.amount === 'string' ? parseFloat(exp.amount) : exp.amount;
            
            return {
              id: exp.id.toString(),
              amount: amount,
              category: exp.category,
              date: dateStr,
              note: exp.note || '',
              createdAt: dateStr
            };
          });
          console.log('Formatted expenses:', formattedExpenses);
          setExpenses(formattedExpenses);
        } else {
          const errorData = await expensesRes.json();
          console.error('Failed to load expenses:', errorData);
          setExpenses([]);
        }

        // Fetch budgets
        const budgetRes = await fetch(`${API_BASE}/budgets`, { headers });
        console.log('Budgets response status:', budgetRes.status);
        
        if (budgetRes.ok) {
          const budgetData = await budgetRes.json();
          console.log('Received budgets:', budgetData);
          setBudget(budgetData);
        } else {
          console.error('Failed to load budgets');
          setBudget(DEFAULT_BUDGET);
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setExpenses([]);
        setBudget(DEFAULT_BUDGET);
      } finally {
        setIsLoading(false);
      }
    };

    if (token) {
      loadData();
    } else {
      console.log('No token available, clearing expenses');
      setExpenses([]);
      setBudget(DEFAULT_BUDGET);
      setIsLoading(false);
    }
  }, [token]);

  // Refetch budget data
  const refetchBudget = useCallback(async () => {
    if (!token) return;
    
    try {
      const headers = getAuthHeaders();
      const budgetRes = await fetch(`${API_BASE}/budgets`, { headers });
      
      if (budgetRes.ok) {
        const budgetData = await budgetRes.json();
        console.log('Refetched budgets:', budgetData);
        setBudget(budgetData);
      }
    } catch (error) {
      console.error('Error refetching budget:', error);
    }
  }, [token]);

  // Add a new expense
  const addExpense = useCallback(async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      console.log('Frontend: Adding expense...', expense);
      const response = await fetch(`${API_BASE}/expenses`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          category: expense.category,
          amount: expense.amount,
          description: expense.note || '',
          date: expense.date
        })
      });

      console.log('Frontend: Response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Frontend: Got response:', result);
        
        const newExpense: Expense = {
          ...expense,
          id: result.id.toString(),
          createdAt: new Date().toISOString()
        };
        setExpenses(prev => [newExpense, ...prev]);
        return newExpense;
      } else {
        const error = await response.json();
        console.error('Frontend: API error:', error);
        throw new Error(error.error || 'Failed to add expense');
      }
    } catch (error) {
      console.error('Frontend: Error adding expense:', error);
      // Fallback: add locally
      const newExpense: Expense = {
        ...expense,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString()
      };
      setExpenses(prev => [newExpense, ...prev]);
      return newExpense;
    }
  }, [token]);

  // Delete an expense
  const deleteExpense = useCallback(async (id: string) => {
    try {
      console.log('Frontend: Deleting expense ID:', id);
      const response = await fetch(`${API_BASE}/expenses/${id}`, { 
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      
      console.log('Frontend: Delete response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Frontend: Deleted:', result);
      }
      
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    } catch (error) {
      console.error('Frontend: Error deleting expense:', error);
      setExpenses(prev => prev.filter(exp => exp.id !== id));
    }
  }, []);

  // Update budget
  const updateBudget = useCallback(async (newBudget: Partial<Budget>) => {
    try {
      await fetch(`${API_BASE}/budgets`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(newBudget)
      });
      setBudget(prev => ({ ...prev, ...newBudget }));
    } catch (error) {
      console.error('Error updating budget:', error);
      setBudget(prev => ({ ...prev, ...newBudget }));
    }
  }, []);

  // Update category budget
  const updateCategoryBudget = useCallback(async (category: CategoryId, amount: number) => {
    try {
      await fetch(`${API_BASE}/budgets`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          categoryBudgets: {
            [category]: amount
          }
        })
      });
      setBudget(prev => ({
        ...prev,
        categoryBudgets: {
          ...prev.categoryBudgets,
          [category]: amount
        }
      }));
    } catch (error) {
      console.error('Error updating category budget:', error);
      setBudget(prev => ({
        ...prev,
        categoryBudgets: {
          ...prev.categoryBudgets,
          [category]: amount
        }
      }));
    }
  }, []);

  // Get current month expenses
  const getCurrentMonthExpenses = useCallback(() => {
    const now = new Date();
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    
    return expenses.filter(exp => exp.date.startsWith(currentMonth));
  }, [expenses]);

  // Get last month expenses
  const getLastMonthExpenses = useCallback(() => {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthStr = `${lastMonth.getFullYear()}-${String(lastMonth.getMonth() + 1).padStart(2, '0')}`;
    
    return expenses.filter(exp => exp.date.startsWith(lastMonthStr));
  }, [expenses]);

  // Calculate total spending for current month
  const getCurrentMonthTotal = useCallback(() => {
    return getCurrentMonthExpenses().reduce((sum, exp) => sum + exp.amount, 0);
  }, [getCurrentMonthExpenses]);

  // Calculate spending by category for current month
  const getCurrentMonthByCategory = useCallback(() => {
    const categoryTotals: Partial<Record<CategoryId, number>> = {};
    
    getCurrentMonthExpenses().forEach(exp => {
      categoryTotals[exp.category] = (categoryTotals[exp.category] || 0) + exp.amount;
    });
    
    return categoryTotals;
  }, [getCurrentMonthExpenses]);

  // Get remaining budget
  const getRemainingBudget = useCallback(() => {
    return budget.monthly - getCurrentMonthTotal();
  }, [budget.monthly, getCurrentMonthTotal]);

  // Get remaining budget by category
  const getRemainingCategoryBudget = useCallback((category: CategoryId) => {
    const categoryBudget = budget.categoryBudgets[category] || 0;
    const spent = getCurrentMonthByCategory()[category] || 0;
    return categoryBudget - spent;
  }, [budget.categoryBudgets, getCurrentMonthByCategory]);

  // Get monthly spending history (last 6 months)
  const getMonthlyHistory = useCallback((): MonthlySpending[] => {
    const history: MonthlySpending[] = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthExpenses = expenses.filter(exp => exp.date.startsWith(monthStr));
      const byCategory: Partial<Record<CategoryId, number>> = {};
      
      monthExpenses.forEach(exp => {
        byCategory[exp.category] = (byCategory[exp.category] || 0) + exp.amount;
      });
      
      history.push({
        month: monthStr,
        total: monthExpenses.reduce((sum, exp) => sum + exp.amount, 0),
        byCategory
      });
    }
    
    return history;
  }, [expenses]);

  // Get daily average for current month
  const getDailyAverage = useCallback(() => {
    const now = new Date();
    const dayOfMonth = now.getDate();
    const total = getCurrentMonthTotal();
    return total / dayOfMonth;
  }, [getCurrentMonthTotal]);

  // Get projected monthly spending
  const getProjectedSpending = useCallback(() => {
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const dailyAverage = getDailyAverage();
    return dailyAverage * daysInMonth;
  }, [getDailyAverage]);

  return {
    expenses,
    budget,
    isLoading,
    addExpense,
    deleteExpense,
    updateBudget,
    updateCategoryBudget,
    refetchBudget,
    getCurrentMonthExpenses,
    getLastMonthExpenses,
    getCurrentMonthTotal,
    getCurrentMonthByCategory,
    getRemainingBudget,
    getRemainingCategoryBudget,
    getMonthlyHistory,
    getDailyAverage,
    getProjectedSpending
  };
};
