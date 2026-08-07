import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";

export type NeuroProfile =
  | "none"
  | "adhd"
  | "autism"
  | "dyslexia"
  | "sensory"
  | "anxiety";

export type FeedbackStyle =
  | "standard"
  | "stepbystep"
  | "visual-first"
  | "concise"
  | "encouraging";

export type DetailLevel = "minimal" | "balanced" | "detailed";

export type TonePreference = "formal" | "casual" | "mixed";
export type ResponseLength = "concise" | "detailed" | "exploratory";
export type HumorPreference = "humor" | "straightforward" | "mix";
export type FeedbackDelivery = "proactive" | "onrequest" | "structured";

export interface LearningProfile {
  profile: NeuroProfile;
  feedbackStyle: FeedbackStyle;
  detailLevel: DetailLevel;
  pacingEnabled: boolean;
  positiveFirst: boolean;
  oneThingAtATime: boolean;
  plainLanguage: boolean;
  customNote: string;
  // Survey fields
  surveyCompleted: boolean;
  aboutYou: string;
  tone: TonePreference;
  responseLength: ResponseLength;
  humor: HumorPreference;
  accessibilityNote: string;
  feedbackDelivery: FeedbackDelivery;
}

interface LearningProfileContextValue extends LearningProfile {
  setProfile: (p: NeuroProfile) => void;
  setFeedbackStyle: (s: FeedbackStyle) => void;
  setDetailLevel: (d: DetailLevel) => void;
  setPacingEnabled: (b: boolean) => void;
  setPositiveFirst: (b: boolean) => void;
  setOneThingAtATime: (b: boolean) => void;
  setPlainLanguage: (b: boolean) => void;
  setCustomNote: (n: string) => void;
  applyPreset: (p: NeuroProfile) => void;
  resetAll: () => void;
  setSurveyCompleted: (b: boolean) => void;
  setAboutYou: (s: string) => void;
  setTone: (t: TonePreference) => void;
  setResponseLength: (r: ResponseLength) => void;
  setHumor: (h: HumorPreference) => void;
  setAccessibilityNote: (s: string) => void;
  setFeedbackDelivery: (f: FeedbackDelivery) => void;
}

const STORAGE_KEY = "atelier_learning_profile_v2";

const DEFAULT_PROFILE: LearningProfile = {
  profile: "none",
  feedbackStyle: "standard",
  detailLevel: "balanced",
  pacingEnabled: false,
  positiveFirst: true,
  oneThingAtATime: false,
  plainLanguage: false,
  customNote: "",
  surveyCompleted: false,
  aboutYou: "",
  tone: "mixed",
  responseLength: "detailed",
  humor: "mix",
  accessibilityNote: "",
  feedbackDelivery: "proactive",
};

const PRESETS: Record<Exclude<NeuroProfile, "none">, Partial<LearningProfile>> = {
  adhd: {
    feedbackStyle: "stepbystep",
    detailLevel: "minimal",
    pacingEnabled: true,
    oneThingAtATime: true,
    positiveFirst: true,
    plainLanguage: true,
  },
  autism: {
    feedbackStyle: "stepbystep",
    detailLevel: "detailed",
    pacingEnabled: true,
    positiveFirst: true,
    oneThingAtATime: true,
    plainLanguage: true,
  },
  dyslexia: {
    feedbackStyle: "concise",
    detailLevel: "minimal",
    pacingEnabled: false,
    positiveFirst: true,
    oneThingAtATime: true,
    plainLanguage: true,
  },
  sensory: {
    feedbackStyle: "concise",
    detailLevel: "minimal",
    pacingEnabled: false,
    positiveFirst: true,
    oneThingAtATime: true,
    plainLanguage: false,
  },
  anxiety: {
    feedbackStyle: "encouraging",
    detailLevel: "balanced",
    pacingEnabled: true,
    positiveFirst: true,
    oneThingAtATime: false,
    plainLanguage: false,
  },
};

const LearningProfileContext = createContext<LearningProfileContextValue | null>(null);

export function LearningProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<LearningProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return { ...DEFAULT_PROFILE, ...parsed };
      }
    } catch {
      // ignore
    }
    return DEFAULT_PROFILE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore
    }
  }, [state]);

  const update = useCallback(<K extends keyof LearningProfile>(key: K, value: LearningProfile[K]) => {
    setState((prev) => ({ ...prev, [key]: value }));
  }, []);

  const applyPreset = useCallback((p: NeuroProfile) => {
    setState((prev) => {
      if (p === "none") return { ...DEFAULT_PROFILE, customNote: prev.customNote };
      const preset = PRESETS[p];
      return { ...prev, ...preset, profile: p };
    });
  }, []);

  const resetAll = useCallback(() => setState(DEFAULT_PROFILE), []);

  const value: LearningProfileContextValue = {
    ...state,
    setProfile: (p) => update("profile", p),
    setFeedbackStyle: (s) => update("feedbackStyle", s),
    setDetailLevel: (d) => update("detailLevel", d),
    setPacingEnabled: (b) => update("pacingEnabled", b),
    setPositiveFirst: (b) => update("positiveFirst", b),
    setOneThingAtATime: (b) => update("oneThingAtATime", b),
    setPlainLanguage: (b) => update("plainLanguage", b),
    setCustomNote: (n) => update("customNote", n),
    applyPreset,
    resetAll,
    setSurveyCompleted: (b) => update("surveyCompleted", b),
    setAboutYou: (s) => update("aboutYou", s),
    setTone: (t) => update("tone", t),
    setResponseLength: (r) => update("responseLength", r),
    setHumor: (h) => update("humor", h),
    setAccessibilityNote: (s) => update("accessibilityNote", s),
    setFeedbackDelivery: (f) => update("feedbackDelivery", f),
  };

  return (
    <LearningProfileContext.Provider value={value}>
      {children}
    </LearningProfileContext.Provider>
  );
}

export function useLearningProfile() {
  const ctx = useContext(LearningProfileContext);
  if (!ctx) throw new Error("useLearningProfile must be used within LearningProfileProvider");
  return ctx;
}

export const PROFILE_LABELS: Record<NeuroProfile, string> = {
  none: "No specific profile",
  adhd: "ADHD",
  autism: "Autism",
  dyslexia: "Dyslexia",
  sensory: "Sensory Processing",
  anxiety: "Anxiety",
};

export const PROFILE_DESCRIPTIONS: Record<NeuroProfile, string> = {
  none: "Standard feedback delivery",
  adhd: "Short, one-at-a-time steps with clear structure and pacing",
  autism: "Detailed, explicit, literal feedback with step-by-step pacing",
  dyslexia: "Concise, plain-language feedback that is easy to read",
  sensory: "Minimal, calm feedback with reduced visual load",
  anxiety: "Warm, encouraging feedback with strengths front and center",
};

export const FEEDBACK_STYLE_LABELS: Record<FeedbackStyle, string> = {
  standard: "Standard",
  stepbystep: "Step by Step",
  "visual-first": "Visual First",
  concise: "Concise",
  encouraging: "Extra Encouraging",
};

export const DETAIL_LEVEL_LABELS: Record<DetailLevel, string> = {
  minimal: "Minimal",
  balanced: "Balanced",
  detailed: "Detailed",
};

export const TONE_LABELS: Record<TonePreference, string> = {
  formal: "Formal",
  casual: "Casual",
  mixed: "A mix of both",
};

export const RESPONSE_LENGTH_LABELS: Record<ResponseLength, string> = {
  concise: "Short & concise",
  detailed: "Detailed",
  exploratory: "Detailed & exploratory",
};

export const HUMOR_LABELS: Record<HumorPreference, string> = {
  humor: "Include humor",
  straightforward: "Straightforward",
  mix: "A mix of both",
};

export const FEEDBACK_DELIVERY_LABELS: Record<FeedbackDelivery, string> = {
  proactive: "Offer suggestions proactively",
  onrequest: "Wait for me to ask",
  structured: "Structured summaries after each topic",
};

export function buildProfilePromptString(profile: LearningProfile): string {
  const parts: string[] = [];

  // Survey-based personalization
  if (profile.surveyCompleted) {
    if (profile.aboutYou.trim()) {
      parts.push(`ABOUT THE STUDENT: ${profile.aboutYou.trim()}`);
    }
    switch (profile.tone) {
      case "formal":
        parts.push("Use a formal, professional tone.");
        break;
      case "casual":
        parts.push("Use a casual, friendly, conversational tone.");
        break;
      case "mixed":
        parts.push("Balance a professional tone with warm, conversational friendliness.");
        break;
    }
    switch (profile.responseLength) {
      case "concise":
        parts.push("Keep responses short and concise.");
        break;
      case "detailed":
        parts.push("Provide detailed, thorough responses.");
        break;
      case "exploratory":
        parts.push("Provide detailed, exploratory responses that open new creative directions.");
        break;
    }
    switch (profile.humor) {
      case "humor":
        parts.push("Include light humor and warmth where appropriate.");
        break;
      case "straightforward":
        parts.push("Be straightforward and direct — no humor needed.");
        break;
      case "mix":
        parts.push("Occasionally include light humor but stay mostly focused and substantive.");
        break;
    }
    switch (profile.feedbackDelivery) {
      case "proactive":
        parts.push("Offer suggestions proactively throughout the feedback.");
        break;
      case "onrequest":
        parts.push("Wait to offer suggestions — present observations first, then invite the student to ask for specific advice.");
        break;
      case "structured":
        parts.push("Provide a structured summary at the end of each topic before moving on.");
        break;
    }
    if (profile.accessibilityNote.trim()) {
      parts.push(`ACCESSIBILITY & NEURODIVERSITY NOTE: ${profile.accessibilityNote.trim()}`);
    }
  }

  // Neurodivergent profile presets
  switch (profile.profile) {
    case "adhd":
      parts.push("This student has ADHD. Keep feedback SHORT and structured. Use clear headings and bullet points. Put the MOST important point first. Avoid long paragraphs. Break suggestions into ONE action at a time. Use energetic, motivating language.");
      break;
    case "autism":
      parts.push("This student is autistic. Be EXPLICIT and literal — avoid metaphors, sarcasm, or implied meaning. Be precise about what specifically works well and what specifically to change. Structure feedback in clear numbered steps. Provide detailed, thorough analysis. Avoid vague phrases like 'play with it' or 'have fun with it' — say exactly what to do.");
      break;
    case "dyslexia":
      parts.push("This student has dyslexia. Use SHORT sentences and PLAIN language. Avoid complex vocabulary when a simple word works. Keep paragraphs to 2-3 sentences maximum. Use bullet points instead of long text blocks. Bold key terms so they stand out visually.");
      break;
    case "sensory":
      parts.push("This student has sensory processing differences. Keep feedback MINIMAL and calm. Use a gentle, grounding tone. Avoid overwhelming detail — give just the essentials. Prioritize 1-2 key points rather than an exhaustive list.");
      break;
    case "anxiety":
      parts.push("This student experiences anxiety. Be EXTRA warm and encouraging. Start with genuine, specific praise. Frame ALL growth areas as exciting possibilities, never as failures. Use reassuring language. Emphasize that mistakes are part of learning and that they are doing well.");
      break;
  }

  if (profile.positiveFirst && profile.profile !== "anxiety") {
    parts.push("ALWAYS start with strengths before any growth suggestions.");
  }
  if (profile.oneThingAtATime) {
    parts.push("Present only ONE growth suggestion at a time. Do not list multiple improvements together.");
  }
  if (profile.plainLanguage && profile.profile !== "dyslexia") {
    parts.push("Use plain, accessible language. Define any technical art terms you use.");
  }
  if (profile.pacingEnabled) {
    parts.push("Add a clear visual separator (---) between each major section of feedback so the student can process one section at a time.");
  }
  if (profile.detailLevel === "minimal") {
    parts.push("Keep the overall feedback brief — no more than 3 short sections.");
  } else if (profile.detailLevel === "detailed") {
    parts.push("Be thorough and comprehensive — give detailed analysis in each section.");
  }
  if (profile.customNote.trim()) {
    parts.push(`Additional student-specific guidance: ${profile.customNote.trim()}`);
  }

  return parts.join(" ");
}
