import React, { useState, useRef, useEffect } from 'react';
import { Lock, XCircle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SafeCrackingLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

export function SafeCrackingLock({ onComplete, visible, onClose }: SafeCrackingLockProps) {
  const [currentNumber, setCurrentNumber] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [sequence, setSequence] = useState<number[]>([]);
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [attempts, setAttempts] = useState(5);
  const [isDragging, setIsDragging] = useState(false);
  const [startAngle, setStartAngle] = useState(0);
  const [lastValidNumber, setLastValidNumber] = useState(0);
  const dialRef = useRef<HTMLDivElement>(null);
  const audioContext = useRef<AudioContext | null>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    if (visible) {
      audioContext.current = new AudioContext();
    }
    return () => {
      audioContext.current?.close();
    };
  }, [visible]);

  const playTickSound = () => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(2000, audioContext.current.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioContext.current.currentTime);

    oscillator.start();
    oscillator.stop(audioContext.current.currentTime + 0.05);
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

  const handlePointerDown = (e: React.PointerEvent) => {
    if (!dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    setIsDragging(true);
    setStartAngle(angle - rotation * Math.PI / 180);
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging || !dialRef.current) return;

    const rect = dialRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const angle = Math.atan2(e.clientY - centerY, e.clientX - centerX);

    let newRotation = ((angle - startAngle) * 180 / Math.PI) % 360;
    if (newRotation < 0) newRotation += 360;

    setRotation(newRotation);

    const newNumber = Math.floor((newRotation / 360) * 100);
    if (newNumber !== currentNumber) {
      setCurrentNumber(newNumber);
      playTickSound();

      if (Math.abs(newNumber - lastValidNumber) >= 10) {
        setLastValidNumber(newNumber);
      }
    }
  };

  const handlePointerUp = async () => {
    if (!isDragging) return;
    setIsDragging(false);

    if (sequence.length < 3) {
      setSequence(prev => [...prev, currentNumber]);
    }

    if (sequence.length === 2) {
      try {
        const response = await fetch('https://moon-ui/safeCrackingComplete', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ combination: [...sequence, currentNumber] })
        });

        const result = await response.json();
        
        if (result.success) {
          onComplete(true);
          onClose();
        } else {
          setError(true);
          setAttempts(prev => prev - 1);
          setSequence([]);
          setTimeout(() => {
            setError(false);
          }, 1000);

          if (attempts <= 1) {
            handleClose();
          }
        }
      } catch (error) {
        console.error('Error validating combination:', error);
        setError(true);
        setTimeout(() => {
          setError(false);
        }, 1000);
      }
    }
  };

  if (!visible) return null;

  const numbers = Array.from({ length: 100 }, (_, i) => i);

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div
        className={cn(
          "glass-effect w-[400px] p-8 rounded-3xl transition-all duration-500",
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
            <Lock className={cn(
              "h-14 w-14 relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Safe Lock</h1>
          <p className={cn(
            "text-lg transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {error ? "Wrong combination" : `Enter combination (${sequence.length}/3)`}
          </p>
          <div className="text-sm text-primary/40 mt-1">
            Attempts remaining: {attempts}
          </div>
        </div>

        <div className="mt-10 relative">
          <div 
            ref={dialRef}
            className={cn(
              "w-64 h-64 mx-auto relative",
              isDragging && "cursor-grabbing"
            )}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            {/* Dial background */}
            <div className="absolute inset-0 rounded-full bg-background/20 backdrop-blur-sm border-4 border-primary/20" />

            {/* Number markers */}
            {numbers.map((number) => {
              const angle = (number / 100) * 360;
              const isMultipleOf5 = number % 5 === 0;
              return (
                <div
                  key={number}
                  className="absolute top-1/2 left-1/2 -translate-y-1/2 origin-left"
                  style={{
                    transform: `rotate(${angle}deg)`,
                    width: '50%',
                  }}
                >
                  {isMultipleOf5 && (
                    <div className="absolute right-0 -translate-y-1/2 text-primary/60 text-sm font-mono">
                      {number.toString().padStart(2, '0')}
                    </div>
                  )}
                  <div 
                    className={cn(
                      "absolute right-8 w-2 h-0.5 bg-primary/40",
                      isMultipleOf5 && "w-4 bg-primary/60"
                    )}
                  />
                </div>
              )}
            )}

            {/* Rotating dial handle */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: isDragging ? 'none' : 'transform 0.2s ease'
              }}
            >
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 bg-primary rounded-full shadow-lg" />
            </div>

            {/* Center cap */}
            <div className="absolute inset-[40%] rounded-full bg-primary/20 backdrop-blur-md border-2 border-primary/40 shadow-xl">
              <div className="absolute inset-[30%] rounded-full bg-primary/40" />
            </div>

            {/* Current number display */}
            <div className="absolute inset-x-0 bottom-16 text-center">
              <div className="text-4xl font-mono font-bold text-primary">
                {currentNumber.toString().padStart(2, '0')}
              </div>
            </div>
          </div>

          {/* Sequence display */}
          <div className="mt-8 flex justify-center gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  "w-12 h-12 rounded-lg flex items-center justify-center text-xl font-mono",
                  "border-2 transition-colors",
                  sequence[i] !== undefined
                    ? "border-primary bg-primary/20 text-primary"
                    : "border-primary/20 bg-background/20 text-primary/40"
                )}
              >
                {sequence[i] !== undefined ? sequence[i].toString().padStart(2, '0') : "00"}
              </div>
            ))}
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