import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, X } from "lucide-react";
import type { CritiquePin } from "@/lib/scoring";

interface CritiquePinsOverlayProps {
  pins: CritiquePin[];
  disabled?: boolean;
}

export default function CritiquePinsOverlay({ pins, disabled = false }: CritiquePinsOverlayProps) {
  const [activePin, setActivePin] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activePin === null) return;
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setActivePin(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [activePin]);

  if (pins.length === 0) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none">
      {pins.map((pin, i) => (
        <div
          key={i}
          className="absolute pointer-events-auto"
          style={{ left: `${pin.x}%`, top: `${pin.y}%`, transform: "translate(-50%, -50%)" }}
        >
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 + i * 0.12, type: "spring", stiffness: 300, damping: 18 }}
            onClick={() => !disabled && setActivePin(activePin === i ? null : i)}
            className="relative"
            aria-label={`Critique pin: ${pin.label}`}
          >
            <motion.div
              animate={{
                boxShadow: [
                  "0 0 0 0 rgba(232, 169, 61, 0.5)",
                  "0 0 0 12px rgba(232, 169, 61, 0)",
                ],
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              className={`w-7 h-7 rounded-full flex items-center justify-center shadow-glow-amber transition-transform ${
                activePin === i
                  ? "bg-gradient-to-br from-accent-coral to-accent-rose scale-110"
                  : "bg-gradient-to-br from-accent-amber to-accent-coral"
              }`}
            >
              <MapPin size={14} className="text-white" />
            </motion.div>
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cream text-deep-earth text-[10px] font-bold flex items-center justify-center shadow-sticker">
              {i + 1}
            </span>
          </motion.button>

          <AnimatePresence>
            {activePin === i && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 5 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 5 }}
                transition={{ duration: 0.15 }}
                className="absolute z-20 top-full mt-2 left-1/2 -translate-x-1/2 w-60 bg-white/95 backdrop-blur-md rounded-2xl shadow-card-warm border border-accent-amber/30 p-3.5"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-xs font-bold text-accent-amber-deep uppercase tracking-wide flex items-center gap-1.5">
                    <MapPin size={12} />
                    {pin.label}
                  </p>
                  <button
                    onClick={() => setActivePin(null)}
                    className="text-warm-taupe hover:text-deep-earth transition-colors flex-shrink-0"
                  >
                    <X size={14} />
                  </button>
                </div>
                <p className="text-sm text-deep-earth leading-relaxed">{pin.advice}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
}
