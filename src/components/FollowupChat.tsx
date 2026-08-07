import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MessageCircle, Coins, Loader2 } from "lucide-react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

interface FollowupChatProps {
  artworkContext: string | null;
  onTokensEarned: (amount: number, reason: string) => void;
  onQuestionAsked?: () => void;
  apiBase: string;
  apiKey: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function FollowupChat({ artworkContext, onTokensEarned, onQuestionAsked, apiBase, apiKey }: FollowupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [exchangeCount, setExchangeCount] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading || !artworkContext) return;

    const userMsg: Message = { role: "user", content: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setLoading(true);
    if (onQuestionAsked) onQuestionAsked();

    try {
      const response = await fetch(`${apiBase}/functions/v1/analyze-artwork`, {
        method: "POST",
        headers: {
          "apikey": apiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mode: "followup",
          history: newMessages,
          previousFeedback: artworkContext,
        }),
      });

      const data = await response.json().catch(() => null);
      if (!response.ok || !data?.feedback) {
        throw new Error(data?.error || "Couldn't get a response");
      }

      const assistantMsg: Message = { role: "assistant", content: data.feedback };
      setMessages([...newMessages, assistantMsg]);
      setExchangeCount((prev) => {
        const next = prev + 1;
        if (next === 1) onTokensEarned(3, "First follow-up question");
        else if (next === 3) onTokensEarned(5, "Deep engagement");
        else if (next === 5) onTokensEarned(8, "Master apprentice dialogue");
        else if (next % 2 === 0) onTokensEarned(2, "Continued conversation");
        return next;
      });
    } catch {
      setMessages([
        ...newMessages,
        { role: "assistant", content: "I apologize — I had trouble responding to that. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, artworkContext, messages, onTokensEarned, apiBase, apiKey]);

  if (messages.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-5"
      >
        <div className="bg-gradient-to-br from-pastel-sky/40 to-pastel-lavender/30 border border-accent-sky/30 rounded-2xl p-5 text-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-sky to-accent-lavender flex items-center justify-center mx-auto mb-2 shadow-glow-sage">
            <MessageCircle size={20} className="text-white" />
          </div>
          <p className="text-deep-earth font-semibold text-sm">Want to dig deeper?</p>
          <p className="text-muted-brown text-xs mt-1 mb-3">
            Ask follow-up questions about the feedback to earn bonus tokens
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {["How can I practice this?", "Can you explain that technique?", "What masters should I study?"].map((q) => (
              <button
                key={q}
                onClick={() => setInput(q)}
                className="text-xs bg-white/70 hover:bg-white text-muted-brown hover:text-deep-earth border border-sand/50 rounded-full px-3 py-1.5 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-5 bg-white/70 backdrop-blur-sm rounded-2xl border border-accent-sky/20 shadow-card-soft overflow-hidden"
    >
      <div className="bg-gradient-to-r from-pastel-sky/40 to-pastel-lavender/30 px-5 py-3 border-b border-accent-sky/20 flex items-center gap-2">
        <MessageCircle size={16} className="text-accent-sky" />
        <span className="text-sm font-semibold text-deep-earth">Continue the conversation</span>
        <span className="ml-auto flex items-center gap-1 text-xs text-muted-brown">
          <Coins size={12} className="text-accent-amber" />
          {exchangeCount} exchanges
        </span>
      </div>

      <div ref={scrollRef} className="max-h-[300px] overflow-y-auto scroll-warm p-5 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === "user"
                    ? "bg-gradient-to-r from-accent-amber to-accent-coral text-white rounded-br-sm"
                    : "bg-gradient-to-br from-pastel-butter to-pastel-amber/30 text-deep-earth rounded-bl-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <div className="text-sm leading-relaxed">
                    <MarkdownRenderer content={msg.content} />
                  </div>
                ) : (
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="bg-gradient-to-br from-pastel-butter to-pastel-amber/30 rounded-2xl rounded-bl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={14} className="animate-spin text-accent-amber" />
              <span className="text-sm text-muted-brown">Thinking...</span>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-sand/50 p-3 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="Ask a follow-up question..."
          className="flex-1 bg-transparent text-sm text-deep-earth placeholder:text-warm-taupe/60 px-3 py-2 outline-none"
        />
        <button
          onClick={handleSend}
          disabled={!input.trim() || loading}
          className="bg-gradient-to-r from-accent-amber to-accent-coral hover:from-accent-amber-deep hover:to-accent-rose disabled:opacity-30 disabled:cursor-not-allowed text-white rounded-full p-2 transition-all shadow-glow-amber"
          aria-label="Send message"
        >
          <Send size={16} />
        </button>
      </div>
    </motion.div>
  );
}
