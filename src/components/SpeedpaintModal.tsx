import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clapperboard, X, Download, Play, Pause, SkipBack, SkipForward, RotateCcw } from "lucide-react";

export interface SpeedpaintStage {
  label: string;
  imageBase64: string | null;
  imageUrl: string | null;
}

interface SpeedpaintModalProps {
  open: boolean;
  onClose: () => void;
  stages: SpeedpaintStage[];
  loading: boolean;
  error: string | null;
}

const STAGE_DURATIONS = [2500, 2500, 3000, 3500];

export default function SpeedpaintModal({ open, onClose, stages, loading, error }: SpeedpaintModalProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanStages = stages.filter((s) => s.imageBase64 || s.imageUrl);
  const total = cleanStages.length;

  const advance = useCallback(() => {
    setCurrentStage((prev) => {
      if (prev + 1 >= total) {
        setPlaying(false);
        return prev;
      }
      return prev + 1;
    });
  }, [total]);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (playing && currentStage < total - 1) {
      timerRef.current = setTimeout(advance, STAGE_DURATIONS[currentStage] ?? 3000);
    } else if (playing && currentStage >= total - 1) {
      setPlaying(false);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [playing, currentStage, total, advance]);

  useEffect(() => {
    if (open) {
      setCurrentStage(0);
      setPlaying(false);
    }
  }, [open]);

  const getImage = (stage: SpeedpaintStage) =>
    stage.imageBase64 ? `data:image/png;base64,${stage.imageBase64}` : stage.imageUrl;

  const handlePlayPause = () => {
    if (currentStage >= total - 1) {
      setCurrentStage(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };

  const handlePrev = () => {
    setPlaying(false);
    setCurrentStage((s) => Math.max(0, s - 1));
  };

  const handleNext = () => {
    setPlaying(false);
    if (currentStage < total - 1) setCurrentStage((s) => s + 1);
  };

  const handleRestart = () => {
    setPlaying(false);
    setCurrentStage(0);
  };

  const activeImage = cleanStages[currentStage] ? getImage(cleanStages[currentStage]) : null;
  const progress = total > 0 ? ((currentStage + 1) / total) * 100 : 0;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-deep-earth/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-pastel-amber/40 to-pastel-coral/30 px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-amber to-accent-coral flex items-center justify-center shadow-sticker">
                  <Clapperboard size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-deep-earth">AI Speedpaint</h2>
                  <p className="text-xs text-muted-brown">Watch your artwork come to life, stroke by stroke</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-brown hover:text-deep-earth transition-colors" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              {loading && (
                <div className="flex flex-col items-center gap-3 py-16">
                  <div className="w-12 h-12 rounded-full border-4 border-sand/40 border-t-accent-amber animate-spin" />
                  <p className="text-sm text-muted-brown">Painting your speedpaint...</p>
                  <p className="text-xs text-muted-brown/70">Generating 4 progressive stages — this takes a moment</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-8 max-w-sm">
                  <p className="text-accent-rose font-semibold text-sm">{error}</p>
                </div>
              )}

              {!loading && !error && total > 0 && (
                <>
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-white/40 border border-sand/40 shadow-card-soft">
                    <AnimatePresence mode="wait">
                      <motion.img
                        key={currentStage}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        src={activeImage || undefined}
                        alt={`Speedpaint stage ${currentStage + 1}: ${cleanStages[currentStage]?.label}`}
                        className="w-full h-full object-contain"
                      />
                    </AnimatePresence>
                    <div className="absolute top-3 left-3 bg-deep-earth/70 backdrop-blur-sm text-cream text-xs font-semibold px-3 py-1.5 rounded-full">
                      {cleanStages[currentStage]?.label}
                    </div>
                    <div className="absolute top-3 right-3 bg-deep-earth/70 backdrop-blur-sm text-cream text-xs font-semibold px-3 py-1.5 rounded-full tabular-nums">
                      {currentStage + 1} / {total}
                    </div>
                  </div>

                  <div className="w-full h-2 bg-sand/40 rounded-full overflow-hidden">
                    <motion.div
                      className="h-full bg-gradient-to-r from-accent-amber to-accent-coral rounded-full"
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.3 }}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleRestart}
                      className="w-10 h-10 rounded-full bg-white/70 border border-sand/40 flex items-center justify-center text-muted-brown hover:text-deep-earth hover:bg-white transition-all"
                      aria-label="Restart"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={handlePrev}
                      disabled={currentStage === 0}
                      className="w-10 h-10 rounded-full bg-white/70 border border-sand/40 flex items-center justify-center text-muted-brown hover:text-deep-earth hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Previous stage"
                    >
                      <SkipBack size={16} />
                    </button>
                    <button
                      onClick={handlePlayPause}
                      className="w-14 h-14 rounded-full bg-gradient-to-br from-accent-amber to-accent-coral flex items-center justify-center text-white shadow-card-color hover:shadow-glow-amber transition-all"
                      aria-label={playing ? "Pause" : "Play"}
                    >
                      {playing ? <Pause size={22} /> : <Play size={22} className="ml-0.5" />}
                    </button>
                    <button
                      onClick={handleNext}
                      disabled={currentStage >= total - 1}
                      className="w-10 h-10 rounded-full bg-white/70 border border-sand/40 flex items-center justify-center text-muted-brown hover:text-deep-earth hover:bg-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                      aria-label="Next stage"
                    >
                      <SkipForward size={16} />
                    </button>
                    {activeImage && (
                      <a
                        href={activeImage}
                        download={`atelier-speedpaint-stage-${currentStage + 1}.png`}
                        className="w-10 h-10 rounded-full bg-white/70 border border-sand/40 flex items-center justify-center text-muted-brown hover:text-deep-earth hover:bg-white transition-all"
                        aria-label="Download this stage"
                      >
                        <Download size={16} />
                      </a>
                    )}
                  </div>

                  <p className="text-xs text-muted-brown text-center max-w-xs">
                    {playing
                      ? "Auto-playing through the painting stages..."
                      : currentStage >= total - 1
                      ? "Finished! Press play to watch again from the beginning."
                      : "Press play to watch the artwork build automatically"}
                  </p>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
