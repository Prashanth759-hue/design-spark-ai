import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Cpu,
  BarChart3,
  Truck,
  FileText,
  ClipboardList,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Plus,
} from "lucide-react";

const modules = [
  { id: "requirements", label: "Requirement Ingestion", icon: ClipboardList, desc: "Dimensions, load, budget" },
  { id: "generative", label: "Generative Design", icon: Sparkles, desc: "AI-powered design generation" },
  { id: "simulation", label: "3D Simulation", icon: Box, desc: "Physics validation & rendering" },
  { id: "materials", label: "Material & Cost", icon: BarChart3, desc: "Analytics & optimization" },
  { id: "logistics", label: "Logistics & Timeline", icon: Truck, desc: "Production scheduling" },
  { id: "reporting", label: "Reporting & Export", icon: FileText, desc: "Documentation & exports" },
];

interface SidebarProps {
  activeModule: string;
  onModuleSelect: (id: string) => void;
  collapsed: boolean;
  onToggle: () => void;
  onNewChat?: () => void;
}

const Sidebar = ({ activeModule, onModuleSelect, collapsed, onToggle, onNewChat }: SidebarProps) => {
  return (
    <motion.aside
      animate={{ width: collapsed ? 56 : 260 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col border-r border-border bg-sidebar h-full overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 h-14 border-b border-border shrink-0">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2 overflow-hidden"
          >
            <Cpu className="w-5 h-5 text-primary shrink-0" />
            <span className="font-semibold text-sm text-foreground truncate">CDAI Optimizer</span>
          </motion.div>
        )}
        {collapsed && <Cpu className="w-5 h-5 text-primary mx-auto" />}
      </div>

      {/* New Chat */}
      <div className="px-2 pt-3 pb-1 shrink-0">
        <button onClick={onNewChat} className="flex items-center gap-2 w-full px-2 py-2 rounded-md text-sm text-muted-foreground hover:bg-surface-hover hover:text-foreground transition-colors">
          <Plus className="w-4 h-4 shrink-0" />
          {!collapsed && <span>New Chat</span>}
        </button>
      </div>

      {/* Module List */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-2 py-2 space-y-0.5">
        {!collapsed && (
          <p className="px-2 pb-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            Modules
          </p>
        )}
        {modules.map((mod) => {
          const Icon = mod.icon;
          const isActive = activeModule === mod.id;
          return (
            <button
              key={mod.id}
              onClick={() => onModuleSelect(mod.id)}
              className={`flex items-center gap-2.5 w-full px-2 py-2 rounded-md text-sm transition-all group ${
                isActive
                  ? "bg-secondary text-foreground glow-border"
                  : "text-sidebar-foreground hover:bg-surface-hover hover:text-foreground"
              }`}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-colors ${
                  isActive ? "text-primary" : "text-module-icon group-hover:text-primary"
                }`}
              />
              {!collapsed && (
                <div className="flex flex-col items-start overflow-hidden">
                  <span className="truncate text-xs font-medium">{mod.label}</span>
                  {isActive && (
                    <span className="text-[10px] text-muted-foreground truncate">{mod.desc}</span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center h-10 border-t border-border text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>
    </motion.aside>
  );
};

export default Sidebar;
