import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronRight, Check, Sparkles, Lightbulb, Heart, ArrowRight } from "lucide-react";
import { StepNavigation } from "@/components/FocusMode";

interface StepByStepFeedbackProps {
  feedback: string;
  onComplete?: () => void;
}

interface FeedbackSection {
  title: string;
  content: string;
  icon: typeof Sparkles;
  color: string;
}

function parseSections(feedback: string): FeedbackSection[] {
  const lines = feedback.split("\n");
  const sections: FeedbackSection[] = [];
  let currentTitle = "";
  let currentContent: string[] = [];

  for (const line of lines) {
    const headingMatch = line.match(/^#{1,3}\s+(.*)/);
    if (headingMatch) {
      if (currentTitle && currentContent.length > 0) {
        sections.push(buildSection(currentTitle, currentContent.join("\n").trim()));
      }
      currentTitle = headingMatch[1].trim();
      currentContent = [];
    } else {
      currentContent.push(line);
    }
  }
  if (currentTitle && currentContent.length > 0) {
    sections.push(buildSection(currentTitle, currentContent.join("\n").trim()));
  }

  if (sections.length === 0) {
    sections.push(buildSection("Your Feedback", feedback.trim()));
  }
  return sections;
}

function buildSection(title: string, content: string): FeedbackSection {
  const lower = title.toLowerCase();
  if (lower.includes("greeting") || lower.includes("welcome")) {
    return { title, content, icon: Heart, color: "from-accent-rose to-accent-coral" };
  }
  if (lower.includes("strength")) {
    return { title, content, icon: Sparkles, color: "from-accent-amber to-accent-coral" };
  }
  if (lower.includes("growth") || lower.includes("opportunit")) {
    return { title, content, icon: Lightbulb, color: "from-accent-sage to-accent-sky" };
  }
  if (lower.includes("final") || lower.includes("note") || lower.includes("closing")) {
    return { title, content, icon: Check, color: "from-accent-sky to-accent-lavender" };
  }
  return { title, content, icon: ChevronRight, color: "from-warm-taupe to-muted-brown" };
}

export default function StepByStepFeedback({ feedback, onComplete }: StepByStepFeedbackProps) {
  const sections = useMemo(() => parseSections(feedback), [feedback]);
  const [currentStep, setCurrentStep] = useState(0);
  const [completed, setCompleted] = useState(false);

  useEffect(() => {
    if (completed && onComplete) onComplete();
  }, [completed, onComplete]);

  const handleNext = () => {
    if (currentStep < sections.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setCompleted(true);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(currentStep - 1);
  };

  if (completed) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-3xl border-2 border-accent-sage/40 bg-gradient-to-br from-pastel-sage/20 to-pastel-sky/15 p-8 text-center"
      >
        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 400, damping: 15 }}
          className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-sage to-accent-sky flex items-center justify-center mx-auto mb-4 shadow-glow-sage"
        >
          <Check size={28} className="text-white" />
        </motion.div>
        <h3 className="font-display font-bold text-deep-earth text-lg mb-2">You've read all your feedback</h3>
        <p className="text-sm text-muted-brown max-w-sm mx-auto">
          Great job working through each section. Take a moment to reflect on what resonated with you.
        </p>
        <button
          onClick={() => { setCurrentStep(0); setCompleted(false); }}
          className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-accent-sage hover:text-deep-earth transition-colors"
        >
          <ArrowRight size={14} className="rotate-180" /> Review again
        </button>
      </motion.div>
    );
  }

  const section = sections[currentStep];
  if (!section) return null;
  const Icon = section.icon;

  return (
    <div className="rounded-3xl border-2 border-sand/40 bg-white/70 overflow-hidden">
      {/* Header */}
      <div className={`bg-gradient-to-r ${section.color} px-5 py-4 flex items-center gap-3`}>
        <div className="w-10 h-10 rounded-xl bg-white/25 flex items-center justify-center backdrop-blur-sm">
          <Icon size={20} className="text-white" />
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Section {currentStep + 1} of {sections.length}</p>
          <h3 className="font-display font-bold text-white text-base">{section.title}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, x: 15 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -15 }}
            transition={{ duration: 0.25 }}
            className="text-sm text-deep-earth leading-relaxed"
          >
            <FormattedContent content={section.content} />
          </motion.div>
        </AnimatePresence>

        <StepNavigation
          totalSteps={sections.length}
          currentStep={currentStep}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>
    </div>
  );
}

function FormattedContent({ content }: { content: string }) {
  const lines = content.split("\n").filter((l) => l.trim());
  return (
    <div className="space-y-3">
      {lines.map((line, i) => {
        const bulletMatch = line.match(/^[-*]\s+(.*)/);
        const boldMatch = line.match(/^\*\*(.*?)\*\*:?\s*(.*)/);

        if (bulletMatch) {
          const text = bulletMatch[1];
          const boldInBullet = text.match(/^\*\*(.*?)\*\*:?\s*(.*)/);
          return (
            <div key={i} className="flex items-start gap-2.5">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-amber mt-2 flex-shrink-0" />
              <p className="flex-1">
                {boldInBullet ? (
                  <>
                    <span className="font-semibold text-deep-earth">{boldInBullet[1]}:</span>{" "}
                    <span className="text-muted-brown">{boldInBullet[2]}</span>
                  </>
                ) : (
                  <span className="text-muted-brown">{text}</span>
                )}
              </p>
            </div>
          );
        }

        if (boldMatch) {
          return (
            <div key={i} className="bg-pastel-amber/15 rounded-xl p-3 border border-accent-amber/20">
              <span className="font-semibold text-deep-earth">{boldMatch[1]}:</span>{" "}
              <span className="text-muted-brown">{boldMatch[2]}</span>
            </div>
          );
        }

        return <p key={i} className="text-muted-brown">{line}</p>;
      })}
    </div>
  );
}
