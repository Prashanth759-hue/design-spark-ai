import { motion } from "framer-motion";

const TypingIndicator = () => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    className="flex gap-3 px-4 py-4 bg-chat-assistant"
  >
    <div className="flex items-center justify-center w-7 h-7 rounded-md shrink-0 bg-primary/15">
      <div className="flex gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "0ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "300ms" }} />
        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse-glow" style={{ animationDelay: "600ms" }} />
      </div>
    </div>
    <div className="flex items-center">
      <span className="text-xs text-muted-foreground">CDAI is analyzing...</span>
    </div>
  </motion.div>
);

export default TypingIndicator;
