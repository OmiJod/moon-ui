import React, { useState, useEffect } from 'react';
import { AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface AlertDialogProps {
  title: string;
  description: string;
  cancelText: string;
  submitText: string;
  onCancel: () => void;
  onSubmit: () => void;
  visible: boolean;
}

export function AlertDialog({
  title,
  description,
  cancelText,
  submitText,
  onCancel,
  onSubmit,
  visible
}: AlertDialogProps) {
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        handleClose();
      } else if (event.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  const handleClose = () => {
    setIsClosing(true);
    onCancel();
  };

  const handleSubmit = () => {
    onSubmit();
  };

  if (!visible) return null;

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 flex items-center justify-center"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", duration: 0.5 }}
            className={cn(
              "glass-effect w-[450px] rounded-3xl transition-all duration-500 relative overflow-hidden",
              isClosing && "animate-fadeOut"
            )}
          >
            {/* Content */}
            <div className="relative z-10">
              <div className="flex flex-col items-center p-8 pb-0">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="rounded-full bg-primary/10 p-6 mb-6 relative group"
                >
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-lg transition-all duration-300 group-hover:blur-xl" />
                  <AlertTriangle className="h-14 w-14 text-primary relative z-10" />
                  
                  {/* Pulse Effect */}
                  <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
                </motion.div>

                <motion.h2
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="text-2xl font-bold text-primary mb-3"
                >
                  {title}
                </motion.h2>

                <motion.p
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="text-center text-primary/70 text-lg leading-relaxed"
                >
                  {description}
                </motion.p>
              </div>

              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="grid grid-cols-2 gap-4 mt-8 p-8"
              >
                <button
                  onClick={handleClose}
                  className={cn(
                    "h-14 rounded-xl transition-all flex items-center justify-center gap-3",
                    "bg-primary/5 hover:bg-primary/10 active:bg-primary/15",
                    "text-primary hover:text-primary/90 text-lg",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "border-2 border-primary/20",
                    "relative overflow-hidden group"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <span className="relative z-10">{cancelText}</span>
                </button>
                
                <button
                  onClick={handleSubmit}
                  className={cn(
                    "h-14 rounded-xl transition-all flex items-center justify-center gap-3",
                    "bg-primary/10 hover:bg-primary/20 active:bg-primary/30",
                    "text-primary hover:text-primary/90 text-lg",
                    "focus:outline-none focus:ring-2 focus:ring-primary/50",
                    "border-2 border-primary/20",
                    "relative overflow-hidden group"
                  )}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/10 to-primary/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-500" />
                  <span className="relative z-10">{submitText}</span>
                </button>
              </motion.div>
            </div>

          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}