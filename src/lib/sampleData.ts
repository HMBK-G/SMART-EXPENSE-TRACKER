import { Expense } from '@/types/expense';

// Sample expenses for demo purposes
export const getSampleExpenses = (): Expense[] => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  const getDate = (daysAgo: number) => {
    const date = new Date(currentYear, currentMonth, now.getDate() - daysAgo);
    return date.toISOString().split('T')[0];
  };
  
  const getLastMonthDate = (day: number) => {
    const date = new Date(currentYear, currentMonth - 1, day);
    return date.toISOString().split('T')[0];
  };

  return [
    // Current month expenses
    {
      id: 'sample-1',
      amount: 450,
      category: 'food',
      date: getDate(0),
      note: 'Dinner at Zomato',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-2',
      amount: 1200,
      category: 'shopping',
      date: getDate(1),
      note: 'Amazon - Phone case',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-3',
      amount: 250,
      category: 'travel',
      date: getDate(1),
      note: 'Uber to office',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-4',
      amount: 150,
      category: 'food',
      date: getDate(2),
      note: 'Coffee at Starbucks',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-5',
      amount: 15000,
      category: 'rent',
      date: getDate(5),
      note: 'Monthly rent',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-6',
      amount: 2500,
      category: 'utilities',
      date: getDate(7),
      note: 'Electricity bill',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-7',
      amount: 500,
      category: 'entertainment',
      date: getDate(3),
      note: 'Netflix subscription',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-8',
      amount: 800,
      category: 'health',
      date: getDate(4),
      note: 'Gym membership',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-9',
      amount: 350,
      category: 'food',
      date: getDate(2),
      note: 'Groceries',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-10',
      amount: 180,
      category: 'travel',
      date: getDate(0),
      note: 'Metro pass recharge',
      createdAt: new Date().toISOString()
    },
    // Last month expenses (for comparison)
    {
      id: 'sample-11',
      amount: 12000,
      category: 'rent',
      date: getLastMonthDate(5),
      note: 'Monthly rent',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-12',
      amount: 3500,
      category: 'food',
      date: getLastMonthDate(10),
      note: 'Food expenses',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-13',
      amount: 1500,
      category: 'travel',
      date: getLastMonthDate(15),
      note: 'Travel expenses',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-14',
      amount: 2000,
      category: 'shopping',
      date: getLastMonthDate(20),
      note: 'Shopping',
      createdAt: new Date().toISOString()
    },
    {
      id: 'sample-15',
      amount: 1800,
      category: 'utilities',
      date: getLastMonthDate(8),
      note: 'Bills',
      createdAt: new Date().toISOString()
    }
  ];
};
