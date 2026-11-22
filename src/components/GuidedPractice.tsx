import { useState, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Camera,
  Lightbulb,
  TrendingUp,
} from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

const API_URL = import.meta.env.VITE_SUPABASE_URL;
const API_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface PracticeReview {
  feedback: string;
  strengths: string[];
  improvements: string[];
  nextStep: string;
}

interface GuidedPracticeProps {
  mediumName: string;
  techniqueName: string;
  lessonContext: string;
  onPracticed: () => void;
}

export default function GuidedPractice({ mediumName, techniqueName, lessonContext, onPracticed }: GuidedPracticeProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [review, setReview] = useState<PracticeReview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setSelectedFile(file);
    setReview(null);
    setError(null);
    const reader = new FileReader();
    reader.onload = (e) => setPreviewUrl(e.target?.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleSubmit = useCallback(async () => {
    if (!selectedFile || loading) return;
    setLoading(true);
    setError(null);

    const reader = new FileReader();
    reader.onload = async (e) => {
      const dataUrl = e.target?.result as string;
      const base64 = dataUrl.split(",")[1];
      const mimeType = selectedFile.type || "image/jpeg";

      try {
        const res = await fetch(`${API_URL}/functions/v1/analyze-artwork`, {
          method: "POST",
          headers: { apikey: API_KEY, "Content-Type": "application/json" },
          body: JSON.stringify({
            mode: "practice-review",
            imageBase64: base64,
            mimeType,
            mediumName,
            techniqueName,
            lessonContext,
          }),
        });
        const data = await res.json().catch(() => null);

        if (!res.ok || !data?.feedback) {
          throw new Error(data?.error || "Couldn't review your practice work");
        }

        setReview({
          feedback: data.feedback,
          strengths: data.strengths || [],
          improvements: data.improvements || [],
          nextStep: data.nextStep || "",
        });
        onPracticed();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to review practice work");
      } finally {
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Failed to read image file");
      setLoading(false);
    };
    reader.readAsDataURL(selectedFile);
  }, [selectedFile, loading, mediumName, techniqueName, lessonContext, onPracticed]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setReview(null);
    setError(null);
  }, []);

  return (
    <div className="space-y-5">
      <div className="bg-gradient-to-br from-pastel-sage/20 to-pastel-sky/15 rounded-2xl border border-accent-sage/20 p-5">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-sage to-accent-sky flex items-center justify-center shadow-sticker flex-shrink-0">
            <Camera size={20} className="text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-deep-earth">Practice {techniqueName}</p>
            <p className="text-xs text-muted-brown mt-0.5 leading-relaxed">
              Upload your practice attempt and your AI teacher will give you targeted feedback on how
              well you applied the technique, what you did well, and what to try next.
            </p>
          </div>
        </div>
      </div>

      {!review && !loading && (
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative rounded-2xl border-2 border-dashed transition-all p-8 text-center ${
            dragActive ? "border-accent-sage bg-pastel-sage/10" : "border-sand/60 bg-white/50"
          }`}
        >
          {previewUrl ? (
            <div className="space-y-4">
              <img src={previewUrl} alt="Practice preview" className="max-h-64 mx-auto rounded-xl shadow-card-soft object-contain" />
              <div className="flex items-center justify-center gap-3">
                <button onClick={() => fileInputRef.current?.click()} className="text-xs font-semibold text-muted-brown hover:text-deep-earth transition-colors">
                  Choose different image
                </button>
                <button onClick={handleSubmit} className="inline-flex items-center gap-1.5 bg-gradient-to-r from-accent-sage to-accent-sky text-white text-sm font-semibold rounded-full px-5 py-2.5 shadow-sticker hover:shadow-glow-sage transition-all">
                  <Sparkles size={14} />
                  Get Feedback
                </button>
              </div>
            </div>
          ) : (
            <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-3 w-full">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-accent-sage/20 to-accent-sky/20 flex items-center justify-center">
                <Upload size={26} className="text-accent-sage" />
              </div>
              <div>
                <p className="text-sm font-semibold text-deep-earth">Upload your practice work</p>
                <p className="text-xs text-muted-brown mt-0.5">Click or drag an image here</p>
              </div>
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
          />
        </div>
      )}

      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-accent-sage/20 to-accent-sky/20 flex items-center justify-center">
            <Loader2 size={28} className="text-accent-sage animate-spin" />
          </div>
          <p className="text-muted-brown text-sm">Your AI teacher is reviewing your practice work...</p>
        </div>
      )}

      {error && !loading && (
        <div className="flex flex-col items-center text-center gap-3 py-12">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-accent-rose to-accent-rose-light flex items-center justify-center">
            <AlertCircle size={24} className="text-white" />
          </div>
          <p className="text-accent-rose font-semibold text-sm">{error}</p>
          <button onClick={handleSubmit} className="inline-flex items-center gap-1.5 text-sm text-accent-rose font-medium bg-white/60 hover:bg-white rounded-full px-4 py-2 transition-all">
            Try again
          </button>
        </div>
      )}

      <AnimatePresence>
        {review && !loading && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-sage to-accent-sky flex items-center justify-center shadow-sticker">
                <CheckCircle2 size={20} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-bold text-deep-earth">Practice Review</p>
                <p className="text-xs text-muted-brown">Targeted feedback on your {techniqueName} attempt</p>
              </div>
            </div>

            {review.strengths.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp size={16} className="text-accent-sage" />
                  <p className="text-sm font-bold text-accent-sage">What you did well</p>
                </div>
                {review.strengths.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2.5 bg-pastel-sage/15 rounded-xl border border-accent-sage/20 p-3">
                    <CheckCircle2 size={16} className="text-accent-sage flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-deep-earth leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            )}

            {review.improvements.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <Lightbulb size={16} className="text-accent-amber-deep" />
                  <p className="text-sm font-bold text-accent-amber-deep">Areas to improve</p>
                </div>
                {review.improvements.map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} className="flex items-start gap-2.5 bg-pastel-amber/20 rounded-xl border border-accent-amber/20 p-3">
                    <ArrowRight size={16} className="text-accent-amber-deep flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-deep-earth leading-relaxed">{s}</p>
                  </motion.div>
                ))}
              </div>
            )}

            <div className="bg-white/70 rounded-2xl border border-sand/40 p-5">
              <div className="prose prose-sm max-w-none [&_p]:text-sm [&_p]:text-muted-brown [&_p]:leading-relaxed [&_p]:mb-2 [&_strong]:text-deep-earth [&_strong]:font-semibold">
                <MarkdownRenderer content={review.feedback} />
              </div>
            </div>

            {review.nextStep && (
              <div className="bg-gradient-to-r from-pastel-sky/30 to-pastel-lavender/20 rounded-2xl border border-accent-sky/20 p-4 flex items-start gap-3">
                <ArrowRight size={18} className="text-accent-sky flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wider text-accent-sky mb-0.5">Next Step</p>
                  <p className="text-sm text-deep-earth leading-relaxed">{review.nextStep}</p>
                </div>
              </div>
            )}

            <button onClick={handleReset} className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-brown hover:text-deep-earth transition-colors">
              <Upload size={14} />
              Submit another practice attempt
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
