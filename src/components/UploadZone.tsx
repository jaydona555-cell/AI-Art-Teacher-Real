import React, { useCallback, useRef, useState } from "react";
import { Upload, ImageIcon, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UploadZoneProps {
  onImageSelected: (file: File) => void;
  preview: string | null;
  onClear: () => void;
  disabled: boolean;
}

export default function UploadZone({ onImageSelected, preview, onClear, disabled }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    (file: File) => {
      if (!file.type.startsWith("image/")) return;
      onImageSelected(file);
    },
    [onImageSelected]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (disabled) return;
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.currentTarget === e.target) setIsDragging(false);
  }, []);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
      e.target.value = "";
    },
    [handleFile]
  );

  return (
    <AnimatePresence mode="wait">
      {preview ? (
        <motion.div
          key="preview"
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="relative group rounded-3xl overflow-hidden border-2 border-accent-amber/30 shadow-card-warm bg-cream"
        >
          <motion.img
            src={preview}
            alt="Uploaded artwork"
            className="w-full max-h-[480px] object-contain"
            initial={{ opacity: 0, filter: "blur(8px)" }}
            animate={{ opacity: 1, filter: "blur(0px)" }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
          {!disabled && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              onClick={onClear}
              className="absolute top-3 right-3 bg-gradient-to-r from-accent-rose to-accent-rose-light text-white hover:from-accent-rose-deep rounded-full p-2 shadow-glow-rose transition-all duration-200"
              aria-label="Remove image"
            >
              <X size={18} />
            </motion.button>
          )}
        </motion.div>
      ) : (
        <motion.div
          key="dropzone"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => !disabled && inputRef.current?.click()}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`relative rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer flex flex-col items-center justify-center gap-5 py-16 px-8 min-h-[280px]
            ${isDragging
              ? "border-accent-amber bg-gradient-to-br from-pastel-amber to-pastel-coral scale-[1.01] shadow-glow-amber"
              : "border-accent-sage/40 bg-gradient-to-br from-white/50 via-pastel-sky/20 to-pastel-sage/20 hover:border-accent-amber hover:bg-gradient-to-br hover:from-pastel-amber/30 hover:to-pastel-coral/20"
            }
            ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          `}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleChange}
            disabled={disabled}
          />

          <motion.div
            animate={isDragging ? { scale: 1.1, rotate: -8 } : { scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className={`rounded-full p-5 transition-colors duration-300 shadow-sticker ${
              isDragging
                ? "bg-gradient-to-br from-accent-amber to-accent-coral"
                : "bg-gradient-to-br from-pastel-sage to-pastel-sky"
            }`}
          >
            {isDragging ? (
              <ImageIcon size={36} className="text-white" />
            ) : (
              <Upload size={36} className="text-accent-sage" />
            )}
          </motion.div>

          <div className="text-center">
            <p className="text-deep-earth font-semibold text-base mb-1">
              {isDragging ? "Release to upload your artwork" : "Drop your artwork here"}
            </p>
            <p className="text-muted-brown text-sm">
              or <span className="text-accent-amber-deep font-medium underline underline-offset-2">browse to upload</span>
            </p>
            <p className="text-warm-taupe/70 text-xs mt-3">Supports JPG, PNG, WEBP, GIF</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
