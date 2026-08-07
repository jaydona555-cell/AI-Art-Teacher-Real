import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, X, Smile, Frown, Meh, Sparkles } from "lucide-react";

type Mood = "great" | "good" | "okay" | "tense" | "overwhelmed";

const MOODS: { value: Mood; label: string; icon: typeof Smile; color: string }[] = [
  { value: "great", label: "Great", icon: Sparkles, color: "from-accent-amber to-accent-coral" },
  { value: "good", label: "Good", icon: Smile, color: "from-accent-sage to-accent-sky" },
  { value: "okay", label: "Okay", icon: Meh, color: "from-warm-taupe to-muted-brown" },
  { value: "tense", label: "A bit tense", icon: Frown, color: "from-accent-rose to-accent-coral" },
  { value: "overwhelmed", label: "Overwhelmed", icon: Heart, color: "from-accent-lavender to-accent-sky" },
];

const ENCOURAGEMENT: Record<Mood, string> = {
  great: "Wonderful! Let's channel that creative energy into your feedback.",
  good: "Glad you're feeling good. Let's explore your artwork together.",
  okay: "That's perfectly fine. Take this at your own pace — there's no rush.",
  tense: "It's okay to feel tense. Feedback here is about growth, not judgment. Take a breath, and we'll go step by step.",
  overwhelmed: "Let's slow down. You can read your feedback one piece at a time. If it feels like too much, step away and come back whenever you're ready.",
};

interface SensoryCheckInProps {
  show: boolean;
  onDone: (mood: Mood) => void;
  onSkip: () => void;
}

export default function SensoryCheckIn({ show, onDone, onSkip }: SensoryCheckInProps) {
  const [selected, setSelected] = useState<Mood | null>(null);
  const [phase, setPhase] = useState<"ask" | "response">("ask");

  useEffect(() => {
    if (show) {
      setSelected(null);
      setPhase("ask");
    }
  }, [show]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[65] flex items-center justify-center p-4"
          onClick={onSkip}
        >
          <div className="absolute inset-0 bg-deep-earth/40 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-md overflow-hidden"
          >
            {phase === "ask" && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="p-6"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-rose to-accent-coral flex items-center justify-center shadow-sticker">
                      <Heart size={20} className="text-white" />
                    </div>
                    <div>
                      <h2 className="font-display font-bold text-deep-earth text-base">How are you feeling?</h2>
                      <p className="text-xs text-muted-brown">A quick check-in before we begin</p>
                    </div>
                  </div>
                  <button
                    onClick={onSkip}
                    className="w-8 h-8 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                    aria-label="Skip check-in"
                  >
                    <X size={16} className="text-deep-earth" />
                  </button>
                </div>

                <div className="space-y-2">
                  {MOODS.map((mood) => {
                    const Icon = mood.icon;
                    const active = selected === mood.value;
                    return (
                      <button
                        key={mood.value}
                        onClick={() => setSelected(mood.value)}
                        className={`w-full flex items-center gap-3 rounded-2xl border-2 p-3.5 transition-all text-left ${
                          active ? "border-accent-rose/50 bg-pastel-rose/20 shadow-glow-rose" : "border-sand/40 bg-white/50 hover:border-accent-rose/30"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${mood.color} flex items-center justify-center shadow-sticker flex-shrink-0`}>
                          <Icon size={18} className="text-white" />
                        </div>
                        <span className={`font-medium text-sm ${active ? "text-deep-earth" : "text-muted-brown"}`}>{mood.label}</span>
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between mt-5">
                  <button
                    onClick={onSkip}
                    className="text-xs text-muted-brown hover:text-deep-earth transition-colors"
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => selected && setPhase("response")}
                    disabled={!selected}
                    className="text-sm font-semibold text-white bg-gradient-to-r from-accent-rose to-accent-coral rounded-full px-5 py-2.5 hover:shadow-glow-rose disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                  >
                    Continue
                  </button>
                </div>
              </motion.div>
            )}

            {phase === "response" && selected && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="p-6 text-center"
              >
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 400, damping: 15, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-rose to-accent-coral flex items-center justify-center mx-auto mb-4 shadow-glow-rose"
                >
                  <Heart size={30} className="text-white" />
                </motion.div>
                <p className="text-sm text-deep-earth leading-relaxed max-w-xs mx-auto mb-5">
                  {ENCOURAGEMENT[selected]}
                </p>
                <button
                  onClick={() => onDone(selected)}
                  className="text-sm font-semibold text-white bg-gradient-to-r from-accent-sage to-accent-sky rounded-full px-6 py-2.5 hover:shadow-glow-sage transition-all"
                >
                  I'm ready
                </button>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export type { Mood };
