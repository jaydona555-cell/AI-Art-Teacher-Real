import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type StickerSize = "small" | "medium" | "large";

export interface PlacedSticker {
  id: string;
  stickerId: string;
  x: number;
  y: number;
  size: StickerSize;
  rotation: number;
}

interface StickerPlacementContextValue {
  stickers: PlacedSticker[];
  addSticker: (sticker: Omit<PlacedSticker, "id">) => boolean;
  removeSticker: (id: string) => void;
  moveSticker: (id: string, x: number, y: number) => void;
  clearAll: () => void;
  canAddMore: boolean;
  maxStickers: number;
  costPerSticker: number;
}

const STORAGE_KEY = "atelier_placed_stickers_v1";
const MAX_STICKERS = 6;
const COST_PER_STICKER = 10;

const StickerPlacementContext = createContext<StickerPlacementContextValue | null>(null);

export function StickerPlacementProvider({ children }: { children: ReactNode }) {
  const [stickers, setStickers] = useState<PlacedSticker[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stickers));
    } catch {
      // ignore
    }
  }, [stickers]);

  const addSticker = useCallback((sticker: Omit<PlacedSticker, "id">): boolean => {
    if (stickers.length >= MAX_STICKERS) return false;
    const id = `placed-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setStickers((prev) => [...prev, { ...sticker, id }]);
    return true;
  }, [stickers.length]);

  const removeSticker = useCallback((id: string) => {
    setStickers((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const moveSticker = useCallback((id: string, x: number, y: number) => {
    setStickers((prev) => prev.map((s) => (s.id === id ? { ...s, x, y } : s)));
  }, []);

  const clearAll = useCallback(() => {
    setStickers([]);
  }, []);

  return (
    <StickerPlacementContext.Provider value={{
      stickers,
      addSticker,
      removeSticker,
      moveSticker,
      clearAll,
      canAddMore: stickers.length < MAX_STICKERS,
      maxStickers: MAX_STICKERS,
      costPerSticker: COST_PER_STICKER,
    }}>
      {children}
    </StickerPlacementContext.Provider>
  );
}

export function useStickerPlacement() {
  const ctx = useContext(StickerPlacementContext);
  if (!ctx) throw new Error("useStickerPlacement must be used within StickerPlacementProvider");
  return ctx;
}
