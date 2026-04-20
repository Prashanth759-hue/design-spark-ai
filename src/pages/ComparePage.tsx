import { useState, useRef, Suspense } from "react";
import { useNavigate } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, ContactShadows, PerspectiveCamera, Grid } from "@react-three/drei";
import { ArrowLeft, Send, Zap, Sparkles, AlertTriangle } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { streamChat, ChatMsg } from "@/lib/streamChat";
import { AI_MODEL_OPTIONS, DEFAULT_AI_MODEL } from "@/lib/aiModels";
import { parseDesignBlock, designBlockToDrawingType, designBlockToDrawingParams, designBlockTo3DParams, stripDesignBlock, DesignBlock } from "@/lib/parseDesignBlock";
import { EngineeringDrawing } from "@/components/EngineeringDrawing";
import { BeamStructure } from "@/components/3d/BeamStructure";
import { BuildingStructure } from "@/components/3d/BuildingStructure";
import { SportsCar } from "@/components/3d/SportsCar";
import { RobotArmPreview } from "@/components/3d/previews/RobotArmPreview";
import { JetPreview } from "@/components/3d/previews/JetPreview";
import { VesselPreview } from "@/components/3d/previews/VesselPreview";
import { HeartPreview } from "@/components/3d/previews/HeartPreview";
import { ConveyorPreview } from "@/components/3d/previews/ConveyorPreview";
import { toast } from "@/hooks/use-toast";

const DEFAULT_CAR_CONFIG = {
  bodyColor: "#c8102e", accentColor: "#111", accentZone: "none" as const,
  rimColor: "#d4d4d8", paintFinish: "gloss" as const, windowTint: 0.3,
  headlightColor: "#fef08a", rimStyle: "spoke" as const, bodyKit: "stock" as const,
};

function MiniScene({ block }: { block: DesignBlock | null }) {
  if (!block) {
    return (
      <>
        <PerspectiveCamera makeDefault position={[5, 3.5, 5]} fov={40} />
        <Environment preset="studio" background={false} />
        <ambientLight intensity={0.4} />
        <directionalLight position={[5, 8, 4]} intensity={1.2} />
        <BeamStructure params={{
          structureType: "beam", beamLength: 4, beamHeight: 0.3, beamWidth: 0.6,
          columnHeight: 1.2, columnWidth: 0.25, materialColor: "#22d3ee",
          columnColor: "#0e7490", baseColor: "#164e63", label: "",
        } as any} />
        <ContactShadows position={[0, -0.9, 0]} opacity={0.4} scale={12} blur={2} />
        <OrbitControls enableDamping minDistance={2} maxDistance={15} />
      </>
    );
  }

  const params = designBlockTo3DParams(block);
  const p = (params as any).rawParams || {};

  const visual = (() => {
    switch (block.domain) {
      case "vehicle": return <SportsCar config={DEFAULT_CAR_CONFIG as any} autoRotate={false} />;
      case "building": return <BuildingStructure params={params as any} />;
      case "robotics": return <RobotArmPreview reach={p.reach} payload={p.payload} joints={p.joints} speed={p.speed} />;
      case "aerospace": return <JetPreview wingspan={p.wingspan} fuselageLength={p.fuselageLength} altitude={p.altitude} airspeed={p.airspeed} engines={p.engines} />;
      case "marine": return <VesselPreview length={p.length} beam={p.beam} displacement={p.displacement} speed={p.speed} hullDrag={p.hullDrag} />;
      case "biomedical": return <HeartPreview bpm={p.bpm} strokeVolume={p.strokeVolume} systolic={p.systolic} diastolic={p.diastolic} />;
      case "industrial": return <ConveyorPreview beltSpeed={p.beltSpeed} spindleRpm={p.spindleRpm} throughput={p.throughput} efficiency={p.efficiency} quality={p.quality} />;
      default: return <BeamStructure params={params as any} />;
    }
  })();

  return (
    <>
      <PerspectiveCamera makeDefault position={[5, 3.5, 5]} fov={40} />
      <Environment preset="studio" background={false} />
      <directionalLight position={[8, 12, 6]} intensity={1.5} castShadow color="#fff5e6" />
      <directionalLight position={[-5, 6, -4]} intensity={0.4} color="#b0d4f1" />
      <ambientLight intensity={0.2} color="#e0e7ff" />
      {visual}
      <ContactShadows position={[0, -0.9, 0]} opacity={0.4} scale={12} blur={2.5} />
      <Grid position={[0, -0.9, 0]} args={[10, 10]} cellSize={0.5} cellThickness={0.3}
        cellColor="#94a3b8" sectionSize={2} sectionThickness={0.6} sectionColor="#22d3ee"
        fadeDistance={10} fadeStrength={1} infiniteGrid />
      <OrbitControls enableDamping minDistance={2} maxDistance={15} maxPolarAngle={Math.PI / 2.1} />
    </>
  );
}

interface PaneState {
  model: string;
  content: string;
  block: DesignBlock | null;
  loading: boolean;
  error: string | null;
}

const initPane = (model: string): PaneState => ({ model, content: "", block: null, loading: false, error: null });

function ResultPane({ pane, onModelChange, side }: {
  pane: PaneState; onModelChange: (m: string) => void; side: "left" | "right";
}) {
  const drawingType = pane.block ? designBlockToDrawingType(pane.block) : "machine";
  const drawingParams = pane.block ? designBlockToDrawingParams(pane.block) : {};
  const display = stripDesignBlock(pane.content);
  const modelLabel = AI_MODEL_OPTIONS.find((m) => m.value === pane.model)?.label || pane.model;

  return (
    <div className="flex flex-col h-full min-h-0 bg-background border-r border-border last:border-r-0">
      <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-1.5 h-1.5 rounded-full ${pane.loading ? "bg-amber-500 animate-pulse" : pane.error ? "bg-red-500" : "bg-green-500"}`} />
          <span className="text-xs font-bold text-foreground truncate">{modelLabel}</span>
          {pane.block && (
            <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-primary/10 text-primary truncate">
              {pane.block.domain}/{pane.block.type.replace(/_/g, " ")}
            </span>
          )}
        </div>
        <select
          value={pane.model}
          onChange={(e) => onModelChange(e.target.value)}
          disabled={pane.loading}
          className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-mono text-foreground outline-none focus:ring-1 focus:ring-primary"
        >
          {AI_MODEL_OPTIONS.map((m) => (
            <option key={m.value} value={m.value}>{m.label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-rows-[1fr_220px] flex-1 min-h-0">
        {/* Chat response */}
        <div className="overflow-y-auto p-3 text-sm prose prose-sm max-w-none scrollbar-thin">
          {pane.error ? (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-xs">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{pane.error}</span>
            </div>
          ) : display ? (
            <ReactMarkdown>{display}</ReactMarkdown>
          ) : pane.loading ? (
            <div className="text-xs text-muted-foreground italic">Generating with {modelLabel}...</div>
          ) : (
            <div className="text-xs text-muted-foreground italic">Waiting for prompt...</div>
          )}
        </div>

        {/* 3D + drawing toggle */}
        <div className="grid grid-cols-2 border-t border-border min-h-0">
          <div className="relative bg-background border-r border-border">
            <div className="absolute top-1.5 left-1.5 z-10 text-[9px] font-mono px-1.5 py-0.5 rounded bg-card/80 backdrop-blur text-foreground border border-border">3D</div>
            <Canvas shadows gl={{ antialias: true }}>
              <Suspense fallback={null}>
                <MiniScene block={pane.block} />
              </Suspense>
            </Canvas>
          </div>
          <div className="overflow-auto bg-card scrollbar-thin">
            <div className="text-[9px] font-mono px-2 py-1 sticky top-0 bg-card/90 backdrop-blur text-muted-foreground border-b border-border">BLUEPRINT</div>
            {pane.block ? (
              <div className="origin-top-left scale-[0.32]" style={{ width: 1000, height: 700 }}>
                <EngineeringDrawing type={drawingType} params={drawingParams} />
              </div>
            ) : (
              <div className="p-3 text-[10px] text-muted-foreground italic">No design generated yet</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const ComparePage = () => {
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState("Design a 6-DOF robotic arm with 1.2m reach and 5kg payload");
  const [leftPane, setLeftPane] = useState<PaneState>(initPane("openai/gpt-5"));
  const [rightPane, setRightPane] = useState<PaneState>(initPane(DEFAULT_AI_MODEL));
  const abortControllers = useRef<{ left?: AbortController; right?: AbortController }>({});

  const runPane = (
    side: "left" | "right",
    model: string,
    history: ChatMsg[],
    setPane: React.Dispatch<React.SetStateAction<PaneState>>,
  ) => {
    abortControllers.current[side]?.abort();
    const controller = new AbortController();
    abortControllers.current[side] = controller;

    setPane((prev) => ({ ...prev, model, content: "", block: null, loading: true, error: null }));

    let acc = "";
    return streamChat({
      messages: history,
      model,
      signal: controller.signal,
      onDelta: (chunk) => {
        acc += chunk;
        setPane((prev) => ({ ...prev, content: acc }));
      },
      onDone: () => {
        const block = parseDesignBlock([{ role: "assistant", content: acc }]);
        setPane((prev) => ({ ...prev, loading: false, block: block || prev.block }));
      },
      onError: (err) => {
        setPane((prev) => ({ ...prev, loading: false, error: err }));
        toast({ title: `${side === "left" ? "Left" : "Right"} model error`, description: err, variant: "destructive" });
      },
    });
  };

  const handleSend = () => {
    const trimmed = prompt.trim();
    if (!trimmed || leftPane.loading || rightPane.loading) return;

    const history: ChatMsg[] = [{ role: "user", content: trimmed }];

    // Run both in parallel
    runPane("left", leftPane.model, history, setLeftPane);
    runPane("right", rightPane.model, history, setRightPane);
  };

  const swapModels = () => {
    setLeftPane((p) => ({ ...p, model: rightPane.model }));
    setRightPane((p) => ({ ...p, model: leftPane.model }));
  };

  const isAnyLoading = leftPane.loading || rightPane.loading;

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between gap-2 px-4 h-14 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/")} className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-violet-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-white" />
            </div>
            <div>
              <div className="text-sm font-bold text-foreground leading-none">Compare Mode</div>
              <div className="text-[10px] text-muted-foreground">Run the same prompt against two models in parallel</div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={swapModels} disabled={isAnyLoading}
            className="text-[10px] font-mono px-2 py-1 rounded bg-secondary text-muted-foreground hover:text-foreground transition-colors disabled:opacity-30">
            ↔ Swap
          </button>
        </div>
      </header>

      {/* Prompt bar */}
      <div className="px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="max-w-5xl mx-auto flex items-center gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Ask both models the same engineering question..."
            disabled={isAnyLoading}
            className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
          />
          <button onClick={handleSend} disabled={isAnyLoading || !prompt.trim()}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            {isAnyLoading ? <Zap className="w-3.5 h-3.5 animate-pulse" /> : <Send className="w-3.5 h-3.5" />}
            {isAnyLoading ? "Running both..." : "Compare"}
          </button>
        </div>
      </div>

      {/* Split panes */}
      <div className="flex-1 grid grid-cols-2 min-h-0">
        <ResultPane pane={leftPane} side="left" onModelChange={(m) => setLeftPane((p) => ({ ...p, model: m }))} />
        <ResultPane pane={rightPane} side="right" onModelChange={(m) => setRightPane((p) => ({ ...p, model: m }))} />
      </div>
    </div>
  );
};

export default ComparePage;
