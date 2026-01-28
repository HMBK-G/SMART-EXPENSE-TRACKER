export type CategoryId = 
  | 'food'
  | 'travel'
  | 'shopping'
  | 'rent'
  | 'utilities'
  | 'entertainment'
  | 'health'
  | 'other';

export interface Category {
  id: CategoryId;
  name: string;
  icon: string;
  color: string;
  keywords: string[]; // For auto-categorization
}

export interface Expense {
  id: string;
  amount: number;
  category: CategoryId;
  date: string; // ISO date string
  note?: string;
  createdAt: string;
}

export interface Budget {
  monthly: number;
  categoryBudgets: Partial<Record<CategoryId, number>>;
}

export interface SpendingInsight {
  id: string;
  type: 'warning' | 'tip' | 'achievement' | 'prediction';
  title: string;
  message: string;
  icon: string;
}

export interface MonthlySpending {
  month: string; // YYYY-MM
  total: number;
  byCategory: Partial<Record<CategoryId, number>>;
}
