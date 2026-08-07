import { motion, AnimatePresence } from "framer-motion";
import { Focus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useEffect, type ReactNode } from "react";

interface FocusModeProps {
  active: boolean;
  children: ReactNode;
  title?: string;
  onClose: () => void;
}

export default function FocusMode({ active, children, title = "Focus Mode", onClose }: FocusModeProps) {
  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-[70] bg-cream/98 backdrop-blur-lg"
        >
          <div className="max-w-3xl mx-auto px-6 py-8 h-full flex flex-col">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-sand/40">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-sage to-accent-sky flex items-center justify-center shadow-sticker">
                  <Focus size={18} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-deep-earth text-base">{title}</h2>
                  <p className="text-xs text-muted-brown">Distractions hidden. Take your time.</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-brown hover:text-deep-earth bg-white/60 hover:bg-white rounded-full px-4 py-2 border border-sand/40 transition-all"
              >
                <X size={14} /> Exit Focus
              </button>
            </div>
            <div className="flex-1 overflow-y-auto scroll-warm">
              {children}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

interface StepNavigationProps {
  totalSteps: number;
  currentStep: number;
  onPrev: () => void;
  onNext: () => void;
}

export function StepNavigation({ totalSteps, currentStep, onPrev, onNext }: StepNavigationProps) {
  const [hasNext, setHasNext] = useState(true);
  useEffect(() => {
    setHasNext(currentStep < totalSteps - 1);
  }, [currentStep, totalSteps]);

  return (
    <div className="flex items-center justify-between mt-6 pt-4 border-t border-sand/40">
      <button
        onClick={onPrev}
        disabled={currentStep === 0}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-brown hover:text-deep-earth disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
      >
        <ChevronLeft size={16} /> Previous
      </button>

      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === currentStep ? "w-6 bg-accent-amber" : i < currentStep ? "w-1.5 bg-accent-sage" : "w-1.5 bg-sand/50"
            }`}
          />
        ))}
      </div>

      <button
        onClick={onNext}
        disabled={!hasNext}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-accent-amber to-accent-coral rounded-full px-5 py-2.5 hover:shadow-glow-amber disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        Next <ChevronRight size={16} />
      </button>
    </div>
  );
}
