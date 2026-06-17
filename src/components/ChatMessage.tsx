import { motion } from "framer-motion";
import { Bot, User, Volume2, Loader2, FileText, Box as BoxIcon, Mic, FileSpreadsheet } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { stripDesignBlock } from "@/lib/parseDesignBlock";
import { useRef, useState } from "react";
import { synthesizeSpeech } from "@/lib/tts";
import { toast } from "@/hooks/use-toast";
import type { Attachment } from "@/lib/attachments";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  module?: string;
  timestamp: Date;
  attachments?: Attachment[];
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const [playing, setPlaying] = useState(false);
  const [loading, setLoading] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handleSpeak = async () => {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setPlaying(false);
      return;
    }
    try {
      setLoading(true);
      const audio = await synthesizeSpeech(stripDesignBlock(message.content));
      audioRef.current = audio;
      audio.onended = () => setPlaying(false);
      audio.onpause = () => setPlaying(false);
      await audio.play();
      setPlaying(true);
    } catch (e: any) {
      toast({ title: "Voice playback failed", description: e?.message || String(e), variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 px-4 py-4 ${isUser ? "bg-chat-user" : "bg-chat-assistant"}`}
    >
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 mt-0.5 ${
          isUser ? "bg-secondary" : "bg-gradient-to-br from-primary/20 to-violet-500/20"
        }`}
      >
        {isUser ? (
          <User className="w-3.5 h-3.5 text-foreground" />
        ) : (
          <Bot className="w-3.5 h-3.5 text-primary" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-medium text-foreground">
            {isUser ? "You" : "CDAI Assistant"}
          </span>
          {message.module && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              {message.module}
            </span>
          )}
          <span className="text-[10px] text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </span>
          {!isUser && message.content && (
            <button
              onClick={handleSpeak}
              className="ml-auto flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
              title={playing ? "Stop" : "Listen"}
            >
              {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Volume2 className="w-3 h-3" />}
              {playing ? "Stop" : "Listen"}
            </button>
          )}
        </div>

        {/* User attachments */}
        {isUser && message.attachments && message.attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-2">
            {message.attachments.map((a) => (
              <div key={a.id} className="flex items-center gap-2 rounded-lg border border-border bg-background px-2 py-1.5 text-xs max-w-[220px]">
                {a.kind === "image" ? (
                  <img src={a.dataUrl} alt={a.name} className="w-10 h-10 rounded object-cover" />
                ) : a.kind === "audio" ? (
                  <audio src={a.dataUrl} controls className="h-8" />
                ) : (
                  <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center">
                    {a.kind === "pdf" ? <FileText className="w-4 h-4 text-primary" /> :
                     a.kind === "cad" ? <BoxIcon className="w-4 h-4 text-primary" /> :
                     <FileSpreadsheet className="w-4 h-4 text-primary" />}
                  </div>
                )}
                {a.kind !== "audio" && (
                  <div className="flex flex-col min-w-0">
                    <span className="truncate font-medium text-foreground">{a.name}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">{a.kind}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {isUser ? (
          <div className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
            {message.content}
          </div>
        ) : (
          <div className="prose prose-sm prose-invert max-w-none text-secondary-foreground leading-relaxed
            prose-headings:text-foreground prose-headings:font-semibold prose-headings:mt-3 prose-headings:mb-1.5
            prose-strong:text-primary prose-strong:font-semibold
            prose-code:text-primary prose-code:bg-secondary prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-xs prose-code:font-mono
            prose-pre:bg-secondary prose-pre:border prose-pre:border-border prose-pre:rounded-lg prose-pre:p-3
            prose-table:border-collapse prose-th:border prose-th:border-border prose-th:px-3 prose-th:py-1.5 prose-th:bg-secondary prose-th:text-xs prose-th:font-medium prose-th:text-foreground
            prose-td:border prose-td:border-border prose-td:px-3 prose-td:py-1.5 prose-td:text-xs
            prose-li:text-secondary-foreground prose-li:marker:text-primary
            prose-a:text-primary prose-a:no-underline hover:prose-a:underline
            prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5"
          >
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {stripDesignBlock(message.content)}
            </ReactMarkdown>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ChatMessage;
