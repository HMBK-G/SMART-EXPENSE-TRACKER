import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useExpenseContext } from '@/context/ExpenseContext';

export const MonthlySpendingLineChart: React.FC = () => {
  const { getMonthlyHistory, budget } = useExpenseContext();
  
  const history = getMonthlyHistory();

  const data = history.map(item => ({
    month: new Date(item.month + '-01').toLocaleDateString('en-IN', { month: 'short', year: '2-digit' }),
    spending: item.total,
    budget: budget.monthly,
    fullMonth: item.month
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium">{payload[0].payload.month}</p>
          <p className="text-sm text-emerald-600">
            Spending: ₹{payload[0].value.toLocaleString()}
          </p>
          {payload[1] && (
            <p className="text-sm text-blue-600">
              Budget: ₹{payload[1].value.toLocaleString()}
            </p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending Trend</CardTitle>
      </CardHeader>
      <CardContent>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full"
        >
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="month" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `₹${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line
                type="monotone"
                dataKey="spending"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', r: 5 }}
                activeDot={{ r: 7 }}
                name="Spending"
                isAnimationActive={true}
              />
              <Line
                type="monotone"
                dataKey="budget"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', r: 4 }}
                name="Budget Limit"
                isAnimationActive={true}
              />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
        <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
          <div className="p-3 bg-emerald-50 rounded-lg">
            <p className="text-muted-foreground">Current Month</p>
            <p className="text-lg font-semibold text-emerald-600">
              ₹{data.length > 0 ? data[data.length - 1].spending.toLocaleString() : 0}
            </p>
          </div>
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-muted-foreground">Budget Limit</p>
            <p className="text-lg font-semibold text-blue-600">
              ₹{budget.monthly.toLocaleString()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
