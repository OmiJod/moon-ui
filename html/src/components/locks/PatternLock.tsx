import React, { useState, useEffect } from 'react';
import { Fingerprint, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PatternLock as PatternInput } from '../PatternLock/PatternLock';

interface PatternLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

export function PatternLock({ onComplete, visible, onClose }: PatternLockProps) {
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

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

  const handlePatternComplete = async (pattern: number[]) => {
    setValidationError(null);
    
    try {
      const response = await fetch('https://moon-ui/patternComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pattern })
      });

      const result = await response.json();
      
      if (result.success) {
        onComplete(true);
        onClose();
      } else {
        setError(true);
        setTimeout(() => setError(false), 1000);
      }
    } catch (error) {
      console.error('Error validating pattern:', error);
      setValidationError('Failed to validate pattern. Please try again.');
      setError(true);
      setTimeout(() => {
        setError(false);
        setValidationError(null);
      }, 3000);
    }
  };

  if (!visible) return null;

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
            <Fingerprint className={cn(
              "h-10 w-10 transition-colors relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-xl font-bold text-primary">Secure Access</h1>
          <p className={cn(
            "text-sm mt-1 transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {error ? "Invalid pattern" : "Draw pattern to unlock"}
          </p>
        </div>

        <div className="mt-6">
          <PatternInput
            onComplete={handlePatternComplete}
            error={error}
          />
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