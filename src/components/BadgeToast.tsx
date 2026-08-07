import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, X } from "lucide-react";
import { useAchievements } from "@/context/AchievementContext";

export default function BadgeToast() {
  const { newlyEarnedBadge, clearNewlyEarned } = useAchievements();

  useEffect(() => {
    if (!newlyEarnedBadge) return;
    const timer = setTimeout(() => clearNewlyEarned(), 6000);
    return () => clearTimeout(timer);
  }, [newlyEarnedBadge, clearNewlyEarned]);

  return (
    <AnimatePresence>
      {newlyEarnedBadge && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="fixed bottom-6 left-6 z-[60] max-w-xs"
        >
          <div className="relative bg-white rounded-2xl shadow-card-color border-2 border-accent-amber/50 p-5 overflow-hidden">
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
              onClick={clearNewlyEarned}
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
                className="flex-shrink-0 w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-amber via-accent-coral to-accent-rose flex items-center justify-center shadow-glow-amber"
              >
                <Award size={22} className="text-white" />
              </motion.div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold uppercase tracking-wider text-accent-amber-deep mb-0.5">Badge Earned!</p>
                <p className="font-display font-bold text-deep-earth text-base leading-tight">{newlyEarnedBadge.name}</p>
                <p className="text-xs text-muted-brown mt-1">{newlyEarnedBadge.description}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
