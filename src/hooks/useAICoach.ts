import { useCallback } from 'react';
import { SpendingInsight, CategoryId, Expense, Budget } from '@/types/expense';
import { getCategoryById } from '@/lib/categories';

const API_BASE = 'http://localhost:5000/api';

interface AICoachParams {
  expenses: Expense[];
  budget: Budget;
}

export const generateAIInsights = ({ expenses, budget }: AICoachParams): SpendingInsight[] => {
  const insights: SpendingInsight[] = [];
  
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = `${lastMonthDate.getFullYear()}-${String(lastMonthDate.getMonth() + 1).padStart(2, '0')}`;
  
  // Filter expenses by month
  const currentMonthExpenses = expenses.filter(exp => exp.date.startsWith(currentMonth));
  const lastMonthExpenses = expenses.filter(exp => exp.date.startsWith(lastMonth));
  
  // Calculate totals
  const currentMonthTotal = currentMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  const lastMonthTotal = lastMonthExpenses.reduce((sum, exp) => sum + exp.amount, 0);
  
  // Calculate by category
  const currentByCategory: Partial<Record<CategoryId, number>> = {};
  currentMonthExpenses.forEach(exp => {
    currentByCategory[exp.category] = (currentByCategory[exp.category] || 0) + exp.amount;
  });
  
  const lastMonthByCategory: Partial<Record<CategoryId, number>> = {};
  lastMonthExpenses.forEach(exp => {
    lastMonthByCategory[exp.category] = (lastMonthByCategory[exp.category] || 0) + exp.amount;
  });
  
  // Calculate projected spending
  const dayOfMonth = now.getDate();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dailyAverage = dayOfMonth > 0 ? currentMonthTotal / dayOfMonth : 0;
  const projected = dailyAverage * daysInMonth;
  const remaining = budget.monthly - currentMonthTotal;

  // 1. Budget overspend prediction
  if (projected > budget.monthly && currentMonthTotal > 0) {
    const overspend = projected - budget.monthly;
    insights.push({
      id: 'overspend-prediction',
      type: 'warning',
      title: 'Budget Alert',
      message: `At this rate, you may exceed your budget by ₹${Math.round(overspend).toLocaleString()} this month.`,
      icon: '⚠️'
    });
  }

  // 2. Compare spending with last month
  if (lastMonthTotal > 0 && currentMonthTotal > 0) {
    const percentChange = ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100;
    
    if (percentChange > 20) {
      insights.push({
        id: 'spending-increase',
        type: 'warning',
        title: 'Spending Up',
        message: `You've spent ${Math.abs(percentChange).toFixed(0)}% more than last month so far.`,
        icon: '📈'
      });
    } else if (percentChange < -15) {
      insights.push({
        id: 'spending-decrease',
        type: 'achievement',
        title: 'Great Progress!',
        message: `You're spending ${Math.abs(percentChange).toFixed(0)}% less than last month! Keep it up!`,
        icon: '🎉'
      });
    }
  }

  // 3. Category-wise comparisons
  Object.entries(currentByCategory).forEach(([category, amount]) => {
    const catId = category as CategoryId;
    const lastMonthAmount = lastMonthByCategory[catId] || 0;
    
    if (lastMonthAmount > 0) {
      const percentChange = ((amount - lastMonthAmount) / lastMonthAmount) * 100;
      
      if (percentChange > 35) {
        const categoryInfo = getCategoryById(catId);
        insights.push({
          id: `category-spike-${catId}`,
          type: 'warning',
          title: `${categoryInfo.icon} ${categoryInfo.name} Spike`,
          message: `You've spent ${percentChange.toFixed(0)}% more on ${categoryInfo.name.toLowerCase()} compared to last month.`,
          icon: categoryInfo.icon
        });
      }
    }
  });

  // 4. Category budget warnings
  Object.entries(currentByCategory).forEach(([category, amount]) => {
    const catId = category as CategoryId;
    const categoryBudget = budget.categoryBudgets[catId] || 0;
    
    if (categoryBudget > 0) {
      const percentUsed = (amount / categoryBudget) * 100;
      
      if (percentUsed >= 100) {
        const categoryInfo = getCategoryById(catId);
        insights.push({
          id: `category-exceeded-${catId}`,
          type: 'warning',
          title: 'Budget Exceeded',
          message: `You've exceeded your ${categoryInfo.name.toLowerCase()} budget by ₹${(amount - categoryBudget).toLocaleString()}.`,
          icon: '🚨'
        });
      } else if (percentUsed >= 80) {
        const categoryInfo = getCategoryById(catId);
        insights.push({
          id: `category-warning-${catId}`,
          type: 'tip',
          title: 'Approaching Limit',
          message: `You've used ${percentUsed.toFixed(0)}% of your ${categoryInfo.name.toLowerCase()} budget.`,
          icon: '⚡'
        });
      }
    }
  });

  // 5. Positive reinforcement
  if (remaining > 0 && remaining > budget.monthly * 0.3) {
    insights.push({
      id: 'budget-healthy',
      type: 'achievement',
      title: 'On Track!',
      message: `You still have ₹${remaining.toLocaleString()} left in your budget. You're doing great!`,
      icon: '✨'
    });
  }

  // 6. Daily spending tip
  const daysLeft = daysInMonth - dayOfMonth;
  if (daysLeft > 0 && remaining > 0) {
    const dailyAllowance = remaining / daysLeft;
    insights.push({
      id: 'daily-allowance',
      type: 'tip',
      title: 'Daily Budget',
      message: `Try to keep daily spending under ₹${Math.round(dailyAllowance).toLocaleString()} for the rest of the month.`,
      icon: '💡'
    });
  }

  // 7. Top spending category
  const categories = Object.entries(currentByCategory);
  if (categories.length > 0 && currentMonthTotal > 0) {
    const topCategory = categories.reduce((a, b) => (a[1] > b[1] ? a : b));
    const categoryInfo = getCategoryById(topCategory[0] as CategoryId);
    const percentage = ((topCategory[1] as number) / currentMonthTotal) * 100;
    
    if (percentage > 40) {
      insights.push({
        id: 'top-category',
        type: 'tip',
        title: 'Top Spending',
        message: `${categoryInfo.icon} ${categoryInfo.name} accounts for ${percentage.toFixed(0)}% of your spending this month.`,
        icon: '📊'
      });
    }
  }

  // Sort by priority: warnings first, then tips, then achievements
  const priority: Record<SpendingInsight['type'], number> = {
    warning: 0,
    prediction: 1,
    tip: 2,
    achievement: 3
  };
  
  return insights.sort((a, b) => priority[a.type] - priority[b.type]).slice(0, 5);
};

export const useAICoach = () => {
  const generateInsights = useCallback(async (expenses: Expense[], budget: Budget) => {
    try {
      // Try to fetch from backend first
      const response = await fetch(`${API_BASE}/insights`);
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.warn('Backend insights not available, using local calculation:', error);
    }
    
    // Fallback to local calculation
    return generateAIInsights({ expenses, budget });
  }, []);

  return { generateInsights };
};
