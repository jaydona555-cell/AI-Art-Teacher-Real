import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  earnedAt: string | null;
}

export interface AchievementState {
  totalUploads: number;
  currentStreak: number;
  longestStreak: number;
  lastUploadDate: string | null;
  followupQuestionsAsked: number;
  tokensEarnedTotal: number;
  mediumsExplored: string[];
  badges: Badge[];
  newlyEarnedBadge: Badge | null;
  streakMilestonesReached: number[];
  pendingStreakMilestone: number | null;
}

export interface UploadResult {
  newStreak: number;
  streakBonus: number;
  milestone: number | null;
}

interface AchievementContextValue extends AchievementState {
  recordUpload: (medium: string, tokensEarned: number) => UploadResult;
  recordFollowup: () => void;
  addMediumExplored: (medium: string) => void;
  clearNewlyEarned: () => void;
  clearPendingStreakMilestone: () => void;
}

const STORAGE_KEY = "atelier_achievements_v2";

export const STREAK_MILESTONES = [3, 7, 14, 30, 60, 100];

export function streakBonusTokens(streak: number): number {
  if (streak <= 0) return 0;
  if (streak < 3) return 2;
  if (streak < 7) return 5;
  if (streak < 14) return 10;
  if (streak < 30) return 15;
  if (streak < 60) return 25;
  return 40;
}

export function isStreakMilestone(streak: number): number | null {
  return STREAK_MILESTONES.includes(streak) ? streak : null;
}

const ALL_BADGES: Omit<Badge, "earnedAt">[] = [
  { id: "first-steps", name: "First Steps", description: "Share your first artwork", icon: "sparkles" },
  { id: "dedicated", name: "Dedicated Student", description: "Share 3 artworks", icon: "flame" },
  { id: "prolific", name: "Prolific Creator", description: "Share 10 artworks", icon: "palette" },
  { id: "streak-3", name: "On a Roll", description: "3-day creative streak", icon: "zap" },
  { id: "streak-7", name: "Week Warrior", description: "7-day creative streak", icon: "trophy" },
  { id: "streak-30", name: "Master's Discipline", description: "30-day creative streak", icon: "crown" },
  { id: "curious-mind", name: "Curious Mind", description: "Ask your first follow-up question", icon: "message" },
  { id: "deep-thinker", name: "Deep Thinker", description: "Ask 5 follow-up questions", icon: "brain" },
  { id: "explorer", name: "Medium Explorer", description: "Try 3 different mediums", icon: "compass" },
  { id: "polyglot", name: "Renaissance Soul", description: "Try all 5 mediums", icon: "globe" },
  { id: "first-tokens", name: "Token Earner", description: "Earn your first 50 tokens", icon: "coin" },
  { id: "centurion", name: "Centurion", description: "Earn 500 total tokens", icon: "gem" },
  { id: "master-earner", name: "Master Earner", description: "Earn 1000 total tokens", icon: "star" },
];

function getInitialBadges(): Badge[] {
  return ALL_BADGES.map((b) => ({ ...b, earnedAt: null }));
}

function todayStr(): string {
  return new Date().toISOString().split("T")[0];
}

function daysBetween(a: string, b: string): number {
  const dateA = new Date(a + "T00:00:00");
  const dateB = new Date(b + "T00:00:00");
  return Math.round((dateB.getTime() - dateA.getTime()) / (1000 * 60 * 60 * 24));
}

function checkBadges(state: AchievementState): { badges: Badge[]; newlyEarned: Badge | null } {
  const badges = [...state.badges];
  let newlyEarned: Badge | null = null;

  const earn = (id: string) => {
    const idx = badges.findIndex((b) => b.id === id);
    if (idx >= 0 && !badges[idx].earnedAt) {
      badges[idx] = { ...badges[idx], earnedAt: new Date().toISOString() };
      if (!newlyEarned) newlyEarned = badges[idx];
    }
  };

  if (state.totalUploads >= 1) earn("first-steps");
  if (state.totalUploads >= 3) earn("dedicated");
  if (state.totalUploads >= 10) earn("prolific");
  if (state.longestStreak >= 3) earn("streak-3");
  if (state.longestStreak >= 7) earn("streak-7");
  if (state.longestStreak >= 30) earn("streak-30");
  if (state.followupQuestionsAsked >= 1) earn("curious-mind");
  if (state.followupQuestionsAsked >= 5) earn("deep-thinker");
  const mediumCount = state.mediumsExplored.filter((m) => m !== "none").length;
  if (mediumCount >= 3) earn("explorer");
  if (mediumCount >= 5) earn("polyglot");
  if (state.tokensEarnedTotal >= 50) earn("first-tokens");
  if (state.tokensEarnedTotal >= 500) earn("centurion");
  if (state.tokensEarnedTotal >= 1000) earn("master-earner");

  return { badges, newlyEarned };
}

const AchievementContext = createContext<AchievementContextValue | null>(null);

export function AchievementProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AchievementState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          totalUploads: parsed.totalUploads ?? 0,
          currentStreak: parsed.currentStreak ?? 0,
          longestStreak: parsed.longestStreak ?? 0,
          lastUploadDate: parsed.lastUploadDate ?? null,
          followupQuestionsAsked: parsed.followupQuestionsAsked ?? 0,
          tokensEarnedTotal: parsed.tokensEarnedTotal ?? 0,
          mediumsExplored: parsed.mediumsExplored ?? [],
          badges: parsed.badges?.length ? parsed.badges : getInitialBadges(),
          newlyEarnedBadge: null,
          streakMilestonesReached: parsed.streakMilestonesReached ?? [],
          pendingStreakMilestone: null,
        };
      }
    } catch {
      // ignore
    }
    return {
      totalUploads: 0,
      currentStreak: 0,
      longestStreak: 0,
      lastUploadDate: null,
      followupQuestionsAsked: 0,
      tokensEarnedTotal: 0,
      mediumsExplored: [],
      badges: getInitialBadges(),
      newlyEarnedBadge: null,
      streakMilestonesReached: [],
      pendingStreakMilestone: null,
    };
  });

  const [newlyEarnedBadge, setNewlyEarnedBadge] = useState<Badge | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        totalUploads: state.totalUploads,
        currentStreak: state.currentStreak,
        longestStreak: state.longestStreak,
        lastUploadDate: state.lastUploadDate,
        followupQuestionsAsked: state.followupQuestionsAsked,
        tokensEarnedTotal: state.tokensEarnedTotal,
        mediumsExplored: state.mediumsExplored,
        badges: state.badges,
        streakMilestonesReached: state.streakMilestonesReached,
      }));
    } catch {
      // ignore
    }
  }, [state]);

  const recordUpload = useCallback((medium: string, tokensEarned: number): UploadResult => {
    let result: UploadResult = { newStreak: 0, streakBonus: 0, milestone: null };
    setState((prev) => {
      const today = todayStr();
      let currentStreak = prev.currentStreak;
      if (prev.lastUploadDate) {
        const diff = daysBetween(prev.lastUploadDate, today);
        if (diff === 1) currentStreak = prev.currentStreak + 1;
        else if (diff > 1) currentStreak = 1;
      } else {
        currentStreak = 1;
      }

      const mediumsExplored = prev.mediumsExplored.includes(medium)
        ? prev.mediumsExplored
        : [...prev.mediumsExplored, medium];

      const milestone = isStreakMilestone(currentStreak);
      const isMilestoneNew = milestone && !prev.streakMilestonesReached.includes(milestone);
      const milestonesReached = isMilestoneNew
        ? [...prev.streakMilestonesReached, milestone as number]
        : prev.streakMilestonesReached;

      const bonus = streakBonusTokens(currentStreak);
      result = { newStreak: currentStreak, streakBonus: bonus, milestone: isMilestoneNew ? milestone : null };

      const newState: AchievementState = {
        ...prev,
        totalUploads: prev.totalUploads + 1,
        currentStreak,
        longestStreak: Math.max(prev.longestStreak, currentStreak),
        lastUploadDate: today,
        tokensEarnedTotal: prev.tokensEarnedTotal + tokensEarned,
        mediumsExplored,
        streakMilestonesReached: milestonesReached,
        pendingStreakMilestone: isMilestoneNew ? milestone : null,
      };

      const { badges, newlyEarned } = checkBadges(newState);
      newState.badges = badges;
      if (newlyEarned) setNewlyEarnedBadge(newlyEarned);

      return newState;
    });
    return result;
  }, []);

  const recordFollowup = useCallback(() => {
    setState((prev) => {
      const newState = { ...prev, followupQuestionsAsked: prev.followupQuestionsAsked + 1 };
      const { badges, newlyEarned } = checkBadges(newState);
      newState.badges = badges;
      if (newlyEarned) setNewlyEarnedBadge(newlyEarned);
      return newState;
    });
  }, []);

  const addMediumExplored = useCallback((medium: string) => {
    setState((prev) => {
      if (prev.mediumsExplored.includes(medium)) return prev;
      const newState = { ...prev, mediumsExplored: [...prev.mediumsExplored, medium] };
      const { badges, newlyEarned } = checkBadges(newState);
      newState.badges = badges;
      if (newlyEarned) setNewlyEarnedBadge(newlyEarned);
      return newState;
    });
  }, []);

  const clearNewlyEarned = useCallback(() => setNewlyEarnedBadge(null), []);
  const clearPendingStreakMilestone = useCallback(
    () => setState((prev) => ({ ...prev, pendingStreakMilestone: null })),
    []
  );

  return (
    <AchievementContext.Provider value={{
      ...state,
      newlyEarnedBadge,
      recordUpload,
      recordFollowup,
      addMediumExplored,
      clearNewlyEarned,
      clearPendingStreakMilestone,
    }}>
      {children}
    </AchievementContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementContext);
  if (!ctx) throw new Error("useAchievements must be used within AchievementProvider");
  return ctx;
}
