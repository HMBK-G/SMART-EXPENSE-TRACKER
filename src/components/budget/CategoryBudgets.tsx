import React from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseContext } from '@/context/ExpenseContext';
import { CATEGORIES, getCategoryColor } from '@/lib/categories';
import { CategoryId } from '@/types/expense';

export const CategoryBudgets: React.FC = () => {
  const { 
    budget, 
    getCurrentMonthByCategory,
    getRemainingCategoryBudget 
  } = useExpenseContext();

  const spentByCategory = getCurrentMonthByCategory();

  const categoryData = CATEGORIES.filter(cat => cat.id !== 'other').map(cat => {
    const spent = spentByCategory[cat.id] || 0;
    const budgetAmount = budget.categoryBudgets[cat.id] || 0;
    const remaining = getRemainingCategoryBudget(cat.id);
    const percentUsed = budgetAmount > 0 ? (spent / budgetAmount) * 100 : 0;

    return {
      ...cat,
      spent,
      budget: budgetAmount,
      remaining,
      percentUsed
    };
  }).filter(cat => cat.budget > 0 || cat.spent > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Category Budgets</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {categoryData.map((cat, index) => (
          <motion.div
            key={cat.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <span className="text-lg">{cat.icon}</span>
                <span className="font-medium">{cat.name}</span>
              </div>
              <div className="text-right">
                <span className={cat.remaining < 0 ? 'text-destructive' : 'text-muted-foreground'}>
                  ₹{cat.spent.toLocaleString()}
                </span>
                <span className="text-muted-foreground"> / ₹{cat.budget.toLocaleString()}</span>
              </div>
            </div>
            <div className="relative h-2 bg-muted rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(cat.percentUsed, 100)}%` }}
                transition={{ duration: 0.8, delay: index * 0.05 }}
                className="absolute h-full rounded-full"
                style={{ 
                  backgroundColor: getCategoryColor(cat.id as CategoryId),
                  opacity: cat.percentUsed > 100 ? 1 : 0.8
                }}
              />
            </div>
          </motion.div>
        ))}

        {categoryData.length === 0 && (
          <p className="text-center text-muted-foreground py-4">
            No category budgets set. Add expenses to see your spending.
          </p>
        )}
      </CardContent>
    </Card>
  );
};
