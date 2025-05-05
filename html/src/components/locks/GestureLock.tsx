import React, { useState, useRef, useEffect } from 'react';
import { Aperture as Gesture, XCircle, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GestureLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

interface Point {
  x: number;
  y: number;
}

export function GestureLock({ onComplete, visible, onClose }: GestureLockProps) {
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'Backspace') {
        handleReset();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  useEffect(() => {
    drawGesture();
  }, [points, error]);

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

  const handleReset = () => {
    setPoints([]);
  };

  const drawGesture = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set line style
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
    ctx.shadowColor = error ? 'hsl(var(--destructive))' : 'hsl(var(--primary))';
    ctx.shadowBlur = 10;

    // Draw the gesture path
    if (points.length > 0) {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      
      ctx.stroke();
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setIsDrawing(true);
    setPoints([{ x, y }]);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setPoints(prev => [...prev, { x, y }]);
  };

  const handlePointerUp = async () => {
    if (!isDrawing || points.length < 2) return;
    
    setIsDrawing(false);
    setValidationError(null);

    try {
      const response = await fetch('https://moon-ui/gestureComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ gesture: points })
      });

      const result = await response.json();
      
      if (result.success) {
        onComplete(true);
        onClose();
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPoints([]);
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating gesture:', error);
      setValidationError('Failed to validate gesture. Please try again.');
      setError(true);
      setTimeout(() => {
        setError(false);
        setValidationError(null);
        setPoints([]);
      }, 3000);
    }
  };

  const handlePointerLeave = () => {
    if (isDrawing) {
      handlePointerUp();
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      drawGesture();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

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
            <Gesture className={cn(
              "h-10 w-10 transition-colors relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-xl font-bold text-primary">Gesture Lock</h1>
          <p className={cn(
            "text-sm mt-1 transition-colors",
            error ? "text-destructive" : "text-primary/60"
          )}>
            {error ? "Invalid gesture" : "Draw your gesture pattern"}
          </p>
        </div>

        <div className="mt-6" ref={containerRef}>
          <div className="relative aspect-square w-full rounded-lg overflow-hidden bg-background/20 backdrop-blur-sm">
            <canvas
              ref={canvasRef}
              className="absolute inset-0 touch-none"
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerLeave}
            />
          </div>

          <button
            onClick={handleReset}
            disabled={points.length === 0}
            className={cn(
              "w-full h-12 rounded-lg mt-4 transition-all flex items-center justify-center gap-2",
              "bg-primary/5 hover:bg-primary/10 active:bg-primary/15",
              "text-primary hover:text-primary/90",
              "focus:outline-none focus:ring-2 focus:ring-primary/50",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            <RotateCcw className="w-5 h-5" />
            Reset
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