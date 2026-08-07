import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImageIcon, X, Trash2, Coins, Calendar, MapPin, Sparkles, ChevronLeft, ChevronRight } from "lucide-react";
import type { PortfolioEntry } from "@/hooks/usePortfolio";
import { SKILL_LABELS, type SkillLevel } from "@/lib/scoring";
import JourneyTracker from "@/components/JourneyTracker";
import CritiquePinsOverlay from "@/components/CritiquePinsOverlay";

const SKILL_COLORS: Record<SkillLevel, string> = {
  beginner: "from-accent-sage to-pastel-sage-dark",
  intermediate: "from-accent-sky to-pastel-sky-dark",
  advanced: "from-accent-amber to-accent-amber-light",
  professional: "from-accent-coral to-accent-peach",
  master: "from-accent-rose to-accent-rose-light",
};

interface PortfolioProps {
  entries: PortfolioEntry[];
  loading: boolean;
  error: string | null;
  onDelete: (id: string) => void;
}

const PAGE_SIZE = 12;

export default function Portfolio({ entries, loading, error, onDelete }: PortfolioProps) {
  const [selected, setSelected] = useState<PortfolioEntry | null>(null);
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(entries.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pagedEntries = entries.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-10 h-10 rounded-full border-3 border-accent-amber/30 border-t-accent-amber"
        />
        <p className="text-muted-brown text-sm">Loading your gallery...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3 text-center">
        <div className="w-12 h-12 rounded-2xl bg-pastel-rose/40 flex items-center justify-center">
          <X size={24} className="text-accent-rose" />
        </div>
        <p className="text-deep-earth font-semibold">Couldn't load your portfolio</p>
        <p className="text-muted-brown text-sm max-w-sm">{error}</p>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-16 h-16 rounded-3xl bg-gradient-to-br from-pastel-amber to-pastel-coral flex items-center justify-center shadow-card-soft"
        >
          <ImageIcon size={28} className="text-accent-amber-deep" />
        </motion.div>
        <div>
          <p className="font-display text-deep-earth font-semibold text-lg">Your gallery is waiting</p>
          <p className="text-muted-brown text-sm mt-1 max-w-sm">
            Upload your first artwork and receive feedback to begin your artistic journey. Every piece you share will appear here as a milestone.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <JourneyTracker entries={entries} />

      <div>
        <h3 className="font-display text-deep-earth font-semibold text-sm uppercase tracking-wide mb-4 flex items-center gap-2">
          <Sparkles size={15} className="text-accent-amber-deep" />
          Gallery Timeline
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {pagedEntries.map((entry, i) => (
            <motion.button
              key={entry.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setSelected(entry)}
              className="group relative rounded-2xl overflow-hidden border border-sand/40 shadow-card-soft hover:shadow-card-warm transition-all duration-200 bg-cream"
            >
              <div className="aspect-square overflow-hidden bg-sand/20">
                <img
                  src={entry.image_url}
                  alt="Portfolio artwork"
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>
              <div className="p-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full text-white bg-gradient-to-r ${SKILL_COLORS[entry.skill_level]}`}>
                    {SKILL_LABELS[entry.skill_level]}
                  </span>
                  <span className="flex items-center gap-0.5 text-[11px] font-bold text-accent-amber-deep">
                    <Coins size={11} />
                    +{entry.tokens_earned}
                  </span>
                </div>
                <p className="text-[10px] text-warm-taupe mt-1.5 flex items-center gap-1">
                  <Calendar size={9} />
                  {new Date(entry.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}
                </p>
              </div>
            </motion.button>
          ))}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="inline-flex items-center gap-1 text-sm font-medium rounded-full px-3.5 py-2 transition-all bg-white/60 text-deep-earth border border-sand/40 hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <ChevronLeft size={14} /> Prev
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-9 h-9 rounded-full text-sm font-semibold transition-all ${
                  p === currentPage
                    ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-sticker"
                    : "bg-white/60 text-deep-earth border border-sand/40 hover:bg-white/80"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="inline-flex items-center gap-1 text-sm font-medium rounded-full px-3.5 py-2 transition-all bg-white/60 text-deep-earth border border-sand/40 hover:bg-white/80 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={14} />
            </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
            className="fixed inset-0 z-50 bg-deep-earth/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream rounded-3xl shadow-card-warm max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between p-4 border-b border-sand/40">
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-bold uppercase tracking-wide px-2.5 py-1 rounded-full text-white bg-gradient-to-r ${SKILL_COLORS[selected.skill_level]}`}>
                    {SKILL_LABELS[selected.skill_level]}
                  </span>
                  <span className="flex items-center gap-1 text-sm font-bold text-accent-amber-deep">
                    <Coins size={14} />
                    +{selected.tokens_earned}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      onDelete(selected.id);
                      setSelected(null);
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-accent-rose hover:text-accent-rose-deep bg-pastel-rose/30 hover:bg-pastel-rose/50 rounded-full px-3 py-1.5 transition-all"
                  >
                    <Trash2 size={13} />
                    Delete
                  </button>
                  <button
                    onClick={() => setSelected(null)}
                    className="w-8 h-8 rounded-full bg-sand/40 hover:bg-sand/60 flex items-center justify-center transition-colors"
                  >
                    <X size={16} className="text-deep-earth" />
                  </button>
                </div>
              </div>

              <div className="overflow-y-auto scroll-warm">
                <div className="grid md:grid-cols-2 gap-0">
                  <div className="relative bg-deep-earth/5 p-4 flex items-center justify-center">
                    <div className="relative max-w-full">
                      <img
                        src={selected.image_url}
                        alt="Portfolio artwork detail"
                        className="max-w-full max-h-[50vh] md:max-h-[60vh] object-contain rounded-xl shadow-card-soft"
                      />
                      {selected.critique_pins.length > 0 && (
                        <CritiquePinsOverlay pins={selected.critique_pins} />
                      )}
                    </div>
                  </div>
                  <div className="p-5 sm:p-6">
                    <div className="flex items-center gap-2 mb-3 text-xs text-muted-brown">
                      <Calendar size={12} />
                      {new Date(selected.created_at).toLocaleDateString(undefined, { dateStyle: "full" })}
                    </div>
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-accent-amber-deep mb-2 flex items-center gap-1.5">
                      <MapPin size={12} />
                      Master Teacher's Critique
                    </p>
                    <div className="text-sm text-deep-earth leading-relaxed whitespace-pre-wrap max-h-[45vh] overflow-y-auto scroll-warm pr-2">
                      {selected.feedback}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
