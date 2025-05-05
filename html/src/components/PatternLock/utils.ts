import { Point } from './types';

/**
 * Generate a grid of points based on grid size
 */
export const generatePoints = (
  gridSize: number,
  width: number,
  height: number,
  pointRadius: number
): Point[] => {
  const points: Point[] = [];
  const cellWidth = width / gridSize;
  const cellHeight = height / gridSize;
  
  for (let i = 0; i < gridSize; i++) {
    for (let j = 0; j < gridSize; j++) {
      points.push({
        id: i * gridSize + j,
        x: j * cellWidth + cellWidth / 2,
        y: i * cellHeight + cellHeight / 2,
      });
    }
  }
  
  return points;
};

/**
 * Check if a point is near coordinates
 */
export const isPointNear = (
  point: Point,
  x: number,
  y: number,
  radius: number
): boolean => {
  const dx = point.x - x;
  const dy = point.y - y;
  return dx * dx + dy * dy <= radius * radius;
};

/**
 * Find a point that is near coordinates
 */
export const findNearestPoint = (
  points: Point[],
  x: number,
  y: number,
  radius: number
): Point | null => {
  for (const point of points) {
    if (isPointNear(point, x, y, radius)) {
      return point;
    }
  }
  return null;
};

/**
 * Check if two patterns match
 */
export const patternsMatch = (
  pattern1: number[],
  pattern2: number[]
): boolean => {
  if (pattern1.length !== pattern2.length) {
    return false;
  }
  
  for (let i = 0; i < pattern1.length; i++) {
    if (pattern1[i] !== pattern2[i]) {
      return false;
    }
  }
  
  return true;
};

/**
 * Get canvas coordinates from mouse/touch event
 */
export const getCanvasCoordinates = (
  event: MouseEvent | TouchEvent,
  canvas: HTMLCanvasElement
): { x: number, y: number } => {
  const rect = canvas.getBoundingClientRect();
  
  // Touch event
  if (window.TouchEvent && event instanceof TouchEvent) {
    const touch = event.touches[0] || event.changedTouches[0];
    return {
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top
    };
  }
  
  // Mouse event
  return {
    x: (event as MouseEvent).clientX - rect.left,
    y: (event as MouseEvent).clientY - rect.top
  };
};