import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { stripDesignBlock } from "@/lib/parseDesignBlock";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  module?: string;
  timestamp: Date;
}

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className={`flex gap-3 px-4 py-4 ${isUser ? "bg-chat-user" : "bg-chat-assistant"}`}
    >
      <div
        className={`flex items-center justify-center w-7 h-7 rounded-md shrink-0 mt-0.5 ${
          isUser ? "bg-secondary" : "bg-primary/15"
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
        </div>
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
