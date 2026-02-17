import { useState, useRef, useEffect, useMemo } from "react";
import Sidebar from "@/components/Sidebar";
import ChatMessage, { Message } from "@/components/ChatMessage";
import ChatInput from "@/components/ChatInput";
import WelcomeScreen from "@/components/WelcomeScreen";
import TypingIndicator from "@/components/TypingIndicator";
import Viewport3D from "@/components/Viewport3D";
import { streamChat, ChatMsg } from "@/lib/streamChat";
import { parseDesignParams } from "@/lib/parseDesignParams";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeModule, setActiveModule] = useState("requirements");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [show3D, setShow3D] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const designParams = useMemo(() => parseDesignParams(messages), [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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

    // Build conversation history for AI
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
        onNewChat={() => { setMessages([]); setShow3D(false); }}
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
            <button
              onClick={() => setShow3D(!show3D)}
              className={`text-[10px] font-mono px-2 py-1 rounded transition-colors ${
                show3D
                  ? "bg-primary/20 text-primary"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              3D View
            </button>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse-glow" />
              <span className="text-[10px] text-muted-foreground">Online</span>
            </div>
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
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>
            <ChatInput onSend={handleSend} isLoading={isLoading} activeModule={activeModule} />
          </div>

          {/* 3D Viewport */}
          <Viewport3D visible={show3D} onToggle={() => setShow3D(!show3D)} designParams={designParams} />
        </div>
      </main>
    </div>
  );
};

export default Index;
