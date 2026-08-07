import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import { useReward } from "@/context/RewardContext";

export default function UnlockToast() {
  const { newlyUnlocked, clearNewlyUnlocked } = useReward();

  useEffect(() => {
    if (!newlyUnlocked) return;
    const timer = setTimeout(() => clearNewlyUnlocked(), 5000);
    return () => clearTimeout(timer);
  }, [newlyUnlocked, clearNewlyUnlocked]);

  return (
    <AnimatePresence>
      {newlyUnlocked && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 right-6 z-50 max-w-xs"
        >
          <div className="relative bg-white rounded-2xl shadow-card-color border-2 border-accent-amber-light/50 p-5 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pastel-amber via-pastel-coral to-pastel-rose pointer-events-none opacity-30" />
            <motion.div
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 1 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            >
              {[...Array(12)].map((_, i) => {
                const angle = (i / 12) * Math.PI * 2;
                const dist = 80 + Math.random() * 60;
                return (
                  <motion.div
                    key={i}
                    initial={{ x: 0, y: 0, scale: 0, opacity: 1 }}
                    animate={{ x: Math.cos(angle) * dist, y: Math.sin(angle) * dist, scale: 1, opacity: 0 }}
                    transition={{ duration: 1.2, ease: "easeOut", delay: 0.1 }}
                    className="absolute top-1/2 left-1/2 w-2.5 h-2.5 rounded-full"
                    style={{ background: ["#FBBF24", "#F472B6", "#A5B4FC", "#86EFAC"][i % 4] }}
                  />
                );
              })}
            </motion.div>
            <button
              onClick={clearNewlyUnlocked}
              className="absolute top-2.5 right-2.5 text-warm-taupe hover:text-deep-earth transition-colors z-10"
              aria-label="Dismiss"
            >
              <X size={16} />
            </button>
            <div className="relative flex items-start gap-3">
              <motion.div
                initial={{ scale: 0, rotate: -30 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-accent-amber-light via-accent-coral to-accent-rose flex items-center justify-center shadow-glow-amber"
              >
                <Sparkles size={20} className="text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-accent-amber-deep mb-0.5">New Unlock!</p>
                <p className="font-display font-bold text-deep-earth text-base leading-tight">{newlyUnlocked}</p>
                <p className="text-xs text-muted-brown mt-1">Keep sharing your art to earn more!</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
