import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type StickerPack = "starter" | "nature" | "cosmic";
export type ThemeName = "blossom" | "ocean";
export type ShopBackground = "greek-mythology" | "chinese-art";
export type ShopItem = "generate-masterpiece";

export interface UnlockState {
  stickerPacks: Record<StickerPack, boolean>;
  animatedBackground: boolean;
  premiumThemes: ThemeName[];
}

export interface RewardState {
  tokens: number;
  totalEarned: number;
  unlocks: UnlockState;
  lastEarnedAmount: number;
  purchasedBackgrounds: ShopBackground[];
  purchasedItems: ShopItem[];
  activeBackground: ShopBackground | null;
}

interface RewardContextValue {
  tokens: number;
  totalEarned: number;
  unlocks: UnlockState;
  lastEarnedAmount: number;
  newlyUnlocked: string | null;
  purchasedBackgrounds: ShopBackground[];
  purchasedItems: ShopItem[];
  activeBackground: ShopBackground | null;
  addTokens: (amount: number, reason: string) => void;
  subtractTokens: (amount: number, reason: string) => void;
  spendTokens: (amount: number, reason: string) => boolean;
  resetTokens: () => void;
  clearNewlyUnlocked: () => void;
  purchaseBackground: (bg: ShopBackground, cost: number) => boolean;
  purchaseItem: (item: ShopItem, cost: number) => boolean;
  setActiveBackground: (bg: ShopBackground | null) => void;
}

const STORAGE_KEY = "atelier_reward_state_v2";

const DEFAULT_UNLOCKS: UnlockState = {
  stickerPacks: { starter: true, nature: false, cosmic: false },
  animatedBackground: false,
  premiumThemes: [],
};

const DEFAULT_STATE: RewardState = {
  tokens: 0,
  totalEarned: 0,
  unlocks: DEFAULT_UNLOCKS,
  lastEarnedAmount: 0,
  purchasedBackgrounds: [],
  purchasedItems: [],
  activeBackground: null,
};

export const UNLOCK_THRESHOLDS: { tokens: number; label: string; type: "stickerPack" | "background" | "theme"; value: string }[] = [
  { tokens: 20, label: "Nature Sticker Pack", type: "stickerPack", value: "nature" },
  { tokens: 50, label: "Blossom Theme", type: "theme", value: "blossom" },
  { tokens: 80, label: "Animated Background", type: "background", value: "animated" },
  { tokens: 120, label: "Cosmic Sticker Pack", type: "stickerPack", value: "cosmic" },
  { tokens: 200, label: "Ocean Theme", type: "theme", value: "ocean" },
];

function computeUnlocks(totalEarned: number): UnlockState {
  const unlocks: UnlockState = {
    stickerPacks: { starter: true, nature: false, cosmic: false },
    animatedBackground: false,
    premiumThemes: [],
  };
  for (const threshold of UNLOCK_THRESHOLDS) {
    if (totalEarned >= threshold.tokens) {
      if (threshold.type === "stickerPack") {
        unlocks.stickerPacks[threshold.value as StickerPack] = true;
      } else if (threshold.type === "background") {
        unlocks.animatedBackground = true;
      } else if (threshold.type === "theme") {
        unlocks.premiumThemes.push(threshold.value as ThemeName);
      }
    }
  }
  return unlocks;
}

function checkThreshold(state: UnlockState, threshold: typeof UNLOCK_THRESHOLDS[0]): boolean {
  if (threshold.type === "stickerPack") return state.stickerPacks[threshold.value as StickerPack];
  if (threshold.type === "background") return state.animatedBackground;
  if (threshold.type === "theme") return state.premiumThemes.includes(threshold.value as ThemeName);
  return false;
}

function findNewlyUnlocked(oldState: UnlockState, newState: UnlockState): string | null {
  for (const threshold of UNLOCK_THRESHOLDS) {
    const wasUnlocked = checkThreshold(oldState, threshold);
    const isUnlocked = checkThreshold(newState, threshold);
    if (isUnlocked && !wasUnlocked) return threshold.label;
  }
  return null;
}

const RewardContext = createContext<RewardContextValue | null>(null);

export function RewardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<RewardState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          tokens: parsed.tokens ?? 0,
          totalEarned: parsed.totalEarned ?? 0,
          unlocks: computeUnlocks(parsed.totalEarned ?? 0),
          lastEarnedAmount: 0,
          purchasedBackgrounds: parsed.purchasedBackgrounds ?? [],
          purchasedItems: parsed.purchasedItems ?? [],
          activeBackground: parsed.activeBackground ?? null,
        };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  const [newlyUnlocked, setNewlyUnlocked] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        tokens: state.tokens,
        totalEarned: state.totalEarned,
        purchasedBackgrounds: state.purchasedBackgrounds,
        purchasedItems: state.purchasedItems,
        activeBackground: state.activeBackground,
      }));
    } catch {
      // ignore
    }
  }, [state.tokens, state.totalEarned, state.purchasedBackgrounds, state.purchasedItems, state.activeBackground]);

  const addTokens = useCallback((amount: number, _reason: string) => {
    if (amount <= 0) return;
    setState((prev) => {
      const newTotalEarned = prev.totalEarned + amount;
      const newTokens = prev.tokens + amount;
      const newUnlocks = computeUnlocks(newTotalEarned);
      const unlocked = findNewlyUnlocked(prev.unlocks, newUnlocks);
      if (unlocked) setNewlyUnlocked(unlocked);
      return { ...prev, tokens: newTokens, totalEarned: newTotalEarned, unlocks: newUnlocks, lastEarnedAmount: amount };
    });
  }, []);

  // subtractTokens CAN go negative — used only for AI penalty
  const subtractTokens = useCallback((amount: number, _reason: string) => {
    if (amount <= 0) return;
    setState((prev) => ({
      ...prev,
      tokens: prev.tokens - amount,
      lastEarnedAmount: -amount,
    }));
  }, []);

  // spendTokens floors at 0 — returns false if insufficient balance
  const spendTokens = useCallback((amount: number, _reason: string): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.tokens < amount) return prev;
      success = true;
      return { ...prev, tokens: prev.tokens - amount, lastEarnedAmount: -amount };
    });
    return success;
  }, []);

  const purchaseBackground = useCallback((bg: ShopBackground, cost: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.purchasedBackgrounds.includes(bg)) { success = true; return prev; }
      if (prev.tokens < cost) return prev;
      success = true;
      return {
        ...prev,
        tokens: prev.tokens - cost,
        purchasedBackgrounds: [...prev.purchasedBackgrounds, bg],
        activeBackground: bg,
      };
    });
    return success;
  }, []);

  const purchaseItem = useCallback((item: ShopItem, cost: number): boolean => {
    let success = false;
    setState((prev) => {
      if (prev.tokens < cost) return prev;
      success = true;
      return {
        ...prev,
        tokens: prev.tokens - cost,
        purchasedItems: [...prev.purchasedItems, item],
      };
    });
    return success;
  }, []);

  const setActiveBackground = useCallback((bg: ShopBackground | null) => {
    setState((prev) => ({ ...prev, activeBackground: bg }));
  }, []);

  const resetTokens = useCallback(() => {
    setState(DEFAULT_STATE);
    setNewlyUnlocked(null);
  }, []);

  const clearNewlyUnlocked = useCallback(() => setNewlyUnlocked(null), []);

  return (
    <RewardContext.Provider value={{
      tokens: state.tokens,
      totalEarned: state.totalEarned,
      unlocks: state.unlocks,
      lastEarnedAmount: state.lastEarnedAmount,
      newlyUnlocked,
      purchasedBackgrounds: state.purchasedBackgrounds,
      purchasedItems: state.purchasedItems,
      activeBackground: state.activeBackground,
      addTokens,
      subtractTokens,
      spendTokens,
      resetTokens,
      clearNewlyUnlocked,
      purchaseBackground,
      purchaseItem,
      setActiveBackground,
    }}>
      {children}
    </RewardContext.Provider>
  );
}

export function useReward() {
  const ctx = useContext(RewardContext);
  if (!ctx) throw new Error("useReward must be used within RewardProvider");
  return ctx;
}
