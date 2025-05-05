import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, XCircle, RotateCcw, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface SliderConfig {
  id: string;
  label: string;
  target: number;
  tolerance: number;
}

interface SliderLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
  initialData?: {
    sliders: SliderConfig[];
    timeLimit?: number;
  };
}

export function SliderLock({ onComplete, visible, onClose, initialData }: SliderLockProps) {
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialData?.timeLimit || 30);

  useEffect(() => {
    if (visible && initialData?.sliders) {
      const initialValues: Record<string, number> = {};
      initialData.sliders.forEach(slider => {
        initialValues[slider.id] = Math.random() * 100;
      });
      setSliderValues(initialValues);
      setTimeLeft(initialData.timeLimit || 30);
    }
  }, [visible, initialData]);

  useEffect(() => {
    if (timeLeft > 0 && visible) {
      const timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeout();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [timeLeft, visible]);


  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onComplete(false);
        onClose();
      }
    };

    if (visible) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [visible]);

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

  const handleTimeout = async () => {
    setTimeout(() => {
    onComplete(false);
    onClose();
    }, 1000);
  };

  const handleSliderChange = (id: string, value: number) => {
    setSliderValues(prev => ({
      ...prev,
      [id]: value
    }));
  };

  const handleSubmit = async () => {
    if (!initialData?.sliders || timeLeft <= 0) return;

    const isCorrect = initialData.sliders.every(slider => {
      const value = sliderValues[slider.id];
      return Math.abs(value - slider.target) <= slider.tolerance;
    });

    try {
      const response = await fetch('https://moon-ui/sliderComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ success: isCorrect })
      });

      if (isCorrect) {
        onComplete(true);
        onClose();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating sliders:', error);
    }
  };

  const handleReset = () => {
    if (initialData?.sliders && timeLeft > 0) {
      const newValues: Record<string, number> = {};
      initialData.sliders.forEach(slider => {
        newValues[slider.id] = Math.random() * 100;
      });
      setSliderValues(newValues);
    }
  };

  if (!visible || !initialData?.sliders) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div
            className={cn(
              "glass-effect w-[600px] p-8 rounded-3xl transition-all duration-500",
              error && "animate-shake",
              isClosing && "animate-fadeOut"
            )}
          >
            <div className="flex flex-col items-center">
              <div className={cn(
                "rounded-full bg-primary/10 p-6 mb-6 relative",
                error && "bg-destructive/10"
              )}>
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
                <SlidersHorizontal className={cn(
                  "h-14 w-14 relative z-10",
                  error ? "text-destructive" : "text-primary"
                )} />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">Calibration Required</h1>
              <div className="flex items-center gap-2">
                <span className={cn(
                  "text-lg",
                  timeLeft <= 10 ? "text-destructive" : "text-primary/60"
                )}>
                  {timeLeft}s remaining
                </span>
              </div>
            </div>

            <div className="mt-8 space-y-6">
              {initialData.sliders.map((slider) => (
                <div key={slider.id} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label className="text-primary/80">{slider.label}</label>
                    <span className="text-primary/60 font-mono">
                      {Math.round(sliderValues[slider.id] || 0)}%
                    </span>
                  </div>
                  <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.1"
                      value={sliderValues[slider.id] || 0}
                      onChange={(e) => handleSliderChange(slider.id, parseFloat(e.target.value))}
                      disabled={timeLeft <= 0}
                      className={cn(
                        "absolute inset-0 w-full appearance-none bg-transparent cursor-pointer",
                        "[&::-webkit-slider-thumb]:w-4",
                        "[&::-webkit-slider-thumb]:h-4",
                        "[&::-webkit-slider-thumb]:appearance-none",
                        "[&::-webkit-slider-thumb]:bg-primary",
                        "[&::-webkit-slider-thumb]:rounded-full",
                        "[&::-webkit-slider-thumb]:shadow-lg",
                        "[&::-webkit-slider-thumb]:transition-transform",
                        "[&::-webkit-slider-thumb]:hover:scale-110",
                        "[&::-moz-range-thumb]:w-4",
                        "[&::-moz-range-thumb]:h-4",
                        "[&::-moz-range-thumb]:appearance-none",
                        "[&::-moz-range-thumb]:bg-primary",
                        "[&::-moz-range-thumb]:border-none",
                        "[&::-moz-range-thumb]:rounded-full",
                        "[&::-moz-range-thumb]:shadow-lg",
                        "[&::-moz-range-thumb]:transition-transform",
                        "[&::-moz-range-thumb]:hover:scale-110",
                        timeLeft <= 0 && "opacity-50 cursor-not-allowed"
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4 mt-8">
              <button
                onClick={handleReset}
                disabled={timeLeft <= 0}
                className={cn(
                  "flex-1 h-14 rounded-xl transition-all flex items-center justify-center gap-3",
                  "bg-primary/5 hover:bg-primary/10 active:bg-primary/15",
                  "text-primary hover:text-primary/90 text-lg",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "border-2 border-primary/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <RotateCcw className="w-6 h-6" />
                Reset
              </button>
              <button
                onClick={handleSubmit}
                disabled={timeLeft <= 0}
                className={cn(
                  "flex-1 h-14 rounded-xl transition-all flex items-center justify-center gap-3",
                  "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
                  "text-primary hover:text-primary/90 text-lg",
                  "focus:outline-none focus:ring-2 focus:ring-primary/50",
                  "border-2 border-primary/20",
                  "disabled:opacity-50 disabled:cursor-not-allowed"
                )}
              >
                <CheckCircle className="w-6 h-6" />
                Submit
              </button>
            </div>

            <button
              onClick={handleClose}
              className="absolute top-6 right-6 p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <XCircle className="w-6 h-6 text-white/70" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}