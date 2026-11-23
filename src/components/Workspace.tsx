import { useRef, useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brush, Eraser, Type, Undo2, Redo2, Trash2, Download,
  Pen, Sparkles, ChevronDown, Plus, X, Pencil,
} from "lucide-react";

type Tool = "brush" | "pencil" | "eraser" | "text";

interface NoteItem {
  id: string;
  x: number;
  y: number;
  text: string;
  color: string;
}

const STICKY_COLORS = [
  "#fef3c7",
  "#d1fae5",
  "#dbeafe",
  "#fce7f3",
  "#ede9fe",
  "#fed7aa",
];

const BRUSH_COLORS = [
  "#3d2f1f", "#c97b5e", "#a8d5e2", "#7cb377",
  "#e8a0a0", "#d4a574", "#8b6f47", "#b8a8d8",
];

const SIZES = [2, 4, 8, 14, 22];

export default function Workspace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tool, setTool] = useState<Tool>("brush");
  const [color, setColor] = useState(BRUSH_COLORS[0]);
  const [size, setSize] = useState(SIZES[1]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showSizePicker, setShowSizePicker] = useState(false);
  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [activeNote, setActiveNote] = useState<string | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [redoStack, setRedoStack] = useState<ImageData[]>([]);

  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Initialize canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeCanvas = () => {
      const rect = container.getBoundingClientRect();
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Save current content
      const saved = ctx.getImageData(0, 0, canvas.width, canvas.height);

      canvas.width = rect.width;
      canvas.height = rect.height;

      // Fill white background
      ctx.fillStyle = "#fffdf7";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Restore content (if canvas was already sized)
      if (saved.width > 1) {
        ctx.putImageData(saved, 0, 0);
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    return () => window.removeEventListener("resize", resizeCanvas);
  }, []);

  const getCanvasPoint = useCallback((e: React.PointerEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
  }, []);

  const saveToHistory = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setHistory((prev) => [...prev.slice(-19), imageData]);
    setRedoStack([]);
  }, []);

  const startDrawing = useCallback((e: React.PointerEvent) => {
    if (tool === "text") {
      const pt = getCanvasPoint(e);
      const id = `note-${Date.now()}`;
      setNotes((prev) => [...prev, {
        id,
        x: pt.x,
        y: pt.y,
        text: "",
        color: STICKY_COLORS[prev.length % STICKY_COLORS.length],
      }]);
      setActiveNote(id);
      return;
    }

    saveToHistory();
    setIsDrawing(true);
    lastPoint.current = getCanvasPoint(e);

    // Draw a dot on click
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const pt = lastPoint.current;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, size / 2, 0, Math.PI * 2);
    ctx.fillStyle = tool === "eraser" ? "#fffdf7" : color;
    ctx.fill();
  }, [tool, color, size, getCanvasPoint, saveToHistory]);

  const draw = useCallback((e: React.PointerEvent) => {
    if (!isDrawing || tool === "text") return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const pt = getCanvasPoint(e);
    const last = lastPoint.current;
    if (!last) return;

    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(pt.x, pt.y);
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.lineWidth = size;
    ctx.strokeStyle = tool === "eraser" ? "#fffdf7" : color;

    if (tool === "pencil") {
      ctx.globalAlpha = 0.6;
    } else {
      ctx.globalAlpha = 1;
    }

    ctx.stroke();
    ctx.globalAlpha = 1;
    lastPoint.current = pt;
  }, [isDrawing, tool, color, size, getCanvasPoint]);

  const stopDrawing = useCallback(() => {
    setIsDrawing(false);
    lastPoint.current = null;
  }, []);

  const undo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const previous = prev[prev.length - 1];
      setRedoStack((r) => [...r, current]);
      ctx.putImageData(previous, 0, 0);
      return prev.slice(0, -1);
    });
  }, []);

  const redo = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    setRedoStack((prev) => {
      if (prev.length === 0) return prev;
      const current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const next = prev[prev.length - 1];
      setHistory((h) => [...h, current]);
      ctx.putImageData(next, 0, 0);
      return prev.slice(0, -1);
    });
  }, []);

  const clearCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    saveToHistory();
    ctx.fillStyle = "#fffdf7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    setNotes([]);
  }, [saveToHistory]);

  const downloadCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Create a temp canvas to include notes
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;
    tempCtx.drawImage(canvas, 0, 0);

    // Draw notes
    notes.forEach((note) => {
      tempCtx.fillStyle = note.color;
      tempCtx.shadowColor = "rgba(0,0,0,0.1)";
      tempCtx.shadowBlur = 8;
      tempCtx.shadowOffsetY = 2;
      tempCtx.fillRect(note.x, note.y, 180, 100);
      tempCtx.shadowBlur = 0;
      tempCtx.shadowOffsetY = 0;
      tempCtx.fillStyle = "#3d2f1f";
      tempCtx.font = "13px sans-serif";
      const lines = note.text.split("\n");
      lines.forEach((line, i) => {
        tempCtx.fillText(line, note.x + 8, note.y + 20 + i * 16, 164);
      });
    });

    const link = document.createElement("a");
    link.download = `atelier-workspace-${Date.now()}.png`;
    link.href = tempCanvas.toDataURL("image/png");
    link.click();
  }, [notes]);

  const updateNoteText = useCallback((id: string, text: string) => {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, text } : n)));
  }, []);

  const deleteNote = useCallback((id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
    setActiveNote(null);
  }, []);

  const tools: { id: Tool; icon: React.ComponentType<{ size?: number; className?: string }>; label: string }[] = [
    { id: "brush", icon: Brush, label: "Brush" },
    { id: "pencil", icon: Pencil, label: "Pencil" },
    { id: "eraser", icon: Eraser, label: "Eraser" },
    { id: "text", icon: Type, label: "Sticky Note" },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-pastel-sage/50 to-pastel-sky/50 border border-accent-sage/30 rounded-full px-4 py-1.5 mb-4">
          <Pen size={14} className="text-accent-sage" />
          <p className="text-accent-sage text-xs font-semibold uppercase tracking-[0.15em]">
            Creative Workspace
          </p>
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold text-deep-earth mb-3">
          Sketch, Doodle & Jot Ideas
        </h2>
        <p className="text-muted-brown max-w-xl mx-auto">
          A space to experiment freely. Draw, add sticky notes, and when you're ready,
          download your sketch to upload for AI feedback.
        </p>
      </motion.div>

      {/* Toolbar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl border border-sand/40 shadow-card-soft p-2 mb-3 flex items-center gap-2 flex-wrap">
        {/* Tool buttons */}
        <div className="flex items-center gap-1 bg-sand/30 rounded-xl p-1">
          {tools.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setTool(id)}
              className={`relative inline-flex items-center justify-center w-9 h-9 rounded-lg transition-all ${
                tool === id
                  ? "bg-gradient-to-br from-accent-amber to-accent-coral text-white shadow-sticker"
                  : "text-muted-brown hover:text-deep-earth hover:bg-white/60"
              }`}
              title={label}
              aria-label={label}
            >
              <Icon size={16} />
            </button>
          ))}
        </div>

        <div className="w-px h-7 bg-sand/40" />

        {/* Color picker */}
        <div className="relative">
          <button
            onClick={() => { setShowColorPicker(!showColorPicker); setShowSizePicker(false); }}
            className="inline-flex items-center gap-1.5 bg-sand/30 rounded-lg px-2.5 py-2 hover:bg-sand/50 transition-all"
            title="Color"
          >
            <div className="w-5 h-5 rounded-full border-2 border-white shadow-sm" style={{ background: color }} />
            <ChevronDown size={12} className="text-muted-brown" />
          </button>
          <AnimatePresence>
            {showColorPicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-1 z-20 bg-white rounded-xl border border-sand/40 shadow-card-warm p-2 grid grid-cols-4 gap-1.5"
              >
                {BRUSH_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { setColor(c); setShowColorPicker(false); }}
                    className={`w-7 h-7 rounded-full border-2 transition-all ${
                      color === c ? "border-accent-amber scale-110" : "border-white hover:scale-105"
                    }`}
                    style={{ background: c }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Size picker */}
        <div className="relative">
          <button
            onClick={() => { setShowSizePicker(!showSizePicker); setShowColorPicker(false); }}
            className="inline-flex items-center gap-1.5 bg-sand/30 rounded-lg px-2.5 py-2 hover:bg-sand/50 transition-all"
            title="Brush size"
          >
            <div className="flex items-center justify-center w-5 h-5">
              <div className="rounded-full bg-deep-earth" style={{ width: Math.min(size, 16), height: Math.min(size, 16) }} />
            </div>
            <ChevronDown size={12} className="text-muted-brown" />
          </button>
          <AnimatePresence>
            {showSizePicker && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                className="absolute top-full left-0 mt-1 z-20 bg-white rounded-xl border border-sand/40 shadow-card-warm p-2 flex items-center gap-1.5"
              >
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSize(s); setShowSizePicker(false); }}
                    className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${
                      size === s ? "bg-accent-amber/20" : "hover:bg-sand/30"
                    }`}
                  >
                    <div className="rounded-full bg-deep-earth" style={{ width: s, height: s }} />
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="w-px h-7 bg-sand/40" />

        {/* Undo / Redo */}
        <div className="flex items-center gap-1">
          <button
            onClick={undo}
            disabled={history.length === 0}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-brown hover:text-deep-earth hover:bg-sand/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Undo"
          >
            <Undo2 size={16} />
          </button>
          <button
            onClick={redo}
            disabled={redoStack.length === 0}
            className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-muted-brown hover:text-deep-earth hover:bg-sand/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            title="Redo"
          >
            <Redo2 size={16} />
          </button>
        </div>

        <div className="w-px h-7 bg-sand/40" />

        {/* Clear + Download */}
        <div className="flex items-center gap-1">
          <button
            onClick={clearCanvas}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-accent-rose hover:bg-accent-rose/10 rounded-lg px-2.5 py-2 transition-all"
            title="Clear canvas"
          >
            <Trash2 size={14} />
            Clear
          </button>
          <button
            onClick={downloadCanvas}
            className="inline-flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-accent-sage to-pastel-sage-dark text-white rounded-lg px-3 py-2 shadow-sticker hover:shadow-glow-sage transition-all"
            title="Download as PNG"
          >
            <Download size={14} />
            Save
          </button>
        </div>

        <div className="flex-1" />

        {/* Active tool label */}
        <div className="text-xs text-muted-brown font-medium hidden sm:block">
          {tools.find((t) => t.id === tool)?.label}
        </div>
      </div>

      {/* Canvas Area */}
      <div
        ref={containerRef}
        className="relative bg-white rounded-2xl border-2 border-sand/40 shadow-card-warm overflow-hidden"
        style={{ height: "500px" }}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={startDrawing}
          onPointerMove={draw}
          onPointerUp={stopDrawing}
          onPointerLeave={stopDrawing}
          className="absolute inset-0 touch-none"
          style={{ cursor: tool === "text" ? "text" : "crosshair" }}
        />

        {/* Sticky notes overlay */}
        {notes.map((note) => (
          <div
            key={note.id}
            className="absolute z-10"
            style={{
              left: note.x,
              top: note.y,
              width: 180,
              minHeight: 100,
            }}
          >
            <div
              className="rounded-lg shadow-lg p-2 h-full"
              style={{ background: note.color }}
            >
              <div className="flex items-center justify-between mb-1">
                <button
                  onClick={() => deleteNote(note.id)}
                  className="text-deep-earth/40 hover:text-accent-rose transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
              <textarea
                value={note.text}
                onChange={(e) => updateNoteText(note.id, e.target.value)}
                onFocus={() => setActiveNote(note.id)}
                placeholder="Type your note..."
                className="w-full bg-transparent text-deep-earth text-xs resize-none outline-none"
                style={{ height: 70 }}
              />
            </div>
          </div>
        ))}

        {/* Empty state hint */}
        {notes.length === 0 && history.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
          >
            <div className="text-center">
              <Brush size={32} className="text-warm-taupe mx-auto mb-2" />
              <p className="text-warm-taupe text-sm">Start drawing or add a sticky note</p>
            </div>
          </motion.div>
        )}
      </div>

      {/* Helper text */}
      <div className="mt-3 flex items-center justify-center gap-2">
        <Sparkles size={12} className="text-accent-amber" />
        <p className="text-xs text-muted-brown">
          Save your sketch, then upload it to the Studio for AI feedback
        </p>
      </div>
    </div>
  );
}
