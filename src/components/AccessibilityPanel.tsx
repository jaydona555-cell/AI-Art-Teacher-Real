import { motion, AnimatePresence } from "framer-motion";
import {
  Accessibility,
  X,
  Eye,
  Type,
  Volume2,
  Sparkles,
  RotateCcw,
  Zap,
  Moon,
  Sun,
  Gauge,
  Check,
} from "lucide-react";
import { useAccessibility, type SensoryMode, type FontSize, type NarrationSpeed, type NarrationVoice } from "@/context/AccessibilityContext";

interface AccessibilityPanelProps {
  open: boolean;
  onClose: () => void;
}

const SENSORY_OPTIONS: { value: SensoryMode; label: string; desc: string; icon: typeof Sparkles }[] = [
  { value: "full", label: "Full Experience", desc: "All animations and effects", icon: Sparkles },
  { value: "reduced", label: "Reduced Motion", desc: "Subtle animations only", icon: Zap },
  { value: "minimal", label: "Calm Mode", desc: "No animations, static UI", icon: Moon },
];

const FONT_SIZE_OPTIONS: { value: FontSize; label: string; sample: string }[] = [
  { value: "sm", label: "Small", sample: "Aa" },
  { value: "base", label: "Default", sample: "Aa" },
  { value: "lg", label: "Large", sample: "Aa" },
  { value: "xl", label: "Extra Large", sample: "Aa" },
];

const SPEED_OPTIONS: { value: NarrationSpeed; label: string }[] = [
  { value: "slow", label: "Slow & Gentle" },
  { value: "normal", label: "Normal" },
  { value: "fast", label: "Fast" },
];

const VOICE_OPTIONS: { value: NarrationVoice; label: string; desc: string }[] = [
  { value: "warm", label: "Warm Teacher", desc: "Gentle, encouraging tone" },
  { value: "clear", label: "Clear & Direct", desc: "Crisp, easy to follow" },
  { value: "calm", label: "Calm Mentor", desc: "Soft, unhurried delivery" },
];

export default function AccessibilityPanel({ open, onClose }: AccessibilityPanelProps) {
  const {
    sensoryMode,
    fontSize,
    fontFamily,
    contrast,
    narrationEnabled,
    narrationSpeed,
    narrationVoice,
    autoNarrate,
    setSensoryMode,
    setFontSize,
    setFontFamily,
    setContrast,
    setNarrationEnabled,
    setNarrationSpeed,
    setNarrationVoice,
    setAutoNarrate,
    resetAll,
  } = useAccessibility();

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
          <div className="absolute inset-0 bg-deep-earth/50 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pastel-sky/50 to-pastel-lavender/40 px-6 py-5 border-b border-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-sky to-accent-lavender flex items-center justify-center shadow-sticker">
                  <Accessibility size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-deep-earth">Accessibility Settings</h2>
                  <p className="text-xs text-muted-brown">Tailor the experience to your needs</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Close settings"
              >
                <X size={18} className="text-deep-earth" />
              </button>
            </div>

            <div className="overflow-y-auto scroll-warm p-6 space-y-7">
              {/* Sensory Mode */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Eye size={16} className="text-accent-sky" />
                  <h3 className="font-display font-bold text-deep-earth text-sm uppercase tracking-wide">Visual Stimulation</h3>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SENSORY_OPTIONS.map((opt) => {
                    const active = sensoryMode === opt.value;
                    const Icon = opt.icon;
                    return (
                      <button
                        key={opt.value}
                        onClick={() => setSensoryMode(opt.value)}
                        className={`text-left rounded-2xl border-2 p-4 transition-all ${
                          active
                            ? "border-accent-sky bg-pastel-sky/40 shadow-glow-sage"
                            : "border-sand/40 bg-white/50 hover:border-accent-sky/40"
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-2 ${
                          active ? "bg-gradient-to-br from-accent-sky to-accent-lavender" : "bg-sand/30"
                        }`}>
                          <Icon size={18} className={active ? "text-white" : "text-muted-brown"} />
                        </div>
                        <p className={`font-semibold text-sm ${active ? "text-deep-earth" : "text-muted-brown"}`}>{opt.label}</p>
                        <p className="text-xs text-muted-brown mt-0.5">{opt.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* Font Settings */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Type size={16} className="text-accent-sage" />
                  <h3 className="font-display font-bold text-deep-earth text-sm uppercase tracking-wide">Reading Comfort</h3>
                </div>

                {/* Font Size */}
                <p className="text-xs text-muted-brown mb-2">Text Size</p>
                <div className="flex gap-2 mb-4">
                  {FONT_SIZE_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => setFontSize(opt.value)}
                      className={`flex-1 rounded-xl border-2 py-3 transition-all flex flex-col items-center gap-1 ${
                        fontSize === opt.value
                          ? "border-accent-sage bg-pastel-sage/40"
                          : "border-sand/40 bg-white/50 hover:border-accent-sage/40"
                      }`}
                    >
                      <span className={`font-display font-bold ${opt.value === "sm" ? "text-sm" : opt.value === "base" ? "text-base" : opt.value === "lg" ? "text-lg" : "text-xl"} ${fontSize === opt.value ? "text-deep-earth" : "text-muted-brown"}`}>
                        {opt.sample}
                      </span>
                      <span className="text-[10px] text-muted-brown">{opt.label}</span>
                    </button>
                  ))}
                </div>

                {/* Dyslexia-friendly font */}
                <button
                  onClick={() => setFontFamily(fontFamily === "default" ? "dyslexic" : "default")}
                  className={`w-full flex items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                    fontFamily === "dyslexic" ? "border-accent-sage bg-pastel-sage/30" : "border-sand/40 bg-white/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${fontFamily === "dyslexic" ? "bg-accent-sage" : "bg-sand/30"}`}>
                      <Type size={18} className={fontFamily === "dyslexic" ? "text-white" : "text-muted-brown"} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-deep-earth">Dyslexia-friendly font</p>
                      <p className="text-xs text-muted-brown">Wider letter spacing, heavier weighting</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors ${fontFamily === "dyslexic" ? "bg-accent-sage" : "bg-sand/50"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${fontFamily === "dyslexic" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                  </div>
                </button>

                {/* High contrast */}
                <button
                  onClick={() => setContrast(contrast === "normal" ? "high" : "normal")}
                  className={`w-full mt-3 flex items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                    contrast === "high" ? "border-accent-amber bg-pastel-amber/30" : "border-sand/40 bg-white/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${contrast === "high" ? "bg-accent-amber" : "bg-sand/30"}`}>
                      <Sun size={18} className={contrast === "high" ? "text-white" : "text-muted-brown"} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-deep-earth">High contrast</p>
                      <p className="text-xs text-muted-brown">Stronger color differentiation</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors ${contrast === "high" ? "bg-accent-amber" : "bg-sand/50"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${contrast === "high" ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                  </div>
                </button>
              </section>

              {/* Audio Narration */}
              <section>
                <div className="flex items-center gap-2 mb-3">
                  <Volume2 size={16} className="text-accent-amber-deep" />
                  <h3 className="font-display font-bold text-deep-earth text-sm uppercase tracking-wide">Audio Narration</h3>
                </div>

                <button
                  onClick={() => setNarrationEnabled(!narrationEnabled)}
                  className={`w-full flex items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                    narrationEnabled ? "border-accent-amber bg-pastel-amber/30" : "border-sand/40 bg-white/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${narrationEnabled ? "bg-accent-amber" : "bg-sand/30"}`}>
                      <Volume2 size={18} className={narrationEnabled ? "text-white" : "text-muted-brown"} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm text-deep-earth">Enable audio narration</p>
                      <p className="text-xs text-muted-brown">Read feedback aloud with a natural voice</p>
                    </div>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors ${narrationEnabled ? "bg-accent-amber" : "bg-sand/50"}`}>
                    <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${narrationEnabled ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                  </div>
                </button>

                {narrationEnabled && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4 mt-3"
                  >
                    {/* Voice Selection */}
                    <div>
                      <p className="text-xs text-muted-brown mb-2">Voice Style</p>
                      <div className="grid grid-cols-1 gap-2">
                        {VOICE_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setNarrationVoice(opt.value)}
                            className={`flex items-center justify-between rounded-xl border-2 p-3 transition-all ${
                              narrationVoice === opt.value
                                ? "border-accent-amber bg-pastel-amber/20"
                                : "border-sand/30 bg-white/40 hover:border-accent-amber/30"
                            }`}
                          >
                            <div className="text-left">
                              <p className={`font-medium text-sm ${narrationVoice === opt.value ? "text-deep-earth" : "text-muted-brown"}`}>{opt.label}</p>
                              <p className="text-[11px] text-muted-brown">{opt.desc}</p>
                            </div>
                            {narrationVoice === opt.value && (
                              <Check size={16} className="text-accent-amber-deep" />
                            )}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Speed */}
                    <div>
                      <p className="text-xs text-muted-brown mb-2">Narration Speed</p>
                      <div className="flex gap-2">
                        {SPEED_OPTIONS.map((opt) => (
                          <button
                            key={opt.value}
                            onClick={() => setNarrationSpeed(opt.value)}
                            className={`flex-1 rounded-xl border-2 py-2.5 text-sm font-medium transition-all ${
                              narrationSpeed === opt.value
                                ? "border-accent-amber bg-pastel-amber/20 text-deep-earth"
                                : "border-sand/30 bg-white/40 text-muted-brown hover:border-accent-amber/30"
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Auto-narrate */}
                    <button
                      onClick={() => setAutoNarrate(!autoNarrate)}
                      className={`w-full flex items-center justify-between rounded-xl border-2 p-3 transition-all ${
                        autoNarrate ? "border-accent-sage bg-pastel-sage/20" : "border-sand/30 bg-white/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Gauge size={16} className={autoNarrate ? "text-accent-sage" : "text-muted-brown"} />
                        <span className="text-sm text-deep-earth">Automatically read new feedback</span>
                      </div>
                      <div className={`w-11 h-6 rounded-full transition-colors ${autoNarrate ? "bg-accent-sage" : "bg-sand/50"}`}>
                        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${autoNarrate ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
                      </div>
                    </button>
                  </motion.div>
                )}
              </section>

              {/* Reset */}
              <button
                onClick={resetAll}
                className="w-full flex items-center justify-center gap-2 text-sm text-muted-brown hover:text-accent-rose transition-colors py-2"
              >
                <RotateCcw size={14} />
                Reset all settings to defaults
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
