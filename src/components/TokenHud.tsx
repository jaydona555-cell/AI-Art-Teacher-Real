import { motion, AnimatePresence } from "framer-motion";
import { Coins, Lock, Sparkles } from "lucide-react";
import { useReward, UNLOCK_THRESHOLDS } from "@/context/RewardContext";

export default function TokenHud() {
  const { tokens, totalEarned } = useReward();

  const nextThreshold = UNLOCK_THRESHOLDS.find((t) => totalEarned < t.tokens);
  const prevThreshold = [...UNLOCK_THRESHOLDS].reverse().find((t) => totalEarned >= t.tokens);
  const progressToNext = nextThreshold
    ? ((totalEarned - (prevThreshold?.tokens ?? 0)) / (nextThreshold.tokens - (prevThreshold?.tokens ?? 0))) * 100
    : 100;

  return (
    <div className="flex items-center gap-3">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-2 bg-gradient-to-r from-accent-amber-light to-accent-amber border border-accent-amber-deep/30 rounded-full px-4 py-2 shadow-glow-amber"
      >
        <Coins size={18} className="text-white" />
        <span className="font-display font-bold text-white text-lg tabular-nums">{tokens}</span>
        <span className="text-white/80 text-xs font-medium">tokens</span>
      </motion.div>

      <AnimatePresence mode="wait">
        {nextThreshold && (
          <motion.div
            key={nextThreshold.label}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="hidden sm:flex items-center gap-2.5 bg-white/80 backdrop-blur-sm border border-sand/60 rounded-full pl-3 pr-4 py-2 shadow-card-soft"
          >
            <Lock size={14} className="text-warm-taupe" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[10px] text-muted-brown font-medium leading-none">{nextThreshold.label}</span>
              <div className="w-28 h-1.5 rounded-full bg-sand/50 overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-accent-amber via-accent-coral to-accent-rose"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressToNext}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
            <span className="text-[10px] text-muted-brown font-semibold tabular-nums">
              {totalEarned}/{nextThreshold.tokens}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      {!nextThreshold && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="hidden sm:flex items-center gap-1.5 bg-gradient-to-r from-accent-rose-light to-accent-lavender border border-accent-rose/30 rounded-full px-3 py-2 shadow-glow-rose"
        >
          <Sparkles size={14} className="text-white" />
          <span className="text-[10px] font-semibold text-white">All unlocked!</span>
        </motion.div>
      )}
    </div>
  );
}
