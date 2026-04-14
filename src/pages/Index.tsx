import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import Sidebar from "@/components/Sidebar";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import TypingIndicator from "@/components/TypingIndicator";
import Viewport3D from "@/components/Viewport3D";
import { CarConfigurator } from "@/components/CarConfigurator";
import { streamChat, ChatMsg } from "@/lib/streamChat";
import { parseDesignParams } from "@/lib/parseDesignParams";
import { parseDesignBlock, designBlockToDrawingType, designBlockToDrawingParams, designBlockTo3DParams, DesignBlock } from "@/lib/parseDesignBlock";
import { toast } from "@/hooks/use-toast";
import { useRef, useMemo } from "react";
import { LogOut, Car, Building2, Cog, CircuitBoard, LayoutDashboard, Ruler, BotMessageSquare, Plane, Ship, HeartPulse, Factory } from "lucide-react";
import { EngineeringDrawing } from "@/components/EngineeringDrawing";

const Index = () => {
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("requirements");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const [showConfigurator, setShowConfigurator] = useState(false);
  const [showDrawing, setShowDrawing] = useState(false);
  const [drawingType, setDrawingType] = useState<"vehicle" | "building" | "machine" | "circuit">("vehicle");
  const [drawingParams, setDrawingParams] = useState<Record<string, number | string>>({});
  const [activeDesignBlock, setActiveDesignBlock] = useState<DesignBlock | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use design block for 3D params if available, otherwise fall back to regex parser
  const designParams = useMemo(() => {
    if (activeDesignBlock) {
      return designBlockTo3DParams(activeDesignBlock) as any;
    }
    return parseDesignParams(messages);
  }, [messages, activeDesignBlock]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  const handleSend = async (content: string, module?: string) => {
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

    const history: ChatMsg[] = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));
    history.push({ role: "user", content: `[Module: ${mod}] ${content}` });

    let assistantContent = "";
    const assistantId = (Date.now() + 1).toString();

    await streamChat({
      messages: history,
      onDelta: (chunk) => {
        assistantContent += chunk;
        setMessages((prev) => {
          const last = prev[prev.length - 1];
          if (last?.role === "assistant" && last.id === assistantId) {
            return prev.map((m, i) =>
              i === prev.length - 1 ? { ...m, content: assistantContent } : m
            );
          }
          return [
            ...prev,
            {
              id: assistantId,
              role: "assistant" as const,
              content: assistantContent,
              module: mod,
              timestamp: new Date(),
            },
          ];
        });
      },
      onDone: () => {
        setIsLoading(false);

        // Parse the unified design block from AI response
        const allMsgs = [...messages.map(m => ({ role: m.role, content: m.content })), { role: "assistant", content: assistantContent }];
        const block = parseDesignBlock(allMsgs);
        
        if (block) {
          setActiveDesignBlock(block);
          setDrawingType(designBlockToDrawingType(block));
          setDrawingParams(designBlockToDrawingParams(block));
          setShowDrawing(true);
          setShow3D(true);
        }
      },
      onError: (error) => {
        toast({
          title: "AI Error",
          description: error,
          variant: "destructive",
        });
        setIsLoading(false);
      },
    });
  };

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar
        activeModule={activeModule}
        onModuleSelect={setActiveModule}
        collapsed={sidebarCollapsed}
        onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
        onNewChat={() => { setMessages([]); setShow3D(false); setShowDrawing(false); setActiveDesignBlock(null); }}
      />

      <main className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center justify-between h-14 px-4 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-foreground">AI Design Assistant</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">v2.0</span>
            {activeDesignBlock && (
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-green-500/10 text-green-600">
                {activeDesignBlock.domain} / {activeDesignBlock.type.replace(/_/g, ' ')}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {/* Domain simulators */}
            {[
              { route: "/drive", icon: Car, label: "Drive" },
              { route: "/building", icon: Building2, label: "Building" },
              { route: "/machine", icon: Cog, label: "Machine" },
              { route: "/circuit", icon: CircuitBoard, label: "Circuit" },
              { route: "/robotics", icon: BotMessageSquare, label: "Robotics" },
              { route: "/aerospace", icon: Plane, label: "Aerospace" },
              { route: "/marine", icon: Ship, label: "Marine" },
              { route: "/biomedical", icon: HeartPulse, label: "Bio" },
              { route: "/industrial", icon: Factory, label: "Industrial" },
            ].map(({ route, icon: Icon, label }) => (
              <button key={route} onClick={() => navigate(route)}
                className="flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded-lg bg-accent/20 text-accent-foreground hover:bg-accent/40 transition-colors font-semibold">
                <Icon className="w-3 h-3" /> {label}
              </button>
            ))}

            <div className="w-px h-5 bg-border mx-1" />

            <button onClick={() => navigate("/dashboard")}
              className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg bg-accent/30 text-accent-foreground hover:bg-accent/50 transition-colors font-semibold">
              <LayoutDashboard className="w-3 h-3" /> Dashboard
            </button>
            <button onClick={() => setShowConfigurator(true)}
              className="flex items-center gap-1.5 text-[10px] font-mono px-2.5 py-1 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-semibold shadow-sm">
              🎨 3D Configurator
            </button>
            <button onClick={() => setShowDrawing(!showDrawing)}
              className={`flex items-center gap-1 text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                showDrawing ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              <Ruler className="w-3 h-3" /> Drawing
            </button>
            <button onClick={() => setShow3D(!show3D)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                show3D ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}>
              3D View
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--success))] animate-pulse" />
              <span className="text-[10px] text-muted-foreground">Online</span>
            </div>
            <button onClick={handleSignOut}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors" title="Sign Out">
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        <div className="flex-1 flex min-h-0">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col min-w-0">
            <div className="flex-1 overflow-y-auto scrollbar-thin">
              {messages.length === 0 ? (
                <WelcomeScreen onSuggestionClick={handleSend} />
              ) : (
                <div className="max-w-3xl mx-auto">
                  {messages.map((msg) => (
                    <ChatMessage key={msg.id} message={msg} />
                  ))}
                  {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                    <TypingIndicator />
                  )}
                  {/* Engineering Drawing - auto-appears after relevant AI responses */}
                  {showDrawing && messages.length > 0 && (
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Ruler className="w-4 h-4 text-primary" />
                        <span className="text-xs font-semibold text-foreground">Engineering Blueprint</span>
                        {activeDesignBlock && (
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary">
                            {activeDesignBlock.domain} — {activeDesignBlock.type.replace(/_/g, ' ')}
                          </span>
                        )}
                      </div>
                      <EngineeringDrawing type={drawingType} params={drawingParams} />
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <ChatInput onSend={handleSend} isLoading={isLoading} activeModule={activeModule} />
          </div>

          {/* 3D Viewport */}
          <Viewport3D
            visible={show3D}
            onToggle={() => setShow3D(!show3D)}
            designParams={designParams}
            onOpenConfigurator={() => setShowConfigurator(true)}
          />
        </div>
      </main>

      {/* Full-screen Car Configurator */}
      <CarConfigurator
        visible={showConfigurator}
        onClose={() => setShowConfigurator(false)}
      />
    </div>
  );
};

export default Index;
