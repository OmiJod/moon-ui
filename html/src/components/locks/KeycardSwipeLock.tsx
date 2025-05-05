import React, { useState, useRef, useEffect } from 'react';
import { CreditCard, XCircle, ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KeycardSwipeLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

export function KeycardSwipeLock({ onComplete, visible, onClose }: KeycardSwipeLockProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState(0);
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isClosing, setIsClosing] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const startYRef = useRef(0);
  const velocityRef = useRef(0);
  const lastTimeRef = useRef(0);
  const lastPositionRef = useRef(0);

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
    startYRef.current = e.clientY - position;
    lastTimeRef.current = Date.now();
    lastPositionRef.current = e.clientY;
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    const container = containerRef.current;
    if (!container) return;

    const currentTime = Date.now();
    const deltaTime = currentTime - lastTimeRef.current;
    const deltaPosition = e.clientY - lastPositionRef.current;
    
    if (deltaTime > 0) {
      velocityRef.current = Math.abs(deltaPosition / deltaTime);
    }

    lastTimeRef.current = currentTime;
    lastPositionRef.current = e.clientY;

    const maxY = container.clientHeight - 120;
    const newPosition = Math.max(0, Math.min(e.clientY - startYRef.current, maxY));
    setPosition(newPosition);

    if (newPosition >= maxY * 0.8 && velocityRef.current > 0.5) {
      setIsDragging(false);
      handleSwipeComplete();
    }
  };

  const handleSwipeComplete = async () => {
    try {
      const response = await fetch('https://moon-ui/keycardComplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      const result = await response.json();
      
      if (result.success) {
        setUnlocked(true);
        setTimeout(() => {
          onComplete(true);
          onClose();
        }, 500);
      } else {
        setError(true);
        setErrorMessage('No keycard found');
        setPosition(0);
        setTimeout(() => {
          setError(false);
          setErrorMessage(null);
        }, 2000);
      }
    } catch (error) {
      console.error('Error validating keycard:', error);
      setError(true);
      setErrorMessage('Failed to validate keycard');
      setPosition(0);
      setTimeout(() => {
        setError(false);
        setErrorMessage(null);
      }, 2000);
    }
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    
    const container = containerRef.current;
    if (!container) return;
    
    const maxY = container.clientHeight - 120;
    if (position < maxY * 0.8 || velocityRef.current < 0.5) {
      setError(true);
      setErrorMessage('Swipe faster');
      setPosition(0);
      setTimeout(() => {
        setError(false);
        setErrorMessage(null);
      }, 1000);
    }
    
    velocityRef.current = 0;
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
        <div className="flex flex-col items-center">
          <div className={cn(
            "rounded-full bg-primary/10 p-6 mb-6 relative",
            error && "bg-destructive/10"
          )}>
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
            <CreditCard className={cn(
              "h-14 w-14 relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Security Access</h1>
          <p className={cn(
            "text-lg mt-1 text-center transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {errorMessage || "Please swipe your keycard to verify access"}
          </p>
        </div>

        <div 
          ref={containerRef} 
          className={cn(
            "mt-10 h-96 backdrop-blur-md rounded-3xl relative overflow-hidden border-2 transition-colors",
            error ? "bg-destructive/10 border-destructive/20" : "bg-primary/10 border-primary/20",
            unlocked && "bg-green-500/10 border-green-500/20"
          )}
        >
          {/* Card Reader Slot */}
          <div className="absolute inset-x-8 h-3 top-6 bg-black/40 rounded-full shadow-inner" />
          
          {/* Guide Arrow */}
          <div className={cn(
            "absolute inset-x-0 top-20 flex justify-center transition-colors",
            error ? "text-destructive/40" : "text-primary/40",
            "animate-bounce"
          )}>
            <ArrowDown className="h-12 w-12" />
          </div>

          {/* Progress Indicator */}
          <div
            className={cn(
              "absolute inset-x-0 top-0 transition-all",
              error ? "bg-destructive/30" : "bg-primary/30",
              unlocked && "bg-green-500/30"
            )}
            style={{ height: `${position + 120}px` }}
          />

          {/* Keycard Handle */}
          <div
            className={cn(
              "absolute left-1/2 -translate-x-1/2 w-40 h-56 rounded-2xl cursor-grab active:cursor-grabbing transition-all",
              "shadow-xl backdrop-blur-sm",
              error ? "bg-gradient-to-b from-destructive/90 to-destructive/70 shadow-destructive/20" :
              unlocked ? "bg-gradient-to-b from-green-500/90 to-green-500/70 shadow-green-500/20" :
              "bg-gradient-to-b from-primary/90 to-primary/70 shadow-primary/20",
              isDragging && "scale-105"
            )}
            style={{
              transform: `translate(-50%, ${position}px)`,
              transition: isDragging ? 'none' : 'all 0.5s ease',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
          >
            {/* Keycard Chip */}
            <div className="absolute top-6 left-6 right-6 h-3 bg-yellow-400/90 rounded-full shadow-inner" />
            
            {/* Keycard Details */}
            <div className="absolute top-16 left-6 right-6 space-y-2">
              <div className="h-2 bg-white/20 rounded-full" />
              <div className="h-2 bg-white/20 rounded-full w-3/4" />
              <div className="h-2 bg-white/20 rounded-full w-1/2" />
            </div>
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