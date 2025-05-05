import React, { useState, useRef, useEffect } from 'react';
import { CheckCircle, XCircle, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SwipeLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

export function SwipeLock({ onComplete, visible, onClose }: SwipeLockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startXRef = useRef(0);

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
    fetch('https://moon-ui/closeUI', { method: 'POST' });
    setTimeout(() => {
      onComplete(false);
      onClose();
    }, 500);
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    startXRef.current = e.clientX - position;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;
    const maxX = container.clientWidth - 72;
    const newPosition = Math.max(0, Math.min(e.clientX - startXRef.current, maxX));
    setPosition(newPosition);

    if (newPosition >= maxX * 0.95) {
      setIsDragging(false);
      setUnlocked(true);
      setTimeout(() => {
        onComplete(true);
        onClose();
      }, 500);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    const container = containerRef.current;
    if (!container) return;
    const maxX = container.clientWidth - 72;
    if (position < maxX * 0.95) {
      setError(true);
      setPosition(0);
      setTimeout(() => setError(false), 500);
    }
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
        <div className="flex flex-col items-center">
          <div className="rounded-full bg-primary/10 p-4 mb-4 relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
            <ArrowRight className="h-10 w-10 text-primary relative z-10" />
          </div>
          <h1 className="text-xl font-bold text-primary">Slide to Unlock</h1>
          <p className="text-sm mt-1 text-primary/60">Drag the button all the way right</p>
        </div>

        <div ref={containerRef} className="mt-8 h-16 bg-primary/10 backdrop-blur-md rounded-full relative overflow-hidden">
          {/* Progress Bar */}
          <div
            className="absolute inset-y-0 left-0 bg-primary/30 transition-all rounded-full"
            style={{ width: `${position + 72}px` }}
          />

          {/* Swipe Handle */}
          <div
            className={cn(
              "absolute top-0 bottom-0 w-16 h-16 rounded-full bg-primary/90 text-white flex items-center justify-center shadow-lg cursor-grab active:cursor-grabbing transition-transform",
              error && "bg-destructive",
              unlocked && "bg-green-500"
            )}
            style={{
              transform: `translateX(${position}px)`,
              transition: isDragging ? 'none' : 'transform 0.5s ease',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {unlocked ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <ArrowRight className="w-6 h-6" />
            )}
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
