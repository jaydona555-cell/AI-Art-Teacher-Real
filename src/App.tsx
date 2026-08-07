import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Palette, Sparkles, AlertCircle, RotateCcw, Coins, ShieldAlert, Award, Store, FlaskConical, Hand, GalleryHorizontalEnd, ImagePlus, Accessibility, Trophy, Brain, Focus, Layers, Sticker as StickerIcon } from "lucide-react";
import UploadZone from "@/components/UploadZone";
import LoadingAnalysis from "@/components/LoadingAnalysis";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import FollowupChat from "@/components/FollowupChat";
import TokenHud from "@/components/TokenHud";
import UnlockToast from "@/components/UnlockToast";
import Sticker, { STICKER_LAYOUTS } from "@/components/Stickers";
import StickerCanvas from "@/components/StickerCanvas";
import StreakTracker from "@/components/StreakTracker";
import StreakCelebration from "@/components/StreakCelebration";
import SeasonalBackground from "@/components/SeasonalBackground";
import SeasonalControl from "@/components/SeasonalControl";
import PremiumBackground from "@/components/PremiumBackground";
import TokenShop from "@/components/TokenShop";
import PreferredMediumSelector from "@/components/PreferredMediumSelector";
import MasterpieceModal from "@/components/MasterpieceModal";
import Portfolio from "@/components/Portfolio";
import CritiquePinsOverlay from "@/components/CritiquePinsOverlay";
import AccessibilityPanel from "@/components/AccessibilityPanel";
import AudioNarration from "@/components/AudioNarration";
import AchievementBadge from "@/components/AchievementBadge";
import BadgeToast from "@/components/BadgeToast";
import LearningProfileSelector from "@/components/LearningProfileSelector";
import FocusMode from "@/components/FocusMode";
import StepByStepFeedback from "@/components/StepByStepFeedback";
import SensoryCheckIn, { type Mood } from "@/components/SensoryCheckIn";
import { RewardProvider, useReward } from "@/context/RewardContext";
import { StickerPlacementProvider, useStickerPlacement } from "@/context/StickerPlacementContext";
import { SeasonProvider, useSeason } from "@/context/SeasonContext";
import { MediumProvider, useMedium, MEDIUM_API_VALUES } from "@/context/MediumContext";
import { AccessibilityProvider, useAccessibility } from "@/context/AccessibilityContext";
import { AchievementProvider, useAchievements, streakBonusTokens } from "@/context/AchievementContext";
import { LearningProfileProvider, useLearningProfile, buildProfilePromptString } from "@/context/LearningProfileContext";
import { usePortfolio } from "@/hooks/usePortfolio";
import {
  calculateTokens,
  AI_PENALTY,
  SKILL_LABELS,
  type TokenBreakdownLine,
  type SkillLevel,
  type CritiquePin,
} from "@/lib/scoring";

interface AnalysisState {
  loading: boolean;
  feedback: string | null;
  error: string | null;
  errorType: "generic" | "timeout" | "rate-limit" | null;
  aiDetected: boolean;
  skillLevel: SkillLevel | null;
  tokensAwarded: number;
  tokenBreakdown: TokenBreakdownLine[];
  critiquePins: CritiquePin[];
  savedToPortfolio: boolean;
}

interface MasterpieceState {
  open: boolean;
  loading: boolean;
  imageData: string | null;
  error: string | null;
}

const INITIAL_STATE: AnalysisState = {
  loading: false,
  feedback: null,
  error: null,
  errorType: null,
  aiDetected: false,
  skillLevel: null,
  tokensAwarded: 0,
  tokenBreakdown: [],
  critiquePins: [],
  savedToPortfolio: false,
};

const INITIAL_MASTERPIECE: MasterpieceState = {
  open: false,
  loading: false,
  imageData: null,
  error: null,
};

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

function AppContent() {
  const { tokens, unlocks, addTokens, subtractTokens, activeBackground, purchasedBackgrounds } = useReward();
  const { season } = useSeason();
  const { medium } = useMedium();
  const portfolio = usePortfolio();
  const { sensoryMode, fontSize, fontFamily, contrast } = useAccessibility();
  const { recordUpload, recordFollowup, pendingStreakMilestone, clearPendingStreakMilestone } = useAchievements();
  const learningProfile = useLearningProfile();
  const { surveyCompleted } = learningProfile;
  const [view, setView] = useState<"studio" | "gallery">("studio");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisState>(INITIAL_STATE);
  const [shopOpen, setShopOpen] = useState(false);
  const [stickerCanvasOpen, setStickerCanvasOpen] = useState(false);
  const [masterpiece, setMasterpiece] = useState<MasterpieceState>(INITIAL_MASTERPIECE);
  const [lastImageBase64, setLastImageBase64] = useState<string | null>(null);
  const [accessibilityOpen, setAccessibilityOpen] = useState(false);
  const [achievementsOpen, setAchievementsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auto-open survey on first visit
  useEffect(() => {
    if (!surveyCompleted) setProfileOpen(true);
  }, [surveyCompleted]);
  const [focusMode, setFocusMode] = useState(false);
  const [checkInShow, setCheckInShow] = useState(false);
  const [stepByStep, setStepByStep] = useState(false);

  const profilePromptString = buildProfilePromptString(learningProfile);

  // Apply accessibility classes to document body
  useEffect(() => {
    const body = document.body;
    body.classList.remove("sensory-reduced", "sensory-minimal", "font-dyslexic", "text-sm-base", "text-base-default", "text-lg-base", "text-xl-base", "contrast-high");
    if (sensoryMode === "reduced") body.classList.add("sensory-reduced");
    if (sensoryMode === "minimal") body.classList.add("sensory-minimal");
    if (fontFamily === "dyslexic") body.classList.add("font-dyslexic");
    if (fontSize === "sm") body.classList.add("text-sm-base");
    else body.classList.add("text-base-default");
    if (fontSize === "lg") body.classList.add("text-lg-base");
    if (fontSize === "xl") body.classList.add("text-xl-base");
    if (contrast === "high") body.classList.add("contrast-high");
  }, [sensoryMode, fontSize, fontFamily, contrast]);

  const handleImageSelected = useCallback((file: File) => {
    setSelectedFile(file);
    setPreview(URL.createObjectURL(file));
    setAnalysis(INITIAL_STATE);
  }, []);

  const handleClear = useCallback(() => {
    setSelectedFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setAnalysis(INITIAL_STATE);
  }, [preview]);

  const handleAnalyze = useCallback(async () => {
    if (!selectedFile) return;

    setAnalysis({ ...INITIAL_STATE, loading: true });

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        setLastImageBase64(base64);
        try {
          const apiUrl = `${API_URL}/functions/v1/analyze-artwork`;
          const response = await fetch(apiUrl, {
            method: "POST",
            headers: {
              "apikey": API_KEY,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              imageBase64: base64,
              mimeType: selectedFile.type,
              preferredMedium: MEDIUM_API_VALUES[medium],
              profilePrompt: profilePromptString,
            }),
          });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            throw new Error(data?.error || `The analysis service returned an error (${response.status})`);
          }

          if (!data) {
            throw new Error("No response received from the AI");
          }

          if (data.aiDetected) {
            subtractTokens(AI_PENALTY, "AI-generated art detected penalty");
            setAnalysis({
              loading: false,
              feedback: null,
              error: null,
              errorType: null,
              aiDetected: true,
              skillLevel: null,
              tokensAwarded: -AI_PENALTY,
              tokenBreakdown: [],
              critiquePins: [],
              savedToPortfolio: false,
            });
            return;
          }

          // ---- Parse the strict JSON response from the edge function ----
          const feedbackText = typeof data.feedback === "string" ? data.feedback.trim() : "";
          if (!feedbackText) {
            throw new Error("The AI did not return readable feedback. Please try again.");
          }

          const rawSkill = typeof data.skillLevel === "string" ? data.skillLevel : "";
          const pins: CritiquePin[] = Array.isArray(data.critiquePins) ? data.critiquePins : [];

          // ---- Advanced scoring calculation (via scoring utility) ----
          
          const { total, breakdown, normalizedSkill } = calculateTokens({
            skillLevel: rawSkill || "beginner",
            mediumMatch: data.mediumMatch === true,
            isAnalog: data.isAnalog === true,
            experimentationLevel: data.experimentationLevel || "low",
            critiquePins: pins,
          });

          // ---- Streak bonus: recordUpload computes the new streak and returns the bonus ----
          const uploadResult = recordUpload(medium, total);
          addTokens(total + uploadResult.streakBonus, `Artwork analyzed — ${normalizedSkill} level`);

          setAnalysis({
            loading: false,
            feedback: feedbackText,
            error: null,
            errorType: null,
            aiDetected: false,
            skillLevel: normalizedSkill,
            tokensAwarded: total,
            tokenBreakdown: breakdown,
            critiquePins: pins,
            savedToPortfolio: false,
          });

          // ---- Save to portfolio (cloud storage + database) ----
          if (selectedFile) {
            portfolio.addEntry({
              file: selectedFile,
              skillLevel: normalizedSkill,
              tokensEarned: total,
              feedback: feedbackText,
              critiquePins: pins,
              medium: medium,
              mediumMatch: data.mediumMatch === true,
              isAnalog: data.isAnalog === true,
              experimentationLevel: data.experimentationLevel || "low",
            }).then((saved) => {
              if (saved) setAnalysis((prev) => ({ ...prev, savedToPortfolio: true }));
            });
          }

        } catch (err) {
          const msg = err instanceof Error ? err.message : "Failed to analyze artwork";
          const errorType: AnalysisState["errorType"] =
            msg.includes("timed out") || msg.includes("timeout") ? "timeout"
            : msg.includes("busy") || msg.includes("rate") || msg.includes("429") ? "rate-limit"
            : "generic";
          setAnalysis({
            ...INITIAL_STATE,
            loading: false,
            error: msg,
            errorType,
          });
        }
      };
      reader.onerror = () => {
        setAnalysis({
          ...INITIAL_STATE,
          loading: false,
          error: "Failed to read image file",
        });
      };
      reader.readAsDataURL(selectedFile);
    } catch (err) {
      setAnalysis({
        ...INITIAL_STATE,
        loading: false,
        error: err instanceof Error ? err.message : "An unexpected error occurred",
      });
    }
  }, [selectedFile, addTokens, subtractTokens, medium]);

  const handleReset = useCallback(() => {
    handleClear();
  }, [handleClear]);

  const handleGenerateMasterpiece = useCallback(async () => {
    setMasterpiece({ open: true, loading: true, imageData: null, error: null });

    try {
      // Step 1: Analyze the last uploaded image's style
      let styleDescription = "a beautiful artistic masterpiece";
      if (lastImageBase64) {
        const styleRes = await fetch(`${API_URL}/functions/v1/analyze-artwork`, {
          method: "POST",
          headers: { "apikey": API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({ mode: "analyze-style", imageBase64: lastImageBase64 }),
        });
        const styleData = await styleRes.json().catch(() => null);
        if (styleData?.styleDescription) {
          styleDescription = styleData.styleDescription;
        }
      }

      // Step 2: Generate the masterpiece
      const genRes = await fetch(`${API_URL}/functions/v1/analyze-artwork`, {
        method: "POST",
        headers: { "apikey": API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "generate-masterpiece", styleDescription }),
      });
      const genData = await genRes.json().catch(() => null);

      if (!genRes.ok) {
        throw new Error(genData?.error || "Failed to generate masterpiece");
      }

      if (genData.imageBase64) {
        setMasterpiece({
          open: true,
          loading: false,
          imageData: `data:image/png;base64,${genData.imageBase64}`,
          error: null,
        });
      } else if (genData.imageUrl) {
        setMasterpiece({
          open: true,
          loading: false,
          imageData: genData.imageUrl,
          error: null,
        });
      } else {
        throw new Error("No image returned");
      }
    } catch (err) {
      setMasterpiece({
        open: true,
        loading: false,
        imageData: null,
        error: err instanceof Error ? err.message : "Failed to generate masterpiece",
      });
    }
  }, [lastImageBase64]);

  const hasResult = analysis.feedback !== null;
  const activeStickers = STICKER_LAYOUTS.filter((s) => unlocks.stickerPacks[s.pack]);
  const isWinter = season === "WINTER";
  const showPremiumBg = activeBackground !== null && purchasedBackgrounds.includes(activeBackground);

  return (
    <div className={`min-h-screen relative text-deep-earth transition-all duration-700 ${isWinter ? "text-cream" : ""}`}>
      {showPremiumBg && activeBackground ? (
        <PremiumBackground background={activeBackground} />
      ) : (
        <SeasonalBackground />
      )}

      <div className="relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-accent-amber/10 to-accent-coral/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-0 w-80 h-80 bg-gradient-to-br from-accent-sage/10 to-accent-sky/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-gradient-to-br from-accent-rose/10 to-accent-lavender/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <header className="relative border-b border-sand/50 backdrop-blur-md bg-cream/70 sticky top-0 z-30">
          <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent-amber via-accent-coral to-accent-rose flex items-center justify-center shadow-glow-amber">
                <Palette size={22} className="text-white" />
              </div>
              <div>
                <h1 className={`font-display text-xl font-bold leading-tight ${isWinter ? "text-cream" : "text-deep-earth"}`}>Atelier</h1>
                <p className={`text-[11px] -mt-0.5 ${isWinter ? "text-cream/60" : "text-muted-brown"}`}>Master Art Teacher</p>
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap justify-end">
              <div className="flex items-center bg-white/60 border border-sand/40 rounded-full p-1">
                <button
                  onClick={() => setView("studio")}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all ${
                    view === "studio"
                      ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-sticker"
                      : "text-muted-brown hover:text-deep-earth"
                  }`}
                >
                  <ImagePlus size={13} />
                  <span className="hidden sm:inline">Studio</span>
                </button>
                <button
                  onClick={() => setView("gallery")}
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all ${
                    view === "gallery"
                      ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-sticker"
                      : "text-muted-brown hover:text-deep-earth"
                  }`}
                >
                  <GalleryHorizontalEnd size={13} />
                  <span className="hidden sm:inline">Gallery</span>
                  {portfolio.entries.length > 0 && (
                    <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${
                      view === "gallery" ? "bg-white/25" : "bg-accent-amber/20 text-accent-amber-deep"
                    }`}>
                      {portfolio.entries.length}
                    </span>
                  )}
                </button>
              </div>
              <button
                onClick={() => setProfileOpen(true)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-2 transition-all ${
                  isWinter
                    ? "bg-white/20 text-cream hover:bg-white/30"
                    : "bg-white/60 text-deep-earth hover:bg-white/80 border border-sand/40"
                }`}
                aria-label="Set learning profile"
              >
                <Brain size={14} />
                <span className="hidden sm:inline">Profile</span>
              </button>
              <PreferredMediumSelector variant={isWinter ? "dark" : "light"} />
              <SeasonalControl />
              <button
                onClick={() => setAchievementsOpen(true)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-2 transition-all ${
                  isWinter
                    ? "bg-white/20 text-cream hover:bg-white/30"
                    : "bg-white/60 text-deep-earth hover:bg-white/80 border border-sand/40"
                }`}
                aria-label="View achievements"
              >
                <Trophy size={14} />
                <span className="hidden sm:inline">Badges</span>
              </button>
              <button
                onClick={() => setAccessibilityOpen(true)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-2 transition-all ${
                  isWinter
                    ? "bg-white/20 text-cream hover:bg-white/30"
                    : "bg-white/60 text-deep-earth hover:bg-white/80 border border-sand/40"
                }`}
                aria-label="Open accessibility settings"
              >
                <Accessibility size={14} />
                <span className="hidden sm:inline">Access</span>
              </button>
              <button
                onClick={() => setStickerCanvasOpen(true)}
                className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3.5 py-2 transition-all ${
                  isWinter
                    ? "bg-white/20 text-cream hover:bg-white/30"
                    : "bg-white/60 text-deep-earth hover:bg-white/80 border border-sand/40"
                }`}
                aria-label="Open sticker studio"
              >
                <StickerIcon size={14} />
                <span className="hidden sm:inline">Stickers</span>
              </button>
              <button
                onClick={() => setShopOpen(true)}
                className="inline-flex items-center gap-1.5 bg-gradient-to-r from-accent-amber to-accent-coral text-white text-xs font-semibold rounded-full px-3.5 py-2 shadow-card-soft hover:shadow-glow-amber transition-all"
                aria-label="Open token shop"
              >
                <Store size={14} />
                <span className="hidden sm:inline">Shop</span>
              </button>
              <TokenHud />
              <StreakTracker />
            </div>
          </div>
        </header>

        <main className="relative max-w-5xl mx-auto px-6 py-12 sm:py-16">
          {view === "gallery" ? (
            <section className="max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center mb-10"
              >
                <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pastel-sage/50 to-pastel-sky/50 border border-accent-sage/30 rounded-full px-4 py-1.5 mb-4">
                  <GalleryHorizontalEnd size={14} className="text-accent-sage" />
                  <p className="text-accent-sage text-xs font-semibold uppercase tracking-[0.15em]">
                    Master's Gallery
                  </p>
                </div>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-earth mb-3">
                  Your Artistic Journey
                </h2>
                <p className="text-muted-brown max-w-xl mx-auto">
                  Every artwork you share becomes a milestone. Trace your growth from your first strokes to your masterworks.
                </p>
              </motion.div>

              <Portfolio
                entries={portfolio.entries}
                loading={portfolio.loading}
                error={portfolio.error}
                onDelete={portfolio.deleteEntry}
              />

              <div className="text-center mt-10">
                <button
                  onClick={() => setView("studio")}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-amber to-accent-coral text-white font-semibold px-6 py-3 rounded-full shadow-card-soft hover:shadow-glow-amber transition-all"
                >
                  <ImagePlus size={16} />
                  Upload new artwork
                </button>
              </div>
            </section>
          ) : (
            <>
          {/* Hero */}
          <section className="text-center mb-12 max-w-2xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-pastel-amber/50 to-pastel-coral/50 border border-accent-amber/30 rounded-full px-4 py-1.5 mb-4"
            >
              <Sparkles size={14} className="text-accent-amber-deep" />
              <p className="text-accent-amber-deep text-xs font-semibold uppercase tracking-[0.15em]">
                AI-Powered Art Critique
              </p>
            </motion.div>
            <motion.h2
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="font-display text-4xl sm:text-5xl font-bold leading-tight mb-4"
            >
              <span className="text-deep-earth">Share your art.</span><br />
              <span className="gradient-text-sunset">Receive master-level guidance.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-muted-brown leading-relaxed max-w-xl mx-auto"
            >
              Upload a piece of your artwork and receive thoughtful, expert feedback inspired by the
              tradition of the great ateliers — celebrating your strengths and illuminating your next steps.
            </motion.p>
          </section>

          {/* Upload + Results */}
          <section className="max-w-2xl mx-auto">
            <div className="relative">
              <UploadZone
                onImageSelected={handleImageSelected}
                preview={preview}
                onClear={handleClear}
                disabled={analysis.loading}
              />
              {hasResult && analysis.critiquePins.length > 0 && preview && (
                <CritiquePinsOverlay pins={analysis.critiquePins} disabled={analysis.loading} />
              )}
            </div>

            {selectedFile && !analysis.loading && !hasResult && !analysis.aiDetected && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-5 flex flex-col items-center gap-3"
              >
                <button
                  onClick={() => {
                    if (learningProfile.profile !== "none") setCheckInShow(true);
                    else handleAnalyze();
                  }}
                  className="group inline-flex items-center gap-2.5 bg-gradient-to-r from-accent-amber via-accent-coral to-accent-rose hover:shadow-glow-amber text-white font-semibold px-7 py-3.5 rounded-full shadow-card-color transition-all duration-200"
                >
                  <Sparkles size={18} className="text-white group-hover:rotate-12 transition-transform" />
                  Receive Feedback
                </button>
                {medium !== "none" && (
                  <p className="text-xs text-muted-brown">
                    Evaluating for <span className="font-semibold text-accent-sage">{medium.replace(/-/g, " ")}</span> mastery — eligible for 1.5x token bonus
                  </p>
                )}
              </motion.div>
            )}

            <AnimatePresence mode="wait">
              {analysis.loading && (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mt-6 bg-gradient-to-br from-white/80 to-pastel-butter/30 rounded-3xl border border-accent-amber/20 shadow-card-soft"
                >
                  <LoadingAnalysis />
                </motion.div>
              )}

              {analysis.error && (
                <motion.div
                  key="error"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 bg-gradient-to-br from-pastel-rose/40 to-pastel-blush/30 border-2 border-accent-rose/30 rounded-2xl p-5 flex items-start gap-3"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-rose to-accent-rose-light flex items-center justify-center flex-shrink-0">
                    <AlertCircle size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="text-accent-rose font-semibold text-sm">
                      {analysis.errorType === "timeout" ? "The analysis timed out" : analysis.errorType === "rate-limit" ? "Service is busy" : "Couldn't complete the analysis"}
                    </p>
                    <p className="text-deep-earth/70 text-sm mt-1">{analysis.error}</p>
                    <button
                      onClick={handleAnalyze}
                      className="mt-3 inline-flex items-center gap-1.5 text-sm text-accent-rose font-medium bg-white/60 hover:bg-white rounded-full px-3 py-1.5 transition-all"
                    >
                      <RotateCcw size={13} />
                      Try again
                    </button>
                  </div>
                </motion.div>
              )}

              {analysis.aiDetected && (
                <motion.div
                  key="aidetected"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6 bg-gradient-to-br from-pastel-lavender/40 to-pastel-sky/30 border-2 border-accent-lavender/30 rounded-2xl p-6 flex flex-col items-center text-center gap-3"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-lavender to-accent-sky flex items-center justify-center shadow-glow-sage">
                    <ShieldAlert size={28} className="text-white" />
                  </div>
                  <p className="text-deep-earth font-semibold text-base">AI-Generated Art Detected</p>
                  <p className="text-muted-brown text-sm max-w-md leading-relaxed">
                    Our master teacher has examined this image and found indicators of AI generation.
                    Atelier celebrates the human creative journey, so we reserve feedback and token
                    rewards for original, human-made artwork.
                  </p>
                  <div className="flex items-center gap-2 bg-accent-rose/15 border border-accent-rose/30 rounded-full px-4 py-2">
                    <Coins size={14} className="text-accent-rose" />
                    <span className="text-xs font-bold text-accent-rose">{AI_PENALTY} tokens deducted</span>
                  </div>
                  <p className="text-xs text-muted-brown italic max-w-sm">
                    We encourage authentic creation. Please share your own hand-made art — that is where true growth happens.
                  </p>
                  <button
                    onClick={handleReset}
                    className="mt-2 inline-flex items-center gap-2 bg-gradient-to-r from-accent-sky to-accent-lavender hover:shadow-glow-sage text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all"
                  >
                    <RotateCcw size={14} />
                    Upload different artwork
                  </button>
                </motion.div>
              )}

              {hasResult && analysis.feedback && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-6"
                >
                  <div className="relative bg-white/85 backdrop-blur-sm rounded-3xl border border-accent-amber/20 shadow-card-warm overflow-visible">
                    {activeStickers.map((spec) => (
                      <Sticker key={spec.id} spec={spec} />
                    ))}

                    <div className="bg-gradient-to-r from-pastel-amber/40 via-pastel-coral/20 to-pastel-blush/30 px-6 sm:px-8 py-4 border-b border-accent-amber/20 flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-accent-amber to-accent-coral flex items-center justify-center shadow-sticker">
                          <Palette size={18} className="text-white" />
                        </div>
                        <p className="font-display text-deep-earth font-semibold">Master Teacher's Critique</p>
                      </div>
                      <button
                        onClick={handleReset}
                        className="inline-flex items-center gap-1.5 text-sm text-muted-brown hover:text-deep-earth transition-colors"
                      >
                        <RotateCcw size={14} />
                        <span className="hidden sm:inline">New critique</span>
                      </button>
                    </div>

                    <div className="px-6 sm:px-8 py-6 max-h-[500px] overflow-y-auto scroll-warm relative z-10">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <AudioNarration text={analysis.feedback} autoStart />
                        <button
                          onClick={() => setStepByStep(!stepByStep)}
                          className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium border transition-all ${
                            stepByStep
                              ? "bg-accent-sage text-white border-accent-sage"
                              : "bg-white/60 text-deep-earth border-sand/40 hover:bg-white/80"
                          }`}
                        >
                          <Layers size={12} />
                          {stepByStep ? "Reading mode on" : "Read step-by-step"}
                        </button>
                        <button
                          onClick={() => setFocusMode(true)}
                          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium bg-white/60 text-deep-earth border border-sand/40 hover:bg-white/80 transition-all"
                        >
                          <Focus size={12} />
                          Focus view
                        </button>
                      </div>
                      {stepByStep ? (
                        <StepByStepFeedback feedback={analysis.feedback} />
                      ) : (
                        <MarkdownRenderer content={analysis.feedback} />
                      )}
                    </div>

                    {analysis.skillLevel && (
                      <div className="px-6 sm:px-8 py-5 border-t border-accent-amber/20 bg-gradient-to-br from-pastel-sage/15 via-white/40 to-pastel-amber/15 relative z-10">
                        <div className="flex items-center justify-between flex-wrap gap-3 mb-3">
                          <div className="flex items-center gap-2">
                            <Award size={16} className="text-accent-sage" />
                            <span className="text-sm text-deep-earth">
                              Skill level: <span className="font-semibold gradient-text-sage">{SKILL_LABELS[analysis.skillLevel]}</span>
                            </span>
                          </div>
                          <motion.div
                            initial={{ scale: 0, rotate: -10 }}
                            animate={{ scale: 1, rotate: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 15, delay: 0.3 }}
                            className="flex items-center gap-1.5 rounded-full px-4 py-2 shadow-glow-amber bg-gradient-to-r from-accent-amber to-accent-coral"
                          >
                            <Coins size={16} className="text-white" />
                            <span className="text-sm font-bold text-white">
                              +{analysis.tokensAwarded} tokens earned
                            </span>
                          </motion.div>
                        </div>

                        {analysis.tokenBreakdown.length > 0 && (
                          <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-sand/40 shadow-card-soft p-4 space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-brown mb-1">Token Breakdown</p>
                            {analysis.tokenBreakdown.map((line, i) => {
                              const Icon = line.type === "base" ? Award
                                : line.type === "multiplier" ? Sparkles
                                : line.type === "bonus" && line.label.includes("analog") ? Hand
                                : line.type === "bonus" && line.label.includes("Innovator") ? FlaskConical
                                : Sparkles;
                              const color = line.type === "base" ? "text-deep-earth"
                                : line.type === "multiplier" ? "text-accent-amber-deep"
                                : line.type === "bonus" && line.label.includes("analog") ? "text-accent-sage"
                                : line.type === "bonus" && line.label.includes("Innovator") ? "text-accent-lavender"
                                : "text-accent-amber-deep";
                              return (
                                <motion.div
                                  key={i}
                                  initial={{ opacity: 0, x: -8 }}
                                  animate={{ opacity: 1, x: 0 }}
                                  transition={{ delay: 0.35 + i * 0.08 }}
                                  className="flex items-center justify-between"
                                >
                                  <div className="flex items-center gap-2">
                                    <Icon size={14} className={color} />
                                    <span className="text-sm text-muted-brown">{line.label}</span>
                                  </div>
                                  <span className={`text-sm font-semibold tabular-nums ${color}`}>
                                    +{line.amount}
                                  </span>
                                </motion.div>
                              );
                            })}
                            <div className="flex items-center justify-between pt-2 mt-1 border-t border-sand/40">
                              <div className="flex items-center gap-2">
                                <Coins size={16} className="text-accent-amber-deep" />
                                <span className="text-sm font-bold text-deep-earth">Total Awarded</span>
                              </div>
                              <span className="text-lg font-bold tabular-nums gradient-text-sunset">
                                +{analysis.tokensAwarded}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <FollowupChat
                    artworkContext={analysis.feedback}
                    onTokensEarned={addTokens}
                    onQuestionAsked={recordFollowup}
                    apiBase={API_URL}
                    apiKey={API_KEY}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </section>
            </>
          )}
        </main>

        <footer className="relative border-t border-sand/50 mt-8">
          <div className="max-w-5xl mx-auto px-6 py-6 text-center">
            <p className="text-warm-taupe text-xs">
              Atelier · AI Master Art Teacher · Feedback is educational guidance, not a judgment of worth.
            </p>
            <p className="text-warm-taupe/70 text-[10px] mt-1">
              {unlocks.stickerPacks.cosmic
                ? "All sticker packs unlocked — thank you for your dedication to your craft."
                : `Total tokens earned: ${tokens} · Keep creating to unlock more!`}
            </p>
          </div>
        </footer>
      </div>

      <AnimatePresence>
        <TokenShop
          key="shop"
          open={shopOpen}
          onClose={() => setShopOpen(false)}
          onGenerateMasterpiece={handleGenerateMasterpiece}
        />
      </AnimatePresence>

      <StickerCanvas
        open={stickerCanvasOpen}
        onClose={() => setStickerCanvasOpen(false)}
      />

      <MasterpieceModal
        open={masterpiece.open}
        onClose={() => setMasterpiece(INITIAL_MASTERPIECE)}
        imageData={masterpiece.imageData}
        loading={masterpiece.loading}
        error={masterpiece.error}
      />

      <UnlockToast />
      <BadgeToast />
      <StreakCelebration
        streak={pendingStreakMilestone}
        bonusTokens={pendingStreakMilestone ? streakBonusTokens(pendingStreakMilestone) : 0}
        onClose={clearPendingStreakMilestone}
      />

      <AccessibilityPanel open={accessibilityOpen} onClose={() => setAccessibilityOpen(false)} />
      <AchievementBadge open={achievementsOpen} onClose={() => setAchievementsOpen(false)} />
      <LearningProfileSelector open={profileOpen} onClose={() => setProfileOpen(false)} />

      <SensoryCheckIn
        show={checkInShow}
        onSkip={() => { setCheckInShow(false); handleAnalyze(); }}
        onDone={(_mood: Mood) => { setCheckInShow(false); handleAnalyze(); }}
      />

      <FocusMode active={focusMode} title="Focused Feedback" onClose={() => setFocusMode(false)}>
        {hasResult && analysis.feedback && (
          <div className="space-y-6">
            <AudioNarration text={analysis.feedback} />
            {stepByStep ? (
              <StepByStepFeedback feedback={analysis.feedback} />
            ) : (
              <div className="bg-white/80 rounded-2xl border border-sand/40 p-6">
                <MarkdownRenderer content={analysis.feedback} />
              </div>
            )}
          </div>
        )}
      </FocusMode>
    </div>
  );
}

export default function App() {
  return (
    <SeasonProvider>
      <MediumProvider>
        <AccessibilityProvider>
          <LearningProfileProvider>
            <AchievementProvider>
              <RewardProvider>
                <StickerPlacementProvider>
                  <AppContent />
                </StickerPlacementProvider>
              </RewardProvider>
            </AchievementProvider>
          </LearningProfileProvider>
        </AccessibilityProvider>
      </MediumProvider>
    </SeasonProvider>
  );
}
