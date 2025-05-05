import React, { useState, useEffect } from 'react';
import { KeySquare, XCircle, Backpack as Backspace, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeypadLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

export function KeypadLock({ onComplete, visible, onClose }: KeypadLockProps) {
  const [code, setCode] = useState<string>('');
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [shift, setShift] = useState(false);

  const keys = [
    ['1', '2', '3', 'A', 'B', 'C'],
    ['4', '5', '6', 'D', 'E', 'F'],
    ['7', '8', '9', 'G', 'H', 'I'],
    ['*', '0', '#', 'J', 'K', 'L']
  ];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'Backspace') {
        handleBackspace();
      } else if (event.key === 'Enter') {
        handleComplete();
      } else if (event.key === 'Shift') {
        setShift(true);
      } else {
        const key = event.key.toUpperCase();
        if (isValidKey(key)) {
          handleKeyClick(key);
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.key === 'Shift') {
        setShift(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [code]);

  const isValidKey = (key: string): boolean => {
    return keys.flat().includes(key) || (key >= '0' && key <= '9') || key === '*' || key === '#';
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
    if (code.length < 4) return;
    
    setValidationError(null);
    
    try {
      const response = await fetch('https://moon-ui/keypadComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      });

      const result = await response.json();
      
      if (result.success) {
        onComplete(true);
        onClose();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setCode('');
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating code:', error);
      setValidationError('Failed to validate code. Please try again.');
      setError(true);
      setTimeout(() => {
        setError(false);
        setValidationError(null);
        setCode('');
      }, 3000);
    }
  };

  const handleKeyClick = (key: string) => {
    if (code.length < 8) {
      setCode(prev => prev + key);
    }
  };

  const handleBackspace = () => {
    setCode(prev => prev.slice(0, -1));
  };

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div
        className={cn(
          "glass-effect w-[400px] p-6 rounded-2xl transition-all duration-500",
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
            "rounded-full bg-primary/10 p-3 mb-4 transition-colors relative",
            error && "bg-destructive/10"
          )}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
            <KeySquare className={cn(
              "h-10 w-10 transition-colors relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-xl font-bold text-primary">Keypad Access</h1>
          <p className={cn(
            "text-sm mt-1 transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {error ? "Invalid code" : "Enter access code"}
          </p>
        </div>

        <div className="mt-6">
          <div className="bg-background/20 backdrop-blur-sm rounded-lg p-3 mb-4">
            <div className="font-mono text-2xl text-primary text-center tracking-wider h-8">
              {code ? '*'.repeat(code.length) : '_'}
            </div>
          </div>

          <div className="grid grid-cols-6 gap-2">
            {keys.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.map((key) => (
                  <button
                    key={key}
                    onClick={() => handleKeyClick(key)}
                    className={cn(
                      "h-12 rounded-lg text-lg font-mono transition-all",
                      "bg-primary/5 hover:bg-primary/10 active:bg-primary/15",
                      "text-primary hover:text-primary/90",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50"
                    )}
                  >
                    {key}
                  </button>
                ))}
                {rowIndex === row.length - 1 && (
                  <>
                    <button
                      onClick={handleBackspace}
                      className="h-12 rounded-lg bg-primary/5 hover:bg-primary/10 active:bg-primary/15 flex items-center justify-center text-primary hover:text-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    >
                      <Backspace className="w-5 h-5" />
                    </button>
                    <button
                      onClick={handleComplete}
                      disabled={code.length < 4}
                      className={cn(
                        "h-12 rounded-lg transition-all flex items-center justify-center",
                        "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
                        "text-primary hover:text-primary/90",
                        "focus:outline-none focus:ring-2 focus:ring-primary/50",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      <ArrowRight className="w-5 h-5" />
                    </button>
                  </>
                )}
              </React.Fragment>
            ))}
          </div>
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