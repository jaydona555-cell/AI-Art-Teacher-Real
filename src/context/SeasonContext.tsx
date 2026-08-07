import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export type Season = "SPRING" | "SUMMER" | "AUTUMN" | "WINTER";

export const SEASONS: Season[] = ["SPRING", "SUMMER", "AUTUMN", "WINTER"];

export const SEASON_LABELS: Record<Season, string> = {
  SPRING: "Spring",
  SUMMER: "Summer",
  AUTUMN: "Autumn",
  WINTER: "Winter",
};

export const SEASON_GRADIENTS: Record<Season, string> = {
  SPRING: "linear-gradient(135deg, #DCE6EF 0%, #E8ECEF 100%)",
  SUMMER: "linear-gradient(135deg, #F2EDE3 0%, #D6E3D8 100%)",
  AUTUMN: "linear-gradient(135deg, #C2C9D1 0%, #8B97A4 100%)",
  WINTER: "linear-gradient(135deg, #3B4754 0%, #8B97A4 100%)",
};

interface SeasonContextValue {
  season: Season;
  setSeason: (s: Season) => void;
  cycleSeason: () => void;
}

const SeasonContext = createContext<SeasonContextValue | null>(null);

export function SeasonProvider({ children }: { children: ReactNode }) {
  const [season, setSeason] = useState<Season>("SPRING");

  const cycleSeason = useCallback(() => {
    setSeason((prev) => {
      const idx = SEASONS.indexOf(prev);
      return SEASONS[(idx + 1) % SEASONS.length];
    });
  }, []);

  return (
    <SeasonContext.Provider value={{ season, setSeason, cycleSeason }}>
      {children}
    </SeasonContext.Provider>
  );
}

export function useSeason() {
  const ctx = useContext(SeasonContext);
  if (!ctx) throw new Error("useSeason must be used within SeasonProvider");
  return ctx;
}
