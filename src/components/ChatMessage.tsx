import { motion } from "framer-motion";
import { Bot, User } from "lucide-react";

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
        <div className="text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </motion.div>
  );
};

export default ChatMessage;
