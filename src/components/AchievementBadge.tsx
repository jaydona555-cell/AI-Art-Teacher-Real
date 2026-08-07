import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Flame, Palette, Zap, Trophy, Crown, MessageCircle,
  Brain, Compass, Globe, Coins, Gem, Star, Lock, X, Award,
} from "lucide-react";
import { useAchievements, type Badge } from "@/context/AchievementContext";
import { useState } from "react";

const BADGE_ICONS: Record<string, typeof Sparkles> = {
  "sparkles": Sparkles,
  "flame": Flame,
  "palette": Palette,
  "zap": Zap,
  "trophy": Trophy,
  "crown": Crown,
  "message": MessageCircle,
  "brain": Brain,
  "compass": Compass,
  "globe": Globe,
  "coin": Coins,
  "gem": Gem,
  "star": Star,
};

interface AchievementBadgeProps {
  open: boolean;
  onClose: () => void;
}

export default function AchievementBadge({ open, onClose }: AchievementBadgeProps) {
  const { badges, totalUploads, currentStreak, longestStreak, followupQuestionsAsked } = useAchievements();
  const [filter, setFilter] = useState<"all" | "earned">("all");

  const earnedCount = badges.filter((b) => b.earnedAt).length;
  const displayBadges = filter === "earned" ? badges.filter((b) => b.earnedAt) : badges;

  const stats = [
    { label: "Artworks Shared", value: totalUploads, icon: Palette, color: "from-accent-amber to-accent-coral" },
    { label: "Current Streak", value: `${currentStreak}d`, icon: Flame, color: "from-accent-rose to-accent-coral" },
    { label: "Longest Streak", value: `${longestStreak}d`, icon: Trophy, color: "from-accent-amber to-accent-amber-light" },
    { label: "Questions Asked", value: followupQuestionsAsked, icon: MessageCircle, color: "from-accent-sky to-accent-lavender" },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-deep-earth/50 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pastel-amber/50 via-pastel-coral/40 to-pastel-rose/30 px-6 py-5 border-b border-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-amber via-accent-coral to-accent-rose flex items-center justify-center shadow-sticker">
                  <Award size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-deep-earth">Achievements</h2>
                  <p className="text-xs text-muted-brown">{earnedCount} of {badges.length} badges earned</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Close achievements"
              >
                <X size={18} className="text-deep-earth" />
              </button>
            </div>

            <div className="overflow-y-auto scroll-warm p-6 space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {stats.map((stat) => {
                  const Icon = stat.icon;
                  return (
                    <div key={stat.label} className="bg-white/60 rounded-2xl border border-sand/40 p-3 text-center">
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center mx-auto mb-1.5 shadow-sticker`}>
                        <Icon size={16} className="text-white" />
                      </div>
                      <p className="font-display font-bold text-deep-earth text-lg tabular-nums">{stat.value}</p>
                      <p className="text-[10px] text-muted-brown leading-tight mt-0.5">{stat.label}</p>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              <div className="bg-white/50 rounded-2xl border border-sand/40 p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-muted-brown uppercase tracking-wide">Badge Progress</span>
                  <span className="text-xs font-bold text-accent-amber-deep tabular-nums">{earnedCount}/{badges.length}</span>
                </div>
                <div className="h-2 rounded-full bg-sand/40 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-accent-amber via-accent-coral to-accent-rose"
                    initial={{ width: 0 }}
                    animate={{ width: `${(earnedCount / badges.length) * 100}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  />
                </div>
              </div>

              {/* Filter */}
              <div className="flex gap-2">
                <button
                  onClick={() => setFilter("all")}
                  className={`text-xs font-medium rounded-full px-4 py-1.5 transition-all ${
                    filter === "all" ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white" : "bg-white/60 text-muted-brown"
                  }`}
                >
                  All Badges
                </button>
                <button
                  onClick={() => setFilter("earned")}
                  className={`text-xs font-medium rounded-full px-4 py-1.5 transition-all ${
                    filter === "earned" ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white" : "bg-white/60 text-muted-brown"
                  }`}
                >
                  Earned ({earnedCount})
                </button>
              </div>

              {/* Badge Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {displayBadges.map((badge) => (
                  <BadgeCard key={badge.id} badge={badge} />
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function BadgeCard({ badge }: { badge: Badge }) {
  const Icon = BADGE_ICONS[badge.icon] || Sparkles;
  const earned = !!badge.earnedAt;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative rounded-2xl border-2 p-4 text-center transition-all ${
        earned
          ? "border-accent-amber/40 bg-gradient-to-br from-pastel-amber/30 to-pastel-coral/20 shadow-glow-amber"
          : "border-sand/30 bg-white/30"
      }`}
    >
      {earned ? (
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-amber via-accent-coral to-accent-rose flex items-center justify-center mx-auto mb-2 shadow-sticker">
          <Icon size={22} className="text-white" />
        </div>
      ) : (
        <div className="w-12 h-12 rounded-2xl bg-sand/30 flex items-center justify-center mx-auto mb-2">
          <Lock size={20} className="text-warm-taupe/60" />
        </div>
      )}
      <p className={`font-semibold text-xs leading-tight ${earned ? "text-deep-earth" : "text-muted-brown/70"}`}>{badge.name}</p>
      <p className="text-[10px] text-muted-brown mt-1 leading-tight">{badge.description}</p>
      {earned && badge.earnedAt && (
        <p className="text-[9px] text-accent-amber-deep mt-1.5 font-medium">
          {new Date(badge.earnedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
        </p>
      )}
    </motion.div>
  );
}
