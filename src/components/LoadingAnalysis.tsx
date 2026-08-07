import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const steps = [
  "Examining composition and structure...",
  "Analyzing color relationships and values...",
  "Evaluating technique and medium...",
  "Checking for AI-generated artifacts...",
  "Crafting personalized feedback...",
];

const WHEEL_COLORS = ["#C9A961", "#7BA08C", "#B89098", "#6B95B8", "#D9C084", "#C99B8E", "#8B9BA8"];

export default function LoadingAnalysis() {
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1400);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-16 px-8 gap-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative"
      >
        <div className="relative w-24 h-24">
          {WHEEL_COLORS.map((color, i) => (
            <motion.div
              key={i}
              className="absolute inset-0 rounded-full"
              style={{
                background: `conic-gradient(from ${i * (360 / WHEEL_COLORS.length)}deg, ${color} 0deg, ${color} ${360 / WHEEL_COLORS.length}deg, transparent ${360 / WHEEL_COLORS.length}deg)`,
                mask: "radial-gradient(transparent 36%, black 38%)",
                WebkitMask: "radial-gradient(transparent 36%, black 38%)",
              }}
              animate={{ rotate: 360 }}
              transition={{ duration: 2.5, repeat: Infinity, ease: "linear", delay: i * 0.1 }}
            />
          ))}
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            animate={{ rotate: -360 }}
            transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
          >
            <div className="w-8 h-8 rounded-full bg-cream shadow-inner-warm flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-gradient-to-br from-accent-amber to-accent-rose" />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <div className="text-center space-y-2">
        <p className="text-deep-earth font-display font-bold text-lg">Your Master Art Teacher is reviewing your work</p>
        <p className="text-muted-brown text-sm">This takes a moment — great feedback deserves careful consideration</p>
      </div>

      <div className="w-full max-w-sm space-y-2.5">
        {steps.map((step, i) => (
          <motion.div
            key={step}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: i <= activeStep ? 1 : 0.35, x: 0 }}
            transition={{ delay: i * 0.1 }}
            className="flex items-center gap-3 text-sm text-deep-earth"
          >
            <div className="w-1.5 h-1.5 rounded-full flex-shrink-0">
              {i < activeStep ? (
                <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="w-1.5 h-1.5 rounded-full bg-accent-sage" />
              ) : i === activeStep ? (
                <motion.div
                  className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-accent-amber to-accent-coral"
                  animate={{ scale: [1, 1.6, 1], opacity: [1, 0.4, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              ) : (
                <div className="w-1.5 h-1.5 rounded-full bg-warm-taupe/30" />
              )}
            </div>
            <span className={i <= activeStep ? "font-medium" : ""}>{step}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
