import React, { useState, useEffect } from 'react';
import { Palette, XCircle, RotateCcw, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ColorSequenceLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

interface ColorButton {
  id: string;
  color: string;
  hoverColor: string;
  ringColor: string;
}

export function ColorSequenceLock({ onComplete, visible, onClose }: ColorSequenceLockProps) {
  const [sequence, setSequence] = useState<string[]>([]);
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const colors: ColorButton[] = [
    { id: 'red', color: 'bg-red-500', hoverColor: 'hover:bg-red-400', ringColor: 'focus:ring-red-400' },
    { id: 'blue', color: 'bg-blue-500', hoverColor: 'hover:bg-blue-400', ringColor: 'focus:ring-blue-400' },
    { id: 'green', color: 'bg-green-500', hoverColor: 'hover:bg-green-400', ringColor: 'focus:ring-green-400' },
    { id: 'yellow', color: 'bg-yellow-500', hoverColor: 'hover:bg-yellow-400', ringColor: 'focus:ring-yellow-400' },
    { id: 'purple', color: 'bg-purple-500', hoverColor: 'hover:bg-purple-400', ringColor: 'focus:ring-purple-400' },
    { id: 'pink', color: 'bg-pink-500', hoverColor: 'hover:bg-pink-400', ringColor: 'focus:ring-pink-400' },
  ];

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'Backspace') {
        handleReset();
      } else if (event.key === 'Enter') {
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [sequence]);

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
    if (sequence.length < 4) return;
    
    setValidationError(null);
    setIsPlaying(true);
    
    try {
      const response = await fetch('https://moon-ui/colorSequenceComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sequence })
      });

      const result = await response.json();
      
      if (result.success) {
        onComplete(true);
        onClose();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setSequence([]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating sequence:', error);
      setValidationError('Failed to validate sequence. Please try again.');
      setError(true);
      setTimeout(() => {
        setError(false);
        setValidationError(null);
        setSequence([]);
      }, 3000);
    } finally {
      setIsPlaying(false);
    }
  };

  const handleColorClick = (colorId: string) => {
    if (sequence.length < 8 && !isPlaying) {
      setSequence(prev => [...prev, colorId]);
    }
  };

  const handleReset = () => {
    setSequence([]);
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
            <Palette className={cn(
              "h-14 w-14 relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Color Sequence</h1>
          <p className={cn(
            "text-lg mt-1 transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {error ? "Invalid sequence" : "Enter the color sequence"}
          </p>
        </div>

        <div className="mt-10">
          <div className={cn(
            "backdrop-blur-md rounded-2xl p-6 mb-6 min-h-[80px] flex items-center justify-center gap-3 border-2 transition-colors",
            error ? "border-destructive/20" : "border-primary/20"
          )}>
            {sequence.length > 0 ? (
              sequence.map((colorId, index) => {
                const color = colors.find(c => c.id === colorId);
                return (
                  <div
                    key={index}
                    className={cn(
                      "w-12 h-12 rounded-xl transition-all animate-in fade-in-75 zoom-in-75 shadow-lg",
                      color?.color
                    )}
                  />
                );
              })
            ) : (
              <div className="text-primary/40 text-lg">Select colors below</div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => handleColorClick(color.id)}
                disabled={isPlaying}
                className={cn(
                  "h-20 rounded-xl transition-all relative group overflow-hidden",
                  color.color,
                  color.hoverColor,
                  "focus:outline-none focus:ring-2",
                  color.ringColor,
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  "border-2 border-white/20"
                )}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
              </button>
            ))}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={handleReset}
              disabled={sequence.length === 0 || isPlaying}
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
              disabled={sequence.length < 4 || isPlaying}
              className={cn(
                "flex-1 h-14 rounded-xl transition-all flex items-center justify-center gap-3",
                "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
                "text-primary hover:text-primary/90 text-lg",
                "focus:outline-none focus:ring-2 focus:ring-primary/50",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "border-2 border-primary/20"
              )}
            >
              <ArrowRight className="w-6 h-6" />
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