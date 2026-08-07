import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brush, ChevronDown, Check } from "lucide-react";
import { useMedium, MEDIUM_LABELS, type Medium } from "@/context/MediumContext";

const MEDIUM_ORDER: Medium[] = ["none", "watercolor", "oil-paint", "gouache", "charcoal", "digital-illustration"];

interface PreferredMediumSelectorProps {
  variant?: "light" | "dark";
}

export default function PreferredMediumSelector({ variant = "light" }: PreferredMediumSelectorProps) {
  const { medium, setMedium } = useMedium();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const isDark = variant === "dark";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`inline-flex items-center gap-2 text-xs font-semibold rounded-full px-3.5 py-2 transition-all ${
          isDark
            ? "bg-white/10 text-cream border border-cream/20 hover:bg-white/20"
            : "bg-white/70 text-deep-earth border border-sand/50 hover:bg-white shadow-card-soft"
        }`}
        aria-label="Select preferred medium"
        aria-expanded={open}
      >
        <Brush size={14} className={isDark ? "text-pastel-sky" : "text-accent-sage"} />
        <span className="hidden sm:inline">{MEDIUM_LABELS[medium]}</span>
        <ChevronDown size={12} className={`transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 z-40 bg-white rounded-2xl shadow-card-warm border border-sand/50 p-1.5 min-w-[180px]"
          >
            {MEDIUM_ORDER.map((m) => (
              <button
                key={m}
                onClick={() => { setMedium(m); setOpen(false); }}
                className={`w-full flex items-center justify-between text-sm px-3 py-2 rounded-xl transition-colors ${
                  medium === m ? "bg-pastel-sage/40 text-deep-earth" : "text-muted-brown hover:bg-cream"
                }`}
              >
                <span>{MEDIUM_LABELS[m]}</span>
                {medium === m && <Check size={14} className="text-accent-sage" />}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
