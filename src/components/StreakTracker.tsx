import { motion } from "framer-motion";
import { Flame } from "lucide-react";
import { useAchievements, STREAK_MILESTONES } from "@/context/AchievementContext";

export default function StreakTracker() {
  const { currentStreak, longestStreak } = useAchievements();

  const nextMilestone = STREAK_MILESTONES.find((m) => m > currentStreak) ?? null;
  const prevMilestone = [...STREAK_MILESTONES].reverse().find((m) => m <= currentStreak) ?? 0;
  const progress = nextMilestone
    ? Math.min(100, ((currentStreak - prevMilestone) / (nextMilestone - prevMilestone)) * 100)
    : 100;

  const isActive = currentStreak > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-2 bg-white/70 backdrop-blur-sm border border-sand/50 rounded-full pl-2.5 pr-3.5 py-1.5 shadow-card-soft"
      title={`Current streak: ${currentStreak} day${currentStreak === 1 ? "" : "s"} · Best: ${longestStreak}`}
    >
      <motion.div
        animate={
          isActive
            ? { scale: [1, 1.15, 1], rotate: [0, -3, 3, 0] }
            : { scale: 1, rotate: 0 }
        }
        transition={
          isActive
            ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" }
            : { duration: 0 }
        }
        className={
          isActive
            ? "flex items-center justify-center w-7 h-7 rounded-full bg-gradient-to-br from-accent-amber to-accent-coral shadow-glow-amber"
            : "flex items-center justify-center w-7 h-7 rounded-full bg-sand/40"
        }
      >
        <Flame
          size={15}
          className={isActive ? "text-white" : "text-warm-taupe"}
        />
      </motion.div>

      <div className="flex flex-col gap-0.5">
        <div className="flex items-baseline gap-1">
          <span className="font-display font-bold text-deep-earth text-sm tabular-nums leading-none">
            {currentStreak}
          </span>
          <span className="text-[9px] text-muted-brown font-medium leading-none">
            day{currentStreak === 1 ? "" : "s"}
          </span>
        </div>
        {nextMilestone ? (
          <div className="w-16 h-1 rounded-full bg-sand/50 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-accent-amber to-accent-coral"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, ease: "easeOut" }}
            />
          </div>
        ) : (
          <span className="text-[9px] text-accent-sage font-semibold leading-none">
            Max streak!
          </span>
        )}
      </div>
    </motion.div>
  );
}
