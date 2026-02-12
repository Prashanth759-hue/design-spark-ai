import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ChatInputProps {
  onSend: (message: string) => void;
  isLoading: boolean;
  activeModule: string;
}

const moduleLabels: Record<string, string> = {
  requirements: "Requirement Ingestion",
  generative: "Generative Design",
  simulation: "3D Simulation",
  materials: "Material & Cost",
  logistics: "Logistics & Timeline",
  reporting: "Reporting & Export",
};

const ChatInput = ({ onSend, isLoading, activeModule }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed);
    setInput("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 160) + "px";
    }
  }, [input]);

  return (
    <div className="border-t border-border bg-card px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Module:
          </span>
          <span className="text-[10px] font-mono text-primary">
            {moduleLabels[activeModule]}
          </span>
        </div>
        <div className="relative flex items-end gap-2 rounded-lg border border-border bg-surface p-2 focus-within:glow-border transition-shadow">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Describe your engineering requirement...`}
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[36px] max-h-[160px] py-1.5 px-1 scrollbar-thin"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors">
              <Paperclip className="w-4 h-4" />
            </button>
            <button className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors">
              <Mic className="w-4 h-4" />
            </button>
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          CDAI Optimizer generates engineering designs. Always verify results with domain experts.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
