import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Volume2, Square, Pause, Play } from "lucide-react";
import { useAccessibility, getNarrationRate, type NarrationVoice } from "@/context/AccessibilityContext";

interface AudioNarrationProps {
  text: string;
  autoStart?: boolean;
}

const VOICE_PITCH: Record<NarrationVoice, number> = {
  warm: 1.0,
  clear: 1.1,
  calm: 0.9,
};

function pickVoice(voices: SpeechSynthesisVoice[], preferred: NarrationVoice): SpeechSynthesisVoice | null {
  if (voices.length === 0) return null;
  const en = voices.filter((v) => v.lang.startsWith("en"));
  if (en.length === 0) return voices[0];

  const preferFemale = preferred === "warm" || preferred === "calm";
  const preferMale = preferred === "clear";

  if (preferFemale) {
    const match = en.find((v) => /female|samantha|victoria|karen|moira|tessa/i.test(v.name));
    if (match) return match;
  }
  if (preferMale) {
    const match = en.find((v) => /male|daniel|alex|fred|arthur/i.test(v.name));
    if (match) return match;
  }
  return en[0];
}

export default function AudioNarration({ text, autoStart }: AudioNarrationProps) {
  const { narrationEnabled, narrationSpeed, narrationVoice, autoNarrate } = useAccessibility();
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [supported, setSupported] = useState(true);
  const utterRef = useRef<SpeechSynthesisUtterance | null>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      setSupported(false);
    }
  }, []);

  const cleanText = useCallback((raw: string): string => {
    return raw
      .replace(/^#+\s*/gm, "")
      .replace(/\*\*(.*?)\*\*/g, "$1")
      .replace(/\*(.*?)\*/g, "$1")
      .replace(/\[(.*?)\]\(.*?\)/g, "$1")
      .replace(/^[-*]\s+/gm, "")
      .replace(/^>\s+/gm, "")
      .replace(/`{1,3}/g, "")
      .replace(/\n{2,}/g, ". ")
      .replace(/\n/g, " ")
      .trim();
  }, []);

  const stop = useCallback(() => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
  }, []);

  const play = useCallback(() => {
    if (!supported || !text) return;
    window.speechSynthesis.cancel();

    const utter = new SpeechSynthesisUtterance(cleanText(text));
    utter.rate = getNarrationRate(narrationSpeed);
    utter.pitch = VOICE_PITCH[narrationVoice];
    utter.volume = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const voice = pickVoice(voices, narrationVoice);
    if (voice) utter.voice = voice;

    utter.onstart = () => { setIsPlaying(true); setIsPaused(false); };
    utter.onend = () => { setIsPlaying(false); setIsPaused(false); };
    utter.onerror = () => { setIsPlaying(false); setIsPaused(false); };

    utterRef.current = utter;
    window.speechSynthesis.speak(utter);
  }, [supported, text, narrationSpeed, narrationVoice, cleanText]);

  const togglePause = useCallback(() => {
    if (!supported) return;
    if (isPaused) {
      window.speechSynthesis.resume();
      setIsPaused(false);
    } else {
      window.speechSynthesis.pause();
      setIsPaused(true);
    }
  }, [supported, isPaused]);

  // Auto-narrate when new feedback arrives
  useEffect(() => {
    if (autoStart && autoNarrate && narrationEnabled && supported && text) {
      const timer = setTimeout(() => play(), 800);
      return () => clearTimeout(timer);
    }
  }, [autoStart, autoNarrate, narrationEnabled, supported, text, play]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!narrationEnabled || !supported || !text) return null;

  return (
    <div className="flex items-center gap-2 bg-gradient-to-r from-pastel-amber/30 to-pastel-coral/20 rounded-full pl-2 pr-3 py-1.5 border border-accent-amber/20">
      <div className="w-7 h-7 rounded-full bg-gradient-to-br from-accent-amber to-accent-coral flex items-center justify-center flex-shrink-0">
        <Volume2 size={14} className="text-white" />
      </div>
      {!isPlaying ? (
        <button
          onClick={play}
          className="flex items-center gap-1.5 text-xs font-medium text-deep-earth hover:text-accent-amber-deep transition-colors"
        >
          <Play size={12} />
          Listen to feedback
        </button>
      ) : (
        <>
          <button
            onClick={togglePause}
            className="flex items-center gap-1.5 text-xs font-medium text-deep-earth hover:text-accent-amber-deep transition-colors"
          >
            {isPaused ? <Play size={12} /> : <Pause size={12} />}
            {isPaused ? "Resume" : "Pause"}
          </button>
          <button
            onClick={stop}
            className="flex items-center gap-1 text-xs font-medium text-muted-brown hover:text-accent-rose transition-colors"
          >
            <Square size={11} />
          </button>
          <AnimatePresence>
            {!isPaused && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-end gap-0.5 h-3"
              >
                {[0, 1, 2].map((i) => (
                  <motion.div
                    key={i}
                    className="w-0.5 bg-accent-amber rounded-full"
                    animate={{ height: [4, 10, 4] }}
                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
