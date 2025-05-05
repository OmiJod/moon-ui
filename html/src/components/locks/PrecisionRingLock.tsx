import React, { useState, useEffect, useRef } from 'react';
import { Target, XCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, getHSLColor } from '@/lib/utils';

interface PrecisionRingLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
  initialData?: {
    speed?: number;
    targetSize?: number;
    requiredHits?: number;
  };
}

export function PrecisionRingLock({ onComplete, visible, onClose, initialData }: PrecisionRingLockProps) {
  const [rotation, setRotation] = useState(0);
  const [targetRotation, setTargetRotation] = useState(Math.random() * 360);
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [hits, setHits] = useState(0);
  const [speed] = useState(initialData?.speed || 1);
  const [targetSize] = useState(initialData?.targetSize || 30);
  const [requiredHits] = useState(initialData?.requiredHits || 3);
  const [isAnimating, setIsAnimating] = useState(true);
  const [showPulse, setShowPulse] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    const updateCanvasSize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const size = Math.min(container.clientWidth, 400);
      canvas.width = size;
      canvas.height = size;
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    return () => window.removeEventListener('resize', updateCanvasSize);
  }, []);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.code === 'Space') {
        event.preventDefault();
        handleAttempt();
      }
    };

    if (visible) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [visible, rotation]);

  useEffect(() => {
    let lastTime = performance.now();
    
    const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;
      
      if (isAnimating) {
        setRotation(prev => (prev + speed * (deltaTime / 16)) % 360);
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    if (visible) {
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [visible, speed, isAnimating]);

  useEffect(() => {
    const angleDiff = Math.abs(rotation - targetRotation) % 360;
    const isInZone = angleDiff <= targetSize / 2 || angleDiff >= 360 - targetSize / 2;
    setShowPulse(isInZone);
  }, [rotation, targetRotation, targetSize]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const size = canvas.width;
    const center = size / 2;
    const radius = (size / 2) * 0.8;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // Draw background circle with gradient
    const bgGradient = ctx.createRadialGradient(center, center, 0, center, center, radius + 20);
    bgGradient.addColorStop(0, getHSLColor('--primary', 0.1));
    bgGradient.addColorStop(1, getHSLColor('--primary', 0.05));
    
    ctx.beginPath();
    ctx.arc(center, center, radius + 20, 0, Math.PI * 2);
    ctx.fillStyle = bgGradient;
    ctx.fill();

    // Draw outer ring with gradient
    const ringGradient = ctx.createRadialGradient(center, center, radius - 10, center, center, radius + 10);
    ringGradient.addColorStop(0, getHSLColor('--primary', 0.3));
    ringGradient.addColorStop(1, getHSLColor('--primary', 0.1));

    ctx.beginPath();
    ctx.arc(center, center, radius, 0, Math.PI * 2);
    ctx.strokeStyle = ringGradient;
    ctx.lineWidth = 20;
    ctx.stroke();

    // Draw target zone with pulse effect
    const targetAngle = (targetRotation * Math.PI) / 180;
    const targetArcSize = (targetSize * Math.PI) / 180;
    
    ctx.shadowColor = getHSLColor('--primary');
    ctx.shadowBlur = showPulse ? 25 : 15;
    
    ctx.beginPath();
    ctx.arc(center, center, radius, targetAngle - targetArcSize/2, targetAngle + targetArcSize/2);
    ctx.strokeStyle = showPulse ? getHSLColor('--primary') : getHSLColor('--primary', 0.8);
    ctx.lineWidth = showPulse ? 24 : 20;
    ctx.stroke();
    
    ctx.shadowBlur = 0;

    // Draw rotating indicator
    const indicatorAngle = (rotation * Math.PI) / 180;
    const indicatorRadius = 14;
    
    // Add glow effect
    ctx.shadowColor = error ? getHSLColor('--destructive') : getHSLColor('--primary');
    ctx.shadowBlur = showPulse ? 20 : 15;
    
    // Draw indicator with gradient
    const indicatorGradient = ctx.createRadialGradient(
      center + Math.cos(indicatorAngle) * radius,
      center + Math.sin(indicatorAngle) * radius,
      0,
      center + Math.cos(indicatorAngle) * radius,
      center + Math.sin(indicatorAngle) * radius,
      indicatorRadius
    );
    
    indicatorGradient.addColorStop(0, error ? getHSLColor('--destructive') : getHSLColor('--primary'));
    indicatorGradient.addColorStop(1, error ? getHSLColor('--destructive', 0.8) : getHSLColor('--primary', 0.8));

    ctx.beginPath();
    ctx.arc(
      center + Math.cos(indicatorAngle) * radius,
      center + Math.sin(indicatorAngle) * radius,
      indicatorRadius,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = indicatorGradient;
    ctx.fill();

    // Draw inner circle for indicator
    ctx.beginPath();
    ctx.arc(
      center + Math.cos(indicatorAngle) * radius,
      center + Math.sin(indicatorAngle) * radius,
      indicatorRadius * 0.6,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    
    ctx.shadowBlur = 0;

    // Draw hit counter with improved visuals
    const hitSize = 30;
    const hitSpacing = 15;
    const hitsWidth = (hitSize * requiredHits) + (hitSpacing * (requiredHits - 1));
    const startX = (size - hitsWidth) / 2;

    for (let i = 0; i < requiredHits; i++) {
      const x = startX + (hitSize + hitSpacing) * i;
      const y = size - hitSize - 20;

      // Background circle
      ctx.beginPath();
      ctx.arc(x + hitSize/2, y + hitSize/2, hitSize/2, 0, Math.PI * 2);
      ctx.fillStyle = getHSLColor('--primary', 0.1);
      ctx.fill();

      if (i < hits) {
        // Completed hit with glow
        ctx.shadowColor = getHSLColor('--primary');
        ctx.shadowBlur = 15;
        
        ctx.beginPath();
        ctx.arc(x + hitSize/2, y + hitSize/2, hitSize/2 - 2, 0, Math.PI * 2);
        ctx.fillStyle = getHSLColor('--primary');
        ctx.fill();

        // Inner highlight
        ctx.beginPath();
        ctx.arc(x + hitSize/2, y + hitSize/2, hitSize/4, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        ctx.fill();
        
        ctx.shadowBlur = 0;
      }
    }
  }, [rotation, targetRotation, error, hits, requiredHits, targetSize, showPulse]);

  const handleAttempt = () => {
    const angleDiff = Math.abs(rotation - targetRotation) % 360;
    const isHit = angleDiff <= targetSize / 2 || angleDiff >= 360 - targetSize / 2;

    if (isHit) {
      const newHits = hits + 1;
      setHits(newHits);
      
      // Generate new target position
      setTargetRotation(Math.random() * 360);
      
      if (newHits >= requiredHits) {
        handleSuccess();
      }
    } else {
      handleFailure();
    }
  };

  const handleSuccess = () => {
    setIsAnimating(false);
    fetch('https://moon-ui/wireCuttingComplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: true })
    });
    setTimeout(() => {
      onComplete(true);
      onClose();
    }, 500);
  };

  const handleFailure = () => {
    setError(true);
    setHits(0);
    onComplete(false); // Call onComplete first
    onClose(); // Call onClose first
    fetch('https://moon-ui/precisionRingComplete', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ success: false })
    });
    setTimeout(() => {
    }, 500);
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

  const handleBackgroundClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div 
          className="fixed inset-0 flex items-center justify-center bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleBackgroundClick}
        >
          <div
            className={cn(
              "glass-effect w-[500px] p-8 rounded-3xl transition-all duration-500",
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
                <Target className={cn(
                  "h-14 w-14 relative z-10",
                  error ? "text-destructive" : "text-primary"
                )} />
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">Precision Lock</h1>
              <p className={cn(
                "text-lg transition-colors",
                error ? "text-destructive" : "text-primary/60"
              )}>
                {error ? "Missed! Try again" : `Hit the target! (${hits}/${requiredHits})`}
              </p>
            </div>

            <div ref={containerRef} className="mt-10 relative">
              <canvas
                ref={canvasRef}
                onClick={handleAttempt}
                className="w-full cursor-pointer"
              />
            </div>

            <div className="mt-6 text-center text-primary/60">
              Press <kbd className="px-2 py-1 rounded bg-primary/10">Space</kbd> or click when the indicator is in the target zone
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