import React, { useState, useEffect } from 'react';
import { Calculator, XCircle, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MathPuzzleLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

export function MathPuzzleLock({ onComplete, visible, onClose }: MathPuzzleLockProps) {
  const [equation, setEquation] = useState<string>('');
  const [answer, setAnswer] = useState<string>('');
  const [result, setResult] = useState<boolean | null>(null);
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'Enter') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [answer]);

  useEffect(() => {
    if (visible) {
      fetchEquation();
    }
  }, [visible]);

  const fetchEquation = async () => {
    setIsPlaying(true);
    try {
      const response = await fetch('https://moon-ui/getMathEquation', {
        method: 'POST',
      });
      const data = await response.json();
      setEquation(data.equation);
    } catch (error) {
      console.error('Error fetching equation:', error);
      setValidationError('Failed to fetch equation. Please try again.');
      setError(true);
      setTimeout(() => {
        setError(false);
        setValidationError(null);
      }, 3000);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    fetch('https://moon-ui/closeUI', {
      method: 'POST',
    });
    setTimeout(() => {
      onComplete(false);
      onClose();
    }, 500);
  };

  const handleComplete = async () => {
    if (!answer) return;
    
    setValidationError(null);
    setIsPlaying(true);
    
    try {
      const response = await fetch('https://moon-ui/validateMathAnswer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ answer: parseFloat(answer) })
      });

      const result = await response.json();
      
      if (result.success) {
        setResult(true);
        setTimeout(() => {
          onComplete(true);
          onClose();
        }, 1000);
      } else {
        setResult(false);
        setError(true);
        setTimeout(() => {
          setError(false);
          setResult(null);
          setAnswer('');
          fetchEquation();
        }, 2000);
      }
    } catch (error) {
      console.error('Error validating answer:', error);
      setValidationError('Failed to validate answer. Please try again.');
      setError(true);
      setTimeout(() => {
        setError(false);
        setValidationError(null);
        setAnswer('');
      }, 3000);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    setAnswer('');
    setResult(null);
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div
        className={cn(
          "glass-effect w-[600px] p-8 rounded-3xl transition-all duration-500",
          error && "animate-shake",
          isClosing && "animate-fadeOut"
        )}
      >
        {validationError && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-destructive/10 text-destructive px-4 py-2 rounded-lg flex items-center gap-2 animate-fadeIn">
            <XCircle className="h-4 w-4" />
            <span className="text-sm">{validationError}</span>
          </div>
        )}

        <div className="flex flex-col items-center">
          <div className={cn(
            "rounded-full bg-primary/10 p-6 mb-6 relative",
            error && "bg-destructive/10"
          )}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
            <Calculator className={cn(
              "h-14 w-14 relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Math Puzzle</h1>
          <p className={cn(
            "text-lg mt-1 transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {error ? "Incorrect answer" : "Solve the equation"}
          </p>
        </div>

        <div className="mt-10">
          <div className={cn(
            "backdrop-blur-md rounded-2xl p-8 mb-6 min-h-[100px] flex items-center justify-center border-2 transition-colors",
            error ? "border-destructive/20" : "border-primary/20"
          )}>
            <span className="text-primary text-5xl font-mono tracking-wider">
              {equation}
            </span>
          </div>

          <div className="relative">
            <input
              type="number"
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              placeholder="Enter your answer"
              disabled={isPlaying}
              className={cn(
                "w-full h-16 rounded-xl transition-all px-6",
                "bg-primary/5 hover:bg-primary/10",
                "text-primary text-2xl font-mono text-center tracking-wider",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "placeholder:text-primary/40",
                "border-2 border-primary/20"
              )}
            />
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleReset}
              disabled={!answer || isPlaying}
              className={cn(
                "flex-1 h-14 rounded-xl transition-all flex items-center justify-center gap-3",
                "bg-primary/5 hover:bg-primary/10 active:bg-primary/15",
                "text-primary hover:text-primary/90 text-lg",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border-2 border-primary/20"
              )}
            >
              <RotateCcw className="w-6 h-6" />
              Reset
            </button>
            <button
              onClick={handleComplete}
              disabled={!answer || isPlaying}
              className={cn(
                "flex-1 h-14 rounded-xl transition-all flex items-center justify-center gap-3",
                "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
                "text-primary hover:text-primary/90 text-lg",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border-2 border-primary/20"
              )}
            >
              <CheckCircle className="w-6 h-6" />
              Submit
            </button>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-6 right-6 p-2 rounded-md hover:bg-white/10 transition-colors"
        >
          <XCircle className="w-6 h-6 text-white/70" />
        </button>
      </div>
    </div>
  );
}