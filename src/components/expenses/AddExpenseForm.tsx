import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Mic, MicOff, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useExpenseContext } from '@/context/ExpenseContext';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { CATEGORIES } from '@/lib/categories';
import { CategoryId } from '@/types/expense';
import { toast } from '@/hooks/use-toast';

interface AddExpenseFormProps {
  onClose?: () => void;
}

export const AddExpenseForm: React.FC<AddExpenseFormProps> = ({ onClose }) => {
  const { addExpense } = useExpenseContext();
  const { isListening, transcript, error, startListening, parseExpenseFromText } = useVoiceInput();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState<CategoryId>('other');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');
  const [showVoiceHint, setShowVoiceHint] = useState(false);

  // Handle voice transcript
  React.useEffect(() => {
    if (transcript && !isListening) {
      const parsed = parseExpenseFromText(transcript);
      if (parsed) {
        setAmount(parsed.amount.toString());
        setCategory(parsed.category);
        setNote(parsed.note);
        setShowVoiceHint(true);
        toast({
          title: "Voice recognized!",
          description: `₹${parsed.amount} for ${CATEGORIES.find(c => c.id === parsed.category)?.name}`,
        });
      } else {
        toast({
          variant: "destructive",
          title: "Couldn't parse expense",
          description: "Try saying something like 'Add 250 rupees for coffee'",
        });
      }
    }
  }, [transcript, isListening, parseExpenseFromText]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount greater than 0",
      });
      return;
    }

    addExpense({
      amount: amountNum,
      category,
      date,
      note: note.trim() || undefined,
    });

    toast({
      title: "Expense added!",
      description: `₹${amountNum.toLocaleString()} added to ${CATEGORIES.find(c => c.id === category)?.name}`,
    });

    // Reset form
    setAmount('');
    setCategory('other');
    setNote('');
    setDate(new Date().toISOString().split('T')[0]);
    setShowVoiceHint(false);
    
    if (onClose) onClose();
  };

  return (
    <Card variant="elevated" className="w-full max-w-md mx-auto">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Add Expense</CardTitle>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant={isListening ? "voice" : "outline"}
            size="icon"
            onClick={startListening}
            disabled={isListening}
            className="relative"
          >
            {isListening ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
            {isListening && (
              <motion.span
                className="absolute inset-0 rounded-lg bg-accent/30"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </Button>
          {onClose && (
            <Button type="button" variant="ghost" size="icon" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Voice Hint */}
          <AnimatePresence>
            {(isListening || showVoiceHint) && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="text-sm text-center p-3 bg-secondary rounded-lg"
              >
                {isListening ? (
                  <span className="text-primary font-medium">
                    🎤 Listening... Try "Add 250 rupees for coffee"
                  </span>
                ) : (
                  <span className="text-muted-foreground">
                    ✨ Parsed from voice: "{transcript}"
                  </span>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Amount */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Amount (₹)</label>
            <Input
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="text-2xl font-display h-14"
              required
              min="1"
              step="0.01"
            />
          </div>

          {/* Category Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Category</label>
            <div className="grid grid-cols-4 gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`p-3 rounded-xl text-center transition-all ${
                    category === cat.id
                      ? 'bg-primary text-primary-foreground shadow-md scale-105'
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-xl">{cat.icon}</span>
                  <p className="text-xs mt-1 truncate">{cat.name.split(' ')[0]}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Date */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Date
            </label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
              className="h-12"
            />
          </div>

          {/* Note */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Note (optional)</label>
            <Textarea
              placeholder="What was this expense for?"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={2}
            />
          </div>

          {/* Submit */}
          <Button type="submit" variant="gradient" size="lg" className="w-full">
            <Plus className="h-5 w-5" />
            Add Expense
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
