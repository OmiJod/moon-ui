import React, { useState, useEffect } from 'react';
import { Terminal, XCircle, Timer, Play, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import Editor from "@monaco-editor/react";
import { motion, AnimatePresence } from 'framer-motion';

interface HackersTerminalLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
  initialData?: {
    language: 'python' | 'lua' | 'csharp';
    challenge: string;
    timeLimit: number;
    testCases: Array<{
      input: any[];
      expected: any;
    }>;
    handleFailure: (message: string) => void;
  };
}

export function HackersTerminalLock({
  onComplete,
  visible,
  onClose,
  initialData
}: HackersTerminalLockProps) {
  const [code, setCode] = useState('');
  const [output, setOutput] = useState<string>('');
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [timeLeft, setTimeLeft] = useState(initialData?.timeLimit || 300);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!visible) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          initialData?.handleFailure("Time's up!");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [visible]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
        handleRun();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [code]);

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

  const handleRun = async () => {
    if (isRunning) return;
    setIsRunning(true);
    setOutput('');

    try {
      const response = await fetch('https://moon-ui/validateCode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          language: initialData?.language,
          testCases: initialData?.testCases
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setOutput('All test cases passed! Access granted.');
        setTimeout(() => {
          onComplete(true);
          onClose();
        }, 1000);
      } else {
        setError(true);
        setOutput(result.error || 'Test cases failed. Access denied.');
        setTimeout(() => {
          setError(false);
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating code:', error);
      setError(true);
      setOutput('Error executing code. Please try again.');
      setTimeout(() => {
        setError(false);
      }, 1000);
    } finally {
      setIsRunning(false);
    }
  };

  const handleReset = () => {
    setCode('');
    setOutput('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        >
          <div
            className={cn(
              "glass-effect w-[500px] p-6 rounded-2xl transition-all duration-500",
              error && "animate-shake",
              isClosing && "animate-fadeOut"
            )}
          >
            <div className="flex flex-col items-center">
              <div className={cn(
                "rounded-full bg-primary/10 p-4 mb-4 relative",
                error && "bg-destructive/10"
              )}>
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
                <Terminal className={cn(
                  "h-10 w-10 relative z-10",
                  error ? "text-destructive" : "text-primary"
                )} />
              </div>
              <h1 className="text-xl font-bold text-primary mb-2">Terminal Access Required</h1>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Timer className={cn(
                    "w-4 h-4",
                    timeLeft <= 60 ? "text-destructive" : "text-primary"
                  )} />
                  <p className={cn(
                    "text-sm",
                    timeLeft <= 60 ? "text-destructive" : "text-primary"
                  )}>
                    {formatTime(timeLeft)}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {/* Challenge Description */}
              <div className="p-3 rounded-lg bg-primary/5 border-2 border-primary/20">
                <h3 className="text-sm font-semibold text-primary mb-1">Challenge:</h3>
                <p className="text-sm text-primary/80 whitespace-pre-wrap">{initialData?.challenge}</p>
              </div>

              {/* Code Editor */}
              <div className={cn(
                "rounded-lg overflow-hidden border-2 transition-colors",
                error ? "border-destructive/20" : "border-primary/20"
              )}>
                <Editor
                  height="200px"
                  defaultLanguage={initialData?.language || "python"}
                  theme="vs-dark"
                  value={code}
                  onChange={(value) => setCode(value || '')}
                  options={{
                    minimap: { enabled: false },
                    fontSize: 12,
                    lineNumbers: 'on',
                    roundedSelection: true,
                    scrollBeyondLastLine: false,
                    automaticLayout: true,
                  }}
                />
              </div>

              {/* Output Console */}
              {output && (
                <div className={cn(
                  "p-3 rounded-lg font-mono text-xs transition-colors",
                  error ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                )}>
                  {output}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleReset}
                  disabled={!code || isRunning}
                  className={cn(
                    "flex-1 h-10 rounded-lg transition-all flex items-center justify-center gap-2",
                    "bg-primary/5 hover:bg-primary/10 active:bg-primary/15",
                    "text-primary hover:text-primary/90 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "border-2 border-primary/20"
                  )}
                >
                  <RotateCcw className="w-4 h-4" />
                  Reset
                </button>
                <button
                  onClick={handleRun}
                  disabled={!code || isRunning}
                  className={cn(
                    "flex-1 h-10 rounded-lg transition-all flex items-center justify-center gap-2",
                    "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
                    "text-primary hover:text-primary/90 text-sm",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "border-2 border-primary/20"
                  )}
                >
                  <Play className="w-4 h-4" />
                  Run Code
                </button>
              </div>
            </div>

            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 rounded-md hover:bg-white/10 transition-colors"
            >
              <XCircle className="w-5 h-5 text-white/70" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}