import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useExpenseContext } from '@/context/ExpenseContext';

export const BudgetOverview: React.FC = () => {
  const { 
    budget, 
    getCurrentMonthTotal, 
    getRemainingBudget,
    getProjectedSpending 
  } = useExpenseContext();

  const spent = getCurrentMonthTotal();
  const remaining = getRemainingBudget();
  const projected = getProjectedSpending();
  const percentUsed = (spent / budget.monthly) * 100;
  const isOverBudget = remaining < 0;
  const willExceed = projected > budget.monthly;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="gradient" className="overflow-hidden">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Wallet className="h-5 w-5" />
              <span className="text-sm font-medium opacity-90">Monthly Budget</span>
            </div>
            <span className="text-sm opacity-75">
              {new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}
            </span>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-baseline justify-between">
                <span className="text-4xl font-display font-bold">
                  ₹{spent.toLocaleString()}
                </span>
                <span className="text-lg opacity-75">
                  of ₹{budget.monthly.toLocaleString()}
                </span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="relative h-3 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${Math.min(percentUsed, 100)}%` }}
                transition={{ duration: 1, ease: 'easeOut' }}
                className={`absolute h-full rounded-full ${
                  percentUsed > 100 
                    ? 'bg-destructive' 
                    : percentUsed > 80 
                      ? 'bg-warning' 
                      : 'bg-white/90'
                }`}
              />
            </div>

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-1">
                {isOverBudget ? (
                  <TrendingDown className="h-4 w-4 text-destructive-foreground" />
                ) : (
                  <TrendingUp className="h-4 w-4" />
                )}
                <span className={isOverBudget ? 'text-destructive-foreground' : ''}>
                  {isOverBudget ? 'Over by' : 'Remaining'}: ₹{Math.abs(remaining).toLocaleString()}
                </span>
              </div>
              {willExceed && !isOverBudget && (
                <span className="text-warning-foreground bg-warning/20 px-2 py-0.5 rounded-full text-xs">
                  Projected: ₹{Math.round(projected).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
