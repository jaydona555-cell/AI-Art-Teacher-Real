import { motion, AnimatePresence } from "framer-motion";
import {
  Brain, X, Zap, Eye, Type, Heart, Check, RotateCcw,
  BookOpen, Gauge, MessageSquare, ArrowRight, ArrowLeft, Sparkles,
  User, Settings, Accessibility, MessageCircle,
} from "lucide-react";
import { useState } from "react";
import {
  useLearningProfile,
  PROFILE_LABELS,
  PROFILE_DESCRIPTIONS,
  FEEDBACK_STYLE_LABELS,
  DETAIL_LEVEL_LABELS,
  TONE_LABELS,
  RESPONSE_LENGTH_LABELS,
  HUMOR_LABELS,
  FEEDBACK_DELIVERY_LABELS,
  type NeuroProfile,
  type FeedbackStyle,
  type DetailLevel,
  type TonePreference,
  type ResponseLength,
  type HumorPreference,
  type FeedbackDelivery,
} from "@/context/LearningProfileContext";

interface LearningProfileSelectorProps {
  open: boolean;
  onClose: () => void;
}

const PROFILE_ICONS: Record<NeuroProfile, typeof Brain> = {
  none: BookOpen,
  adhd: Zap,
  autism: Brain,
  dyslexia: Type,
  sensory: Eye,
  anxiety: Heart,
};

const PROFILE_COLORS: Record<NeuroProfile, string> = {
  none: "from-warm-taupe to-muted-brown",
  adhd: "from-accent-amber to-accent-coral",
  autism: "from-accent-sky to-accent-lavender",
  dyslexia: "from-accent-sage to-pastel-sage-dark",
  sensory: "from-accent-mint to-accent-sage",
  anxiety: "from-accent-rose to-accent-coral",
};

const PROFILES: NeuroProfile[] = ["none", "adhd", "autism", "dyslexia", "sensory", "anxiety"];

export default function LearningProfileSelector({ open, onClose }: LearningProfileSelectorProps) {
  const {
    profile, feedbackStyle, detailLevel, pacingEnabled, positiveFirst,
    oneThingAtATime, plainLanguage, customNote,
    aboutYou, tone, responseLength, humor, accessibilityNote, feedbackDelivery,
    applyPreset, setFeedbackStyle, setDetailLevel,
    setPacingEnabled, setPositiveFirst, setOneThingAtATime, setPlainLanguage,
    setCustomNote, resetAll,
    setSurveyCompleted, setAboutYou, setTone, setResponseLength, setHumor,
    setAccessibilityNote, setFeedbackDelivery,
  } = useLearningProfile();

  // 0-3: survey steps, 4: neuro profile, 5: customization, 6: custom note
  const TOTAL_STEPS = 7;
  const [step, setStep] = useState(0);

  const handleClose = () => {
    setStep(0);
    onClose();
  };

  const handleSave = () => {
    setSurveyCompleted(true);
    handleClose();
  };

  const handleReset = () => {
    resetAll();
    setStep(0);
  };

  const canProceed = () => {
    if (step === 0) return aboutYou.trim().length > 0;
    return true;
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-deep-earth/50 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-2xl max-h-[88vh] overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-pastel-sky/40 via-pastel-lavender/30 to-pastel-sage/30 px-6 py-5 border-b border-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-sky to-accent-lavender flex items-center justify-center shadow-sticker">
                  <Brain size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-deep-earth">Your Learning Profile</h2>
                  <p className="text-xs text-muted-brown">
                    {step < 4 ? "Let's get to know each other" : "Fine-tune your feedback delivery"}
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="w-9 h-9 rounded-full bg-white/60 hover:bg-white flex items-center justify-center transition-colors"
                aria-label="Close"
              >
                <X size={18} className="text-deep-earth" />
              </button>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 py-3 bg-white/30">
              {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    i === step ? "w-6 bg-accent-sky" : i < step ? "w-1.5 bg-accent-sage" : "w-1.5 bg-sand/50"
                  }`}
                />
              ))}
            </div>

            <div className="overflow-y-auto scroll-warm p-6">
              {/* Step 0: About You */}
              {step === 0 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <StepHeader icon={User} title="Step 1 — About You" />
                  <p className="text-sm text-muted-brown leading-relaxed">
                    Welcome! Before we begin, I'd love to get to know you so I can make our conversations
                    as helpful, comfortable, and engaging as possible.
                  </p>
                  <p className="text-sm text-muted-brown">
                    Please share a short description of yourself — your interests, communication style,
                    and anything you'd like me to know about your personality.
                  </p>
                  <textarea
                    value={aboutYou}
                    onChange={(e) => setAboutYou(e.target.value)}
                    placeholder="e.g., I'm Alex, a passionate beginner who loves watercolor landscapes. I enjoy hiking and find inspiration in nature. I'm particularly interested in learning color theory and brush techniques..."
                    rows={5}
                    className="w-full rounded-2xl border-2 border-sand/40 bg-white/60 p-4 text-sm text-deep-earth placeholder:text-warm-taupe/60 outline-none focus:border-accent-sky/50 transition-colors resize-none"
                  />
                  <div className="bg-pastel-amber/15 border border-accent-amber/20 rounded-xl px-4 py-3">
                    <p className="text-xs text-muted-brown italic">
                      The more detail you share, the better I can tailor feedback to you. There's no wrong answer here.
                    </p>
                  </div>
                  <NavButtons
                    onNext={() => setStep(1)}
                    nextDisabled={!canProceed()}
                  />
                </motion.div>
              )}

              {/* Step 1: Preferences */}
              {step === 1 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <StepHeader icon={Settings} title="Step 2 — Preferences" />
                  <p className="text-sm text-muted-brown">
                    Tell me how you'd like me to interact with you.
                  </p>

                  <ChoiceGroup
                    label="Tone"
                    options={(Object.keys(TONE_LABELS) as TonePreference[])}
                    labels={TONE_LABELS}
                    value={tone}
                    onChange={(v) => setTone(v)}
                  />

                  <ChoiceGroup
                    label="Response length"
                    options={(Object.keys(RESPONSE_LENGTH_LABELS) as ResponseLength[])}
                    labels={RESPONSE_LENGTH_LABELS}
                    value={responseLength}
                    onChange={(v) => setResponseLength(v)}
                  />

                  <ChoiceGroup
                    label="Humor & style"
                    options={(Object.keys(HUMOR_LABELS) as HumorPreference[])}
                    labels={HUMOR_LABELS}
                    value={humor}
                    onChange={(v) => setHumor(v)}
                  />

                  <NavButtons onBack={() => setStep(0)} onNext={() => setStep(2)} />
                </motion.div>
              )}

              {/* Step 2: Accessibility & Neurodiversity */}
              {step === 2 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <StepHeader icon={Accessibility} title="Step 3 — Accessibility & Neurodiversity" />
                  <p className="text-sm text-muted-brown leading-relaxed">
                    If you are neurodiverse or have specific communication needs, you can let me know here.
                    I can adjust pacing, clarity, sensory load, and feedback style to suit you.
                  </p>
                  <textarea
                    value={accessibilityNote}
                    onChange={(e) => setAccessibilityNote(e.target.value)}
                    placeholder="e.g., I'm autistic and prefer very explicit, literal feedback. I get overwhelmed by too many suggestions at once, so one at a time helps. I also have dyslexia, so shorter sentences are easier..."
                    rows={5}
                    className="w-full rounded-2xl border-2 border-sand/40 bg-white/60 p-4 text-sm text-deep-earth placeholder:text-warm-taupe/60 outline-none focus:border-accent-sky/50 transition-colors resize-none"
                  />
                  <p className="text-xs text-muted-brown italic">
                    This is completely optional — share only what you're comfortable with.
                  </p>
                  <NavButtons onBack={() => setStep(1)} onNext={() => setStep(3)} />
                </motion.div>
              )}

              {/* Step 3: Feedback Style */}
              {step === 3 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <StepHeader icon={MessageCircle} title="Step 4 — Feedback Style" />
                  <p className="text-sm text-muted-brown">How would you like feedback delivered?</p>

                  <ChoiceGroup
                    label="Feedback delivery"
                    options={(Object.keys(FEEDBACK_DELIVERY_LABELS) as FeedbackDelivery[])}
                    labels={FEEDBACK_DELIVERY_LABELS}
                    value={feedbackDelivery}
                    onChange={(v) => setFeedbackDelivery(v)}
                    vertical
                  />

                  <NavButtons onBack={() => setStep(2)} onNext={() => setStep(4)} />
                </motion.div>
              )}

              {/* Step 4: Neurodivergent profile selection */}
              {step === 4 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
                  <StepHeader icon={Brain} title="Neurodivergent Profile" />
                  <p className="text-sm text-muted-brown text-center mb-2">
                    Choose a profile preset to auto-configure feedback delivery. You can fine-tune next,
                    or skip this entirely.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {PROFILES.map((p) => {
                      const Icon = PROFILE_ICONS[p];
                      const active = profile === p;
                      return (
                        <button
                          key={p}
                          onClick={() => applyPreset(p)}
                          className={`text-left rounded-2xl border-2 p-4 transition-all ${
                            active
                              ? "border-accent-sky bg-pastel-sky/30 shadow-glow-sage"
                              : "border-sand/40 bg-white/50 hover:border-accent-sky/40"
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-1.5">
                            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${PROFILE_COLORS[p]} flex items-center justify-center shadow-sticker`}>
                              <Icon size={18} className="text-white" />
                            </div>
                            <span className={`font-semibold text-sm ${active ? "text-deep-earth" : "text-muted-brown"}`}>
                              {PROFILE_LABELS[p]}
                            </span>
                            {active && <Check size={16} className="text-accent-sky ml-auto" />}
                          </div>
                          <p className="text-xs text-muted-brown leading-relaxed">{PROFILE_DESCRIPTIONS[p]}</p>
                        </button>
                      );
                    })}
                  </div>
                  <NavButtons onBack={() => setStep(3)} onNext={() => setStep(5)} />
                </motion.div>
              )}

              {/* Step 5: Customization */}
              {step === 5 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <StepHeader icon={Gauge} title="Fine-tune Delivery" />

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MessageSquare size={15} className="text-accent-amber-deep" />
                      <p className="text-xs font-semibold text-muted-brown uppercase tracking-wide">Feedback Style</p>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {(Object.keys(FEEDBACK_STYLE_LABELS) as FeedbackStyle[]).map((s) => (
                        <button
                          key={s}
                          onClick={() => setFeedbackStyle(s)}
                          className={`rounded-xl border-2 py-2.5 text-xs font-medium transition-all ${
                            feedbackStyle === s
                              ? "border-accent-amber bg-pastel-amber/30 text-deep-earth"
                              : "border-sand/40 bg-white/50 text-muted-brown hover:border-accent-amber/30"
                          }`}
                        >
                          {FEEDBACK_STYLE_LABELS[s]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Gauge size={15} className="text-accent-sage" />
                      <p className="text-xs font-semibold text-muted-brown uppercase tracking-wide">Detail Level</p>
                    </div>
                    <div className="flex gap-2">
                      {(Object.keys(DETAIL_LEVEL_LABELS) as DetailLevel[]).map((d) => (
                        <button
                          key={d}
                          onClick={() => setDetailLevel(d)}
                          className={`flex-1 rounded-xl border-2 py-2.5 text-xs font-medium transition-all ${
                            detailLevel === d
                              ? "border-accent-sage bg-pastel-sage/30 text-deep-earth"
                              : "border-sand/40 bg-white/50 text-muted-brown hover:border-accent-sage/30"
                          }`}
                        >
                          {DETAIL_LEVEL_LABELS[d]}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2.5">
                    <ToggleRow label="Pacing separators" desc="Visual breaks between sections so you can process one part at a time" value={pacingEnabled} onChange={setPacingEnabled} />
                    <ToggleRow label="Strengths first" desc="Always start with what works well before any growth areas" value={positiveFirst} onChange={setPositiveFirst} />
                    <ToggleRow label="One thing at a time" desc="Present only one growth suggestion at a time" value={oneThingAtATime} onChange={setOneThingAtATime} />
                    <ToggleRow label="Plain language" desc="Define technical art terms and use simple vocabulary" value={plainLanguage} onChange={setPlainLanguage} />
                  </div>

                  <NavButtons onBack={() => setStep(4)} onNext={() => setStep(6)} />
                </motion.div>
              )}

              {/* Step 6: Custom note + summary */}
              {step === 6 && (
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                  <StepHeader icon={Sparkles} title="Anything else?" />

                  <div>
                    <p className="text-xs text-muted-brown mb-3">
                      Share any specific preferences, sensitivities, or needs that weren't covered. This helps your AI teacher personalize feedback just for you.
                    </p>
                    <textarea
                      value={customNote}
                      onChange={(e) => setCustomNote(e.target.value)}
                      placeholder="e.g., I prefer very specific step-by-step instructions, or I like knowing the historical context behind techniques..."
                      rows={4}
                      className="w-full rounded-2xl border-2 border-sand/40 bg-white/60 p-4 text-sm text-deep-earth placeholder:text-warm-taupe/60 outline-none focus:border-accent-sky/50 transition-colors resize-none"
                    />
                  </div>

                  {/* Summary */}
                  <div className="bg-gradient-to-br from-pastel-sky/20 to-pastel-sage/15 rounded-2xl border border-accent-sky/20 p-4">
                    <p className="text-xs font-semibold text-muted-brown uppercase tracking-wide mb-3">Your Profile Summary</p>
                    <div className="space-y-2 text-sm text-deep-earth">
                      <SummaryRow label="Profile" value={PROFILE_LABELS[profile]} />
                      <SummaryRow label="Tone" value={TONE_LABELS[tone]} />
                      <SummaryRow label="Length" value={RESPONSE_LENGTH_LABELS[responseLength]} />
                      <SummaryRow label="Humor" value={HUMOR_LABELS[humor]} />
                      <SummaryRow label="Delivery" value={FEEDBACK_DELIVERY_LABELS[feedbackDelivery]} />
                      <SummaryRow label="Style" value={FEEDBACK_STYLE_LABELS[feedbackStyle]} />
                      <SummaryRow label="Detail" value={DETAIL_LEVEL_LABELS[detailLevel]} />
                      <p className="text-xs text-muted-brown pt-1">
                        Pacing: <span className="font-semibold">{pacingEnabled ? "On" : "Off"}</span> · Strengths first: <span className="font-semibold">{positiveFirst ? "On" : "Off"}</span> · One at a time: <span className="font-semibold">{oneThingAtATime ? "On" : "Off"}</span> · Plain language: <span className="font-semibold">{plainLanguage ? "On" : "Off"}</span>
                      </p>
                      {aboutYou.trim() && (
                        <p className="text-xs text-muted-brown pt-2 border-t border-sand/30 mt-2">
                          About you: <span className="italic">{aboutYou.slice(0, 80)}{aboutYou.length > 80 ? "..." : ""}</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-between pt-2">
                    <button
                      onClick={() => setStep(5)}
                      className="inline-flex items-center gap-1.5 text-sm text-muted-brown hover:text-deep-earth font-medium transition-colors"
                    >
                      <ArrowLeft size={14} /> Back
                    </button>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-brown hover:text-accent-rose font-medium transition-colors"
                      >
                        <RotateCcw size={13} /> Reset
                      </button>
                      <button
                        onClick={handleSave}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-accent-sage to-accent-sky rounded-full px-5 py-2.5 hover:shadow-glow-sage transition-all"
                      >
                        <Check size={14} /> Save Profile
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function StepHeader({ icon: Icon, title }: { icon: typeof User; title: string }) {
  return (
    <div className="flex items-center gap-2.5 mb-1">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-sky to-accent-lavender flex items-center justify-center shadow-sticker">
        <Icon size={16} className="text-white" />
      </div>
      <h3 className="font-display font-bold text-deep-earth text-base">{title}</h3>
    </div>
  );
}

function NavButtons({ onBack, onNext, nextDisabled }: { onBack?: () => void; onNext: () => void; nextDisabled?: boolean }) {
  return (
    <div className="flex justify-between pt-2">
      {onBack ? (
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-sm text-muted-brown hover:text-deep-earth font-medium transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
      ) : <span />}
      <button
        onClick={onNext}
        disabled={nextDisabled}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-gradient-to-r from-accent-sky to-accent-lavender rounded-full px-5 py-2.5 hover:shadow-glow-sage transition-all disabled:opacity-40 disabled:cursor-not-allowed"
      >
        Continue <ArrowRight size={14} />
      </button>
    </div>
  );
}

function ChoiceGroup<T extends string>({
  label,
  options,
  labels,
  value,
  onChange,
  vertical,
}: {
  label: string;
  options: T[];
  labels: Record<T, string>;
  value: T;
  onChange: (v: T) => void;
  vertical?: boolean;
}) {
  return (
    <div>
      <p className="text-xs font-semibold text-muted-brown uppercase tracking-wide mb-2">{label}</p>
      <div className={vertical ? "flex flex-col gap-2" : "grid grid-cols-1 sm:grid-cols-3 gap-2"}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`rounded-xl border-2 py-2.5 px-4 text-xs font-medium transition-all text-left ${
              value === opt
                ? "border-accent-sky bg-pastel-sky/30 text-deep-earth"
                : "border-sand/40 bg-white/50 text-muted-brown hover:border-accent-sky/30"
            }`}
          >
            {labels[opt]}
          </button>
        ))}
      </div>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <p className="text-sm">
      <span className="text-muted-brown">{label}: </span>
      <span className="font-semibold">{value}</span>
    </p>
  );
}

function ToggleRow({ label, desc, value, onChange }: {
  label: string;
  desc: string;
  value: boolean;
  onChange: (b: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={`w-full flex items-center justify-between rounded-xl border-2 p-3 transition-all text-left ${
        value ? "border-accent-sage/50 bg-pastel-sage/15" : "border-sand/40 bg-white/40"
      }`}
    >
      <div className="flex-1 min-w-0 pr-3">
        <p className="text-sm font-medium text-deep-earth">{label}</p>
        <p className="text-xs text-muted-brown mt-0.5">{desc}</p>
      </div>
      <div className={`flex-shrink-0 w-11 h-6 rounded-full transition-colors ${value ? "bg-accent-sage" : "bg-sand/50"}`}>
        <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${value ? "translate-x-5" : "translate-x-0.5"} mt-0.5`} />
      </div>
    </button>
  );
}
