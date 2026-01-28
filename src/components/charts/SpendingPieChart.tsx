import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseContext } from '@/context/ExpenseContext';
import { CATEGORIES, getCategoryColor } from '@/lib/categories';
import { CategoryId } from '@/types/expense';

export const SpendingPieChart: React.FC = () => {
  const { getCurrentMonthByCategory, getCurrentMonthTotal } = useExpenseContext();
  
  const spentByCategory = getCurrentMonthByCategory();
  const total = getCurrentMonthTotal();

  const data = CATEGORIES
    .map(cat => ({
      name: cat.name,
      value: spentByCategory[cat.id] || 0,
      icon: cat.icon,
      color: getCategoryColor(cat.id as CategoryId)
    }))
    .filter(item => item.value > 0)
    .sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const percentage = ((item.value / total) * 100).toFixed(1);
      return (
        <div className="glass-strong rounded-lg p-3 shadow-lg">
          <p className="font-medium">{item.icon} {item.name}</p>
          <p className="text-sm text-muted-foreground">
            ₹{item.value.toLocaleString()} ({percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="stat">
        <CardHeader>
          <CardTitle className="text-lg">Spending by Category</CardTitle>
        </CardHeader>
        <CardContent>
          {data.length > 0 ? (
            <div className="h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={3}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {data.map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={entry.color}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-muted-foreground">
              No expenses yet this month
            </div>
          )}
          
          {/* Legend */}
          {data.length > 0 && (
            <div className="grid grid-cols-2 gap-2 mt-4">
              {data.slice(0, 6).map((item, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate">{item.icon} {item.name}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};
