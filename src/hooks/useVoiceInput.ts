import { useState, useCallback } from 'react';
import { autoDetectCategory } from '@/lib/categories';
import { CategoryId } from '@/types/expense';

interface ParsedVoiceExpense {
  amount: number;
  category: CategoryId;
  note: string;
}

export const useVoiceInput = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const parseExpenseFromText = useCallback((text: string): ParsedVoiceExpense | null => {
    const lowerText = text.toLowerCase().trim();
    
    // Pattern matching for various formats
    // "Add 250 rupees for coffee"
    // "Spent 1000 on groceries"
    // "500 for uber"
    // "Add expense 300 rupees food"
    // "250 rupees coffee"
    
    // Extract amount
    const amountPatterns = [
      /(\d+(?:,\d{3})*(?:\.\d{1,2})?)\s*(?:rupees?|rs\.?|₹|inr)?/i,
      /(?:rupees?|rs\.?|₹|inr)\s*(\d+(?:,\d{3})*(?:\.\d{1,2})?)/i,
    ];
    
    let amount: number | null = null;
    
    for (const pattern of amountPatterns) {
      const match = lowerText.match(pattern);
      if (match) {
        amount = parseFloat(match[1].replace(/,/g, ''));
        break;
      }
    }
    
    if (!amount || isNaN(amount) || amount <= 0) {
      return null;
    }
    
    // Auto-detect category from the text
    const category = autoDetectCategory(lowerText);
    
    // Extract note (everything except the amount and common words)
    const cleanedText = text
      .replace(/\d+(?:,\d{3})*(?:\.\d{1,2})?/g, '')
      .replace(/(?:add|spent|expense|rupees?|rs\.?|₹|inr|for|on)/gi, '')
      .trim();
    
    const note = cleanedText.length > 0 ? cleanedText : `Voice entry: ${text}`;
    
    return {
      amount,
      category,
      note
    };
  }, []);

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setError('Voice input is not supported in your browser. Try Chrome or Edge.');
      return;
    }

    setError(null);
    setTranscript('');
    
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-IN'; // Indian English for better rupee understanding
    
    recognition.onstart = () => {
      setIsListening(true);
    };
    
    recognition.onresult = (event: any) => {
      const results = event.results;
      const transcript = results[results.length - 1][0].transcript;
      setTranscript(transcript);
    };
    
    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      setError(event.error === 'not-allowed' 
        ? 'Microphone access denied. Please allow microphone access.' 
        : 'Error recognizing speech. Please try again.'
      );
      setIsListening(false);
    };
    
    recognition.onend = () => {
      setIsListening(false);
    };
    
    try {
      recognition.start();
    } catch (err) {
      setError('Failed to start voice input. Please try again.');
      setIsListening(false);
    }
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    transcript,
    error,
    startListening,
    stopListening,
    parseExpenseFromText
  };
};
