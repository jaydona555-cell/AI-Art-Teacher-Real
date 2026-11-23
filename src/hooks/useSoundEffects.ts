import { useCallback, useRef, useEffect } from "react";
import type { SkillLevel } from "@/lib/scoring";

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    try {
      audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    } catch {
      return null;
    }
  }
  return audioCtx;
}

interface ToneOptions {
  freq: number;
  duration: number;
  startTime: number;
  volume: number;
  type?: OscillatorType;
  detune?: number;
}

function playTone(ctx: AudioContext, opts: ToneOptions) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = opts.type || "sine";
  osc.frequency.value = opts.freq;
  if (opts.detune) osc.detune.value = opts.detune;

  gain.gain.setValueAtTime(0, opts.startTime);
  gain.gain.linearRampToValueAtTime(opts.volume, opts.startTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.001, opts.startTime + opts.duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(opts.startTime);
  osc.stop(opts.startTime + opts.duration + 0.05);
}

function playNoiseBurst(ctx: AudioContext, startTime: number, duration: number, volume: number, filterFreq: number) {
  const bufferSize = ctx.sampleRate * duration;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
  }
  const source = ctx.createBufferSource();
  source.buffer = buffer;

  const filter = ctx.createBiquadFilter();
  filter.type = "bandpass";
  filter.frequency.value = filterFreq;
  filter.Q.value = 1;

  const gain = ctx.createGain();
  gain.gain.setValueAtTime(volume, startTime);
  gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

  source.connect(filter);
  filter.connect(gain);
  gain.connect(ctx.destination);
  source.start(startTime);
  source.stop(startTime + duration + 0.05);
}

// ─────────────────────────────────────────────────────────────────────────────
// Skill-tiered sound profiles
// ─────────────────────────────────────────────────────────────────────────────

const SKILL_SOUNDS: Record<SkillLevel, (ctx: AudioContext, t: number) => void> = {
  beginner: (ctx, t) => {
    playTone(ctx, { freq: 523.25, duration: 0.3, startTime: t, volume: 0.08, type: "sine" });
    playTone(ctx, { freq: 659.25, duration: 0.3, startTime: t + 0.15, volume: 0.06, type: "sine" });
  },
  intermediate: (ctx, t) => {
    playTone(ctx, { freq: 523.25, duration: 0.25, startTime: t, volume: 0.08, type: "sine" });
    playTone(ctx, { freq: 659.25, duration: 0.25, startTime: t + 0.1, volume: 0.07, type: "sine" });
    playTone(ctx, { freq: 783.99, duration: 0.35, startTime: t + 0.2, volume: 0.07, type: "sine" });
  },
  advanced: (ctx, t) => {
    playTone(ctx, { freq: 523.25, duration: 0.2, startTime: t, volume: 0.08, type: "triangle" });
    playTone(ctx, { freq: 659.25, duration: 0.2, startTime: t + 0.08, volume: 0.07, type: "triangle" });
    playTone(ctx, { freq: 783.99, duration: 0.2, startTime: t + 0.16, volume: 0.07, type: "triangle" });
    playTone(ctx, { freq: 1046.5, duration: 0.4, startTime: t + 0.24, volume: 0.08, type: "triangle" });
  },
  professional: (ctx, t) => {
    playTone(ctx, { freq: 523.25, duration: 0.15, startTime: t, volume: 0.07, type: "triangle" });
    playTone(ctx, { freq: 659.25, duration: 0.15, startTime: t + 0.06, volume: 0.06, type: "triangle" });
    playTone(ctx, { freq: 783.99, duration: 0.15, startTime: t + 0.12, volume: 0.06, type: "triangle" });
    playTone(ctx, { freq: 1046.5, duration: 0.15, startTime: t + 0.18, volume: 0.07, type: "triangle" });
    playTone(ctx, { freq: 1318.5, duration: 0.5, startTime: t + 0.24, volume: 0.08, type: "triangle" });
    playNoiseBurst(ctx, t + 0.3, 0.2, 0.03, 3000);
  },
  master: (ctx, t) => {
    // Grand ascending fanfare + applause
    const notes = [523.25, 659.25, 783.99, 1046.5, 1318.5, 1568.0];
    notes.forEach((freq, i) => {
      playTone(ctx, { freq, duration: 0.12, startTime: t + i * 0.07, volume: 0.08, type: "triangle" });
    });
    // Sustained chord
    playTone(ctx, { freq: 1046.5, duration: 1.2, startTime: t + 0.42, volume: 0.06, type: "sine" });
    playTone(ctx, { freq: 1318.5, duration: 1.2, startTime: t + 0.42, volume: 0.05, type: "sine" });
    playTone(ctx, { freq: 1568.0, duration: 1.2, startTime: t + 0.42, volume: 0.05, type: "sine" });
    // Applause — layered noise bursts
    for (let i = 0; i < 18; i++) {
      const delay = 0.5 + Math.random() * 0.8;
      const freq = 1500 + Math.random() * 3000;
      const vol = 0.02 + Math.random() * 0.03;
      playNoiseBurst(ctx, t + delay, 0.04 + Math.random() * 0.06, vol, freq);
    }
    // Final cymbal-like crash
    playNoiseBurst(ctx, t + 1.3, 0.5, 0.05, 5000);
    playTone(ctx, { freq: 2093, duration: 0.8, startTime: t + 1.3, volume: 0.04, type: "sine" });
  },
};

interface UseSoundEffectsReturn {
  playSkillSound: (skill: SkillLevel) => void;
  resumeAudio: () => void;
}

export function useSoundEffects(enabled: boolean): UseSoundEffectsReturn {
  const enabledRef = useRef(enabled);
  useEffect(() => {
    enabledRef.current = enabled;
  }, [enabled]);

  const resumeAudio = useCallback(() => {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
  }, []);

  const playSkillSound = useCallback((skill: SkillLevel) => {
    if (!enabledRef.current) return;
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    const t = ctx.currentTime + 0.1;
    SKILL_SOUNDS[skill](ctx, t);
  }, []);

  return { playSkillSound, resumeAudio };
}
