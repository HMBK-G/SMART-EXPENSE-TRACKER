import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useExpenseContext } from '@/context/ExpenseContext';
import { CATEGORIES } from '@/lib/categories';
import { CategoryId } from '@/types/expense';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from 'recharts';

interface CategoryComparison {
  categoryId: CategoryId;
  categoryName: string;
  icon: string;
  previousMonth: number;
  currentMonth: number;
  difference: number;
  percentChange: number;
  trend: 'up' | 'down' | 'stable';
}

export const ComparisonView: React.FC = () => {
  const { expenses } = useExpenseContext();
  const [selectedMonth, setSelectedMonth] = useState<string>('');

  // Get current month
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  // Get the last 5 months from current month
  const availableMonths = useMemo(() => {
    const months: string[] = [];
    const date = new Date(now);
    
    // Generate last 5 months (including current month)
    for (let i = 0; i < 5; i++) {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      months.push(`${year}-${month}`);
      date.setMonth(date.getMonth() - 1);
    }
    
    return months; // Jan, Dec, Nov, Oct, Sep
  }, []);

  // Set default selected month to previous month if not set
  const comparisonMonth = useMemo(() => {
    if (selectedMonth && selectedMonth !== currentMonth) return selectedMonth;
    // Find the previous month from available months
    const filtered = availableMonths.filter((m) => m < currentMonth);
    return filtered.length > 0 ? filtered[0] : availableMonths.find((m) => m !== currentMonth) || currentMonth;
  }, [selectedMonth, currentMonth, availableMonths]);

  // Format month to display name
  const formatMonthName = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Calculate category-by-category comparison
  const categoryComparisons = useMemo((): CategoryComparison[] => {
    const categoryIds: CategoryId[] = ['food', 'travel', 'shopping', 'rent', 'utilities', 'entertainment', 'health', 'other'];
    const comparisons: CategoryComparison[] = [];

    categoryIds.forEach((catId) => {
      const currentExpenses = expenses
        .filter((e) => e.date.startsWith(currentMonth) && e.category === catId)
        .reduce((sum, e) => sum + e.amount, 0);

      const comparisonExpenses = expenses
        .filter((e) => e.date.startsWith(comparisonMonth) && e.category === catId)
        .reduce((sum, e) => sum + e.amount, 0);

      const difference = currentExpenses - comparisonExpenses;
      const percentChange = comparisonExpenses === 0 ? (currentExpenses > 0 ? 100 : 0) : (difference / comparisonExpenses) * 100;
      const trend = difference > 0 ? 'up' : difference < 0 ? 'down' : 'stable';

      const category = CATEGORIES.find((c) => c.id === catId);

      // Only show categories with spending in either month
      if (currentExpenses > 0 || comparisonExpenses > 0) {
        comparisons.push({
          categoryId: catId,
          categoryName: category?.name || catId,
          icon: category?.icon || '📦',
          previousMonth: comparisonExpenses,
          currentMonth: currentExpenses,
          difference,
          percentChange,
          trend,
        });
      }
    });

    return comparisons.sort((a, b) => Math.abs(b.difference) - Math.abs(a.difference));
  }, [expenses, currentMonth, comparisonMonth]);

  // Overall totals
  const totals = useMemo(() => {
    const currentTotal = categoryComparisons.reduce((sum, c) => sum + c.currentMonth, 0);
    const previousTotal = categoryComparisons.reduce((sum, c) => sum + c.previousMonth, 0);
    const difference = currentTotal - previousTotal;
    const percentChange = previousTotal === 0 ? 0 : (difference / previousTotal) * 100;

    return { currentTotal, previousTotal, difference, percentChange };
  }, [categoryComparisons]);

  // Chart data
  const chartData = categoryComparisons.map((c) => ({
    name: c.categoryName,
    previous: parseFloat(c.previousMonth.toFixed(2)),
    current: parseFloat(c.currentMonth.toFixed(2)),
  }));

  // Insights
  const insights = useMemo(() => {
    const increases = categoryComparisons.filter((c) => c.trend === 'up').slice(0, 2);
    const decreases = categoryComparisons.filter((c) => c.trend === 'down').slice(0, 2);

    return { increases, decreases };
  }, [categoryComparisons]);

  const comparisonChart = useMemo(() => {
    if (!totals) return [];
    return [
      { name: 'Current', value: parseFloat(totals.currentTotal.toFixed(2)) },
      { name: 'Previous', value: parseFloat(totals.previousTotal.toFixed(2)) },
    ];
  }, [totals]);


  return (
    <div className="space-y-6">
      {/* Header Card with Month Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-gradient-to-r from-teal-500 to-green-500 p-6 text-white shadow-lg"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold mb-2">📊 Monthly Comparison</h2>
            <p className="text-white/80">Compare {formatMonthName(comparisonMonth)} with {formatMonthName(currentMonth)}</p>
          </div>
          <Select value={comparisonMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-full md:w-48 bg-white/20 border-white/30 text-white">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                month !== currentMonth && (
                  <SelectItem key={month} value={month}>
                    {formatMonthName(month)}
                  </SelectItem>
                )
              ))}
            </SelectContent>
          </Select>
        </div>
      </motion.div>

      {/* Overall Totals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        {/* This Month */}
        <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-blue-100 p-6 shadow">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">This Month ({formatMonthName(currentMonth)})</h3>
          <p className="text-4xl font-bold text-blue-700 mb-2">₹{totals.currentTotal.toFixed(2)}</p>
          <p className="text-xs text-blue-600">{categoryComparisons.length} categories</p>
        </div>

        {/* Difference */}
        <div className={`rounded-2xl p-6 shadow ${
          totals.difference > 0
            ? 'bg-gradient-to-br from-red-50 to-red-100'
            : totals.difference < 0
              ? 'bg-gradient-to-br from-green-50 to-green-100'
              : 'bg-gradient-to-br from-gray-50 to-gray-100'
        }`}>
          <h3 className={`text-sm font-semibold mb-2 ${
            totals.difference > 0
              ? 'text-red-900'
              : totals.difference < 0
                ? 'text-green-900'
                : 'text-gray-900'
          }`}>
            {totals.difference > 0 ? '📈 Increase' : totals.difference < 0 ? '📉 Decrease' : '➡️ No Change'}
          </h3>
          <p className={`text-4xl font-bold mb-2 ${
            totals.difference > 0
              ? 'text-red-700'
              : totals.difference < 0
                ? 'text-green-700'
                : 'text-gray-700'
          }`}>
            {totals.difference > 0 ? '+' : ''}₹{totals.difference.toFixed(2)}
          </p>
          <p className={`text-lg font-bold ${
            totals.difference > 0
              ? 'text-red-600'
              : totals.difference < 0
                ? 'text-green-600'
                : 'text-gray-600'
          }`}>
            {totals.percentChange > 0 ? '+' : ''}{totals.percentChange.toFixed(1)}%
          </p>
        </div>

        {/* Comparison Month */}
        <div className="rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 p-6 shadow">
          <h3 className="text-sm font-semibold text-slate-900 mb-2">{formatMonthName(comparisonMonth)}</h3>
          <p className="text-4xl font-bold text-slate-700 mb-2">₹{totals.previousTotal.toFixed(2)}</p>
          <p className="text-xs text-slate-600">{categoryComparisons.length} categories</p>
        </div>
      </motion.div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="rounded-2xl bg-white p-6 shadow"
      >
        <h3 className="text-lg font-bold mb-4">Category Comparison</h3>
        <ResponsiveContainer width="100%" height={450}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 100 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} interval={0} />
            <YAxis />
            <Tooltip formatter={(value) => `₹${Number(value).toFixed(2)}`} />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />

            <Bar dataKey="previous" fill="#94a3b8" name={formatMonthName(comparisonMonth)} radius={[8, 8, 0, 0]} />
            <Bar dataKey="current" fill="#14b8a6" name={formatMonthName(currentMonth)} radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Category Details */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-bold">Item-by-Item Analysis</h3>
        {categoryComparisons.map((category, idx) => (
          <motion.div
            key={category.categoryId}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 * idx }}
            className={`rounded-2xl p-4 shadow transition-all ${
              category.trend === 'up'
                ? 'bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500'
                : category.trend === 'down'
                  ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500'
                  : 'bg-gradient-to-r from-gray-50 to-gray-100 border-l-4 border-gray-400'
            }`}
          >
            <div className="flex items-center justify-between">
              {/* Left: Item Info */}
              <div className="flex items-center gap-3 flex-1">
                <span className="text-3xl">{category.icon}</span>
                <div>
                  <p className="font-bold text-sm">{category.categoryName}</p>
                  <div className="flex gap-4 text-xs text-muted-foreground mt-1">
                    <span>Last: ₹{category.previousMonth.toFixed(2)}</span>
                    <span>•</span>
                    <span>This: ₹{category.currentMonth.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Right: Change Info */}
              <div className="text-right">
                <div className={`flex items-center gap-1 justify-end font-bold text-lg mb-1 ${
                  category.trend === 'up'
                    ? 'text-red-600'
                    : category.trend === 'down'
                      ? 'text-green-600'
                      : 'text-gray-600'
                }`}>
                  {category.trend === 'up' ? (
                    <>
                      <TrendingUp className="w-4 h-4" />
                      +₹{category.difference.toFixed(2)}
                    </>
                  ) : category.trend === 'down' ? (
                    <>
                      <TrendingDown className="w-4 h-4" />
                      -₹{Math.abs(category.difference).toFixed(2)}
                    </>
                  ) : (
                    <>-₹{category.difference.toFixed(2)}</>
                  )}
                </div>
                <p className={`text-sm font-bold ${
                  category.trend === 'up'
                    ? 'text-red-600'
                    : category.trend === 'down'
                      ? 'text-green-600'
                      : 'text-gray-600'
                }`}>
                  {category.percentChange > 0 ? '+' : ''}
                  {category.percentChange.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 pt-3 border-t border-gray-300">
              <div className="flex items-center gap-2">
                <div className="text-xs font-semibold text-gray-700 w-24">
                  {category.previousMonth > 0 ? 'vs Last Month' : 'New Category'}
                </div>
                <div className="h-2 flex-1 bg-gray-300 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${
                      category.trend === 'up'
                        ? 'bg-red-500'
                        : category.trend === 'down'
                          ? 'bg-green-500'
                          : 'bg-gray-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        category.previousMonth > 0
                          ? (category.currentMonth / category.previousMonth) * 100
                          : 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Insights Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-1 md:grid-cols-2 gap-4"
      >
        {/* Biggest Increases */}
        {insights.increases.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 p-6">
            <h4 className="font-bold text-red-900 mb-3 flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              📈 Biggest Increases
            </h4>
            <div className="space-y-2">
              {insights.increases.map((cat) => (
                <div key={cat.categoryId} className="text-sm">
                  <p className="font-semibold text-red-800">
                    {cat.categoryName}: <span className="text-red-600">+{cat.percentChange.toFixed(1)}%</span>
                  </p>
                  <p className="text-xs text-red-700">+₹{cat.difference.toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Biggest Decreases */}
        {insights.decreases.length > 0 && (
          <div className="rounded-2xl bg-gradient-to-r from-green-50 to-emerald-50 border-l-4 border-green-500 p-6">
            <h4 className="font-bold text-green-900 mb-3 flex items-center gap-2">
              <TrendingDown className="w-5 h-5" />
              📉 Biggest Decreases
            </h4>
            <div className="space-y-2">
              {insights.decreases.map((cat) => (
                <div key={cat.categoryId} className="text-sm">
                  <p className="font-semibold text-green-800">
                    {cat.categoryName}: <span className="text-green-600">{cat.percentChange.toFixed(1)}%</span>
                  </p>
                  <p className="text-xs text-green-700">-₹{Math.abs(cat.difference).toFixed(2)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
