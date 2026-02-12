import { useState, useRef, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import TypingIndicator from "@/components/TypingIndicator";

const moduleResponses: Record<string, string> = {
  requirements:
    "I've analyzed your requirements. Based on the specified dimensions and load capacity, I recommend the following parameters:\n\n• **Material**: High-strength structural steel (ASTM A992)\n• **Safety Factor**: 2.5x (per AASHTO standards)\n• **Estimated Load Distribution**: Uniform across 4 primary supports\n• **Critical Dimensions**: Cross-section 1200mm × 800mm\n\nWould you like me to proceed with generating optimized design alternatives?",
  generative:
    "Generating design alternatives using topology optimization...\n\n✅ **Design A**: Lattice structure — 23% weight reduction, high manufacturability\n✅ **Design B**: Organic form — 31% weight reduction, requires additive manufacturing\n✅ **Design C**: Hybrid approach — 27% weight reduction, standard CNC compatible\n\nAll designs meet the specified load requirements with a minimum safety factor of 2.0. Shall I run FEA simulations on any of these?",
  simulation:
    "Running finite element analysis...\n\n📊 **Stress Analysis Results:**\n• Max Von Mises Stress: 245 MPa (within yield strength of 345 MPa)\n• Max Displacement: 2.3mm at center span\n• Factor of Safety: 1.41 (minimum acceptable: 1.25)\n\n🔄 **Dynamic Load Test:**\n• Natural Frequency: 12.4 Hz (no resonance risk)\n• Fatigue Life: >1,000,000 cycles\n\nAll simulations passed. Ready to proceed to material optimization.",
  materials:
    "📦 **Material Comparison Analysis:**\n\n| Property | Steel A992 | Aluminum 6061 | Carbon Fiber |\n|----------|-----------|---------------|-------------|\n| Cost/kg | $0.85 | $2.40 | $28.50 |\n| Density | 7850 kg/m³ | 2700 kg/m³ | 1600 kg/m³ |\n| Yield | 345 MPa | 276 MPa | 600 MPa |\n| Total Est. | $12,400 | $18,200 | $142,000 |\n\n**Recommendation**: Steel A992 offers the best cost-performance ratio for this application.",
  logistics:
    "📅 **Production Timeline Estimate:**\n\n1. **Design Finalization** — 2 weeks\n2. **Material Procurement** — 3-4 weeks (lead time for A992 steel)\n3. **CNC Machining** — 1 week per unit\n4. **Welding & Assembly** — 3 days per unit\n5. **Quality Inspection** — 2 days per unit\n6. **Surface Treatment** — 1 week (batch)\n\n**Total for 500 units**: ~18 weeks\n**Estimated Production Cost**: $6.2M\n\nShall I optimize the timeline for faster delivery?",
  reporting:
    "📄 **Report Generation Ready**\n\nI can generate the following documents:\n\n• **Engineering Drawing Package** (DWG/PDF) — All dimensions, tolerances, and GD&T\n• **FEA Report** — Complete stress analysis with visualizations\n• **Bill of Materials** — Itemized component list with costs\n• **Production Schedule** — Gantt chart with milestones\n• **Compliance Report** — Standards verification (ISO, ASTM, AASHTO)\n\nSelect the reports you need, or I can generate the complete package.",
};

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("requirements");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (content: string, module?: string) => {
    const mod = module || activeModule;
    if (module) setActiveModule(module);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content,
      module: mod,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);

    // Simulate AI response
    setTimeout(() => {
      const response = moduleResponses[mod] || moduleResponses.requirements;
      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: response,
        module: mod,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMsg]);
      setIsLoading(false);
    }, 1500);
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeModule={activeModule}
        onModuleSelect={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">AI Design Assistant</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
              v1.0
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
              <span className="text-[10px] text-muted-foreground">Online</span>
            </div>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto scrollbar-thin">
          {messages.length === 0 ? (
            <WelcomeScreen onSuggestionClick={handleSend} />
          ) : (
            <div className="max-w-3xl mx-auto">
              {messages.map((msg) => (
                <ChatMessage key={msg.id} message={msg} />
              ))}
              {isLoading && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isLoading} activeModule={activeModule} />
      </main>
    </div>
  );
};

export default Index;
