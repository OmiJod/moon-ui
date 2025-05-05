import React, { useState, useEffect } from 'react';
import { Image as ImageIcon, XCircle, Lock, Eye } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImageLockProps {
  onComplete: (success: boolean) => void;
  visible: boolean;
  onClose: () => void;
  initialData?: {
    imageUrl: string;
    hasPassword: boolean;
  };
}

export function ImageLock({ onComplete, visible, onClose, initialData }: ImageLockProps) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [imageError, setImageError] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'Enter' && initialData?.hasPassword && !isUnlocked) {
        handleUnlock();
      }
    };

    if (visible) {
      window.addEventListener('keydown', handleKeyPress);
    }

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [visible, password, isUnlocked]);

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

  const handleUnlock = async () => {
    if (!initialData?.hasPassword || !password) return;
    
    try {
      const response = await fetch('https://moon-ui/imageComplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password })
      });

      const result = await response.json();
      
      if (result.success) {
        setIsUnlocked(true);
        onComplete(true);
      } else {
        setError(true);
        setTimeout(() => {
          setError(false);
          setPassword('');
        }, 1000);
      }
    } catch (error) {
      console.error('Error validating image:', error);
      setError(true);
      setTimeout(() => {
        setError(false);
        setPassword('');
      }, 1000);
    }
  };

  const handleImageLoad = () => {
    setIsLoading(false);
    if (!initialData?.hasPassword) {
      onComplete(true);
    }
  };

  const handleImageError = () => {
    setIsLoading(false);
    setImageError(true);
  };

  if (!visible || !initialData?.imageUrl) return null;

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
              "glass-effect w-[800px] p-8 rounded-3xl transition-all duration-500",
              error && "animate-shake",
              isClosing && "animate-fadeOut"
            )}
          >
            <div className="flex flex-col items-center">
              <div className={cn(
                "rounded-full bg-primary/10 p-6 mb-6 relative",
                error && "bg-destructive/10",
                isUnlocked && "bg-green-500/10"
              )}>
                <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg" />
                {initialData.hasPassword ? (
                  <Lock className={cn(
                    "h-14 w-14 relative z-10",
                    error ? "text-destructive" : isUnlocked ? "text-green-500" : "text-primary"
                  )} />
                ) : (
                  <Eye className={cn(
                    "h-14 w-14 relative z-10",
                    error ? "text-destructive" : "text-primary"
                  )} />
                )}
              </div>
              <h1 className="text-2xl font-bold text-primary mb-2">
                {initialData.hasPassword ? (isUnlocked ? "Image Unlocked" : "Protected Image") : "Image Viewer"}
              </h1>
              {initialData.hasPassword && !isUnlocked && (
                <p className={cn(
                  "text-lg transition-colors",
                  error ? "text-destructive" : "text-primary/60"
                )}>
                  {error ? "Invalid password" : "Enter password to view"}
                </p>
              )}
            </div>

            <div className="mt-8">
              <div className={cn(
                "relative overflow-hidden rounded-2xl backdrop-blur-md border-2 transition-all duration-500",
                error ? "border-destructive/20" : isUnlocked ? "border-green-500/20" : "border-primary/20"
              )}>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/20">
                    <ImageIcon className="w-12 h-12 text-primary animate-pulse" />
                  </div>
                )}
                {imageError ? (
                  <div className="h-96 flex items-center justify-center text-destructive">
                    Failed to load image
                  </div>
                ) : (
                  <div className="relative">
                    <img
                      src={initialData.imageUrl}
                      alt="Protected content"
                      className="w-full object-contain max-h-96"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                    />
                    {initialData.hasPassword && !isUnlocked && (
                      <motion.div 
                        className="absolute inset-0 bg-black"
                        initial={false}
                        animate={{ opacity: 0.9 }}
                      >
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Lock className="w-20 h-20 text-primary/50" />
                        </div>
                      </motion.div>
                    )}
                  </div>
                )}
              </div>

              {initialData.hasPassword && !isUnlocked && (
                <div className="mt-6">
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter password"
                    className={cn(
                      "w-full h-14 rounded-xl px-6 transition-all",
                      "bg-primary/5 hover:bg-primary/10",
                      "text-primary text-lg",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      "placeholder:text-primary/40",
                      "border-2 border-primary/20"
                    )}
                  />
                  <button
                    onClick={handleUnlock}
                    disabled={!password}
                    className={cn(
                      "w-full h-14 rounded-xl mt-4 transition-all",
                      "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
                      "text-primary hover:text-primary/90 text-lg",
                      "focus:outline-none focus:ring-2 focus:ring-primary/50",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      "border-2 border-primary/20"
                    )}
                  >
                    View Image
                  </button>
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}