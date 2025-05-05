export interface Point {
  id: number;
  x: number;
  y: number;
}

export interface PatternLockProps {
  /**
   * Width of the pattern lock component
   * @default 300
   */
  width?: number;
  
  /**
   * Height of the pattern lock component
   * @default 300
   */
  height?: number;
  
  /**
   * Grid size (e.g., 3 for a 3x3 grid)
   * @default 3
   */
  gridSize?: number;
  
  /**
   * Radius of each point in the grid
   * @default 10
   */
  pointRadius?: number;
  
  /**
   * Width of the line connecting points
   * @default 2
   */
  lineWidth?: number;
  
  /**
   * Color of the inactive points
   * @default "#718096"
   */
  pointColor?: string;
  
  /**
   * Color of the active points and lines
   * @default "#3B82F6"
   */
  activeColor?: string;
  
  /**
   * Color when pattern is incorrect
   * @default "#EF4444"
   */
  errorColor?: string;
  
  /**
   * Duration of the error state in milliseconds
   * @default 1000
   */
  errorDuration?: number;
  
  /**
   * Callback when pattern is completed
   * @param pattern Array of point IDs representing the pattern
   */
  onComplete?: (pattern: number[]) => void;
  
  /**
   * Show error state
   * @default false
   */
  showError?: boolean;

  /**
   * Clear the pattern
   * @default false
   */
  shouldClear?: boolean;

  /**
   * Class name for additional styling
   */
  className?: string;
}