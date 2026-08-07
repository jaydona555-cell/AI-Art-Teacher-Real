import { useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Flame, X } from "lucide-react";

interface StreakCelebrationProps {
  streak: number | null;
  bonusTokens: number;
  onClose: () => void;
}

const CONFETTI_COLORS = ["#C9A961", "#7BA08C", "#B89098", "#6B95B8", "#D4A88E"];

export default function StreakCelebration({
  streak,
  bonusTokens,
  onClose,
}: StreakCelebrationProps) {
  useEffect(() => {
    if (!streak) return;
    const timer = setTimeout(onClose, 6000);
    return () => clearTimeout(timer);
  }, [streak, onClose]);

  const confettiPieces = useMemo(
    () =>
      Array.from({ length: 24 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 600,
        y: -300 - Math.random() * 200,
        rotate: (Math.random() - 0.5) * 720,
        delay: Math.random() * 0.3,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        size: 6 + Math.random() * 6,
      })),
    []
  );

  return (
    <AnimatePresence>
      {streak && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center pointer-events-none"
        >
          {/* Confetti layer */}
          <div className="absolute inset-0 overflow-hidden">
            {confettiPieces.map((p) => (
              <motion.div
                key={p.id}
                initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
                animate={{ x: p.x, y: p.y + 400, rotate: p.rotate, opacity: 0 }}
                transition={{ duration: 2.5, delay: p.delay, ease: "easeOut" }}
                className="absolute top-1/2 left-1/2 rounded-sm"
                style={{ width: p.size, height: p.size * 0.6, backgroundColor: p.color }}
              />
            ))}
          </div>

          {/* Card */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="relative pointer-events-auto bg-white rounded-3xl shadow-card-color border-2 border-accent-amber/40 p-8 max-w-sm mx-4 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-pastel-amber/30 via-pastel-coral/20 to-pastel-sage/20 pointer-events-none" />
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-warm-taupe hover:text-deep-earth transition-colors z-10"
              aria-label="Dismiss"
            >
              <X size={18} />
            </button>

            <div className="relative flex flex-col items-center text-center gap-4">
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 12, delay: 0.15 }}
                className="w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-amber via-accent-coral to-accent-rose flex items-center justify-center shadow-glow-amber"
              >
                <motion.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, -5, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Flame size={40} className="text-white" />
                </motion.div>
              </motion.div>

              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-accent-amber-deep mb-1">
                  Streak Milestone
                </p>
                <h3 className="font-display text-2xl font-bold text-deep-earth leading-tight">
                  {streak} Day Streak!
                </h3>
                <p className="text-sm text-muted-brown mt-2 leading-relaxed max-w-xs">
                  Your dedication is inspiring. Consistency is the brushstroke of mastery —
                  keep painting your creative journey.
                </p>
              </div>

              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.4 }}
                className="flex items-center gap-2 bg-gradient-to-r from-accent-amber to-accent-coral rounded-full px-5 py-2.5 shadow-glow-amber"
              >
                <Flame size={16} className="text-white" />
                <span className="text-sm font-bold text-white">
                  +{bonusTokens} bonus tokens!
                </span>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
