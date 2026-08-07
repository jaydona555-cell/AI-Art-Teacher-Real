import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import type { SkillLevel } from "@/lib/scoring";
import { SKILL_LABELS } from "@/lib/scoring";
import type { PortfolioEntry } from "@/hooks/usePortfolio";

const SKILL_ORDER: SkillLevel[] = ["beginner", "intermediate", "advanced", "professional", "master"];
const SKILL_COLORS: Record<SkillLevel, string> = {
  beginner: "#7BA08C",
  intermediate: "#6B95B8",
  advanced: "#C9A961",
  professional: "#C99B8E",
  master: "#B89098",
};

interface JourneyTrackerProps {
  entries: PortfolioEntry[];
}

export default function JourneyTracker({ entries }: JourneyTrackerProps) {
  if (entries.length === 0) return null;

  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const maxSkillIndex = sorted.reduce((max, e) => {
    const idx = SKILL_ORDER.indexOf(e.skill_level);
    return idx > max ? idx : max;
  }, 0);

  const timelineWidth = 100;
  const trackHeight = 8;
  const progressWidth = sorted.length > 1
    ? timelineWidth
    : (maxSkillIndex / (SKILL_ORDER.length - 1)) * timelineWidth;

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-3xl border border-sand/40 shadow-card-soft p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-5">
        <Sparkles size={16} className="text-accent-amber-deep" />
        <h3 className="font-display text-deep-earth font-semibold text-sm uppercase tracking-wide">
          Journey Tracker
        </h3>
      </div>

      <div className="relative" style={{ height: trackHeight }}>
        <div className="absolute inset-0 rounded-full bg-sand/40" />
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progressWidth}%` }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent-sage via-accent-amber to-accent-rose"
        />
      </div>

      <div className="flex justify-between mt-2.5">
        {SKILL_ORDER.map((level, i) => {
          const reached = i <= maxSkillIndex;
          const color = SKILL_COLORS[level];
          return (
            <div key={level} className="flex flex-col items-center gap-1.5" style={{ width: `${100 / SKILL_ORDER.length}%` }}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: reached ? 1 : 0.6 }}
                transition={{ delay: 0.3 + i * 0.08, type: "spring", stiffness: 260 }}
                className={`w-3.5 h-3.5 rounded-full ${reached ? "shadow-glow-amber" : ""}`}
                style={{ backgroundColor: reached ? color : "#C2C9D1" }}
              />
              <span className={`text-[10px] font-medium text-center ${reached ? "text-deep-earth" : "text-warm-taupe/60"}`}>
                {SKILL_LABELS[level]}
              </span>
            </div>
          );
        })}
      </div>

      {sorted.length > 1 && (
        <div className="mt-5 pt-4 border-t border-sand/40">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-brown">
              {sorted.length} Artworks
            </span>
            <span className="text-[11px] text-muted-brown">
              {new Date(sorted[0].created_at).toLocaleDateString()} — {new Date(sorted[sorted.length - 1].created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-1 flex-wrap">
            {sorted.map((entry, i) => {
              const color = SKILL_COLORS[entry.skill_level];
              return (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + i * 0.06 }}
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: color }}
                  title={`${SKILL_LABELS[entry.skill_level]} — ${new Date(entry.created_at).toLocaleDateString()}`}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
