import { motion, AnimatePresence } from "framer-motion";
import { Wand2, X, Download } from "lucide-react";

interface MasterpieceModalProps {
  open: boolean;
  onClose: () => void;
  imageData: string | null;
  loading: boolean;
  error: string | null;
}

export default function MasterpieceModal({ open, onClose, imageData, loading, error }: MasterpieceModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <div className="absolute inset-0 bg-deep-earth/60 backdrop-blur-sm" />

          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
            onClick={(e) => e.stopPropagation()}
            className="relative bg-cream rounded-3xl shadow-card-warm border border-sand/50 w-full max-w-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-pastel-lavender/40 to-pastel-sky/30 px-6 py-4 border-b border-sand/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-lavender to-accent-sky flex items-center justify-center shadow-sticker">
                  <Wand2 size={20} className="text-white" />
                </div>
                <div>
                  <h2 className="font-display text-lg font-bold text-deep-earth">Your Masterpiece</h2>
                  <p className="text-xs text-muted-brown">Generated in the style of your artwork</p>
                </div>
              </div>
              <button onClick={onClose} className="text-muted-brown hover:text-deep-earth transition-colors" aria-label="Close">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 flex flex-col items-center gap-4">
              {loading && (
                <div className="flex flex-col items-center gap-3 py-12">
                  <div className="w-12 h-12 rounded-full border-4 border-sand/40 border-t-accent-lavender animate-spin" />
                  <p className="text-sm text-muted-brown">Painting your masterpiece...</p>
                </div>
              )}

              {error && !loading && (
                <div className="text-center py-8">
                  <p className="text-accent-rose font-semibold text-sm">{error}</p>
                </div>
              )}

              {imageData && !loading && (
                <>
                  <motion.img
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    src={imageData}
                    alt="AI-generated masterpiece"
                    className="rounded-2xl shadow-card-warm max-w-full max-h-[400px] object-contain"
                  />
                  <a
                    href={imageData}
                    download="atelier-masterpiece.png"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-accent-lavender to-accent-sky text-white text-sm font-medium px-5 py-2.5 rounded-full transition-all hover:shadow-glow-sage"
                  >
                    <Download size={16} />
                    Download masterpiece
                  </a>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
