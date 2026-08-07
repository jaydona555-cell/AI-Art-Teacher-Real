import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type SensoryMode = "full" | "reduced" | "minimal";
export type FontSize = "sm" | "base" | "lg" | "xl";
export type FontFamily = "default" | "dyslexic";
export type ContrastLevel = "normal" | "high";
export type NarrationSpeed = "slow" | "normal" | "fast";
export type NarrationVoice = "warm" | "clear" | "calm";

export interface AccessibilityState {
  sensoryMode: SensoryMode;
  fontSize: FontSize;
  fontFamily: FontFamily;
  contrast: ContrastLevel;
  narrationEnabled: boolean;
  narrationSpeed: NarrationSpeed;
  narrationVoice: NarrationVoice;
  autoNarrate: boolean;
}

interface AccessibilityContextValue extends AccessibilityState {
  setSensoryMode: (m: SensoryMode) => void;
  setFontSize: (s: FontSize) => void;
  setFontFamily: (f: FontFamily) => void;
  setContrast: (c: ContrastLevel) => void;
  setNarrationEnabled: (b: boolean) => void;
  setNarrationSpeed: (s: NarrationSpeed) => void;
  setNarrationVoice: (v: NarrationVoice) => void;
  setAutoNarrate: (b: boolean) => void;
  resetAll: () => void;
}

const STORAGE_KEY = "atelier_accessibility_v1";

const DEFAULT_STATE: AccessibilityState = {
  sensoryMode: "full",
  fontSize: "base",
  fontFamily: "default",
  contrast: "normal",
  narrationEnabled: false,
  narrationSpeed: "normal",
  narrationVoice: "warm",
  autoNarrate: false,
};

const SPEED_MAP: Record<NarrationSpeed, number> = {
  slow: 0.7,
  normal: 1.0,
  fast: 1.3,
};

export function getNarrationRate(speed: NarrationSpeed): number {
  return SPEED_MAP[speed];
}

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

export function AccessibilityProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AccessibilityState>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_STATE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_STATE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const update = useCallback(<K extends keyof AccessibilityState>(key: K, value: AccessibilityState[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const resetAll = useCallback(() => setState(DEFAULT_STATE), []);

  const value: AccessibilityContextValue = {
    ...state,
    setSensoryMode: (m) => update("sensoryMode", m),
    setFontSize: (s) => update("fontSize", s),
    setFontFamily: (f) => update("fontFamily", f),
    setContrast: (c) => update("contrast", c),
    setNarrationEnabled: (b) => update("narrationEnabled", b),
    setNarrationSpeed: (s) => update("narrationSpeed", s),
    setNarrationVoice: (v) => update("narrationVoice", v),
    setAutoNarrate: (b) => update("autoNarrate", b),
    resetAll,
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
    </AccessibilityContext.Provider>
  );
}

export function useAccessibility() {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error("useAccessibility must be used within AccessibilityProvider");
  return ctx;
}
