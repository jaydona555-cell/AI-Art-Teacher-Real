import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Medium } from "@/context/MediumContext";

interface MediumBackgroundProps {
  medium: Medium;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

interface FloatElement {
  id: number;
  left: number;
  top: number;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
  drift: number;
}

function generateFloats(count: number, seed: number): FloatElement[] {
  const rng = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: rng() * 100,
    top: rng() * 100,
    size: 20 + rng() * 60,
    delay: rng() * 8,
    duration: 8 + rng() * 12,
    opacity: 0.15 + rng() * 0.3,
    drift: (rng() - 0.5) * 40,
  }));
}

interface BrushStroke {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotate: number;
  opacity: number;
  delay: number;
  duration: number;
}

function generateStrokes(count: number, seed: number): BrushStroke[] {
  const rng = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: rng() * 100,
    y: rng() * 100,
    width: 80 + rng() * 200,
    height: 12 + rng() * 30,
    rotate: (rng() - 0.5) * 80,
    opacity: 0.08 + rng() * 0.15,
    delay: rng() * 5,
    duration: 10 + rng() * 15,
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// Watercolor — soft flowing color blooms with bleeding edges
// ─────────────────────────────────────────────────────────────────────────────

function WatercolorBackground() {
  const blooms = useMemo(() => generateFloats(8, 42), []);
  const colors = ["#a8d5e2", "#c5b8e8", "#f0c8d8", "#b8e0c8", "#e8d5b8"];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-white to-indigo-50/40" />
      {blooms.map((b) => {
        const color = colors[b.id % colors.length];
        return (
          <motion.div
            key={b.id}
            className="absolute rounded-full"
            style={{
              left: `${b.left}%`,
              top: `${b.top}%`,
              width: `${b.size * 3}px`,
              height: `${b.size * 3}px`,
              background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
              opacity: b.opacity,
              filter: "blur(20px)",
            }}
            animate={{
              x: [0, b.drift, 0],
              y: [0, -b.drift * 0.6, 0],
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Oil Paint — thick textured brush strokes with impasto feel
// ─────────────────────────────────────────────────────────────────────────────

function OilPaintBackground() {
  const strokes = useMemo(() => generateStrokes(12, 137), []);
  const colors = ["#d4a574", "#c97b5e", "#8b6f47", "#a89060", "#d8b890"];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-50 via-orange-50/30 to-stone-100" />
      {strokes.map((s) => {
        const color = colors[s.id % colors.length];
        return (
          <motion.div
            key={s.id}
            className="absolute rounded-full"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: `${s.width}px`,
              height: `${s.height}px`,
              background: `linear-gradient(90deg, ${color}, transparent)`,
              opacity: s.opacity,
              borderRadius: "50%",
              transform: `rotate(${s.rotate}deg)`,
              filter: "blur(2px)",
            }}
            animate={{
              x: [0, 15, 0],
              opacity: [s.opacity, s.opacity * 1.5, s.opacity],
            }}
            transition={{
              duration: s.duration,
              delay: s.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Charcoal — dust particles and smudge gradients on warm gray
// ─────────────────────────────────────────────────────────────────────────────

function CharcoalBackground() {
  const particles = useMemo(() => generateFloats(30, 88), []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-stone-100 via-gray-100 to-stone-200/60" />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 30% 40%, rgba(60,50,45,0.04) 0%, transparent 60%)", filter: "blur(30px)" }} />
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse at 70% 60%, rgba(80,70,65,0.03) 0%, transparent 50%)", filter: "blur(25px)" }} />
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full"
          style={{
            left: `${p.left}%`,
            top: `${p.top}%`,
            width: `${p.size * 0.15}px`,
            height: `${p.size * 0.15}px`,
            background: p.id % 3 === 0 ? "rgba(100,90,80,0.4)" : "rgba(60,55,50,0.25)",
            opacity: p.opacity,
          }}
          animate={{
            y: [0, -p.size * 0.8, 0],
            x: [0, p.drift * 0.3, 0],
            opacity: [p.opacity, p.opacity * 0.5, p.opacity],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Gouache — creamy pastel blocks with soft edges
// ─────────────────────────────────────────────────────────────────────────────

function GouacheBackground() {
  const blocks = useMemo(() => generateStrokes(10, 201), []);
  const colors = ["#f2c4a0", "#a8d4c0", "#d4b8e8", "#f0e0a0", "#b8d0e8"];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-rose-50/60 via-cream to-emerald-50/40" />
      {blocks.map((b) => {
        const color = colors[b.id % colors.length];
        return (
          <motion.div
            key={b.id}
            className="absolute"
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: `${b.width}px`,
              height: `${b.height * 1.5}px`,
              background: color,
              opacity: b.opacity,
              borderRadius: "12px",
              transform: `rotate(${b.rotate}deg)`,
              filter: "blur(8px)",
            }}
            animate={{
              scale: [1, 1.08, 1],
              opacity: [b.opacity, b.opacity * 1.3, b.opacity],
            }}
            transition={{
              duration: b.duration,
              delay: b.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Digital Illustration — pixel-grid nodes and glowing connection lines
// ─────────────────────────────────────────────────────────────────────────────

function DigitalBackground() {
  const nodes = useMemo(() => generateFloats(14, 303), []);
  const nodeColors = ["#60a5fa", "#a78bfa", "#34d399", "#f472b6"];

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/40 to-violet-50/30" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(#4f46e5 1px, transparent 1px), linear-gradient(90deg, #4f46e5 1px, transparent 1px)`,
          backgroundSize: "40px 40px",
        }}
      />
      {nodes.map((n) => {
        const color = nodeColors[n.id % nodeColors.length];
        return (
          <motion.div
            key={n.id}
            className="absolute rounded-full"
            style={{
              left: `${n.left}%`,
              top: `${n.top}%`,
              width: `${n.size * 0.4}px`,
              height: `${n.size * 0.4}px`,
              background: color,
              opacity: n.opacity,
              boxShadow: `0 0 ${n.size * 0.6}px ${color}`,
            }}
            animate={{
              y: [0, -n.size * 0.5, 0],
              opacity: [n.opacity, n.opacity * 2, n.opacity],
            }}
            transition={{
              duration: n.duration,
              delay: n.delay,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        );
      })}
      {nodes.slice(0, 7).map((n, i) => {
        const next = nodes[(i + 1) % 7];
        return (
          <svg key={`line-${i}`} className="absolute inset-0 w-full h-full opacity-[0.06]">
            <motion.line
              x1={`${n.left}%`}
              y1={`${n.top}%`}
              x2={`${next.left}%`}
              y2={`${next.top}%`}
              stroke="#6366f1"
              strokeWidth="1"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 3, delay: i * 0.3, repeat: Infinity, repeatType: "reverse" }}
            />
          </svg>
        );
      })}
    </div>
  );
}

const MEDIUM_COMPONENTS: Record<Exclude<Medium, "none">, React.FC> = {
  watercolor: WatercolorBackground,
  "oil-paint": OilPaintBackground,
  charcoal: CharcoalBackground,
  gouache: GouacheBackground,
  "digital-illustration": DigitalBackground,
};

export default function MediumBackground({ medium }: MediumBackgroundProps) {
  const ActiveBg = medium !== "none" ? MEDIUM_COMPONENTS[medium] : null;

  return (
    <AnimatePresence mode="wait">
      {ActiveBg && (
        <motion.div
          key={medium}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className="fixed inset-0 -z-10"
        >
          <ActiveBg />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
