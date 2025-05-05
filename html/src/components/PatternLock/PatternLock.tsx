import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface Point {
  x: number;
  y: number;
  value: number;
}

interface PatternLockProps {
  onComplete: (pattern: number[]) => void;
  error?: boolean;
}

export function PatternLock({ onComplete, error }: PatternLockProps) {
  const [pattern, setPattern] = useState<number[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentPoint, setCurrentPoint] = useState<{ x: number; y: number } | null>(null);

  const points: Point[] = [
    { x: 0, y: 0, value: 1 },
    { x: 1, y: 0, value: 2 },
    { x: 2, y: 0, value: 3 },
    { x: 0, y: 1, value: 4 },
    { x: 1, y: 1, value: 5 },
    { x: 2, y: 1, value: 6 },
    { x: 0, y: 2, value: 7 },
    { x: 1, y: 2, value: 8 },
    { x: 2, y: 2, value: 9 }
  ];

  const getHSLValues = (variable: string): string => {
    const root = document.documentElement;
    const style = getComputedStyle(root);
    return style.getPropertyValue(variable).trim();
  };

  const createHSLColor = (variable: string, opacity: number = 1): string => {
    const values = getHSLValues(variable);
    const [h, s, l] = values.split(' ').map(v => parseFloat(v.replace('%', '')));
    return opacity === 1 
      ? `hsl(${h}, ${s}%, ${l}%)`
      : `hsla(${h}, ${s}%, ${l}%, ${opacity})`;
  };

  const drawPattern = () => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    const pointSize = Math.min(rect.width, rect.height) / 6;
    const spacing = Math.min(rect.width, rect.height) / 3;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw lines between selected points
    if (pattern.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = error ? createHSLColor('--destructive') : createHSLColor('--primary');
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      pattern.forEach((value, index) => {
        const point = points.find(p => p.value === value);
        if (!point) return;

        const x = point.x * spacing + spacing / 2;
        const y = point.y * spacing + spacing / 2;

        if (index === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      });

      if (currentPoint) {
        ctx.lineTo(currentPoint.x, currentPoint.y);
      }

      // Add glow effect to the line
      ctx.shadowColor = error ? createHSLColor('--destructive') : createHSLColor('--primary');
      ctx.shadowBlur = 10;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }

    // Draw points
    points.forEach(point => {
      const x = point.x * spacing + spacing / 2;
      const y = point.y * spacing + spacing / 2;
      const isSelected = pattern.includes(point.value);

      // Draw outer glow
      ctx.beginPath();
      ctx.arc(x, y, pointSize / 1.5, 0, Math.PI * 2);
      ctx.fillStyle = isSelected 
        ? error 
          ? createHSLColor('--destructive', 0.2)
          : createHSLColor('--primary', 0.2)
        : createHSLColor('--primary', 0.1);
      ctx.fill();

      // Draw outer circle with gradient
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, pointSize / 2);
      gradient.addColorStop(0, isSelected 
        ? error
          ? createHSLColor('--destructive')
          : createHSLColor('--primary')
        : createHSLColor('--primary', 0.5));
      gradient.addColorStop(1, isSelected
        ? error
          ? createHSLColor('--destructive', 0.7)
          : createHSLColor('--primary', 0.7)
        : createHSLColor('--primary', 0.3));

      ctx.beginPath();
      ctx.arc(x, y, pointSize / 2.5, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      
      // Add glow effect to the dots
      ctx.shadowColor = isSelected 
        ? error
          ? createHSLColor('--destructive')
          : createHSLColor('--primary')
        : 'transparent';
      ctx.shadowBlur = 8;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw inner highlight
      ctx.beginPath();
      ctx.arc(x, y - pointSize / 8, pointSize / 6, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
      ctx.fill();
    });
  };

  useEffect(() => {
    drawPattern();
  }, [pattern, currentPoint, error]);

  const getPointFromCoordinates = (x: number, y: number): Point | null => {
    const container = containerRef.current;
    if (!container) return null;

    const rect = container.getBoundingClientRect();
    const spacing = Math.min(rect.width, rect.height) / 3;
    const pointSize = Math.min(rect.width, rect.height) / 6;

    return points.find(point => {
      const pointX = point.x * spacing + spacing / 2;
      const pointY = point.y * spacing + spacing / 2;
      const distance = Math.sqrt(Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2));
      return distance < pointSize;
    }) || null;
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const point = getPointFromCoordinates(x, y);

    if (point && !pattern.includes(point.value)) {
      setPattern([point.value]);
      setIsDrawing(true);
    }
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDrawing) return;

    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCurrentPoint({ x, y });

    const point = getPointFromCoordinates(x, y);
    if (point && !pattern.includes(point.value)) {
      setPattern(prev => [...prev, point.value]);
    }
  };

  const handlePointerUp = () => {
    if (pattern.length > 0) {
      onComplete(pattern);
    }
    setIsDrawing(false);
    setCurrentPoint(null);
    setPattern([]);
  };

  return (
    <div 
      ref={containerRef}
      className={cn(
        "w-full aspect-square relative transition-transform",
        error && "animate-shake"
      )}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      <canvas 
        ref={canvasRef}
        className="absolute inset-0 touch-none"
      />
    </div>
  );
}