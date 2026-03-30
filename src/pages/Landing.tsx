import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Cpu, Car, Building2, Cog, CircuitBoard, ArrowRight, Sparkles, Zap, Globe } from "lucide-react";

const DOMAINS = [
  { icon: Car, label: "Vehicles", desc: "Design cars, motorcycles & buses with real-time 3D", color: "bg-blue-50 text-blue-600" },
  { icon: Building2, label: "Buildings", desc: "Architect skyscrapers, villas & structural analysis", color: "bg-amber-50 text-amber-600" },
  { icon: Cog, label: "Machines", desc: "Engineer turbines, engines & mechanical systems", color: "bg-orange-50 text-orange-600" },
  { icon: CircuitBoard, label: "Circuits", desc: "Simulate electronics with Ohm's law & components", color: "bg-emerald-50 text-emerald-600" },
];

const FEATURES = [
  { icon: Sparkles, title: "AI-Powered Design", desc: "Describe your engineering vision in natural language and watch it come to life in 3D." },
  { icon: Zap, title: "Real-Time Simulation", desc: "Interactive physics, stress analysis, and performance charts updated live." },
  { icon: Globe, title: "Multi-Domain", desc: "Vehicles, buildings, machines, and circuits — all in one unified platform." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
        <div className="max-w-6xl mx-auto flex items-center justify-between h-16 px-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground">CDAI <span className="gradient-text">Platform</span></span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/admin/login")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Admin
            </button>
            <button onClick={() => navigate("/auth")} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2">
              Sign In
            </button>
            <button onClick={() => navigate("/auth")} className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors shadow-sm">
              Get Started <ArrowRight className="w-3.5 h-3.5 inline ml-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/5 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
              <Sparkles className="w-3.5 h-3.5" /> AI-Powered Engineering Platform
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-foreground leading-tight mb-6 tracking-tight">
              Design. Simulate.<br />
              <span className="gradient-text">Engineer Everything.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
              The cross-domain AI engineering platform. Build vehicles, architect buildings,
              design machines, and simulate circuits — all with natural language and real-time 3D.
            </p>
            <div className="flex items-center justify-center gap-4">
              <button onClick={() => navigate("/auth")}
                className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
                Start Building Free <ArrowRight className="w-4 h-4 inline ml-1.5" />
              </button>
              <button onClick={() => navigate("/dashboard")}
                className="px-8 py-3.5 rounded-xl bg-secondary text-foreground font-semibold text-sm hover:bg-secondary/80 transition-colors border border-border">
                View Dashboard
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Domains */}
      <section className="max-w-6xl mx-auto px-6 pb-24">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">Four Engineering Domains</h2>
          <p className="text-muted-foreground">One platform, infinite possibilities</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {DOMAINS.map((d, i) => (
            <motion.div key={d.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all cursor-pointer group"
              onClick={() => navigate("/auth")}>
              <div className={`w-12 h-12 rounded-xl ${d.color} flex items-center justify-center mb-4`}>
                <d.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{d.label}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{d.desc}</p>
              <div className="mt-4 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                Explore <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="bg-secondary/50 border-y border-border">
        <div className="max-w-6xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-3">Why CDAI Platform?</h2>
            <p className="text-muted-foreground">Built for engineers, powered by AI</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <f.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-24 text-center">
        <h2 className="text-3xl font-bold text-foreground mb-4">Ready to start engineering?</h2>
        <p className="text-muted-foreground mb-8">Join the platform and bring your designs to life.</p>
        <button onClick={() => navigate("/auth")}
          className="px-8 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20">
          Create Free Account <ArrowRight className="w-4 h-4 inline ml-1.5" />
        </button>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-secondary/30">
        <div className="max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">CDAI Platform © 2026</span>
          </div>
          <span className="text-xs text-muted-foreground">Cross-Domain AI Engineering</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
