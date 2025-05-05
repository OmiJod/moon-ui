import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, CheckCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  visible: boolean;
  onComplete: (success: boolean) => void;
  onClose: () => void;
  initialData: {
    duration: number;
    label: string;
    useWhileDead?: boolean;
    allowRagdoll?: boolean;
    allowSwimming?: boolean;
    allowCuffed?: boolean;
    allowFalling?: boolean;
    canCancel?: boolean;
    style?: 'bar' | 'radial' | 'minimal';
    anim?: {
      dict?: string;
      clip: string;
      flag?: number;
      blendIn?: number;
      blendOut?: number;
      duration?: number;
      playbackRate?: number;
      lockX?: boolean;
      lockY?: boolean;
      lockZ?: boolean;
    };
    scenario?: string;
    playEnter?: boolean;
    prop?: {
      model: string;
      bone?: number;
      pos: { x: number; y: number; z: number };
      rot: { x: number; y: number; z: number };
      rotOrder?: number;
    } | Array<{
      model: string;
      bone?: number;
      pos: { x: number; y: number; z: number };
      rot: { x: number; y: number; z: number };
      rotOrder?: number;
    }>;
    disable?: {
      move?: boolean;
      car?: boolean;
      combat?: boolean;
      mouse?: boolean;
      sprint?: boolean;
    };
  };
}

const RadialProgress = ({ progress, size = 120 }: { progress: number; size?: number }) => {
  const radius = size * 0.4;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Background circle */}
        <circle
          className="text-primary/10"
          strokeWidth="4"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress circle */}
        <circle
          className="text-primary transition-all duration-100"
          strokeWidth="4"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          stroke="currentColor"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center text-xl font-semibold text-primary">
        {Math.round(progress)}%
      </div>
    </div>
  );
};

const MinimalProgress = ({ progress, label }: { progress: number; label: string }) => (
  <div className="flex items-center gap-3">
    <div className="relative h-1 flex-1 bg-primary/10 rounded-full overflow-hidden">
      <motion.div
        className="absolute inset-y-0 left-0 bg-primary rounded-full"
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.1, ease: "linear" }}
      />
    </div>
    <span className="text-primary min-w-[3ch] text-right">{Math.round(progress)}%</span>
  </div>
);

export function ProgressBar({ visible, onComplete, onClose, initialData }: ProgressBarProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isCancelled, setIsCancelled] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const startTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const style = initialData.style || 'bar';

  useEffect(() => {
    if (visible) {
      startTimeRef.current = Date.now();
      setProgress(0);
      setIsComplete(false);
      setIsCancelled(false);
    }
  }, [visible]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && initialData.canCancel) {
        handleCancel();
      }
    };

    if (visible) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, initialData.canCancel]);

  useEffect(() => {
    if (!visible || isComplete || isCancelled) return;

    const animate = () => {
      const elapsed = Date.now() - startTimeRef.current;
      const newProgress = Math.min((elapsed / initialData.duration) * 100, 100);
      
      setProgress(newProgress);

      if (newProgress < 100) {
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        setIsComplete(true);
        handleComplete(true);
      }
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, isComplete, isCancelled]);

  const handleComplete = (success: boolean) => {
    fetch('https://moon-ui/progressComplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success })
    });
    onComplete(success);
    handleClose();
  };

  const handleCancel = () => {
    if (!initialData.canCancel) return;
    setIsCancelled(true);
    handleComplete(false);
  };

  const handleClose = () => {
    setIsClosing(true);
    fetch('https://moon-ui/closeUI', { method: 'POST' });
    setTimeout(() => {
      onClose();
    }, 500);
  };

  if (!visible) return null;

  if (style === 'minimal') {
    return (
      <AnimatePresence>
        {visible && (
          <motion.div
            className="fixed bottom-10 left-1/2 -translate-x-1/2 w-[400px]"

            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
          >
            <div className="px-4 py-2">
              <div className="text-primary/80 text-sm mb-2">{initialData.label}</div>
              <MinimalProgress progress={progress} label={initialData.label} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className="fixed bottom-[10%] left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
        >
          <motion.div
            className={cn(
              "glass-effect p-6 rounded-2xl transition-all duration-500 relative overflow-hidden",
              style === 'radial' ? "w-[200px]" : "w-[400px]",
              isClosing && "animate-fadeOut"
            )}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-500" />
                ) : (
                  <Loader2 className="w-5 h-5 text-primary animate-spin" />
                )}
                <h2 className="text-lg font-semibold text-primary">
                  {initialData.label}
                </h2>
              </div>
            </div>

            {/* Progress Indicator */}
            {style === 'radial' ? (
              <div className="flex justify-center">
                <RadialProgress progress={progress} />
              </div>
            ) : (
              <>
                <div className="relative h-2 bg-primary/10 rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-primary rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.1, ease: "linear" }}
                  />
                </div>
                <div className="mt-2 flex justify-between items-center text-sm">
                  <span className="text-primary/60">
                    {Math.round(progress)}%
                  </span>
                  <span className="text-primary/60">
                    {((initialData.duration - (Date.now() - startTimeRef.current)) / 1000).toFixed(1)}s
                  </span>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}