import { motion } from "framer-motion";
import { Box, Cpu, BarChart3, Truck, FileText, ClipboardList, Sparkles, ArrowRight } from "lucide-react";

const suggestions = [
  { icon: ClipboardList, text: "Design a steel bridge for 50-ton load capacity", module: "requirements" },
  { icon: Sparkles, text: "Generate optimized chassis design for an EV", module: "generative" },
  { icon: Box, text: "Run stress simulation on a beam structure", module: "simulation" },
  { icon: BarChart3, text: "Compare material costs for aluminum vs titanium", module: "materials" },
  { icon: Truck, text: "Plan production timeline for 500 units", module: "logistics" },
  { icon: FileText, text: "Export engineering report with specifications", module: "reporting" },
];

interface WelcomeScreenProps {
  onSuggestionClick: (text: string, attachments?: any[], module?: string) => void;
}

const WelcomeScreen = ({ onSuggestionClick }: WelcomeScreenProps) => {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-2xl w-full"
      >
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 glow-primary mb-4">
            <Cpu className="w-7 h-7 text-primary" />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">
            Cross Domain AI Design <span className="gradient-text">Optimizer</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
            Generate engineering drawings, run 3D simulations, and optimize materials, costs, and production timelines — all powered by AI.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {suggestions.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.button
                key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + i * 0.05 }}
                onClick={() => onSuggestionClick(s.text, s.module)}
                className="group flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-surface-hover hover:glow-border text-left transition-all"
              >
                <Icon className="w-4 h-4 text-module-icon shrink-0 mt-0.5" />
                <span className="text-xs text-secondary-foreground group-hover:text-foreground transition-colors leading-relaxed flex-1">
                  {s.text}
                </span>
                <ArrowRight className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default WelcomeScreen;
