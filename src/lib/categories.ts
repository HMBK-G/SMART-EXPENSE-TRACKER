import { Category, CategoryId } from '@/types/expense';

export const CATEGORIES: Category[] = [
  {
    id: 'food',
    name: 'Food & Dining',
    icon: '🍔',
    color: 'category-food',
    keywords: ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'coffee', 'cafe', 'pizza', 'burger', 'snack', 'grocery', 'groceries', 'meal', 'eat', 'drink', 'tea', 'zomato', 'swiggy']
  },
  {
    id: 'travel',
    name: 'Travel & Transport',
    icon: '🚗',
    color: 'category-travel',
    keywords: ['travel', 'uber', 'ola', 'cab', 'taxi', 'bus', 'train', 'metro', 'flight', 'petrol', 'fuel', 'gas', 'parking', 'toll', 'transport', 'auto', 'rickshaw']
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: 'category-shopping',
    keywords: ['shopping', 'clothes', 'shoes', 'amazon', 'flipkart', 'myntra', 'gadget', 'electronics', 'phone', 'laptop', 'accessories', 'fashion', 'buy', 'purchase']
  },
  {
    id: 'rent',
    name: 'Rent & Housing',
    icon: '🏠',
    color: 'category-rent',
    keywords: ['rent', 'house', 'apartment', 'flat', 'housing', 'maintenance', 'society', 'deposit', 'lease', 'home']
  },
  {
    id: 'utilities',
    name: 'Utilities & Bills',
    icon: '💡',
    color: 'category-utilities',
    keywords: ['electricity', 'electric', 'water', 'bill', 'gas', 'internet', 'wifi', 'mobile', 'phone', 'recharge', 'dth', 'subscription', 'utility', 'utilities']
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: 'category-entertainment',
    keywords: ['movie', 'cinema', 'netflix', 'spotify', 'game', 'gaming', 'concert', 'show', 'party', 'club', 'bar', 'entertainment', 'fun', 'outing', 'trip']
  },
  {
    id: 'health',
    name: 'Health & Fitness',
    icon: '💊',
    color: 'category-health',
    keywords: ['medicine', 'medical', 'doctor', 'hospital', 'pharmacy', 'gym', 'fitness', 'health', 'clinic', 'dental', 'checkup', 'insurance', 'therapy']
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📦',
    color: 'category-other',
    keywords: []
  }
];

export const getCategoryById = (id: CategoryId): Category => {
  return CATEGORIES.find(cat => cat.id === id) || CATEGORIES[CATEGORIES.length - 1];
};

export const autoDetectCategory = (text: string): CategoryId => {
  const lowerText = text.toLowerCase();
  
  for (const category of CATEGORIES) {
    if (category.id === 'other') continue;
    
    for (const keyword of category.keywords) {
      if (lowerText.includes(keyword)) {
        return category.id;
      }
    }
  }
  
  return 'other';
};

export const getCategoryColor = (id: CategoryId): string => {
  const colors: Record<CategoryId, string> = {
    food: '#f97316',
    travel: '#3b82f6',
    shopping: '#a855f7',
    rent: '#10b981',
    utilities: '#eab308',
    entertainment: '#ec4899',
    health: '#22c55e',
    other: '#64748b'
  };
  return colors[id];
};
