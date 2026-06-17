import { useState, useRef, useEffect } from "react";
import { Send, Paperclip, Mic, Square, X, FileText, Image as ImageIcon, FileSpreadsheet, Box } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from "@/lib/aiModels";
import { Attachment, buildAttachment, buildAudioAttachment, formatSize } from "@/lib/attachments";
import { toast } from "@/hooks/use-toast";

interface ChatInputProps {
  onSend: (message: string, attachments: Attachment[], module?: string, model?: string) => void;
  isLoading: boolean;
  activeModule: string;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
}

const moduleLabels: Record<string, string> = {
  requirements: "Requirement Ingestion",
  generative: "Generative Design",
  simulation: "3D Simulation",
  materials: "Material & Cost",
  logistics: "Logistics & Timeline",
  reporting: "Reporting & Export",
};

const ChatInput = ({ onSend, isLoading, activeModule, selectedModel = DEFAULT_AI_MODEL, onModelChange }: ChatInputProps) => {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [recording, setRecording] = useState(false);
  const [recordSecs, setRecordSecs] = useState(0);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const recordTimerRef = useRef<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isLoading) return;
    onSend(trimmed || "Please analyze the attached file(s).", attachments, undefined, selectedModel);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files);
    const MAX = 20 * 1024 * 1024;
    for (const f of arr) {
      if (f.size > MAX) {
        toast({ title: "File too large", description: `${f.name} exceeds 20MB.`, variant: "destructive" });
        continue;
      }
      try {
        const a = await buildAttachment(f);
        setAttachments((prev) => [...prev, a]);
      } catch (e: any) {
        toast({ title: "Upload error", description: e?.message || String(e), variant: "destructive" });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime = MediaRecorder.isTypeSupported("audio/webm") ? "audio/webm" : "audio/mp4";
      const rec = new MediaRecorder(stream, { mimeType: mime });
      chunksRef.current = [];
      rec.ondataavailable = (e) => { if (e.data.size > 0) chunksRef.current.push(e.data); };
      rec.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        const blob = new Blob(chunksRef.current, { type: mime });
        if (blob.size > 0) {
          const a = await buildAudioAttachment(blob, `voice-${Date.now()}.${mime.includes("webm") ? "webm" : "m4a"}`);
          setAttachments((prev) => [...prev, a]);
        }
      };
      rec.start();
      recorderRef.current = rec;
      setRecording(true);
      setRecordSecs(0);
      recordTimerRef.current = window.setInterval(() => setRecordSecs((s) => s + 1), 1000);
    } catch (e: any) {
      toast({ title: "Microphone error", description: e?.message || "Could not access microphone.", variant: "destructive" });
    }
  };

  const stopRecording = () => {
    recorderRef.current?.stop();
    recorderRef.current = null;
    setRecording(false);
    if (recordTimerRef.current) {
      clearInterval(recordTimerRef.current);
      recordTimerRef.current = null;
    }
  };

  const removeAttachment = (id: string) =>
    setAttachments((prev) => prev.filter((a) => a.id !== id));

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

  const kindIcon = (k: Attachment["kind"]) =>
    k === "image" ? ImageIcon : k === "pdf" ? FileText : k === "cad" ? Box : k === "audio" ? Mic : FileSpreadsheet;

  return (
    <div className="border-t border-border bg-gradient-to-b from-card to-card/60 backdrop-blur px-4 py-3">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
            Module:
          </span>
          <span className="text-[10px] font-mono text-primary">
            {moduleLabels[activeModule]}
          </span>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">Model:</span>
            <select
              value={selectedModel}
              onChange={(e) => onModelChange?.(e.target.value)}
              className="rounded-md border border-border bg-background px-2 py-1 text-[10px] font-mono text-foreground outline-none focus:ring-2 focus:ring-primary/30"
            >
              {AI_MODEL_OPTIONS.map((model) => (
                <option key={model.value} value={model.value}>
                  {model.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Attachment chips */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-2 flex flex-wrap gap-2"
            >
              {attachments.map((a) => {
                const Icon = kindIcon(a.kind);
                return (
                  <div
                    key={a.id}
                    className="group relative flex items-center gap-2 rounded-lg border border-border bg-background pl-2 pr-7 py-1.5 text-xs"
                  >
                    {a.kind === "image" ? (
                      <img src={a.dataUrl} alt={a.name} className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                        <Icon className="w-4 h-4 text-primary" />
                      </div>
                    )}
                    <div className="flex flex-col min-w-0 max-w-[160px]">
                      <span className="truncate font-medium text-foreground">{a.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{a.kind} · {formatSize(a.size)}</span>
                    </div>
                    <button
                      onClick={() => removeAttachment(a.id)}
                      className="absolute top-1 right-1 w-4 h-4 rounded-full bg-secondary text-muted-foreground hover:text-foreground flex items-center justify-center"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {recording && (
          <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/30 text-xs">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            <span className="font-mono text-red-600">Recording… {recordSecs}s</span>
            <button onClick={stopRecording} className="ml-auto px-2 py-0.5 rounded bg-red-500 text-white text-[10px] font-semibold hover:bg-red-600">
              Stop
            </button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,application/pdf,text/*,.csv,.json,.md,.step,.stp,.stl,.dwg,.dxf,.iges,.igs,.obj"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        <div className="relative flex items-end gap-2 rounded-xl border border-border bg-surface p-2 focus-within:glow-border focus-within:border-primary/40 transition-all shadow-sm">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={attachments.length > 0
              ? "Add a note about the attached files (optional)…"
              : "Describe your engineering requirement, attach files, or hold the mic…"}
            rows={1}
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground resize-none outline-none min-h-[36px] max-h-[160px] py-1.5 px-1 scrollbar-thin"
          />
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => fileInputRef.current?.click()}
              title="Attach file"
              className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-surface-hover transition-colors"
            >
              <Paperclip className="w-4 h-4" />
            </button>
            <button
              onClick={recording ? stopRecording : startRecording}
              title={recording ? "Stop recording" : "Record voice"}
              className={`p-1.5 rounded-md transition-colors ${
                recording
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-muted-foreground hover:text-foreground hover:bg-surface-hover"
              }`}
            >
              {recording ? <Square className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            <button
              onClick={handleSend}
              disabled={(!input.trim() && attachments.length === 0) || isLoading}
              className="p-1.5 rounded-md bg-gradient-to-br from-primary to-violet-500 text-primary-foreground hover:opacity-90 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1.5 text-center">
          CDAI Optimizer accepts text, images, PDFs, CAD files & voice. Verify results with domain experts.
        </p>
      </div>
    </div>
  );
};

export default ChatInput;
