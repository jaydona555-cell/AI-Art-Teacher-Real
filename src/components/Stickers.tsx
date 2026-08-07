import type { StickerPack } from "@/context/RewardContext";

export interface StickerSpec {
  id: string;
  pack: StickerPack;
  top?: string;
  bottom?: string;
  left?: string;
  right?: string;
  rotate: number;
  size: number;
  delay?: number;
}

export const STICKER_LAYOUTS: StickerSpec[] = [
  { id: "star-1", pack: "starter", top: "-2%", right: "4%", rotate: 15, size: 40, delay: 0 },
  { id: "check-1", pack: "starter", bottom: "-3%", left: "3%", rotate: -12, size: 36, delay: 0.5 },
  { id: "spark-1", pack: "starter", top: "40%", right: "-2%", rotate: 8, size: 30, delay: 1 },

  { id: "leaf-1", pack: "nature", top: "10%", left: "-3%", rotate: -20, size: 42, delay: 0.3 },
  { id: "flower-1", pack: "nature", bottom: "12%", right: "-3%", rotate: 25, size: 38, delay: 0.8 },
  { id: "sun-1", pack: "nature", top: "-4%", left: "30%", rotate: 0, size: 34, delay: 1.2 },

  { id: "moon-1", pack: "cosmic", top: "5%", left: "-4%", rotate: -15, size: 44, delay: 0.2 },
  { id: "rocket-1", pack: "cosmic", bottom: "8%", right: "-2%", rotate: 20, size: 40, delay: 0.6 },
  { id: "comet-1", pack: "cosmic", top: "55%", left: "-3%", rotate: 35, size: 32, delay: 1 },
];

interface StickerProps {
  spec: StickerSpec;
}

const STICKER_SVGS: Record<string, React.ReactNode> = {
  "star-1": (
    <path d="M12 2l2.39 7.36H22l-6.19 4.5 2.37 7.36L12 16.72l-6.18 4.5 2.37-7.36L2 9.36h7.61z"
      fill="#D9C084" stroke="#C9A961" strokeWidth="1.5" strokeLinejoin="round" />
  ),
  "check-1": (
    <>
      <circle cx="12" cy="12" r="10" fill="#7BA08C" stroke="#6B9E7C" strokeWidth="2" />
      <path d="M8 12l3 3 5-6" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  "spark-1": (
    <path d="M12 2v6M12 16v6M2 12h6M16 12h6M5 5l3 3M16 16l3 3M19 5l-3 3M8 16l-3 3"
      stroke="#C9A961" strokeWidth="2.2" strokeLinecap="round" />
  ),
  "leaf-1": (
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19.2 2.96c1.4 9.3-4.1 15.84-8.2 17.04Z"
      fill="#7BA08C" stroke="#6B9E7C" strokeWidth="1.5" />
  ),
  "flower-1": (
    <>
      <circle cx="12" cy="12" r="3" fill="#D9C084" />
      {[0, 72, 144, 216, 288].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const cx = 12 + 6 * Math.cos(rad);
        const cy = 12 + 6 * Math.sin(rad);
        return <ellipse key={angle} cx={cx} cy={cy} rx="4" ry="5.5" fill="#B89098" stroke="#CBA8B0" strokeWidth="1" transform={`rotate(${angle} ${cx} ${cy})`} />;
      })}
    </>
  ),
  "sun-1": (
    <>
      <circle cx="12" cy="12" r="5" fill="#D9C084" stroke="#C9A961" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
        const rad = (angle * Math.PI) / 180;
        const x1 = 12 + 7 * Math.cos(rad);
        const y1 = 12 + 7 * Math.sin(rad);
        const x2 = 12 + 10 * Math.cos(rad);
        const y2 = 12 + 10 * Math.sin(rad);
        return <line key={angle} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#C9A961" strokeWidth="2" strokeLinecap="round" />;
      })}
    </>
  ),
  "moon-1": (
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"
      fill="#8B9BA8" stroke="#E4E8EC" strokeWidth="1.5" strokeLinejoin="round" />
  ),
  "rocket-1": (
    <>
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"
        fill="#6B95B8" stroke="#DCE6EF" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"
        fill="#8B9BA8" stroke="#E4E8EC" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"
        fill="#6B95B8" stroke="#DCE6EF" strokeWidth="1.5" />
    </>
  ),
  "comet-1": (
    <>
      <circle cx="17" cy="7" r="4" fill="#D9C084" stroke="#C9A961" strokeWidth="1.5" />
      <path d="M14 10L4 20" stroke="#D9C084" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
      <path d="M15 12L7 20" stroke="#C99B8E" strokeWidth="2" strokeLinecap="round" opacity="0.4" />
    </>
  ),
};

export default function Sticker({ spec }: StickerProps) {
  const svg = STICKER_SVGS[spec.id];
  if (!svg) return null;

  const style: React.CSSProperties = {
    position: "absolute",
    [spec.top ? "top" : "bottom"]: spec.top ?? spec.bottom,
    [spec.left ? "left" : "right"]: spec.left ?? spec.right,
    width: spec.size,
    height: spec.size,
    ['--rot' as string]: `${spec.rotate}deg`,
    animationDelay: `${spec.delay ?? 0}s`,
  };

  return (
    <div
      className="pointer-events-none z-20 animate-float-sticker drop-shadow-[0_4px_8px_rgba(59,71,84,0.12)]"
      style={style}
    >
      <svg viewBox="0 0 24 24" width={spec.size} height={spec.size} className="overflow-visible">
        {svg}
      </svg>
    </div>
  );
}
