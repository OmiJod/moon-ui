import React, { useState, useEffect } from 'react';
import { KeyRound, XCircle, Backpack as Backspace } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

export function PinLock({ onComplete, visible, onClose }: PinLockProps) {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key >= '0' && event.key <= '9' && pin.length < 6) {
        setPin(prev => prev + event.key);
      } else if (event.key === 'Backspace') {
        setPin(prev => prev.slice(0, -1));
      } else if (event.key === 'Enter' && pin.length === 6) {
        handlePinComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [pin]);

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

  const handlePinComplete = async () => {
    if (pin.length !== 6) return;
    
    setValidationError(null);
    
    try {
      const response = await fetch('https://moon-ui/pinComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin })
      });

      const result = await response.json();
      
      if (result.success) {
        onComplete(true);
        onClose();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPin('');
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating pin:', error);
      setValidationError('Failed to validate PIN. Please try again.');
      setError(true);
      setTimeout(() => {
        setError(false);
        setValidationError(null);
        setPin('');
      }, 3000);
    }
  };

  const handleNumberClick = (number: number) => {
    if (pin.length < 6) {
      setPin(prev => prev + number);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  if (!visible) return null;

  const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  return (
    <div className="fixed inset-0 flex items-center justify-center">
      <div
        className={cn(
          "glass-effect w-[350px] p-6 rounded-2xl transition-all duration-500",
          error && "animate-shake",
          isClosing && "animate-fadeOut",
          "relative overflow-hidden"
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
            "rounded-full bg-primary/10 p-3 mb-4 transition-colors relative",
            error && "bg-destructive/10"
          )}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
            <KeyRound className={cn(
              "h-10 w-10 transition-colors relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-xl font-bold text-primary">Enter PIN</h1>
          <p className={cn(
            "text-sm mt-1 transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {error ? "Invalid PIN" : "Enter 6-digit PIN code"}
          </p>
        </div>

        <div className="mt-6 flex justify-center">
          <div className="flex gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-3 h-3 rounded-full transition-all duration-200",
                  i < pin.length
                    ? error
                      ? "bg-destructive"
                      : "bg-primary"
                    : "bg-primary/20"
                )}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 grid grid-cols-3 gap-3">
          {numbers.slice(0, 9).map(number => (
            <button
              key={number}
              onClick={() => handleNumberClick(number)}
              className={cn(
                "h-14 rounded-lg text-lg font-semibold transition-all",
                "bg-primary/5 hover:bg-primary/10 active:bg-primary/15",
                "text-primary hover:text-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-primary/50"
              )}
            >
              {number}
            </button>
          ))}
          <button
            onClick={handleBackspace}
            className="h-14 rounded-lg bg-primary/5 hover:bg-primary/10 active:bg-primary/15 flex items-center justify-center text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            <Backspace className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleNumberClick(0)}
            className="h-14 rounded-lg bg-primary/5 hover:bg-primary/10 active:bg-primary/15 text-lg font-semibold text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
          >
            0
          </button>
          <button
            onClick={handlePinComplete}
            disabled={pin.length !== 6}
            className={cn(
              "h-14 rounded-lg text-lg font-semibold transition-all",
              "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
              "text-primary hover:text-primary/90",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            ↵
          </button>
        </div>

        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-md hover:bg-white/10 transition-colors"
        >
          <XCircle className="w-5 h-5 text-white/70" />
        </button>
      </div>
    </div>
  );
}