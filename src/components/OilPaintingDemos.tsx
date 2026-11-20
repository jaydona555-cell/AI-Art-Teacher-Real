import { useState, useCallback } from "react";
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
} from "lucide-react";

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface OilDemoGuide {
  title: string;
  guide: string;
  difficulty: string;
  estimatedTime: string;
}

interface YoutubeVideo {
  id: string;
  title: string;
  channel: string;
  url: string;
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

const TECHNIQUES: Technique[] = [
  {
    id: "alla-prima",
    name: "Alla Prima",
    icon: Flame,
    description: "Wet-on-wet painting completed in a single session. Bold, direct, and spontaneous.",
    color: "from-accent-amber to-accent-coral",
    difficulty: "Beginner",
    youtubeVideos: [
      { id: "y1", title: "Alla Prima Painting Tutorial - 5 Easy Steps to GET STARTED", channel: "Painting Lessons", url: "https://www.youtube.com/watch?v=Os9tef7ALoA" },
      { id: "y2", title: "How To Begin An Oil Painting, Alla Prima + Color Mixing (Zorn Palette)", channel: "Academy Oversight", url: "https://www.youtube.com/watch?v=flp38wjNKCk" },
      { id: "y3", title: "Alla Prima Painting Explained (How to Paint Realistically in One Sitting)", channel: "Draw Mix Paint", url: "https://www.youtube.com/watch?v=KYLgSbiD0IE" },
    ],
  },
  {
    id: "glazing",
    name: "Glazing",
    icon: Droplet,
    description: "Transparent color layers built over a dry underpainting for luminous, deep color.",
    color: "from-accent-sky to-accent-lavender",
    difficulty: "Intermediate",
    youtubeVideos: [
      { id: "y4", title: "Understanding Glazing with Oil Painting (Grisaille)", channel: "Oil Painting Tutorials", url: "https://www.youtube.com/watch?v=608EZDwDOOk" },
      { id: "y5", title: "GLAZING and SCUMBLING Oil Painting Techniques", channel: "Art Lessons", url: "https://www.youtube.com/watch?v=5aTqs8MNVfE" },
    ],
  },
  {
    id: "underpainting",
    name: "Underpainting & Grisaille",
    icon: Layers,
    description: "A monochrome value foundation that establishes form and light before color.",
    color: "from-accent-sage to-accent-sky",
    difficulty: "Beginner",
    youtubeVideos: [
      { id: "y6", title: "Oil Painting - Grisaille Underpainting", channel: "Old Masters Academy", url: "https://www.youtube.com/watch?v=CAF5zyj2NHg" },
      { id: "y7", title: "GRISAILLE - Oil Painting Tutorial with Step by Step Demonstration", channel: "Art with Barry", url: "https://www.youtube.com/watch?v=hoCpj0vwmHU" },
      { id: "y8", title: "Oil Painting Tutorial | Grisaille Techniques - Portrait Study", channel: "Artist Chronicle", url: "https://www.youtube.com/watch?v=pwsiH10accI" },
    ],
  },
  {
    id: "impasto",
    name: "Impasto",
    icon: Palette,
    description: "Thick, textured paint applied with brush or palette knife for bold, dimensional marks.",
    color: "from-accent-rose to-accent-coral",
    difficulty: "Intermediate",
    youtubeVideos: [
      { id: "y9", title: "GLAZING vs ALLA PRIMA: Which technique to learn first?", channel: "Atelier Vlog", url: "https://www.youtube.com/watch?v=wngIKAWuc_g" },
    ],
  },
  {
    id: "scumbling",
    name: "Scumbling",
    icon: Wind,
    description: "Dry, opaque paint dragged over dried layers to create broken, textured color effects.",
    color: "from-accent-lavender to-accent-sky",
    difficulty: "Advanced",
    youtubeVideos: [
      { id: "y10", title: "Glazing and Scumbling (Oil and Acrylic) - Playlist", channel: "Art Lessons", url: "https://www.youtube.com/playlist?list=PLXFNfq2bbvreAqBxwuqHowkvXlieZyHhC" },
      { id: "y11", title: "GLAZING and SCUMBLING Oil Painting Techniques", channel: "PaintingTube", url: "https://www.youtube.com/watch?v=5aTqs8MNVfE" },
    ],
  },
  {
    id: "fat-over-lean",
    name: "Fat-over-Lean",
    icon: Brush,
    description: "Progressive oil content layering rule that ensures proper drying and prevents cracking.",
    color: "from-accent-amber-deep to-accent-sage",
    difficulty: "Advanced",
    youtubeVideos: [
      { id: "y12", title: "How To Begin An Oil Painting - Imprimatura & Underpainting", channel: "Academy Oversight", url: "https://www.youtube.com/watch?v=flp38wjNKCk" },
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

export default function OilPaintingDemos() {
  const [selectedTechnique, setSelectedTechnique] = useState<Technique | null>(null);
  const [guide, setGuide] = useState<OilDemoGuide | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [playingVideo, setPlayingVideo] = useState<YoutubeVideo | null>(null);

  const handleGenerateGuide = useCallback(async (technique: Technique) => {
    setSelectedTechnique(technique);
    setGuide(null);
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/functions/v1/analyze-artwork`, {
        method: "POST",
        headers: { apikey: API_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ mode: "oil-painting-demo", technique: technique.id }),
      });
      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Failed to generate guide");
      }

      setGuide({
        title: data.title || technique.name,
        guide: data.guide || "",
        difficulty: data.difficulty || "intermediate",
        estimatedTime: data.estimatedTime || "2-4 hours",
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to generate guide");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <section className="max-w-4xl mx-auto">
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pastel-amber/50 to-pastel-coral/50 border border-accent-amber/30 rounded-full px-4 py-1.5 mb-4">
          <Palette size={14} className="text-accent-amber-deep" />
          <p className="text-accent-amber-deep text-xs font-semibold uppercase tracking-[0.15em]">
            Oil Painting Academy
          </p>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-earth mb-3">
          Master Oil Painting Techniques
        </h2>
        <p className="text-muted-brown max-w-xl mx-auto">
          Explore time-honored oil painting methods with AI-generated process guides and curated
          video tutorials from master painters on YouTube.
        </p>
      </motion.div>

      {!selectedTechnique && (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {TECHNIQUES.map((tech, i) => {
            const Icon = tech.icon;
            const diff = DIFFICULTY_STYLES[tech.difficulty.toLowerCase()] || DIFFICULTY_STYLES.intermediate;
            return (
              <motion.button
                key={tech.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => handleGenerateGuide(tech)}
                className="group relative text-left bg-white/80 backdrop-blur-sm rounded-3xl border border-sand/40 shadow-card-soft p-6 hover:shadow-glow-amber transition-all duration-300 overflow-hidden"
              >
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${tech.color}`} />
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${tech.color} flex items-center justify-center shadow-sticker mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="font-display text-lg font-bold text-deep-earth mb-1.5">{tech.name}</h3>
                <p className="text-sm text-muted-brown leading-relaxed mb-4">{tech.description}</p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${diff.bg} ${diff.text}`}>
                    {diff.label}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs text-muted-brown">
                    <Youtube size={12} className="text-accent-rose" />
                    {tech.youtubeVideos.length} {tech.youtubeVideos.length === 1 ? "video" : "videos"}
                  </span>
                </div>
                <div className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-accent-amber-deep group-hover:gap-2.5 transition-all">
                  <Sparkles size={12} />
                  Generate AI guide
                </div>
              </motion.button>
            );
          })}
        </div>
      )}

      <AnimatePresence mode="wait">
        {selectedTechnique && (
          <motion.div
            key="detail"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <button
              onClick={() => { setSelectedTechnique(null); setGuide(null); setError(null); }}
              className="inline-flex items-center gap-1.5 text-sm text-muted-brown hover:text-deep-earth transition-colors mb-6"
            >
              <ExternalLink size={14} className="rotate-180" />
              Back to all techniques
            </button>

            <div className="bg-white/85 backdrop-blur-sm rounded-3xl border border-accent-amber/20 shadow-card-warm overflow-hidden">
              <div className={`bg-gradient-to-r ${selectedTechnique.color} px-6 sm:px-8 py-5`}>
                <div className="flex items-center gap-3">
                  {(() => {
                    const Icon = selectedTechnique.icon;
                    return <Icon size={28} className="text-white" />;
                  })()}
                  <div>
                    <h3 className="font-display text-xl font-bold text-white">{selectedTechnique.name}</h3>
                    <p className="text-white/80 text-sm">{selectedTechnique.description}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                {loading && (
                  <div className="flex flex-col items-center justify-center py-16 gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-amber/20 to-accent-coral/20 flex items-center justify-center">
                      <Loader2 size={28} className="text-accent-amber animate-spin" />
                    </div>
                    <p className="text-muted-brown text-sm">Generating your master-level process guide...</p>
                  </div>
                )}

                {error && !loading && (
                  <div className="flex flex-col items-center text-center gap-3 py-12">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-rose to-accent-rose-light flex items-center justify-center">
                      <AlertCircle size={24} className="text-white" />
                    </div>
                    <p className="text-accent-rose font-semibold text-sm">{error}</p>
                    <button
                      onClick={() => handleGenerateGuide(selectedTechnique)}
                      className="inline-flex items-center gap-1.5 text-sm text-accent-rose font-medium bg-white/60 hover:bg-white rounded-full px-4 py-2 transition-all"
                    >
                      Try again
                    </button>
                  </div>
                )}

                {guide && !loading && !error && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div className="flex items-center gap-3 flex-wrap mb-5">
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-amber/40 text-accent-amber-deep rounded-full px-3 py-1.5">
                        <BookOpen size={12} />
                        AI Process Guide
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-sage/40 text-accent-sage rounded-full px-3 py-1.5">
                        <Signal size={12} />
                        {DIFFICULTY_STYLES[guide.difficulty]?.label || guide.difficulty}
                      </span>
                      <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-pastel-sky/40 text-accent-sky rounded-full px-3 py-1.5">
                        <Clock size={12} />
                        {guide.estimatedTime}
                      </span>
                    </div>

                    <div className="prose prose-sm max-w-none text-deep-earth leading-relaxed
                      [&_h1]:font-display [&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-deep-earth [&_h1]:mb-3 [&_h1]:mt-5
                      [&_h2]:font-display [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-deep-earth [&_h2]:mb-2 [&_h2]:mt-4
                      [&_h3]:font-semibold [&_h3]:text-sm [&_h3]:text-deep-earth [&_h3]:mb-1.5 [&_h3]:mt-3
                      [&_p]:text-sm [&_p]:text-muted-brown [&_p]:leading-relaxed [&_p]:mb-3
                      [&_ul]:text-sm [&_ul]:text-muted-brown [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-3 [&_ul]:space-y-1
                      [&_ol]:text-sm [&_ol]:text-muted-brown [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:mb-3 [&_ol]:space-y-1
                      [&_strong]:text-deep-earth [&_strong]:font-semibold
                      [&_em]:text-muted-brown"
                      dangerouslySetInnerHTML={{ __html: markdownToHtml(guide.guide) }}
                    />
                  </motion.div>
                )}

                {!loading && (
                  <div className="mt-8 pt-6 border-t border-sand/40">
                    <div className="flex items-center gap-2 mb-4">
                      <Youtube size={18} className="text-accent-rose" />
                      <h4 className="font-display text-sm font-bold text-deep-earth">
                        Watch on YouTube: {selectedTechnique.name}
                      </h4>
                    </div>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {selectedTechnique.youtubeVideos.map((video) => (
                        <button
                          key={video.id}
                          onClick={() => setPlayingVideo(video)}
                          className="group text-left bg-white/60 rounded-2xl border border-sand/40 overflow-hidden hover:shadow-card-soft hover:border-accent-rose/30 transition-all"
                        >
                          <div className="relative aspect-video bg-deep-earth/10 overflow-hidden">
                            <img
                              src={youtubeThumbnail(video.url)}
                              alt={video.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              loading="lazy"
                              onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                            />
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                              <div className="w-12 h-12 rounded-full bg-accent-rose flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                <Play size={20} className="text-white ml-0.5" fill="white" />
                              </div>
                            </div>
                          </div>
                          <div className="p-3">
                            <p className="text-xs font-semibold text-deep-earth line-clamp-2 leading-snug">{video.title}</p>
                            <p className="text-[11px] text-muted-brown mt-1">{video.channel}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                    <p className="text-[11px] text-muted-brown mt-3 italic">
                      Videos open in an embedded player. Support these creators by subscribing to their channels.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {playingVideo && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlayingVideo(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl shadow-2xl overflow-hidden max-w-3xl w-full"
            >
              <div className="bg-gradient-to-r from-accent-rose to-accent-coral px-5 py-3 flex items-center justify-between">
                <p className="text-white text-sm font-semibold line-clamp-1">{playingVideo.title}</p>
                <button
                  onClick={() => setPlayingVideo(null)}
                  className="text-white/80 hover:text-white text-lg font-bold leading-none ml-3"
                  aria-label="Close video"
                >
                  &times;
                </button>
              </div>
              <div className="aspect-video">
                <iframe
                  src={youtubeEmbedUrl(playingVideo.url)}
                  title={playingVideo.title}
                  className="w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="px-5 py-3 flex items-center justify-between">
                <p className="text-xs text-muted-brown">{playingVideo.channel}</p>
                <a
                  href={playingVideo.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-accent-rose hover:gap-2.5 transition-all"
                >
                  <ExternalLink size={12} />
                  Open on YouTube
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function markdownToHtml(md: string): string {
  let html = md
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    .replace(/`(.+?)`/g, '<code class="bg-sand/30 px-1.5 py-0.5 rounded text-xs font-mono">$1</code>');

  const lines = html.split("\n");
  let result: string[] = [];
  let inList: "ul" | "ol" | null = null;

  for (const line of lines) {
    const ulMatch = line.match(/^\s*[-*] (.+)$/);
    const olMatch = line.match(/^\s*\d+\. (.+)$/);

    if (ulMatch) {
      if (inList !== "ul") { if (inList) result.push(`</${inList}>`); result.push("<ul>"); inList = "ul"; }
      result.push(`<li>${ulMatch[1]}</li>`);
    } else if (olMatch) {
      if (inList !== "ol") { if (inList) result.push(`</${inList}>`); result.push("<ol>"); inList = "ol"; }
      result.push(`<li>${olMatch[1]}</li>`);
    } else {
      if (inList) { result.push(`</${inList}>`); inList = null; }
      if (line.trim() && !line.match(/^<h[1-3]>/)) {
        result.push(`<p>${line.trim()}</p>`);
      } else if (line.trim()) {
        result.push(line);
      }
    }
  }
  if (inList) result.push(`</${inList}>`);

  return result.join("\n");
}
