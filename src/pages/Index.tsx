import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Mic, BarChart3, Settings, Target, LogOut, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { ExpenseProvider, useExpenseContext } from '@/context/ExpenseContext';
import { BudgetOverview } from '@/components/budget/BudgetOverview';
import { CategoryBudgets } from '@/components/budget/CategoryBudgets';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { MonthlyBarChart } from '@/components/charts/MonthlyBarChart';
import { AddExpenseForm } from '@/components/expenses/AddExpenseForm';
import { ExpenseList } from '@/components/expenses/ExpenseList';
import { AICoachPanel } from '@/components/ai-coach/AICoachPanel';
import { ComparisonView } from '@/components/analytics/ComparisonView';
import { generateAIInsights } from '@/hooks/useAICoach';

const DashboardContent: React.FC = () => {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'analytics' | 'comparison' | 'budget'>('dashboard');
  const { isLoading, expenses, budget } = useExpenseContext();

  const insights = generateAIInsights({ expenses, budget });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full mx-auto"
          />
          <p className="mt-4 text-muted-foreground">Loading your expenses...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 glass-strong border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-2xl font-bold text-primary">
                💰 ExpenseAI
              </h1>
              <p className="text-sm text-muted-foreground">
                Welcome, {user?.first_name}! Smart expense tracking
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="gradient" 
                size="lg"
                onClick={() => setShowAddForm(true)}
                className="hidden sm:flex"
              >
                <Plus className="h-5 w-5" />
                Add Expense
              </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleLogout}
                className="hidden sm:flex"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="sticky top-[73px] z-30 glass-strong border-b">
        <div className="container mx-auto px-4">
          <nav className="flex gap-1 py-2">
            {[
              { id: 'dashboard', label: 'Dashboard', icon: Target },
              { id: 'analytics', label: 'Analytics', icon: BarChart3 },
              { id: 'comparison', label: 'Comparison', icon: TrendingUp },
              { id: 'budget', label: 'Budgets', icon: Settings },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-secondary text-muted-foreground'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <BudgetOverview />
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ExpenseList />
                <AICoachPanel insights={insights} />
              </div>
            </motion.div>
          )}

          {activeTab === 'analytics' && (
            <motion.div
              key="analytics"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-2 gap-6"
            >
              <SpendingPieChart />
              <MonthlyBarChart />
            </motion.div>
          )}

          {activeTab === 'comparison' && (
            <motion.div
              key="comparison"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <ComparisonView />
            </motion.div>
          )}

          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <BudgetOverview />
              <CategoryBudgets />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Floating Action Button (Mobile) */}
      <div className="fixed bottom-6 right-6 sm:hidden z-50">
        <Button
          variant="gradient"
          size="icon-xl"
          onClick={() => setShowAddForm(true)}
          className="shadow-lg"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Add Expense Modal */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/20 backdrop-blur-sm p-4"
            onClick={() => setShowAddForm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              <AddExpenseForm onClose={() => setShowAddForm(false)} />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Index = () => {
  return (
    <ExpenseProvider>
      <DashboardContent />
    </ExpenseProvider>
  );
};

export default Index;
