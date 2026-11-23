import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Trophy, Crown, Medal, Award, Coins, Flame, Palette, TrendingUp, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { SKILL_LABELS, type SkillLevel } from "@/lib/scoring";

interface LeaderboardEntry {
  id: string;
  skill_level: SkillLevel;
  tokens_earned: number;
  medium: string;
  medium_match: boolean;
  is_analog: boolean;
  experimentation_level: "high" | "medium" | "low";
  created_at: string;
}

interface LeaderboardStats {
  totalSubmissions: number;
  totalTokens: number;
  topSkill: SkillLevel;
  masterCount: number;
  analogCount: number;
}

const SKILL_RANK: Record<SkillLevel, number> = {
  beginner: 1,
  intermediate: 2,
  advanced: 3,
  professional: 4,
  master: 5,
};

const SKILL_COLORS: Record<SkillLevel, string> = {
  beginner: "from-accent-sage to-pastel-sage-dark",
  intermediate: "from-accent-sky to-pastel-sky-dark",
  advanced: "from-accent-amber to-accent-amber-light",
  professional: "from-accent-coral to-accent-peach",
  master: "from-accent-rose to-accent-rose-light",
};

const SKILL_GLOW: Record<SkillLevel, string> = {
  beginner: "shadow-glow-sage",
  intermediate: "shadow-glow-sky",
  advanced: "shadow-glow-amber",
  professional: "shadow-glow-coral",
  master: "shadow-glow-rose",
};

function getMedalIcon(rank: number) {
  if (rank === 1) return Crown;
  if (rank === 2) return Medal;
  if (rank === 3) return Award;
  return Trophy;
}

function getMedalColor(rank: number) {
  if (rank === 1) return "from-amber-400 to-yellow-500";
  if (rank === 2) return "from-slate-300 to-slate-400";
  if (rank === 3) return "from-orange-400 to-amber-600";
  return "from-accent-amber/60 to-accent-coral/60";
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

const MEDIUM_LABELS: Record<string, string> = {
  "none": "Open Medium",
  "watercolor": "Watercolor",
  "oil-paint": "Oil Paint",
  "gouache": "Gouache",
  "charcoal": "Charcoal",
  "digital-illustration": "Digital",
};

type SortMode = "tokens" | "skill" | "recent";

export default function Leaderboard() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortMode, setSortMode] = useState<SortMode>("tokens");

  const fetchLeaderboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from("leaderboard_stats")
        .select("*");
      if (fetchError) throw fetchError;
      setEntries((data as LeaderboardEntry[]) ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const sorted = [...entries].sort((a, b) => {
    if (sortMode === "tokens") return b.tokens_earned - a.tokens_earned;
    if (sortMode === "skill") return SKILL_RANK[b.skill_level] - SKILL_RANK[a.skill_level] || b.tokens_earned - a.tokens_earned;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const stats: LeaderboardStats = {
    totalSubmissions: entries.length,
    totalTokens: entries.reduce((sum, e) => sum + e.tokens_earned, 0),
    topSkill: entries.reduce<SkillLevel>((top, e) =>
      SKILL_RANK[e.skill_level] > SKILL_RANK[top] ? e.skill_level : top, "beginner"),
    masterCount: entries.filter((e) => e.skill_level === "master").length,
    analogCount: entries.filter((e) => e.is_analog).length,
  };

  const topThree = sorted.slice(0, 3);
  const restList = sorted.slice(3, 50);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-20">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            className="inline-block mb-4"
          >
            <Trophy size={40} className="text-accent-amber" />
          </motion.div>
          <p className="text-muted-brown">Loading the hall of fame...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-3xl mx-auto">
        <div className="text-center py-20">
          <p className="text-accent-rose font-semibold mb-2">Couldn't load the leaderboard</p>
          <p className="text-muted-brown text-sm">{error}</p>
          <button
            onClick={fetchLeaderboard}
            className="mt-4 inline-flex items-center gap-2 text-sm bg-gradient-to-r from-accent-amber to-accent-coral text-white font-medium px-4 py-2 rounded-full"
          >
            <Trophy size={14} /> Try again
          </button>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-br from-accent-amber/20 to-accent-coral/20 mb-6"
        >
          <Trophy size={36} className="text-accent-amber" />
        </motion.div>
        <h2 className="font-display text-2xl font-bold text-deep-earth mb-2">The leaderboard awaits</h2>
        <p className="text-muted-brown max-w-md mx-auto">
          Upload your first artwork to get feedback and claim your spot on the leaderboard.
          Every submission earns tokens and a skill ranking from your AI mentor.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pastel-amber/50 to-pastel-coral/50 border border-accent-amber/30 rounded-full px-4 py-1.5 mb-4">
          <Trophy size={14} className="text-accent-amber-deep" />
          <p className="text-accent-amber-deep text-xs font-semibold uppercase tracking-[0.15em]">
            Hall of Fame
          </p>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-earth mb-3">
          Artistic Excellence Leaderboard
        </h2>
        <p className="text-muted-brown max-w-xl mx-auto">
          Celebrating every artist's journey. Rankings are based on tokens earned from AI mentor feedback.
        </p>
      </motion.div>

      {/* Stats Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
      >
        <StatCard icon={Sparkles} label="Submissions" value={stats.totalSubmissions} color="from-accent-sky to-pastel-sky-dark" />
        <StatCard icon={Coins} label="Total Tokens" value={stats.totalTokens} color="from-accent-amber to-accent-coral" />
        <StatCard icon={Crown} label="Master Works" value={stats.masterCount} color="from-accent-rose to-accent-rose-light" />
        <StatCard icon={Palette} label="Analog Pieces" value={stats.analogCount} color="from-accent-sage to-pastel-sage-dark" />
      </motion.div>

      {/* Sort controls */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {([
          { mode: "tokens" as const, label: "Top Tokens", icon: Coins },
          { mode: "skill" as const, label: "Highest Skill", icon: TrendingUp },
          { mode: "recent" as const, label: "Most Recent", icon: Flame },
        ]).map(({ mode, label, icon: Icon }) => (
          <button
            key={mode}
            onClick={() => setSortMode(mode)}
            className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all ${
              sortMode === mode
                ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-sticker"
                : "bg-white/60 text-muted-brown hover:text-deep-earth border border-sand/40"
            }`}
          >
            <Icon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Podium — Top 3 */}
      {topThree.length > 0 && sortMode !== "recent" && (
        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-8">
          {topThree.map((entry, i) => {
            const rank = i + 1;
            const MedIcon = getMedalIcon(rank);
            const isFirst = rank === 1;
            return (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.1, type: "spring", stiffness: 200 }}
                className={`relative ${isFirst ? "sm:-mt-4" : ""}`}
              >
                <div className={`rounded-2xl border-2 overflow-hidden ${
                  isFirst ? "border-amber-400/50 shadow-glow-amber"
                  : rank === 2 ? "border-slate-300/50"
                  : "border-orange-400/40"
                }`}>
                  {/* Medal header */}
                  <div className={`bg-gradient-to-br ${getMedalColor(rank)} px-3 py-3 flex flex-col items-center`}>
                    <MedIcon size={isFirst ? 28 : 22} className="text-white drop-shadow" />
                    <span className="text-white font-bold text-lg mt-1">#{rank}</span>
                  </div>
                  {/* Body */}
                  <div className="bg-white/80 backdrop-blur-sm px-3 py-3 text-center">
                    <div className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-gradient-to-r ${SKILL_COLORS[entry.skill_level]} mb-2`}>
                      <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                        {SKILL_LABELS[entry.skill_level]}
                      </span>
                    </div>
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Coins size={12} className="text-accent-amber-deep" />
                      <span className="font-bold text-deep-earth text-sm">{entry.tokens_earned}</span>
                    </div>
                    <p className="text-[10px] text-muted-brown">{MEDIUM_LABELS[entry.medium] ?? entry.medium}</p>
                    <p className="text-[10px] text-warm-taupe mt-0.5">{formatDate(entry.created_at)}</p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Ranked List */}
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {sorted.map((entry, i) => {
            const rank = i + 1;
            const MedIcon = getMedalIcon(rank);
            return (
              <motion.div
                key={entry.id}
                layout
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.03, 0.5) }}
                className={`flex items-center gap-3 bg-white/70 backdrop-blur-sm rounded-2xl border border-sand/40 px-4 py-3 hover:bg-white/90 transition-all ${
                  rank <= 3 ? "shadow-card-soft" : ""
                }`}
              >
                {/* Rank */}
                <div className={`flex items-center justify-center w-9 h-9 rounded-xl flex-shrink-0 ${
                  rank <= 3
                    ? `bg-gradient-to-br ${getMedalColor(rank)}`
                    : "bg-sand/40"
                }`}>
                  <span className={`font-bold text-sm ${rank <= 3 ? "text-white" : "text-muted-brown"}`}>
                    {rank}
                  </span>
                </div>

                {/* Skill badge */}
                <div className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 bg-gradient-to-r ${SKILL_COLORS[entry.skill_level]} flex-shrink-0`}>
                  <span className="text-[10px] font-bold text-white uppercase tracking-wide">
                    {SKILL_LABELS[entry.skill_level]}
                  </span>
                </div>

                {/* Medium + badges */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-deep-earth font-medium truncate">
                    {MEDIUM_LABELS[entry.medium] ?? entry.medium}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-[10px] text-warm-taupe">{formatDate(entry.created_at)}</span>
                    {entry.is_analog && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-sage font-medium">
                        <Palette size={9} /> Analog
                      </span>
                    )}
                    {entry.medium_match && (
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-accent-amber-deep font-medium">
                        <Sparkles size={9} /> Medium Match
                      </span>
                    )}
                  </div>
                </div>

                {/* Tokens */}
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <Coins size={14} className="text-accent-amber-deep" />
                  <span className="font-bold text-deep-earth text-sm tabular-nums">{entry.tokens_earned}</span>
                </div>

                {/* Medal for top 3 */}
                {rank <= 3 && (
                  <MedIcon size={16} className={`flex-shrink-0 ${
                    rank === 1 ? "text-amber-500"
                    : rank === 2 ? "text-slate-400"
                    : "text-orange-500"
                  }`} />
                )}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {sorted.length > 50 && (
        <p className="text-center text-xs text-warm-taupe mt-6">
          Showing top 50 of {sorted.length} submissions
        </p>
      )}
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white/70 backdrop-blur-sm rounded-2xl border border-sand/40 p-3 text-center"
    >
      <div className={`inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-br ${color} mb-2`}>
        <Icon size={16} className="text-white" />
      </div>
      <p className="font-bold text-xl text-deep-earth tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-brown uppercase tracking-wide">{label}</p>
    </motion.div>
  );
}
