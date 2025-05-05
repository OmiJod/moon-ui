import React, { useState, useEffect, useRef } from 'react';
import { Haze as Maze, XCircle, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MazeNavigationLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
}

interface Cell {
  x: number;
  y: number;
  walls: boolean[];
  visited: boolean;
}

export function MazeNavigationLock({ onComplete, visible, onClose }: MazeNavigationLockProps) {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState({ x: 0, y: 0 });
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(30);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const mazeContainerRef = useRef<HTMLDivElement>(null);
  const mazeSize = 10;
  const [cellSize, setCellSize] = useState(40);

  useEffect(() => {
    const updateCellSize = () => {
      if (mazeContainerRef.current) {
        const containerWidth = mazeContainerRef.current.clientWidth - 48; // Account for padding
        const newCellSize = Math.floor(containerWidth / mazeSize);
        setCellSize(newCellSize);
      }
    };

    updateCellSize();
    window.addEventListener('resize', updateCellSize);
    return () => window.removeEventListener('resize', updateCellSize);
  }, []);

  useEffect(() => {
    if (visible) {
      generateMaze();
      setTimeLeft(30);
      setPlayerPos({ x: 0, y: 0 });
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.focus();
        }
      }, 100);
    }
  }, [visible, cellSize]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (visible && containerRef.current && document.activeElement !== containerRef.current) {
        containerRef.current.focus();
      }
    }, 100);

    return () => clearInterval(interval);
  }, [visible]);

  useEffect(() => {
    if (timeLeft > 0 && visible) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0) {
      handleFailure();
    }
  }, [timeLeft, visible]);

  const generateMaze = () => {
    const newMaze: Cell[][] = Array(mazeSize).fill(null).map((_, y) =>
      Array(mazeSize).fill(null).map((_, x) => ({
        x,
        y,
        walls: [true, true, true, true],
        visited: false,
      }))
    );

    const stack: Cell[] = [];
    const startCell = newMaze[0][0];
    startCell.visited = true;
    stack.push(startCell);

    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      const neighbors = getUnvisitedNeighbors(current, newMaze);

      if (neighbors.length === 0) {
        stack.pop();
      } else {
        const next = neighbors[Math.floor(Math.random() * neighbors.length)];
        removeWalls(current, next);
        next.visited = true;
        stack.push(next);
      }
    }

    const path = findPath(newMaze[0][0], newMaze[mazeSize - 1][mazeSize - 1], newMaze);
    if (!path) {
      generateMaze();
      return;
    }

    setMaze(newMaze);
    drawMaze(newMaze);
  };

  const getUnvisitedNeighbors = (cell: Cell, maze: Cell[][]) => {
    const neighbors: Cell[] = [];
    const directions = [[-1, 0], [0, 1], [1, 0], [0, -1]];

    directions.forEach(([dy, dx]) => {
      const newY = cell.y + dy;
      const newX = cell.x + dx;

      if (newY >= 0 && newY < mazeSize && newX >= 0 && newX < mazeSize && !maze[newY][newX].visited) {
        neighbors.push(maze[newY][newX]);
      }
    });

    return neighbors;
  };

  const removeWalls = (current: Cell, next: Cell) => {
    const dx = next.x - current.x;
    const dy = next.y - current.y;

    if (dx === 1) {
      current.walls[1] = false;
      next.walls[3] = false;
    } else if (dx === -1) {
      current.walls[3] = false;
      next.walls[1] = false;
    }

    if (dy === 1) {
      current.walls[2] = false;
      next.walls[0] = false;
    } else if (dy === -1) {
      current.walls[0] = false;
      next.walls[2] = false;
    }
  };

  const findPath = (start: Cell, end: Cell, maze: Cell[][]) => {
    const visited = new Set<string>();
    const queue: { cell: Cell; path: Cell[] }[] = [{ cell: start, path: [start] }];

    while (queue.length > 0) {
      const { cell, path } = queue.shift()!;
      const key = `${cell.x},${cell.y}`;

      if (cell === end) {
        return path;
      }

      if (!visited.has(key)) {
        visited.add(key);
        const neighbors = getValidNeighbors(cell, maze);
        
        neighbors.forEach(neighbor => {
          if (!visited.has(`${neighbor.x},${neighbor.y}`)) {
            queue.push({ cell: neighbor, path: [...path, neighbor] });
          }
        });
      }
    }

    return null;
  };

  const getValidNeighbors = (cell: Cell, maze: Cell[][]) => {
    const neighbors: Cell[] = [];
    const directions = [
      { dx: 0, dy: -1, wallIndex: 0 },
      { dx: 1, dy: 0, wallIndex: 1 },
      { dx: 0, dy: 1, wallIndex: 2 },
      { dx: -1, dy: 0, wallIndex: 3 },
    ];

    directions.forEach(({ dx, dy, wallIndex }) => {
      const newX = cell.x + dx;
      const newY = cell.y + dy;

      if (newX >= 0 && newX < mazeSize && newY >= 0 && newY < mazeSize && !cell.walls[wallIndex]) {
        neighbors.push(maze[newY][newX]);
      }
    });

    return neighbors;
  };

  const drawMaze = (maze: Cell[][]) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Update canvas size
    canvas.width = cellSize * mazeSize;
    canvas.height = cellSize * mazeSize;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw walls
    ctx.strokeStyle = 'hsl(var(--primary))';
    ctx.lineWidth = 2;

    maze.forEach(row => {
      row.forEach(cell => {
        const x = cell.x * cellSize;
        const y = cell.y * cellSize;

        ctx.beginPath();
        if (cell.walls[0]) {
          ctx.moveTo(x, y);
          ctx.lineTo(x + cellSize, y);
        }
        if (cell.walls[1]) {
          ctx.moveTo(x + cellSize, y);
          ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.walls[2]) {
          ctx.moveTo(x, y + cellSize);
          ctx.lineTo(x + cellSize, y + cellSize);
        }
        if (cell.walls[3]) {
          ctx.moveTo(x, y);
          ctx.lineTo(x, y + cellSize);
        }
        ctx.stroke();
      });
    });

    // Draw player
    ctx.fillStyle = 'hsl(var(--primary))';
    ctx.beginPath();
    ctx.arc(
      playerPos.x * cellSize + cellSize / 2,
      playerPos.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.shadowColor = 'hsl(var(--primary))';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;

    // Draw goal
    ctx.fillStyle = 'hsl(var(--destructive))';
    ctx.beginPath();
    ctx.arc(
      (mazeSize - 1) * cellSize + cellSize / 2,
      (mazeSize - 1) * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2
    );
    ctx.shadowColor = 'hsl(var(--destructive))';
    ctx.shadowBlur = 15;
    ctx.fill();
    ctx.shadowBlur = 0;
  };

  useEffect(() => {
    if (maze.length > 0) {
      drawMaze(maze);
    }
  }, [maze, playerPos, cellSize]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.preventDefault();
    if (!maze.length) return;

    const currentCell = maze[playerPos.y][playerPos.x];
    let newPos = { ...playerPos };

    switch (e.key) {
      case 'ArrowUp':
        if (!currentCell.walls[0]) newPos.y--;
        break;
      case 'ArrowRight':
        if (!currentCell.walls[1]) newPos.x++;
        break;
      case 'ArrowDown':
        if (!currentCell.walls[2]) newPos.y++;
        break;
      case 'ArrowLeft':
        if (!currentCell.walls[3]) newPos.x--;
        break;
      case 'Escape':
        handleClose();
        return;
    }

    if (newPos.x !== playerPos.x || newPos.y !== playerPos.y) {
      setPlayerPos(newPos);
      
      if (newPos.x === mazeSize - 1 && newPos.y === mazeSize - 1) {
        handleSuccess();
      }
    }
  };

  const handleSuccess = () => {
    onComplete(true);
    onClose();
  };

  const handleFailure = () => {
    setError(true);
    setTimeout(() => {
      setError(false);
      generateMaze();
      setPlayerPos({ x: 0, y: 0 });
      setTimeLeft(30);
    }, 1000);
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

  if (!visible) return null;

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 flex items-center justify-center outline-none"
      onKeyDown={handleKeyDown}
      tabIndex={0}
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
            <Maze className={cn(
              "h-14 w-14 relative z-10",
              error ? "text-destructive" : "text-primary"
            )} />
          </div>
          <h1 className="text-2xl font-bold text-primary mb-2">Maze Navigation</h1>
          <div className="flex items-center gap-2">
            <Timer className={cn(
              "w-5 h-5",
              timeLeft <= 10 ? "text-destructive" : "text-primary/60"
            )} />
            <p className={cn(
              "text-lg transition-colors",
              timeLeft <= 10 ? "text-destructive" : "text-primary/60"
            )}>
              {timeLeft} seconds remaining
            </p>
          </div>
        </div>

        <div className="mt-8" ref={mazeContainerRef}>
          <div className={cn(
            "p-6 rounded-2xl backdrop-blur-md border-2 transition-colors flex items-center justify-center",
            error ? "border-destructive/20" : "border-primary/20"
          )}>
            <canvas
              ref={canvasRef}
              className="rounded-xl"
            />
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