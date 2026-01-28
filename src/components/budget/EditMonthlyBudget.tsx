import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Edit2, Check, X } from 'lucide-react';
import { useExpenseContext } from '@/context/ExpenseContext';

export const EditMonthlyBudget: React.FC = () => {
  const { token } = useAuth();
  const { budget, refetchBudget } = useExpenseContext();
  const [isEditing, setIsEditing] = useState(false);
  const [newBudget, setNewBudget] = useState(budget.monthly.toString());
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    const budgetValue = parseFloat(newBudget);
    
    if (isNaN(budgetValue) || budgetValue < 0) {
      setError('Please enter a valid budget amount');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/budgets', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          monthly: budgetValue
        })
      });

      if (response.ok) {
        // Refetch budget data
        if (refetchBudget) {
          await refetchBudget();
        }
        setIsEditing(false);
      } else {
        setError('Failed to save budget');
      }
    } catch (err) {
      setError('Error saving budget');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Monthly Budget</span>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="p-2 hover:bg-secondary rounded-lg transition-colors"
            >
              <Edit2 className="h-4 w-4 text-muted-foreground" />
            </button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {isEditing ? (
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Set your monthly budget (₹)
              </label>
              <Input
                type="number"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                placeholder="50000"
                min="0"
                step="100"
                autoFocus
              />
            </div>
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="bg-emerald-600 hover:bg-emerald-700 flex items-center gap-2"
              >
                <Check className="h-4 w-4" />
                {isSaving ? 'Saving...' : 'Save'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setNewBudget(budget.monthly.toString());
                  setError('');
                }}
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-4xl font-bold text-emerald-600">
              ₹{budget.monthly.toLocaleString()}
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Your total monthly spending limit
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
