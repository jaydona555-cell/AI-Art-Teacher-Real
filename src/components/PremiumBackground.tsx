import { motion } from "framer-motion";
import type { ShopBackground } from "@/context/RewardContext";

// Static SVG-based decorative backgrounds for premium shop themes.
// These render behind the main content when a premium background is active.

const GREEK_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <pattern id="greek-key" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <path d="M0 40h20v-20h20v20h20v-20h20" fill="none" stroke="#C9A961" stroke-width="1.5" opacity="0.12"/>
        <path d="M40 0v20h20v20h-20v20h-20v-20h20" fill="none" stroke="#C9A961" stroke-width="1.5" opacity="0.08"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#greek-key)"/>
    <circle cx="100" cy="100" r="30" fill="none" stroke="#C9A961" stroke-width="1" opacity="0.1"/>
    <circle cx="300" cy="300" r="25" fill="none" stroke="#C9A961" stroke-width="1" opacity="0.08"/>
    <path d="M180 80 L220 80 L220 120 L200 140 L180 120 Z" fill="none" stroke="#C9A961" stroke-width="1.5" opacity="0.1"/>
  </svg>
`;

const CHINESE_PATTERN = `
  <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
    <defs>
      <pattern id="ink-wash" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
        <path d="M20 100 Q40 60 80 90 T160 80" fill="none" stroke="#7BA08C" stroke-width="2" opacity="0.08"/>
        <path d="M100 20 Q120 50 110 90 T140 160" fill="none" stroke="#6B9E7C" stroke-width="1.5" opacity="0.06"/>
        <circle cx="160" cy="40" r="3" fill="#5C6B7A" opacity="0.12"/>
        <circle cx="30" cy="170" r="2" fill="#5C6B7A" opacity="0.1"/>
      </pattern>
    </defs>
    <rect width="400" height="400" fill="url(#ink-wash)"/>
    <path d="M80 320 Q120 280 180 300 T300 290" fill="none" stroke="#5C6B7A" stroke-width="3" opacity="0.1"/>
    <rect x="340" y="20" width="20" height="120" fill="#C9A961" opacity="0.06" rx="2"/>
  </svg>
`;

const BACKGROUNDS: Record<ShopBackground, { gradient: string; pattern: string }> = {
  "greek-mythology": {
    gradient: "linear-gradient(135deg, #F2EDE3 0%, #F0E8D6 50%, #E8D5CE 100%)",
    pattern: GREEK_PATTERN,
  },
  "chinese-art": {
    gradient: "linear-gradient(135deg, #F4F6F8 0%, #DCE6EF 50%, #D6E3D8 100%)",
    pattern: CHINESE_PATTERN,
  },
};

interface PremiumBackgroundProps {
  background: ShopBackground;
}

export default function PremiumBackground({ background }: PremiumBackgroundProps) {
  const config = BACKGROUNDS[background];
  if (!config) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 2, ease: "easeInOut" }}
      className="absolute inset-0 -z-10 overflow-hidden pointer-events-none"
    >
      <div className="absolute inset-0" style={{ background: config.gradient }} />
      <div
        className="absolute inset-0 opacity-40"
        style={{ backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(config.pattern)}")`, backgroundRepeat: "repeat" }}
      />
    </motion.div>
  );
}
