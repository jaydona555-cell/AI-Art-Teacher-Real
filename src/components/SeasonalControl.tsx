import { motion } from "framer-motion";
import { Cherry, Sun, Leaf, Snowflake } from "lucide-react";
import { useSeason, SEASON_LABELS, type Season } from "@/context/SeasonContext";

const SEASON_ICONS: Record<Season, typeof Cherry> = {
  SPRING: Cherry,
  SUMMER: Sun,
  AUTUMN: Leaf,
  WINTER: Snowflake,
};

const SEASON_COLORS: Record<Season, string> = {
  SPRING: "from-pastel-sky-dark to-accent-sky",
  SUMMER: "from-pastel-sage-dark to-accent-sage",
  AUTUMN: "from-pastel-amber-dark to-accent-amber-deep",
  WINTER: "from-pastel-lavender-dark to-accent-lavender",
};

export default function SeasonalControl() {
  const { season, cycleSeason } = useSeason();
  const Icon = SEASON_ICONS[season];

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={cycleSeason}
      className={`inline-flex items-center gap-2 bg-gradient-to-r ${SEASON_COLORS[season]} text-white text-xs font-semibold px-3.5 py-2 rounded-full shadow-card-soft transition-all duration-500`}
      aria-label={`Current season: ${SEASON_LABELS[season]}. Click to change.`}
    >
      <Icon size={14} className="text-white" />
      <span>{SEASON_LABELS[season]}</span>
    </motion.button>
  );
}
