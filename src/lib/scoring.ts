export type SkillLevel = "beginner" | "intermediate" | "advanced" | "professional" | "master";

export const SKILL_TOKEN_MAP: Record<SkillLevel, number> = {
  beginner: 10,
  intermediate: 13,
  advanced: 16,
  professional: 19,
  master: 20,
};

export const SKILL_LABELS: Record<SkillLevel, string> = {
  beginner: "Beginner",
  intermediate: "Intermediate",
  advanced: "Advanced",
  professional: "Professional",
  master: "Master",
};

export const MEDIUM_MULTIPLIER = 1.5;
export const ANALOG_BONUS = 50;
export const EXPERIMENTATION_BONUS = 30;
export const AI_PENALTY = 15;

export interface CritiquePin {
  x: number;
  y: number;
  label: string;
  advice: string;
}

export interface AnalysisMetadata {
  skillLevel: string;
  mediumMatch: boolean;
  isAnalog: boolean;
  experimentationLevel: "high" | "medium" | "low";
  critiquePins: CritiquePin[];
}

export interface TokenBreakdownLine {
  label: string;
  amount: number;
  type: "base" | "bonus" | "multiplier" | "penalty";
}

export interface TokenCalculationResult {
  total: number;
  breakdown: TokenBreakdownLine[];
  normalizedSkill: SkillLevel;
}

function normalizeSkillLevel(raw: string): SkillLevel {
  const lower = (raw || "").toLowerCase().trim();
  if (lower in SKILL_TOKEN_MAP) return lower as SkillLevel;
  if (lower === "pro" || lower === "professional") return "professional";
  if (lower === "master" || lower === "expert") return "master";
  if (lower === "advanced") return "advanced";
  if (lower === "intermediate") return "intermediate";
  return "beginner";
}

export function calculateTokens(metadata: AnalysisMetadata): TokenCalculationResult {
  const skill = normalizeSkillLevel(metadata.skillLevel);
  const baseTokens = SKILL_TOKEN_MAP[skill];
  const breakdown: TokenBreakdownLine[] = [];
  let total = baseTokens;

  breakdown.push({
    label: `${SKILL_LABELS[skill]} skill base`,
    amount: baseTokens,
    type: "base",
  });

  if (metadata.mediumMatch) {
    const bonus = Math.round(baseTokens * (MEDIUM_MULTIPLIER - 1));
    total += bonus;
    breakdown.push({
      label: "Preferred medium match (1.5x)",
      amount: bonus,
      type: "multiplier",
    });
  }

  if (metadata.isAnalog) {
    total += ANALOG_BONUS;
    breakdown.push({
      label: "Traditional analog art bonus",
      amount: ANALOG_BONUS,
      type: "bonus",
    });
  }

  if (metadata.experimentationLevel === "high") {
    total += EXPERIMENTATION_BONUS;
    breakdown.push({
      label: "Innovator bonus (high experimentation)",
      amount: EXPERIMENTATION_BONUS,
      type: "bonus",
    });
  }

  return { total, breakdown, normalizedSkill: skill };
}
