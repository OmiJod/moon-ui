import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Scissors, XCircle, AlertTriangle, Timer, Zap, BatteryCharging } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Wire {
  id: string;
  color: string;
  label: string;
  points: { x: number; y: number }[];
  cut: boolean;
  sparking: boolean;
  voltage: number;
  current: number;
  resistance: number;
  type: 'power' | 'ground' | 'data' | 'control';
}

interface WireCuttingLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

const WIRE_TYPES = {
  power: { icon: BatteryCharging, description: "Main power line carrying high voltage" },
  ground: { icon: Zap, description: "Ground wire for electrical safety" },
  data: { icon: Zap, description: "Data transmission line" },
  control: { icon: Zap, description: "Control circuit for system operation" }
};

const WIRE_CONFIGS = [
  {
    wires: [
      { id: 'w1', color: "#ef4444", label: "Main Power", voltage: 220, current: 10, resistance: 22, type: 'power' },
      { id: 'w2', color: "#3b82f6", label: "Ground Line", voltage: 0, current: 0, resistance: 1, type: 'ground' },
      { id: 'w3', color: "#eab308", label: "Control Bus", voltage: 12, current: 2, resistance: 6, type: 'control' },
      { id: 'w4', color: "#22c55e", label: "Data Bus", voltage: 5, current: 1, resistance: 5, type: 'data' },
      { id: 'w5', color: "#a855f7", label: "Backup", voltage: 110, current: 5, resistance: 22, type: 'power' }
    ],
    clue: "Cut the wire carrying the most electrical power (P = V × I)",
    hint: "Power is measured in watts. Look for the wire with the highest voltage and current combination.",
    solution: (wires: Wire[]) => {
      const powers = wires.map(w => w.voltage * w.current);
      return wires[powers.indexOf(Math.max(...powers))].id;
    }
  },
  {
    wires: [
      { id: 'w1', color: "green", label: "Network A", voltage: 24, current: 2, resistance: 12, type: 'data' },
      { id: 'w2', color: "blue", label: "Network B", voltage: 12, current: 4, resistance: 3, type: 'data' },
      { id: 'w3', color: "yellow", label: "Network C", voltage: 48, current: 1, resistance: 48, type: 'data' },
      { id: 'w4', color: "white", label: "Network D", voltage: 9, current: 3, resistance: 3, type: 'data' },
      { id: 'w5', color: "purple", label: "Network E", voltage: 36, current: 2, resistance: 18, type: 'data' }
    ],
    clue: "Cut the wire that doesn't follow Ohm's Law (V = I × R)",
    hint: "One circuit's values don't add up correctly...",
    solution: (wires: Wire[]) => {
      return wires.find(w => Math.abs(w.voltage - (w.current * w.resistance)) > 0.1)?.id || wires[0].id;
    }
  },
  {
    wires: [
      { id: 'w1', color: "red", label: "Circuit 1", voltage: 120, current: 2, resistance: 60, type: 'power' },
      { id: 'w2', color: "yellow", label: "Circuit 2", voltage: 240, current: 4, resistance: 60, type: 'power' },
      { id: 'w3', color: "blue", label: "Circuit 3", voltage: 12, current: 0.2, resistance: 60, type: 'power' },
      { id: 'w4', color: "green", label: "Circuit 4", voltage: 24, current: 0.4, resistance: 60, type: 'power' },
      { id: 'w5', color: "purple", label: "Circuit 5", voltage: 48, current: 0.8, resistance: 60, type: 'power' }
    ],
    clue: "Cut the wire that breaks the voltage pattern",
    hint: "Each circuit's voltage should follow a mathematical sequence...",
    solution: (wires: Wire[]) => {
      const voltages = wires.map(w => w.voltage);
      const outlierIndex = voltages.findIndex((v, i) => {
        if (i === 0) return false;
        const ratio = v / voltages[i - 1];
        return Math.abs(ratio - 2) > 0.1;
      });
      return outlierIndex === -1 ? wires[0].id : wires[outlierIndex].id;
    }
  }
];

export function WireCuttingLock({ onComplete, visible, onClose }: WireCuttingLockProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [wires, setWires] = useState<Wire[]>([]);
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(45);
  const [initialTimeLeft] = useState(45);
  const [sparks, setSparks] = useState<{ x: number; y: number; vx: number; vy: number; life: number; color: string }[]>([]);
  const [selectedWire, setSelectedWire] = useState<Wire | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number; y: number } | null>(null);
  const [currentConfig, setCurrentConfig] = useState(() => 
    WIRE_CONFIGS[Math.floor(Math.random() * WIRE_CONFIGS.length)]
  );

  useEffect(() => {
    if (visible) {
      initializeWires();
      setTimeLeft(initialTimeLeft);
    }
  }, [visible, initialTimeLeft]);

  useEffect(() => {
    let timer: number;
    if (timeLeft > 0 && visible) {
      timer = window.setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleFailure("Time's up!");
            onClose();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [timeLeft, visible, onClose]);

  const initializeWires = () => {
    const newConfig = WIRE_CONFIGS[Math.floor(Math.random() * WIRE_CONFIGS.length)];
    setCurrentConfig(newConfig);
    const newWires = newConfig.wires.map(wire => ({
      ...wire,
      points: generateWirePoints(wire.id),
      cut: false,
      sparking: false
    }));
    setWires(newWires);
  };

  const generateWirePoints = (wireId: string) => {
    const points = [];
    const numPoints = 25; // Increased number of points
    const index = parseInt(wireId.slice(1)) - 1;
    const startY = 50 + index * 80;
    const amplitude = 15;
    const frequency = Math.PI / 3;
    const phase = Math.random() * Math.PI * 2;

    for (let i = 0; i < numPoints; i++) {
      const x = (i / (numPoints - 1)) * 800; // Use canvas width
      const y = startY + Math.sin(i * frequency + phase) * amplitude;
      points.push({ x, y });
    }

    return points;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setMousePos({ x, y });

    const hoveredWire = findWireAtPosition(x, y);
    setSelectedWire(hoveredWire);

    if (hoveredWire) {
      setTooltipPosition({
        x: e.clientX,
        y: e.clientY
      });
    } else {
      setTooltipPosition(null);
    }

    if (isDragging) {
      cutWireAtPosition(x, y);
    }
  };

  const findWireAtPosition = (x: number, y: number): Wire | null => {
    for (const wire of wires) {
      if (wire.cut) continue;

      for (let j = 1; j < wire.points.length; j++) {
        const p1 = wire.points[j - 1];
        const p2 = wire.points[j];
        
        if (isPointNearLineSegment(x, y, p1.x, p1.y, p2.x, p2.y, 20)) {
          return wire;
        }
      }
    }
    return null;
  };

  const handleMouseDown = () => {
    setIsDragging(true);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const cutWireAtPosition = (x: number, y: number) => {
    const wire = findWireAtPosition(x, y);
    if (!wire) return;

    const correctId = currentConfig.solution(wires);
    
    if (wire.id === correctId) {
      handleSuccess();
    } else {
      handleFailure(`Wrong wire! The ${wire.label} was not the correct choice.`);
    }

    setWires(prev => prev.map(w => 
      w.id === wire.id ? { ...w, cut: true, sparking: true } : w
    ));
  };

  const isPointNearLineSegment = (px: number, py: number, x1: number, y1: number, x2: number, y2: number, threshold: number) => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = px - xx;
    const dy = py - yy;

    return Math.sqrt(dx * dx + dy * dy) < threshold;
  };

  const handleSuccess = () => {
    fetch('https://moon-ui/wireCuttingComplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    });
    setTimeout(() => {
      onComplete(true);
      onClose();
    }, 1000);
  };

  const handleFailure = (message: string) => {
    setError(true);
    fetch('https://moon-ui/wireCuttingComplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false })
    });
    setTimeout(() => {
      setError(false);
      initializeWires();
    }, 1000);
  };

  const handleClose = () => {
    setIsClosing(true);
    fetch('https://moon-ui/closeUI', { method: 'POST' });
    setTimeout(() => {
      onComplete(false);
      onClose();
    }, 500);
  };

  const drawFrame = useCallback((ctx: CanvasRenderingContext2D) => {
    if (!canvasRef.current) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    
    // Draw background grid
    ctx.save();
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    for (let i = 0; i < ctx.canvas.width; i += 20) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, ctx.canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < ctx.canvas.height; i += 20) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(ctx.canvas.width, i);
      ctx.stroke();
    }
    ctx.restore();

    // Draw wires
    wires.forEach(wire => {
      // Draw wire shadow
      ctx.save();
      ctx.shadowColor = wire.color;
      ctx.shadowBlur = wire.cut ? 0 : 10;
      ctx.strokeStyle = wire.cut ? 'rgba(255, 255, 255, 0.2)' : wire.color;
      ctx.lineWidth = wire.cut ? 4 : 6;
      drawWirePath(ctx, wire);
      ctx.stroke();
      ctx.restore();

      // Draw sparks for cut wires
      if (wire.cut && wire.sparking) {
        const cutPoint = wire.points[Math.floor(wire.points.length / 2)];
        drawSparks(ctx, cutPoint.x, cutPoint.y, wire.color);
      }

      // Draw cut mark
      if (wire.cut) {
        const midIndex = Math.floor(wire.points.length / 2);
        const p1 = wire.points[midIndex - 1];
        const p2 = wire.points[midIndex + 1];
        const angle = Math.atan2(p2.y - p1.y, p2.x - p1.x);
        
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.lineWidth = 2;
        ctx.translate(wire.points[midIndex].x, wire.points[midIndex].y);
        ctx.rotate(angle);
        
        // Draw cut ends
        ctx.beginPath();
        ctx.moveTo(-8, -8);
        ctx.lineTo(8, 8);
        ctx.moveTo(-8, 8);
        ctx.lineTo(8, -8);
        ctx.stroke();
        ctx.restore();
      }
    });

    // Draw cursor
    if (mousePos) {
      drawScissorsCursor(ctx, mousePos.x, mousePos.y);
    }
  }, [wires, mousePos, selectedWire]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const animate = () => {
      if (!canvas) return;
      drawFrame(ctx);
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [drawFrame]);

  if (!visible) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-transparent">
      <div
        className={cn(
          "glass-effect w-[900px] p-8 rounded-3xl transition-all duration-500",
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
            <Scissors className={cn(
              "h-14 w-14 relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Circuit Breaker</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="w-5 h-5" />
              <p className="text-lg">{currentConfig.clue}</p>
            </div>
            <div className="flex items-center gap-2">
              <Timer className={cn(
                "w-5 h-5",
                timeLeft <= 10 ? "text-destructive" : "text-primary"
              )} />
              <p className={cn(
                "text-lg",
                timeLeft <= 10 ? "text-destructive" : "text-primary"
              )}>
                {timeLeft}s
              </p>
            </div>
          </div>
          <div className="mt-4 px-6 py-3 rounded-xl bg-primary/5 border-2 border-primary/20">
            <p className="text-primary/80">{currentConfig.hint}</p>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="mt-10 relative"
        >
          <div className={cn(
            "relative p-6 rounded-2xl backdrop-blur-md border-2 transition-colors overflow-hidden",
            error ? "border-destructive/20" : "border-primary/20"
          )}>
            <canvas
              ref={canvasRef}
              width={800}
              height={450}
              onMouseMove={handleMouseMove}
              onMouseDown={handleMouseDown}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
              className="cursor-none"
            />
          </div>

          {tooltipPosition && selectedWire && (
            <div
              className="fixed z-50 px-4 py-2 text-sm bg-black/90 text-white rounded-lg pointer-events-none"
              style={{
                left: tooltipPosition.x,
                top: tooltipPosition.y,
                transform: 'translate(-50%, -100%)'
              }}
            >
              <div className="font-semibold">{selectedWire.label}</div>
              <div className="text-xs opacity-80">
                {selectedWire.voltage}V / {selectedWire.current}A / {selectedWire.resistance}Ω
              </div>
            </div>
          )}
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

function drawWirePath(ctx: CanvasRenderingContext2D, wire: Wire) {
  ctx.beginPath();
  wire.points.forEach((point, i) => {
    if (i === 0) ctx.moveTo(point.x, point.y);
    else ctx.lineTo(point.x, point.y);
  });
}

function drawSparks(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  const sparkCount = 5;
  const sparkLength = 10;
  
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  
  for (let i = 0; i < sparkCount; i++) {
    const angle = (Math.PI * 2 * i) / sparkCount + (Date.now() / 200);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(
      x + Math.cos(angle) * sparkLength,
      y + Math.sin(angle) * sparkLength
    );
    ctx.stroke();
  }
  ctx.restore();
}

function drawScissorsCursor(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  
  const size = 12;
  ctx.beginPath();
  ctx.moveTo(x - size, y - size);
  ctx.lineTo(x + size, y + size);
  ctx.moveTo(x - size, y + size);
  ctx.lineTo(x + size, y - size);
  ctx.stroke();
  
  ctx.restore();
}