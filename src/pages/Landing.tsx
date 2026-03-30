import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Cpu, Car, Building2, Cog, CircuitBoard, ArrowRight, Sparkles, Zap, Globe,
  Brain, Rocket, Atom, Satellite, Microscope, Waves, Shield, BotMessageSquare,
  Plane, Ship, Factory, Hammer, Lightbulb, HeartPulse, Leaf, Gauge
} from "lucide-react";

const DOMAINS = [
  { icon: Car, label: "Automotive", desc: "Cars, motorcycles, trucks, EVs & racing vehicles", color: "from-blue-500 to-blue-600" },
  { icon: Building2, label: "Architecture", desc: "Skyscrapers, villas, bridges & structural engineering", color: "from-amber-500 to-orange-500" },
  { icon: Cog, label: "Mechanical", desc: "Engines, turbines, gears & hydraulic systems", color: "from-orange-500 to-red-500" },
  { icon: CircuitBoard, label: "Electronics", desc: "Circuits, PCBs, IoT devices & embedded systems", color: "from-emerald-500 to-teal-500" },
  { icon: BotMessageSquare, label: "Robotics", desc: "Robot arms, drones, autonomous systems & actuators", color: "from-violet-500 to-purple-500" },
  { icon: Plane, label: "Aerospace", desc: "Aircraft, rockets, satellites & propulsion systems", color: "from-sky-500 to-blue-500" },
  { icon: Ship, label: "Marine", desc: "Ships, submarines, offshore platforms & naval systems", color: "from-cyan-500 to-blue-500" },
  { icon: HeartPulse, label: "Biomedical", desc: "Prosthetics, implants, medical devices & imaging", color: "from-rose-500 to-pink-500" },
  { icon: Atom, label: "Nuclear & Energy", desc: "Reactors, solar, wind & power grid systems", color: "from-yellow-500 to-amber-500" },
  { icon: Factory, label: "Industrial", desc: "Manufacturing, CNC, 3D printing & automation", color: "from-stone-500 to-gray-600" },
  { icon: Leaf, label: "Environmental", desc: "Water treatment, waste systems & sustainability", color: "from-green-500 to-emerald-500" },
  { icon: Satellite, label: "Telecom", desc: "Antennas, 5G, fiber optics & signal processing", color: "from-indigo-500 to-violet-500" },
];

const AI_FEATURES = [
  { icon: Brain, title: "AI Design Generation", desc: "Describe your vision in plain English — AI generates parametric 3D models, schematics, and engineering drawings instantly." },
  { icon: Sparkles, title: "Intelligent Optimization", desc: "AI analyzes stress, weight, cost, and performance to recommend optimal designs across any engineering domain." },
  { icon: Zap, title: "Real-Time Simulation", desc: "Physics-based FEA, CFD, thermal analysis, and circuit simulation with live results and interactive controls." },
  { icon: Gauge, title: "Performance Analytics", desc: "Comprehensive dashboards with charts, metrics, and KPIs — from fuel efficiency to structural load factors." },
  { icon: Lightbulb, title: "Smart Suggestions", desc: "Context-aware recommendations for materials, dimensions, tolerances, and manufacturing processes." },
  { icon: Globe, title: "Cross-Domain Integration", desc: "Seamlessly combine mechanical, electrical, and software components in unified multi-physics simulations." },
];

const STATS = [
  { value: "12+", label: "Engineering Domains" },
  { value: "AI", label: "Powered Design" },
  { value: "3D", label: "Real-Time Simulation" },
  { value: "∞", label: "Possibilities" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/20">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-bold text-foreground tracking-tight">CDAI</span>
              <span className="text-xs text-muted-foreground ml-1.5 font-medium">Engineering Platform</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/admin/login")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary">
              <Shield className="w-4 h-4 inline mr-1" />Admin
            </button>
            <button onClick={() => navigate("/auth")}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg hover:bg-secondary">
              Sign In
            </button>
            <button onClick={() => navigate("/auth")}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-primary to-blue-700 text-white text-sm font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all shadow-md">
              Get Started <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.04] blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.03] blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-border/30" />
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20">
              <Rocket className="w-3.5 h-3.5" /> Next-Gen AI Engineering Platform
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold text-foreground leading-[1.1] mb-6 tracking-tight">
              Design Anything.<br />
              <span className="gradient-text">Engineer Everything.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-12 leading-relaxed">
              The all-in-one AI platform for engineering. From automotive to aerospace, robotics to biomedical — 
              design, simulate, and optimize across <strong className="text-foreground">12+ engineering domains</strong> with natural language and real-time 3D.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 md:gap-16 mb-12">
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1">{s.label}</div>
                </motion.div>
              ))}
            </div>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button onClick={() => navigate("/auth")}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white font-bold text-sm hover:shadow-2xl hover:shadow-primary/30 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
                Start Building Free <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
              <button onClick={() => navigate("/auth")}
                className="px-8 py-4 rounded-2xl bg-card text-foreground font-bold text-sm hover:bg-secondary transition-colors border border-border shadow-sm">
                Watch Demo
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Domains */}
      <section className="max-w-7xl mx-auto px-6 pb-28">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-semibold mb-4">
            <Globe className="w-3.5 h-3.5" /> Universal Engineering
          </div>
          <h2 className="text-4xl font-extrabold text-foreground mb-4">12+ Engineering Domains</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">One platform for every engineering discipline. No domain left behind.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DOMAINS.map((d, i) => (
            <motion.div key={d.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="group bg-card border border-border rounded-2xl p-5 hover:shadow-xl hover:border-primary/20 hover:-translate-y-1 transition-all cursor-pointer"
              onClick={() => navigate("/auth")}>
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${d.color} flex items-center justify-center mb-4 shadow-sm group-hover:shadow-md transition-shadow`}>
                <d.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-bold text-foreground mb-1.5">{d.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              <div className="mt-3 text-primary text-xs font-semibold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Explore <ArrowRight className="w-3 h-3" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Features */}
      <section className="bg-gradient-to-b from-secondary/50 to-background border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-28">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Brain className="w-3.5 h-3.5" /> AI-Powered
            </div>
            <h2 className="text-4xl font-extrabold text-foreground mb-4">Modern AI Features</h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Cutting-edge artificial intelligence built into every workflow.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {AI_FEATURES.map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/10 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <f.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-28 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <h2 className="text-4xl font-extrabold text-foreground mb-5">Ready to engineer the future?</h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">Join thousands of engineers using AI to design, simulate, and build across every domain.</p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button onClick={() => navigate("/auth")}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white font-bold text-sm hover:shadow-2xl hover:shadow-primary/30 transition-all shadow-lg shadow-primary/20">
              Create Free Account <ArrowRight className="w-4 h-4 inline ml-2" />
            </button>
            <button onClick={() => navigate("/admin/login")}
              className="px-8 py-4 rounded-2xl bg-card text-foreground font-bold text-sm hover:bg-secondary transition-colors border border-border">
              Admin Login
            </button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                <Cpu className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-bold text-foreground">CDAI Platform</span>
              <span className="text-xs text-muted-foreground">© 2026</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-muted-foreground">
              <span>12+ Engineering Domains</span>
              <span>•</span>
              <span>AI-Powered Design</span>
              <span>•</span>
              <span>Real-Time 3D Simulation</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
