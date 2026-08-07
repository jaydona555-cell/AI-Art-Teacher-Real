import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, Plus, Minus, Move, Sticker as StickerIcon } from "lucide-react";
import { useStickerPlacement, type StickerSize, type PlacedSticker } from "@/context/StickerPlacementContext";
import { useReward } from "@/context/RewardContext";

interface StickerDef {
  id: string;
  name: string;
  svg: React.ReactNode;
}

export const DIVERSE_STICKERS: StickerDef[] = [
  { id: "star", name: "Star", svg: <path d="M12 2l2.39 7.36H22l-6.19 4.5 2.37 7.36L12 16.72l-6.18 4.5 2.37-7.36L2 9.36h7.61z" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" /> },
  { id: "heart", name: "Heart", svg: <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="#F472B6" stroke="#EC4899" strokeWidth="1.5" /> },
  { id: "flower", name: "Flower", svg: <><circle cx="12" cy="12" r="3" fill="#FBBF24" />{[0, 72, 144, 216, 288].map((angle) => { const rad = (angle * Math.PI) / 180; const cx = 12 + 6 * Math.cos(rad); const cy = 12 + 6 * Math.sin(rad); return <ellipse key={angle} cx={cx} cy={cy} rx="4" ry="5.5" fill="#F9A8D4" stroke="#F472B6" strokeWidth="1" transform={`rotate(${angle} ${cx} ${cy})`} />; })}</> },
  { id: "leaf", name: "Leaf", svg: <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3-4.1 15.84-8.2 17.04Z" fill="#86EFAC" stroke="#22C55E" strokeWidth="1.5" /> },
  { id: "sun", name: "Sun", svg: <><circle cx="12" cy="12" r="5" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" />{[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => { const rad = (angle * Math.PI) / 180; const x1 = 12 + 7 * Math.cos(rad); const y1 = 12 + 7 * Math.sin(rad); const x2 = 12 + 10 * Math.cos(rad); const y2 = 12 + 10 * Math.sin(rad); return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" />; })}</> },
  { id: "moon", name: "Moon", svg: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" fill="#A5B4FC" stroke="#818CF8" strokeWidth="1.5" strokeLinejoin="round" /> },
  { id: "rocket", name: "Rocket", svg: <><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#60A5FA" stroke="#3B82F6" strokeWidth="1.5" strokeLinejoin="round" /><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#A5B4FC" stroke="#818CF8" strokeWidth="1.5" strokeLinejoin="round" /></> },
  { id: "sparkle", name: "Sparkle", svg: <path d="M12 2l1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8z" fill="#FDE68A" stroke="#FBBF24" strokeWidth="1.5" strokeLinejoin="round" /> },
  { id: "music", name: "Music", svg: <><path d="M9 18V5l12-2v13" fill="none" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="6" cy="18" r="3" fill="#C084FC" /><circle cx="18" cy="16" r="3" fill="#C084FC" /></> },
  { id: "palette", name: "Palette", svg: <><circle cx="12" cy="12" r="10" fill="#FCA5A5" stroke="#F87171" strokeWidth="1.5" /><circle cx="8" cy="10" r="1.5" fill="#FBBF24" /><circle cx="12" cy="8" r="1.5" fill="#86EFAC" /><circle cx="16" cy="10" r="1.5" fill="#A5B4FC" /><circle cx="14" cy="15" r="1.5" fill="#F9A8D4" /></> },
  { id: "crown", name: "Crown", svg: <path d="M3 18h18M5 18l-2-9 5 4 4-7 4 7 5-4-2 9" fill="#FBBF24" stroke="#F59E0B" strokeWidth="1.5" strokeLinejoin="round" /> },
  { id: "gem", name: "Gem", svg: <path d="M6 3h12l4 6-10 13L2 9z" fill="#67E8F9" stroke="#06B6D4" strokeWidth="1.5" strokeLinejoin="round" /> },
];

const SIZE_MAP: Record<StickerSize, number> = { small: 40, medium: 64, large: 96 };

interface StickerCanvasProps {
  open: boolean;
  onClose: () => void;
}

export default function StickerCanvas({ open, onClose }: StickerCanvasProps) {
  const { stickers, addSticker, removeSticker, moveSticker, clearAll, canAddMore, maxStickers, costPerSticker } = useStickerPlacement();
  const { spendTokens, addTokens } = useReward();
  const [selectedSticker, setSelectedSticker] = useState<string>("star");
  const [selectedSize, setSelectedSize] = useState<StickerSize>("medium");
  const [placing, setPlacing] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const dragOffset = useRef({ x: 0, y: 0 });

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  }, []);

  const handleCanvasClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!placing || !canAddMore) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    if (!spendTokens(costPerSticker, "Place sticker")) {
      showFeedback("Not enough tokens!");
      setPlacing(false);
      return;
    }
    const placed = addSticker({
      stickerId: selectedSticker,
      x,
      y,
      size: selectedSize,
      rotation: Math.random() * 30 - 15,
    });
    if (placed) {
      showFeedback(`Sticker placed! -${costPerSticker} tokens`);
    } else {
      addTokens(costPerSticker, "Refund sticker");
      showFeedback("Max stickers reached");
    }
    setPlacing(false);
  }, [placing, canAddMore, selectedSticker, selectedSize, addSticker, spendTokens, addTokens, costPerSticker, showFeedback]);

  const startDrag = useCallback((e: React.MouseEvent, sticker: PlacedSticker) => {
    e.stopPropagation();
    const rect = (e.currentTarget.closest(".sticker-canvas") as HTMLElement).getBoundingClientRect();
    dragOffset.current = { x: e.clientX - rect.left - sticker.x, y: e.clientY - rect.top - sticker.y };
    setDraggingId(sticker.id);
  }, []);

  useEffect(() => {
    if (!draggingId) return;
    const handleMove = (e: MouseEvent) => {
      const canvas = document.querySelector(".sticker-canvas") as HTMLElement;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      moveSticker(draggingId, e.clientX - rect.left - dragOffset.current.x, e.clientY - rect.top - dragOffset.current.y);
    };
    const handleUp = () => setDraggingId(null);
    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };
  }, [draggingId, moveSticker]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[55] flex flex-col"
        >
          {/* Canvas overlay */}
          <div
            className="sticker-canvas absolute inset-0"
            onClick={placing ? handleCanvasClick : undefined}
            style={{ cursor: placing ? "crosshair" : "default" }}
          >
            {placing && (
              <div className="absolute inset-0 bg-accent-amber/5 pointer-events-none" />
            )}

            {/* Placed stickers */}
            {stickers.map((s) => {
              const def = DIVERSE_STICKERS.find((d) => d.id === s.stickerId);
              if (!def) return null;
              return (
                <motion.div
                  key={s.id}
                  initial={{ scale: 0, rotate: s.rotation + 30 }}
                  animate={{ scale: 1, rotate: s.rotation }}
                  drag={false}
                  className="absolute group cursor-move"
                  style={{ left: s.x, top: s.y, width: SIZE_MAP[s.size], height: SIZE_MAP[s.size], zIndex: 56 }}
                  onMouseDown={(e) => startDrag(e, s)}
                >
                  <div className="relative w-full h-full animate-float-sticker drop-shadow-[0_4px_12px_rgba(0,0,0,0.25)]">
                    <svg viewBox="0 0 24 24" width="100%" height="100%" className="overflow-visible">
                      {def.svg}
                    </svg>
                    <button
                      onClick={(e) => { e.stopPropagation(); removeSticker(s.id); }}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent-rose text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                    >
                      <X size={12} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Toolbar */}
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 28 }}
            className="relative mt-auto bg-cream/95 backdrop-blur-md border-t-2 border-accent-amber/30 shadow-card-warm"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="max-w-3xl mx-auto px-4 py-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-amber to-accent-coral flex items-center justify-center shadow-sticker">
                    <StickerIcon size={16} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-deep-earth text-sm">Sticker Studio</h3>
                    <p className="text-[11px] text-muted-brown">
                      {stickers.length}/{maxStickers} placed · {costPerSticker} tokens each
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {stickers.length > 0 && (
                    <button
                      onClick={clearAll}
                      className="inline-flex items-center gap-1 text-xs font-medium text-accent-rose bg-white/60 hover:bg-white rounded-full px-3 py-1.5 transition-all"
                    >
                      <Trash2 size={12} /> Clear
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="inline-flex items-center gap-1 text-xs font-medium text-muted-brown hover:text-deep-earth bg-white/60 hover:bg-white rounded-full px-3 py-1.5 transition-all"
                  >
                    <X size={12} /> Done
                  </button>
                </div>
              </div>

              {/* Sticker picker */}
              <div className="flex gap-2 overflow-x-auto scroll-warm pb-2 mb-3">
                {DIVERSE_STICKERS.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedSticker(s.id); setPlacing(true); }}
                    className={`flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center transition-all border-2 ${
                      selectedSticker === s.id && placing
                        ? "border-accent-amber bg-accent-amber/15 shadow-glow-amber scale-110"
                        : "border-sand/40 bg-white/60 hover:border-accent-amber/40 hover:scale-105"
                    }`}
                    title={s.name}
                  >
                    <svg viewBox="0 0 24 24" width="32" height="32" className="overflow-visible">
                      {s.svg}
                    </svg>
                  </button>
                ))}
              </div>

              {/* Size selector + place button */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1.5 bg-white/60 rounded-full p-1 border border-sand/40">
                  {(["small", "medium", "large"] as StickerSize[]).map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      className={`text-xs font-semibold rounded-full px-3 py-1.5 capitalize transition-all ${
                        selectedSize === sz
                          ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-sticker"
                          : "text-muted-brown hover:text-deep-earth"
                      }`}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPlacing(!placing)}
                  disabled={!canAddMore}
                  className={`inline-flex items-center gap-1.5 text-sm font-semibold rounded-full px-5 py-2.5 transition-all ${
                    placing
                      ? "bg-accent-sage text-white shadow-glow-sage"
                      : canAddMore
                        ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-card-soft hover:shadow-glow-amber"
                        : "bg-sand/40 text-warm-taupe cursor-not-allowed"
                  }`}
                >
                  {placing ? <><Move size={14} /> Click on screen to place</> : canAddMore ? <><Plus size={14} /> Place sticker</> : <>Max reached</>}
                </button>
              </div>
            </div>

            {/* Feedback toast */}
            <AnimatePresence>
              {feedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20, scale: 0.85 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 20, scale: 0.85 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 bg-gradient-to-r from-accent-amber to-accent-coral text-white font-bold px-5 py-2.5 rounded-full shadow-glow-amber text-sm whitespace-nowrap"
                >
                  {feedback}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
