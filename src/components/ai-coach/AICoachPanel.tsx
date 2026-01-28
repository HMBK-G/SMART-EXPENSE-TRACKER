import React from 'react';
import { motion } from 'framer-motion';
import { Lightbulb, AlertTriangle, TrendingUp, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SpendingInsight } from '@/types/expense';

interface AICoachPanelProps {
  insights: SpendingInsight[];
}

const getIconComponent = (type: SpendingInsight['type']) => {
  switch (type) {
    case 'warning':
      return <AlertTriangle className="h-5 w-5 text-warning" />;
    case 'tip':
      return <Lightbulb className="h-5 w-5 text-primary" />;
    case 'achievement':
      return <Trophy className="h-5 w-5 text-success" />;
    case 'prediction':
      return <TrendingUp className="h-5 w-5 text-accent" />;
    default:
      return <Lightbulb className="h-5 w-5" />;
  }
};

const getInsightBg = (type: SpendingInsight['type']) => {
  switch (type) {
    case 'warning':
      return 'bg-warning/10 border-warning/20';
    case 'tip':
      return 'bg-primary/10 border-primary/20';
    case 'achievement':
      return 'bg-success/10 border-success/20';
    case 'prediction':
      return 'bg-accent/10 border-accent/20';
    default:
      return 'bg-secondary border-border';
  }
};

export const AICoachPanel: React.FC<AICoachPanelProps> = ({ insights }) => {
  if (insights.length === 0) {
    return (
      <Card variant="insight">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <span className="text-2xl">🤖</span>
            AI Spending Coach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4 text-muted-foreground">
            <p className="text-4xl mb-2">✨</p>
            <p>Add more expenses to get personalized insights!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card variant="insight">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Spending Coach
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => (
          <motion.div
            key={insight.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className={`p-4 rounded-xl border ${getInsightBg(insight.type)}`}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {getIconComponent(insight.type)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm flex items-center gap-2">
                  <span>{insight.icon}</span>
                  {insight.title}
                </h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {insight.message}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};
