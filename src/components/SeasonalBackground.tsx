import { useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSeason, SEASON_GRADIENTS, type Season } from "@/context/SeasonContext";

interface FloralElement {
  id: number;
  left: number;
  top: number;
  size: number;
  rotate: number;
  delay: number;
  duration: number;
  opacity: number;
  variant: number;
}

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateElements(count: number, seed: number): FloralElement[] {
  const rng = seededRandom(seed);
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: rng() * 100,
    top: rng() * 100,
    size: 16 + rng() * 32,
    rotate: (rng() - 0.5) * 60,
    delay: rng() * 6,
    duration: 6 + rng() * 10,
    opacity: 0.25 + rng() * 0.35,
    variant: Math.floor(rng() * 3),
  }));
}

// ---- SVG Floral Assets ----

function CherryBlossom({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="overflow-visible">
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 12 + 5.5 * Math.cos(rad);
        const cy = 12 + 5.5 * Math.sin(rad);
        return (
          <ellipse
            key={angle}
            cx={cx}
            cy={cy}
            rx="4.5"
            ry="6"
            fill={color}
            transform={`rotate(${angle} ${cx} ${cy})`}
          />
        );
      })}
      <circle cx="12" cy="12" r="2.5" fill="#C9A961" opacity="0.8" />
    </svg>
  );
}

function LeafCluster({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="overflow-visible">
      <path d="M12 2C8 6 6 10 6 14c0 4 2 6 6 8 4-2 6-4 6-8 0-4-2-8-6-12z" fill={color} opacity="0.7" />
      <path d="M12 2v20" stroke={color} strokeWidth="0.8" opacity="0.4" />
      <path d="M12 8c-2 1-3 3-4 5M12 8c2 1 3 3 4 5M12 14c-1 1-2 2-3 3M12 14c1 1 2 2 3 3"
        stroke={color} strokeWidth="0.5" opacity="0.3" fill="none" />
    </svg>
  );
}

function SmallBloom({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="overflow-visible">
      {[0, 90, 180, 270].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 12 + 4 * Math.cos(rad);
        const cy = 12 + 4 * Math.sin(rad);
        return <circle key={angle} cx={cx} cy={cy} r="3.5" fill={color} opacity="0.8" />;
      })}
      <circle cx="12" cy="12" r="2.5" fill="#C9A961" />
    </svg>
  );
}

function MapleLeaf({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="overflow-visible">
      <path
        d="M12 2l1.5 4 3.5-1.5L15 8l4 1-3 3 3 1-3 2 2 3-4-1-1.5 4L11 19l-4 1 2-3-3-2 3-1-3-3 4-1-2-3.5L10 6z"
        fill={color}
        opacity="0.75"
        strokeLinejoin="round"
      />
      <path d="M12 2v20" stroke={color} strokeWidth="0.5" opacity="0.3" />
    </svg>
  );
}

function Snowflake({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="overflow-visible">
      {[0, 60, 120].map((angle) => (
        <g key={angle} transform={`rotate(${angle} 12 12)`}>
          <line x1="12" y1="2" x2="12" y2="22" stroke={color} strokeWidth="1" opacity="0.6" />
          <line x1="12" y1="5" x2="9" y2="3" stroke={color} strokeWidth="0.8" opacity="0.5" />
          <line x1="12" y1="5" x2="15" y2="3" stroke={color} strokeWidth="0.8" opacity="0.5" />
          <line x1="12" y1="19" x2="9" y2="21" stroke={color} strokeWidth="0.8" opacity="0.5" />
          <line x1="12" y1="19" x2="15" y2="21" stroke={color} strokeWidth="0.8" opacity="0.5" />
        </g>
      ))}
      <circle cx="12" cy="12" r="1.5" fill={color} opacity="0.5" />
    </svg>
  );
}

function BareBranch({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" className="overflow-visible">
      <path d="M12 22V8M12 8c-2-2-4-2-6-1M12 8c2-2 4-2 6-1M12 14c-2-1-3-1-5 0M12 14c2-1 3-1 5 0M12 18c-1-1-2-1-3 0M12 18c1-1 2-1 3 0"
        stroke={color} strokeWidth="1.2" fill="none" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

// ---- Season-specific renderers ----

interface FloralStyle extends React.CSSProperties {
  '--rot': string;
  '--dur': string;
  '--opacity': number;
}

function SpringFlorals({ elements }: { elements: FloralElement[] }) {
  const colors = ["#E8ECEF", "#D6E3D8", "#E5DDE0"];
  return (
    <>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute animate-drift-up will-change-transform"
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            '--rot': `${el.rotate}deg`,
            '--dur': `${el.duration}s`,
            '--opacity': el.opacity,
            animationDelay: `${el.delay}s`,
          } as FloralStyle}
        >
          <CherryBlossom size={el.size} color={colors[el.variant % colors.length]} />
        </div>
      ))}
    </>
  );
}

function SummerFlorals({ elements }: { elements: FloralElement[] }) {
  const leafColors = ["#7BA08C", "#6B9E7C", "#C2C9D1"];
  const bloomColors = ["#C9A961", "#E8ECEF"];
  return (
    <>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute animate-breeze will-change-transform"
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            '--rot': `${el.rotate}deg`,
            '--dur': `${el.duration}s`,
            '--opacity': el.opacity,
            animationDelay: `${el.delay}s`,
          } as FloralStyle}
        >
          {el.variant === 0 ? (
            <LeafCluster size={el.size} color={leafColors[el.id % 3]} />
          ) : (
            <SmallBloom size={el.size * 0.7} color={bloomColors[el.id % 2]} />
          )}
        </div>
      ))}
    </>
  );
}

function AutumnFlorals({ elements }: { elements: FloralElement[] }) {
  const colors = ["#C9A961", "#A88940", "#B89098", "#C99B8E", "#D4A88E"];
  return (
    <>
      {elements.map((el) => (
        <div
          key={el.id}
          className="absolute animate-tumble will-change-transform"
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            '--rot': `${el.rotate}deg`,
            '--dur': `${el.duration}s`,
            '--opacity': el.opacity,
            animationDelay: `${el.delay}s`,
          } as FloralStyle}
        >
          <MapleLeaf size={el.size} color={colors[el.variant % colors.length]} />
        </div>
      ))}
    </>
  );
}

function WinterFlorals({ elements }: { elements: FloralElement[] }) {
  const snowColor = "#E8ECEF";
  const branchColor = "#8B97A4";
  return (
    <>
      {elements.map((el, i) => (
        <div
          key={el.id}
          className={`absolute will-change-transform ${i % 4 === 0 ? "animate-breeze" : "animate-snowfall"}`}
          style={{
            left: `${el.left}%`,
            top: `${el.top}%`,
            '--rot': `${el.rotate}deg`,
            '--dur': `${el.duration + 4}s`,
            '--opacity': el.opacity * 0.8,
            animationDelay: `${el.delay}s`,
          } as FloralStyle}
        >
          {i % 5 === 0 ? (
            <BareBranch size={el.size * 1.4} color={branchColor} />
          ) : (
            <Snowflake size={el.size * 0.8} color={snowColor} />
          )}
        </div>
      ))}
    </>
  );
}

const SEASON_RENDERERS: Record<Season, React.FC<{ elements: FloralElement[] }>> = {
  SPRING: SpringFlorals,
  SUMMER: SummerFlorals,
  AUTUMN: AutumnFlorals,
  WINTER: WinterFlorals,
};

const SEASON_SEEDS: Record<Season, number> = {
  SPRING: 101,
  SUMMER: 202,
  AUTUMN: 303,
  WINTER: 404,
};

const ELEMENT_COUNT = 18;

export default function SeasonalBackground() {
  const { season } = useSeason();

  const elements = useMemo(
    () => generateElements(ELEMENT_COUNT, SEASON_SEEDS[season]),
    [season]
  );

  const Renderer = SEASON_RENDERERS[season];

  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Gradient layer with cross-fade */}
      <AnimatePresence mode="sync">
        <motion.div
          key={season}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 3, ease: "easeInOut" }}
          style={{ background: SEASON_GRADIENTS[season] }}
        />
      </AnimatePresence>

      {/* Floral overlay */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`florals-${season}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        >
          <Renderer elements={elements} />
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
