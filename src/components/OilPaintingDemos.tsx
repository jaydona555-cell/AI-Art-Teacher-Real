import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brush,
  Play,
  Youtube,
  Loader2,
  AlertCircle,
  Clock,
  Signal,
  Sparkles,
  BookOpen,
  ExternalLink,
  Palette,
  Layers,
  Droplet,
  Wind,
  Flame,
  Pencil,
  PenTool,
  Cloud,
  Eraser,
  Sun,
  Send,
  MessageCircle,
  Target,
  CheckCircle2,
  AlertTriangle,
  Dumbbell,
  User,
  ChevronDown,
  ChevronRight,
  GraduationCap,
  Camera,
  Award,
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import GuidedPractice from "@/components/GuidedPractice";
import { useLessonProgress } from "@/hooks/useLessonProgress";

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface YoutubeVideo {
  id: string;
  title: string;
  channel: string;
  url: string;
}

interface LessonData {
  title: string;
  difficulty: string;
  estimatedTime: string;
  overview: string;
  learningObjectives: string[];
  materials: Array<{ name: string; purpose: string; notes?: string }>;
  steps: Array<{ title: string; instruction: string; tip?: string }>;
  commonMistakes: Array<{ mistake: string; fix: string }>;
  exercises: Array<{ name: string; description: string; duration?: string }>;
  masterReferences: string[];
  mediumName: string;
  techniqueName: string;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Technique {
  id: string;
  name: string;
  icon: typeof Brush;
  description: string;
  color: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  youtubeVideos: YoutubeVideo[];
}

interface Medium {
  id: string;
  name: string;
  icon: typeof Brush;
  color: string;
  techniques: Technique[];
}

const MEDIUMS: Medium[] = [
  {
    id: "oil",
    name: "Oil Painting",
    icon: Palette,
    color: "from-accent-amber to-accent-coral",
    techniques: [
      { id: "alla-prima", name: "Alla Prima", icon: Flame, description: "Wet-on-wet painting completed in a single session. Bold, direct, and spontaneous.", color: "from-accent-amber to-accent-coral", difficulty: "Beginner", youtubeVideos: [
        { id: "o1", title: "Alla Prima Painting Tutorial - 5 Easy Steps to GET STARTED", channel: "Painting Lessons", url: "https://www.youtube.com/watch?v=Os9tef7ALoA" },
        { id: "o2", title: "How To Begin An Oil Painting, Alla Prima + Color Mixing (Zorn Palette)", channel: "Academy Oversight", url: "https://www.youtube.com/watch?v=flp38wjNKCk" },
        { id: "o3", title: "Alla Prima Painting Explained (How to Paint Realistically in One Sitting)", channel: "Draw Mix Paint", url: "https://www.youtube.com/watch?v=KYLgSbiD0IE" },
      ]},
      { id: "glazing", name: "Glazing", icon: Droplet, description: "Transparent color layers built over a dry underpainting for luminous, deep color.", color: "from-accent-sky to-accent-lavender", difficulty: "Intermediate", youtubeVideos: [
        { id: "o4", title: "Understanding Glazing with Oil Painting (Grisaille)", channel: "Oil Painting Tutorials", url: "https://www.youtube.com/watch?v=608EZDwDOOk" },
        { id: "o5", title: "GLAZING and SCUMBLING Oil Painting Techniques", channel: "Art Lessons", url: "https://www.youtube.com/watch?v=5aTqs8MNVfE" },
      ]},
      { id: "underpainting", name: "Underpainting & Grisaille", icon: Layers, description: "A monochrome value foundation that establishes form and light before color.", color: "from-accent-sage to-accent-sky", difficulty: "Beginner", youtubeVideos: [
        { id: "o6", title: "Oil Painting - Grisaille Underpainting", channel: "Old Masters Academy", url: "https://www.youtube.com/watch?v=CAF5zyj2NHg" },
        { id: "o7", title: "GRISAILLE - Oil Painting Tutorial with Step by Step Demonstration", channel: "Art with Barry", url: "https://www.youtube.com/watch?v=hoCpj0vwmHU" },
        { id: "o8", title: "Oil Painting Tutorial | Grisaille Techniques - Portrait Study", channel: "Artist Chronicle", url: "https://www.youtube.com/watch?v=pwsiH10accI" },
      ]},
      { id: "impasto", name: "Impasto", icon: Palette, description: "Thick, textured paint applied with brush or palette knife for bold, dimensional marks.", color: "from-accent-rose to-accent-coral", difficulty: "Intermediate", youtubeVideos: [
        { id: "o9", title: "GLAZING vs ALLA PRIMA: Which technique to learn first?", channel: "Atelier Vlog", url: "https://www.youtube.com/watch?v=wngIKAWuc_g" },
      ]},
      { id: "scumbling", name: "Scumbling", icon: Wind, description: "Dry, opaque paint dragged over dried layers to create broken, textured color effects.", color: "from-accent-lavender to-accent-sky", difficulty: "Advanced", youtubeVideos: [
        { id: "o10", title: "Glazing and Scumbling (Oil and Acrylic) - Playlist", channel: "Art Lessons", url: "https://www.youtube.com/playlist?list=PLXFNfq2bbvreAqBxwuqHowkvXlieZyHhC" },
      ]},
      { id: "fat-over-lean", name: "Fat-over-Lean", icon: Brush, description: "Progressive oil content layering rule that ensures proper drying and prevents cracking.", color: "from-accent-amber-deep to-accent-sage", difficulty: "Advanced", youtubeVideos: [
        { id: "o12", title: "How To Begin An Oil Painting - Imprimatura & Underpainting", channel: "Academy Oversight", url: "https://www.youtube.com/watch?v=flp38wjNKCk" },
      ]},
    ],
  },
  {
    id: "watercolor",
    name: "Watercolor",
    icon: Droplet,
    color: "from-accent-sky to-accent-lavender",
    techniques: [
      { id: "wet-on-wet", name: "Wet-on-Wet", icon: Cloud, description: "Applying wet paint to pre-soaked paper for soft, flowing, unpredictable edges.", color: "from-accent-sky to-accent-lavender", difficulty: "Beginner", youtubeVideos: [
        { id: "w1", title: "The Ultimate Wet-on-Wet Guide: 12 Techniques Every Watercolorist Should Know", channel: "Watercolor Tutorials", url: "https://www.youtube.com/watch?v=lOBINzjnLyI" },
        { id: "w2", title: "5 Easy & Essential Watercolor Techniques For Beginners", channel: "Art with Jane", url: "https://www.youtube.com/watch?v=aOSaQ50xeAM" },
        { id: "w3", title: "Wet on Wet vs. Wet on Dry Watercolor Technique", channel: "Watercolor West", url: "https://www.youtube.com/watch?v=viw12by3cpE" },
      ]},
      { id: "glazing", name: "Glazing & Layering", icon: Layers, description: "Transparent washes built up over dry layers for depth and luminous color.", color: "from-accent-sage to-accent-sky", difficulty: "Intermediate", youtubeVideos: [
        { id: "w4", title: "Watercolor Washes vs Glazes - Explained!", channel: "Watercolor for Beginners", url: "https://www.youtube.com/watch?v=GCy1jFe8f50" },
      ]},
      { id: "dry-brush", name: "Dry Brush", icon: Wind, description: "Minimal water on textured paper for broken, textured strokes and atmospheric effects.", color: "from-accent-amber to-accent-sage", difficulty: "Intermediate", youtubeVideos: [
        { id: "w5", title: "PERFECT DRY BRUSH EVERY TIME! Watercolor Landscape Painting Technique", channel: "Peter Sheeler", url: "https://www.youtube.com/watch?v=QiRdCyzf7H8" },
        { id: "w6", title: "Complete Guide to Dry Brush Technique | Watercolor Tutorial", channel: "Watercolor Academy", url: "https://www.youtube.com/watch?v=Y3f-ANngvC4" },
      ]},
      { id: "flat-wash", name: "Flat Wash", icon: Droplet, description: "Even, uniform color application across the paper — the foundational watercolor skill.", color: "from-accent-sky to-accent-sage", difficulty: "Beginner", youtubeVideos: [
        { id: "w7", title: "Watercolor Washes vs Glazes - Explained!", channel: "Watercolor for Beginners", url: "https://www.youtube.com/watch?v=GCy1jFe8f50" },
      ]},
      { id: "variegated-wash", name: "Variegated Wash", icon: Palette, description: "Blending two or more colors in a single wet wash for seamless gradient transitions.", color: "from-accent-lavender to-accent-rose", difficulty: "Intermediate", youtubeVideos: [
        { id: "w8", title: "WATERCOLOR TUTORIAL - Wet on Dry Techniques // Part One", channel: "Watercolor Tutorials", url: "https://www.youtube.com/watch?v=338aXj4Bqgs" },
      ]},
      { id: "lifting", name: "Lifting & Reserving", icon: Eraser, description: "Removing or protecting white paper for highlights — negative space and light.", color: "from-accent-sage to-accent-amber", difficulty: "Advanced", youtubeVideos: [
        { id: "w9", title: "5 Easy & Essential Watercolor Techniques For Beginners", channel: "Art with Jane", url: "https://www.youtube.com/watch?v=aOSaQ50xeAM" },
      ]},
    ],
  },
  {
    id: "charcoal",
    name: "Charcoal",
    icon: Pencil,
    color: "from-deep-earth to-accent-amber-deep",
    techniques: [
      { id: "vine-sketching", name: "Vine Charcoal Sketching", icon: Pencil, description: "Light, erasable layout and gesture drawing — the starting point for every charcoal work.", color: "from-deep-earth to-accent-amber-deep", difficulty: "Beginner", youtubeVideos: [
        { id: "c1", title: "How To Draw With Vine Charcoal | MADCHARCOAL Drawing Tutorial", channel: "MadCharcoal", url: "https://www.youtube.com/watch?v=m5Ud--hA6Iw" },
        { id: "c2", title: "HOW TO SKETCH using willow, vine, white & compressed charcoal", channel: "The Virtual Instructor", url: "https://www.youtube.com/playlist?list=PLTW1vOkF6UStyeKcL3fz8Fc2mk54XeIFF" },
      ]},
      { id: "compressed-shading", name: "Compressed Charcoal Shading", icon: PenTool, description: "Deep darks and rich value building with compressed sticks and pencils for contrast.", color: "from-accent-amber-deep to-accent-coral", difficulty: "Intermediate", youtubeVideos: [
        { id: "c3", title: "Charcoal Drawing - Basic Forms", channel: "The Virtual Instructor", url: "https://www.youtube.com/watch?v=WZ2DjvbFFcs" },
        { id: "c4", title: "Charcoal Value Drawing Tutorial", channel: "Art Tutor", url: "https://www.youtube.com/watch?v=B8FgFReP8l0" },
      ]},
      { id: "blending", name: "Blending & Smudging", icon: Cloud, description: "Stumps, tissues, and fingers for smooth gradients and atmospheric value transitions.", color: "from-accent-sage to-accent-sky", difficulty: "Beginner", youtubeVideos: [
        { id: "c5", title: "5 Charcoal Blending Secrets for Flawless Shading in Minutes!", channel: "Charcoal Mastery", url: "https://www.youtube.com/watch?v=I-qR-lctRTQ" },
        { id: "c6", title: "Charcoal Drawing Tutorial (Complete Beginners Guide!)", channel: "Art for Beginners", url: "https://www.youtube.com/watch?v=vKsJTVND1jA" },
      ]},
      { id: "subtractive", name: "Subtractive / Eraser Drawing", icon: Eraser, description: "Lifting charcoal with erasers to reveal light and form — painting with negative space.", color: "from-accent-lavender to-accent-sky", difficulty: "Intermediate", youtubeVideos: [
        { id: "c7", title: "Charcoal Drawing - Basic Forms", channel: "The Virtual Instructor", url: "https://www.youtube.com/watch?v=WZ2DjvbFFcs" },
      ]},
      { id: "white-highlights", name: "White Charcoal Highlights", icon: Sun, description: "Adding light values and contrast on toned paper with white charcoal pencils.", color: "from-accent-amber to-accent-sage", difficulty: "Advanced", youtubeVideos: [
        { id: "c8", title: "HOW TO SKETCH using willow, vine, white & compressed charcoal", channel: "The Virtual Instructor", url: "https://www.youtube.com/playlist?list=PLTW1vOkF6UStyeKcL3fz8Fc2mk54XeIFF" },
      ]},
      { id: "fixative", name: "Fixative & Preservation", icon: Wind, description: "Protecting finished charcoal drawings with fixative — proper technique and timing.", color: "from-accent-sky to-accent-lavender", difficulty: "Beginner", youtubeVideos: [
        { id: "c9", title: "Charcoal Drawing Tutorial (Complete Beginners Guide!)", channel: "Art for Beginners", url: "https://www.youtube.com/watch?v=vKsJTVND1jA" },
      ]},
    ],
  },
  {
    id: "pastel",
    name: "Pastels",
    icon: Palette,
    color: "from-accent-rose to-accent-lavender",
    techniques: [
      { id: "underpainting", name: "Underpainting", icon: Layers, description: "Establishing a color and value base before pastel layers — watercolor, alcohol, or ink.", color: "from-accent-rose to-accent-coral", difficulty: "Intermediate", youtubeVideos: [
        { id: "p1", title: "Pastel Art for Beginners – Lavender Field Tutorial", channel: "Valerie McKeehan", url: "https://www.youtube.com/watch?v=eH1WL5Crhio" },
        { id: "p2", title: "Easy Step by Step Pastel Painting Tutorial for Absolute Beginners!", channel: "Monet Cafe", url: "https://www.youtube.com/watch?v=ylSMGVsNx0o" },
        { id: "p3", title: "How a Pink Underpainting Instantly Makes Your Pastel Paintings Better", channel: "Monet Cafe Studio", url: "https://www.youtube.com/watch?v=OzKWK9oZEXY" },
      ]},
      { id: "dark-to-light", name: "Dark-to-Light Layering", icon: Palette, description: "Building from dark foundations to bright highlights — the core pastel painting method.", color: "from-accent-lavender to-accent-rose", difficulty: "Beginner", youtubeVideos: [
        { id: "p4", title: "The Magic of Layering in Soft Pastel - Vibrant Poppy Painting Tutorial", channel: "Pastel Tutorials", url: "https://www.youtube.com/watch?v=H7GuLa5hip0" },
        { id: "p5", title: "3 Steps to More Color with Limited Pastels - Soft Pastel Tutorial", channel: "Pastel Painting", url: "https://www.youtube.com/watch?v=PMCD4OmwLuk" },
      ]},
      { id: "scumbling", name: "Scumbling & Feathering", icon: Wind, description: "Broken color strokes for optical mixing and texture — letting layers peek through.", color: "from-accent-sky to-accent-lavender", difficulty: "Advanced", youtubeVideos: [
        { id: "p6", title: "The Magic of Layering in Soft Pastel - Vibrant Poppy Painting Tutorial", channel: "Pastel Tutorials", url: "https://www.youtube.com/watch?v=H7GuLa5hip0" },
      ]},
      { id: "blending", name: "Blending & Softening", icon: Cloud, description: "Finger, tool, and tissue blending for smooth transitions and atmospheric effects.", color: "from-accent-sage to-accent-sky", difficulty: "Beginner", youtubeVideos: [
        { id: "p7", title: "Easy Step by Step Pastel Painting Tutorial for Absolute Beginners!", channel: "Monet Cafe", url: "https://www.youtube.com/watch?v=ylSMGVsNx0o" },
      ]},
      { id: "sgraffito", name: "Sgraffito", icon: Pencil, description: "Scratching through top layers to reveal underpainting beneath for texture and detail.", color: "from-accent-amber-deep to-accent-rose", difficulty: "Advanced", youtubeVideos: [
        { id: "p8", title: "Essential Tips for Your First Pastel Layer", channel: "Monet Cafe with Susan Jenkins", url: "https://www.youtube.com/playlist?list=PL_UsFfaI-Klqt-UvbkLZyfzN6GDfu0uT6" },
      ]},
      { id: "edge-control", name: "Edge Control", icon: Brush, description: "Managing hard, soft, and lost edges to create depth, focus, and visual interest.", color: "from-accent-coral to-accent-amber", difficulty: "Intermediate", youtubeVideos: [
        { id: "p9", title: "Have You Tried Using Pastel and Watercolor?", channel: "Pastel Tutorials", url: "https://www.youtube.com/watch?v=3WSOUrlt7f0" },
      ]},
    ],
  },
];

const DIFFICULTY_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  beginner: { bg: "bg-pastel-sage/40", text: "text-accent-sage", label: "Beginner" },
  intermediate: { bg: "bg-pastel-amber/40", text: "text-accent-amber-deep", label: "Intermediate" },
  advanced: { bg: "bg-pastel-rose/40", text: "text-accent-rose", label: "Advanced" },
};

function youtubeThumbnail(url: string): string {
  const videoMatch = url.match(/[?&]v=([^&]+)/);
  if (videoMatch) return `https://img.youtube.com/vi/${videoMatch[1]}/hqdefault.jpg`;
  return "";
}

function youtubeEmbedUrl(url: string): string {
  const videoMatch = url.match(/[?&]v=([^&]+)/);
  if (videoMatch) return `https://www.youtube.com/embed/${videoMatch[1]}`;
  return url;
}

const SUGGESTED_QUESTIONS = [
  "Can you break down the first step more?",
  "What should I practice as a beginner?",
  "How do I know when I'm doing this correctly?",
];

export default function OilPaintingDemos() {
  const [selectedMediumId, setSelectedMediumId] = useState<string>("oil");
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<YoutubeVideo | null>(null);
  const [activeSection, setActiveSection] = useState<string>("overview");
  const { markCompleted, markPracticed, getProgress, getMediumProgress } = useLessonProgress();

  const selectedMedium = MEDIUMS.find((m) => m.id === selectedMediumId) || MEDIUMS[0];

  const handleGenerateLesson = useCallback(async (technique: Technique) => {
    setSelectedTechnique(technique);
    setLesson(null);
    setError(null);
    setLoading(true);
    setActiveSection("overview");

    try {
      const res = await fetch(`${API_URL}/functions/v1/analyze-artwork`, {
        method: "POST",
        headers: { apikey: API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "oil-painting-demo", medium: selectedMediumId, technique: technique.id }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate lesson");
      }

      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate lesson");
    } finally {
      setLoading(false);
    }
  }, [selectedMediumId]);

  const handleMediumChange = useCallback((mediumId: string) => {
    setSelectedMediumId(mediumId);
    setSelectedTechnique(null);
    setLesson(null);
    setError(null);
  }, []);

  return (
    <section className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pastel-amber/50 to-pastel-coral/50 border border-accent-amber/30 rounded-full px-4 py-1.5 mb-4">
          <GraduationCap size={14} className="text-accent-amber-deep" />
          <p className="text-accent-amber-deep text-xs font-semibold uppercase tracking-[0.15em]">
            Atelier Lessons
          </p>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-earth mb-3">
          Learn from the AI Master Teacher
        </h2>
        <p className="text-muted-brown max-w-xl mx-auto">
          Structured, interactive lessons for oil, watercolor, charcoal, and pastel. Each lesson includes
          objectives, step-by-step instruction, exercises, and a live chat with your AI art teacher.
        </p>
      </motion.div>

      {/* Medium tabs */}
      <div className="flex justify-center gap-2 mb-8 flex-wrap">
        {MEDIUMS.map((medium) => {
          const Icon = medium.icon;
          const isActive = selectedMediumId === medium.id;
          return (
            <button
              key={medium.id}
              onClick={() => handleMediumChange(medium.id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-all ${
                isActive ? `bg-gradient-to-r ${medium.color} text-white shadow-sticker` : "bg-white/70 text-muted-brown hover:text-deep-earth border border-sand/40"
              }`}
            >
              <Icon size={15} />
              {medium.name}
              {(() => {
                const mp = getMediumProgress(medium.techniques.map((t) => t.id));
                return mp.completed > 0 ? (
                  <span className={`text-[10px] font-bold rounded-full px-1.5 py-0.5 ${isActive ? "bg-white/25" : "bg-accent-sage/20 text-accent-sage"}`}>
                    {mp.completed}/{mp.total}
                  </span>
                ) : null;
              })()}
            </button>
          );
        })}
      </div>

      {!selectedTechnique && (
        <>
          <motion.div key={selectedMediumId + "-header"} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
            <h3 className="font-display text-xl font-bold text-deep-earth">{selectedMedium.name} Lessons</h3>
            <p className="text-sm text-muted-brown mt-1">Choose a technique to start a full lesson with the AI teacher</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {selectedMedium.techniques.map((tech, i) => {
              const Icon = tech.icon;
              const diff = DIFFICULTY_STYLES[tech.difficulty.toLowerCase()] || DIFFICULTY_STYLES.intermediate;
              return (
                <motion.button
                  key={tech.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  onClick={() => handleGenerateLesson(tech)}
                  className="group relative text-left bg-white/80 backdrop-blur-sm rounded-3xl border border-sand/40 shadow-card-soft p-6 hover:shadow-glow-amber transition-all duration-300 overflow-hidden"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tech.color}`} />
                  {(() => {
                    const prog = getProgress(tech.id);
                    return (prog.completed || prog.practiced) ? (
                      <div className="absolute top-3 right-3 flex items-center gap-1">
                        {prog.practiced && <Camera size={14} className="text-accent-sky" />}
                        {prog.completed && <Award size={14} className="text-accent-sage" />}
                      </div>
                    ) : null;
                  })()}
                  <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-sticker mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-display text-lg font-bold text-deep-earth mb-1.5">{tech.name}</h3>
                  <p className="text-sm text-muted-brown leading-relaxed mb-4">{tech.description}</p>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${diff.bg} ${diff.text}`}>{diff.label}</span>
                    <span className="inline-flex items-center gap-1 text-xs text-muted-brown">
                      <Youtube size={12} className="text-accent-rose" />
                      {tech.youtubeVideos.length} {tech.youtubeVideos.length === 1 ? "video" : "videos"}
                    </span>
                    {(() => {
                      const prog = getProgress(tech.id);
                      return prog.completed ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-pastel-sage/40 text-accent-sage">
                          <CheckCircle2 size={10} /> Done
                        </span>
                      ) : null;
                    })()}
                  </div>
                  <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-amber-deep group-hover:gap-2.5 transition-all">
                    <Sparkles size={12} />
                    {getProgress(tech.id).completed ? "Review lesson" : "Start full lesson"}
                  </div>
                </motion.button>
              );
            })}
          </div>
        </>
      )}

      <AnimatePresence mode="wait">
        {selectedTechnique && (
          <motion.div key="detail" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
            <button onClick={() => { setSelectedTechnique(null); setLesson(null); setError(null); }} className="inline-flex items-center gap-1.5 text-sm text-muted-brown hover:text-deep-earth transition-colors mb-6">
              <ExternalLink size={14} className="rotate-180" />
              Back to {selectedMedium.name} lessons
            </button>

            <div className="bg-white/85 backdrop-blur-sm rounded-3xl border border-accent-amber/20 shadow-card-warm overflow-hidden">
              {/* Lesson header */}
              <div className={`bg-gradient-to-r ${selectedTechnique.color} px-6 sm:px-8 py-6`}>
                <div className="flex items-start gap-4">
                  {(() => { const Icon = selectedTechnique.icon; return <Icon size={32} className="text-white flex-shrink-0 mt-1" />; })()}
                  <div className="flex-1">
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider">{selectedMedium.name} Lesson</p>
                    <h3 className="font-display text-2xl font-bold text-white">{selectedTechnique.name}</h3>
                    <p className="text-white/80 text-sm mt-1">{selectedTechnique.description}</p>
                  </div>
                </div>
              </div>

              {loading && (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-amber/20 to-accent-coral/20 flex items-center justify-center">
                    <Loader2 size={28} className="text-accent-amber animate-spin" />
                  </div>
                  <p className="text-muted-brown text-sm">Your AI teacher is preparing a full structured lesson...</p>
                </div>
              )}

              {error && !loading && (
                <div className="flex flex-col items-center text-center gap-3 py-16">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-rose to-accent-rose-light flex items-center justify-center">
                    <AlertCircle size={24} className="text-white" />
                  </div>
                  <p className="text-accent-rose font-semibold text-sm">{error}</p>
                  <button onClick={() => handleGenerateLesson(selectedTechnique)} className="inline-flex items-center gap-1.5 text-sm text-accent-rose font-medium bg-white/60 hover:bg-white rounded-full px-4 py-2 transition-all">Try again</button>
                </div>
              )}

              {lesson && !loading && !error && (
                <div className="p-6 sm:p-8">
                  {/* Lesson metadata */}
                  <div className="flex items-center gap-3 flex-wrap mb-6">
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-amber/40 text-accent-amber-deep rounded-full px-3 py-1.5"><BookOpen size={12} />Full Lesson</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-sage/40 text-accent-sage rounded-full px-3 py-1.5"><Signal size={12} />{DIFFICULTY_STYLES[lesson.difficulty]?.label || lesson.difficulty}</span>
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-sky/40 text-accent-sky rounded-full px-3 py-1.5"><Clock size={12} />{lesson.estimatedTime}</span>
                  </div>

                  {/* Section navigation */}
                  <div className="flex gap-1.5 flex-wrap mb-6 border-b border-sand/40 pb-3">
                    {[
                      { id: "overview", label: "Overview", icon: BookOpen },
                      { id: "objectives", label: "Objectives", icon: Target },
                      { id: "materials", label: "Materials", icon: Palette },
                      { id: "steps", label: "Steps", icon: Layers },
                      { id: "mistakes", label: "Mistakes", icon: AlertTriangle },
                      { id: "exercises", label: "Exercises", icon: Dumbbell },
                      { id: "masters", label: "Master References", icon: GraduationCap },
                      { id: "practice", label: "Practice", icon: Camera },
                      { id: "chat", label: "Ask the Teacher", icon: MessageCircle },
                      { id: "videos", label: "YouTube", icon: Youtube },
                    ].map((section) => {
                      const Icon = section.icon;
                      const isActive = activeSection === section.id;
                      return (
                        <button key={section.id} onClick={() => setActiveSection(section.id)} className={`inline-flex items-center gap-1.5 text-xs font-semibold rounded-full px-3 py-1.5 transition-all ${isActive ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white shadow-sticker" : "bg-white/60 text-muted-brown hover:text-deep-earth border border-sand/40"}`}>
                          <Icon size={11} />
                          {section.label}
                        </button>
                      );
                    })}
                  </div>

                  <AnimatePresence mode="wait">
                    {/* Overview */}
                    {activeSection === "overview" && (
                      <motion.div key="overview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="prose prose-sm max-w-none text-deep-earth leading-relaxed [&_p]:text-sm [&_p]:text-muted-brown [&_p]:leading-relaxed [&_p]:mb-3 [&_strong]:text-deep-earth [&_strong]:font-semibold">
                          <MarkdownRenderer content={lesson.overview} />
                        </div>
                      </motion.div>
                    )}

                    {/* Learning Objectives */}
                    {activeSection === "objectives" && (
                      <motion.div key="objectives" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="text-sm text-muted-brown mb-4">By the end of this lesson, you will be able to:</p>
                        <div className="space-y-2.5">
                          {lesson.learningObjectives.map((obj, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 bg-pastel-sage/15 rounded-2xl p-4 border border-accent-sage/20">
                              <CheckCircle2 size={18} className="text-accent-sage flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-deep-earth leading-relaxed">{obj}</p>
                            </motion.div>
                          ))}
                          {lesson.learningObjectives.length === 0 && <p className="text-sm text-muted-brown italic">Objectives are being prepared.</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Materials */}
                    {activeSection === "materials" && (
                      <motion.div key="materials" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {lesson.materials.map((mat, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }} className="bg-white/70 rounded-2xl border border-sand/40 p-4">
                              <div className="flex items-center gap-2 mb-1.5">
                                <Palette size={14} className="text-accent-amber" />
                                <p className="text-sm font-semibold text-deep-earth">{mat.name}</p>
                              </div>
                              <p className="text-xs text-muted-brown leading-relaxed">{mat.purpose}</p>
                              {mat.notes && <p className="text-xs text-muted-brown/80 italic mt-1.5">{mat.notes}</p>}
                            </motion.div>
                          ))}
                          {lesson.materials.length === 0 && <p className="text-sm text-muted-brown italic">Materials list is being prepared.</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Steps */}
                    {activeSection === "steps" && (
                      <motion.div key="steps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-4">
                          {lesson.steps.map((step, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-white/70 rounded-2xl border border-sand/40 p-5">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-amber to-accent-coral flex items-center justify-center text-white text-sm font-bold shadow-sticker flex-shrink-0">{i + 1}</div>
                                <h4 className="font-display text-sm font-bold text-deep-earth">{step.title}</h4>
                              </div>
                              <div className="prose prose-sm max-w-none ml-11 [&_p]:text-sm [&_p]:text-muted-brown [&_p]:leading-relaxed [&_p]:mb-2 [&_ul]:text-sm [&_ul]:text-muted-brown [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_strong]:text-deep-earth [&_strong]:font-semibold">
                                <MarkdownRenderer content={step.instruction} />
                              </div>
                              {step.tip && (
                                <div className="ml-11 mt-3 bg-gradient-to-r from-pastel-amber/30 to-pastel-butter/20 rounded-xl p-3 border border-accent-amber/20 flex items-start gap-2">
                                  <Sparkles size={14} className="text-accent-amber-deep flex-shrink-0 mt-0.5" />
                                  <div><p className="text-[11px] font-bold uppercase tracking-wider text-accent-amber-deep mb-0.5">Pro Tip</p><p className="text-xs text-muted-brown leading-relaxed">{step.tip}</p></div>
                                </div>
                              )}
                            </motion.div>
                          ))}
                          {lesson.steps.length === 0 && <p className="text-sm text-muted-brown italic">Steps are being prepared.</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Common Mistakes */}
                    {activeSection === "mistakes" && (
                      <motion.div key="mistakes" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-3">
                          {lesson.commonMistakes.map((item, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="bg-white/70 rounded-2xl border border-accent-rose/20 p-4">
                              <div className="flex items-start gap-3">
                                <AlertTriangle size={18} className="text-accent-rose flex-shrink-0 mt-0.5" />
                                <div>
                                  <p className="text-sm font-semibold text-deep-earth mb-1">{item.mistake}</p>
                                  <div className="flex items-start gap-2 mt-2">
                                    <CheckCircle2 size={14} className="text-accent-sage flex-shrink-0 mt-0.5" />
                                    <p className="text-xs text-muted-brown leading-relaxed">{item.fix}</p>
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                          {lesson.commonMistakes.length === 0 && <p className="text-sm text-muted-brown italic">Mistakes list is being prepared.</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Exercises */}
                    {activeSection === "exercises" && (
                      <motion.div key="exercises" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid sm:grid-cols-2 gap-3">
                          {lesson.exercises.map((ex, i) => (
                            <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} className="bg-gradient-to-br from-pastel-sage/20 to-pastel-sky/15 rounded-2xl border border-accent-sage/20 p-4">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2"><Dumbbell size={16} className="text-accent-sage" /><p className="text-sm font-semibold text-deep-earth">{ex.name}</p></div>
                                {ex.duration && <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-muted-brown bg-white/60 rounded-full px-2 py-0.5"><Clock size={10} />{ex.duration}</span>}
                              </div>
                              <p className="text-xs text-muted-brown leading-relaxed">{ex.description}</p>
                            </motion.div>
                          ))}
                          {lesson.exercises.length === 0 && <p className="text-sm text-muted-brown italic">Exercises are being prepared.</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Master References */}
                    {activeSection === "masters" && (
                      <motion.div key="masters" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="space-y-3">
                          {lesson.masterReferences.map((ref, i) => (
                            <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-3 bg-pastel-lavender/15 rounded-2xl border border-accent-lavender/20 p-4">
                              <GraduationCap size={18} className="text-accent-lavender flex-shrink-0 mt-0.5" />
                              <p className="text-sm text-deep-earth leading-relaxed">{ref}</p>
                            </motion.div>
                          ))}
                          {lesson.masterReferences.length === 0 && <p className="text-sm text-muted-brown italic">Master references are being prepared.</p>}
                        </div>
                      </motion.div>
                    )}

                    {/* Guided Practice */}
                    {activeSection === "practice" && (
                      <motion.div key="practice" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <GuidedPractice
                          mediumName={lesson.mediumName}
                          techniqueName={lesson.techniqueName}
                          lessonContext={[
                            `Technique: ${lesson.techniqueName}`,
                            `Medium: ${lesson.mediumName}`,
                            `Overview: ${lesson.overview}`,
                            `Learning Objectives: ${lesson.learningObjectives.join("; ")}`,
                            `Steps: ${lesson.steps.map((s, i) => `Step ${i + 1}: ${s.title} — ${s.instruction}`).join(" | ")}`,
                            `Exercises: ${lesson.exercises.map((e) => e.name).join("; ")}`,
                          ].join("\n")}
                          onPracticed={() => markPracticed(selectedTechnique.id)}
                        />
                      </motion.div>
                    )}

                    {/* AI Tutor Chat */}
                    {activeSection === "chat" && (
                      <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <LessonTutorChat lesson={lesson} mediumId={selectedMediumId} techniqueId={selectedTechnique.id} />
                      </motion.div>
                    )}

                    {/* YouTube Videos */}
                    {activeSection === "videos" && (
                      <motion.div key="videos" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <div className="grid sm:grid-cols-2 gap-4">
                          {selectedTechnique.youtubeVideos.map((video) => (
                            <button key={video.id} onClick={() => setPlayingVideo(video)} className="group text-left bg-white/60 rounded-2xl border border-sand/40 overflow-hidden hover:shadow-card-soft hover:border-accent-rose/30 transition-all">
                              <div className="relative aspect-video bg-deep-earth/10 overflow-hidden">
                                <img src={youtubeThumbnail(video.url)} alt={video.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" loading="lazy" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors"><div className="w-12 h-12 rounded-full bg-accent-rose flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform"><Play size={20} className="text-white ml-0.5" fill="white" /></div></div>
                              </div>
                              <div className="p-3"><p className="text-xs font-semibold text-deep-earth line-clamp-2 leading-snug">{video.title}</p><p className="text-[11px] text-muted-brown mt-1">{video.channel}</p></div>
                            </button>
                          ))}
                        </div>
                        <p className="text-[11px] text-muted-brown mt-3 italic">Supplement the AI lesson with these curated YouTube tutorials. Support these creators by subscribing to their channels.</p>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Lesson completion */}
                  <div className="mt-6 pt-5 border-t border-sand/40 flex items-center justify-between flex-wrap gap-3">
                    {(() => {
                      const prog = getProgress(selectedTechnique.id);
                      return (
                        <>
                          <div className="flex items-center gap-2 flex-wrap">
                            {prog.practiced && (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-sky/40 text-accent-sky rounded-full px-3 py-1.5">
                                <Camera size={12} /> Practiced
                              </span>
                            )}
                            {prog.completed ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-sage/40 text-accent-sage rounded-full px-3 py-1.5">
                                <Award size={12} /> Lesson Completed
                              </span>
                            ) : (
                              <button
                                onClick={() => markCompleted(selectedTechnique.id)}
                                className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-accent-sage to-accent-sky text-white rounded-full px-4 py-2 shadow-sticker hover:shadow-glow-sage transition-all"
                              >
                                <CheckCircle2 size={14} />
                                Mark Lesson Complete
                              </button>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-brown">
                            {prog.completed
                              ? "Great work completing this lesson! Try the Practice tab or explore another technique."
                              : "Read through the lesson, then mark it complete to track your progress."}
                          </p>
                        </>
                      );
                    })()}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video modal */}
      <AnimatePresence>
        {playingVideo && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setPlayingVideo(null)} className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} onClick={(e) => e.stopPropagation()} className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full">
              <div className="bg-gradient-to-r from-accent-rose to-accent-coral px-5 py-3 flex items-center justify-between">
                <p className="text-white text-sm font-semibold line-clamp-1">{playingVideo.title}</p>
                <button onClick={() => setPlayingVideo(null)} className="text-white/80 hover:text-white text-lg font-bold leading-none ml-3" aria-label="Close video">&times;</button>
              </div>
              <div className="aspect-video"><iframe src={youtubeEmbedUrl(playingVideo.url)} title={playingVideo.title} className="w-full h-full" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /></div>
              <div className="px-5 py-3 flex items-center justify-between">
                <p className="text-xs text-muted-brown">{playingVideo.channel}</p>
                <a href={playingVideo.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-rose hover:gap-2.5 transition-all"><ExternalLink size={12} />Open on YouTube</a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Lesson Tutor Chat — embedded AI teacher, context-aware to the lesson
// ─────────────────────────────────────────────────────────────────────────────

function LessonTutorChat({ lesson, mediumId, techniqueId }: { lesson: LessonData; mediumId: string; techniqueId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const lessonContext = [
    `Technique: ${lesson.techniqueName}`,
    `Medium: ${lesson.mediumName}`,
    `Overview: ${lesson.overview}`,
    `Learning Objectives: ${lesson.learningObjectives.join("; ")}`,
    `Materials: ${lesson.materials.map((m) => m.name).join(", ")}`,
    `Steps: ${lesson.steps.map((s, i) => `Step ${i + 1}: ${s.title} — ${s.instruction}`).join(" | ")}`,
    `Common Mistakes: ${lesson.commonMistakes.map((m) => m.mistake).join("; ")}`,
    `Exercises: ${lesson.exercises.map((e) => e.name).join("; ")}`,
  ].join("\n");

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(async (text: string) => {
    if (!text.trim() || loading) return;

    const userMsg: ChatMessage = { role: "user", content: text.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/functions/v1/analyze-artwork`, {
        method: "POST",
        headers: { apikey: API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "lesson-tutor",
          history: newMessages,
          lessonContext,
          techniqueName: lesson.techniqueName,
          mediumName: lesson.mediumName,
        }),
      });

      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.feedback) {
        throw new Error(data?.error || "Couldn't get a response");
      }

      setMessages([...newMessages, { role: "assistant", content: data.feedback }]);
    } catch {
      setMessages([...newMessages, { role: "assistant", content: "I apologize — I had trouble responding to that. Please try asking again." }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, lessonContext, lesson.techniqueName, lesson.mediumName]);

  return (
    <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-accent-sky/20 shadow-card-soft overflow-hidden">
      <div className="bg-gradient-to-r from-pastel-sky/40 to-pastel-lavender/30 px-5 py-3 border-b border-accent-sky/20 flex items-center gap-2">
        <MessageCircle size={16} className="text-accent-sky" />
        <span className="text-sm font-semibold text-deep-earth">Ask the AI Teacher</span>
        <span className="ml-auto text-xs text-muted-brown">About this lesson</span>
      </div>

      {messages.length === 0 ? (
        <div className="p-6 text-center">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-sky to-accent-lavender flex items-center justify-center mx-auto mb-3 shadow-glow-sage">
            <GraduationCap size={24} className="text-white" />
          </div>
          <p className="text-deep-earth font-semibold text-sm">Have a question about this {lesson.techniqueName} lesson?</p>
          <p className="text-muted-brown text-xs mt-1 mb-4">Your AI teacher can explain steps further, suggest exercises, or share master examples</p>
          <div className="flex flex-wrap gap-2 justify-center">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button key={q} onClick={() => handleSend(q)} className="text-xs bg-white/70 hover:bg-white text-muted-brown hover:text-deep-earth border border-sand/50 rounded-full px-3 py-1.5 transition-colors">{q}</button>
            ))}
          </div>
        </div>
      ) : (
        <div ref={scrollRef} className="max-h-[350px] overflow-y-auto scroll-warm p-5 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${msg.role === "user" ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white rounded-br-sm" : "bg-gradient-to-br from-pastel-butter to-pastel-amber/30 text-deep-earth rounded-bl-sm"}`}>
                  {msg.role === "user" ? (
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                  ) : (
                    <div className="text-sm leading-relaxed"><MarkdownRenderer content={msg.content} /></div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <div className="flex justify-start">
              <div className="bg-gradient-to-br from-pastel-butter to-pastel-amber/30 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
                <Loader2 size={14} className="animate-spin text-accent-amber" />
                <span className="text-sm text-muted-brown">The teacher is thinking...</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="border-t border-sand/50 p-3 flex items-center gap-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend(input)} placeholder="Ask about this technique, a step, or a material..." className="flex-1 bg-transparent text-sm text-deep-earth placeholder:text-warm-taupe/60 px-3 py-2 outline-none" />
        <button onClick={() => handleSend(input)} disabled={!input.trim() || loading} className="bg-gradient-to-r from-accent-amber to-accent-coral hover:from-accent-amber-deep hover:to-accent-rose disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all shadow-glow-amber" aria-label="Send message"><Send size={16} /></button>
      </div>
    </div>
  );
}
