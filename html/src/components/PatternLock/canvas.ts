import { Point } from './types';

interface DrawPatternParams {
  ctx: CanvasRenderingContext2D;
  points: Point[];
  pattern: number[];
  currentPoint: { x: number; y: number } | null;
  pointRadius: number;
  lineWidth: number;
  pointColor: string;
  activeColor: string;
}

/**
 * Draw the pattern lock on the canvas
 */
export const drawPattern = ({
  ctx,
  points,
  pattern,
  currentPoint,
  pointRadius,
  lineWidth,
  pointColor,
  activeColor,
}: DrawPatternParams): void => {
  // Clear the canvas
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  
  // Draw lines connecting the points in the pattern
  if (pattern.length > 0) {
    ctx.beginPath();
    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = activeColor;
    
    // Get the first point in the pattern
    const firstPoint = points.find(p => p.id === pattern[0]);
    if (firstPoint) {
      ctx.moveTo(firstPoint.x, firstPoint.y);
      
      // Draw lines to each subsequent point in the pattern
      for (let i = 1; i < pattern.length; i++) {
        const point = points.find(p => p.id === pattern[i]);
        if (point) {
          ctx.lineTo(point.x, point.y);
        }
      }
      
      // If we're still drawing, draw a line to the current cursor position
      if (currentPoint) {
        const lastPoint = points.find(p => p.id === pattern[pattern.length - 1]);
        if (lastPoint) {
          ctx.lineTo(currentPoint.x, currentPoint.y);
        }
      }
      
      ctx.stroke();
    }
  }
  
  // Draw each point
  points.forEach(point => {
    const isActive = pattern.includes(point.id);
    
    // Draw outer circle (border)
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius + 2, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
    
    // Draw the point
    ctx.beginPath();
    ctx.arc(point.x, point.y, pointRadius, 0, Math.PI * 2);
    ctx.fillStyle = isActive ? activeColor : pointColor;
    ctx.fill();
    
    // Draw a smaller inner circle for active points
    if (isActive) {
      ctx.beginPath();
      ctx.arc(point.x, point.y, pointRadius / 2, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
      ctx.fill();
    }
  });
};