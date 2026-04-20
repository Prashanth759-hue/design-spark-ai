import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Cpu, Car, Building2, Cog, CircuitBoard, ArrowRight, Sparkles, Zap, Globe,
  Brain, Rocket, Atom, Satellite, Microscope, Waves, Shield, BotMessageSquare,
  Plane, Ship, Factory, Hammer, Lightbulb, HeartPulse, Leaf, Gauge, LogIn,
  CheckCircle2, Star, Quote, Github, Twitter, Linkedin
} from "lucide-react";

const DOMAINS = [
  { icon: Car, label: "Automotive", desc: "Cars, motorcycles, trucks, EVs & racing", color: "from-blue-500 to-blue-600" },
  { icon: Building2, label: "Architecture", desc: "Skyscrapers, villas, bridges & structures", color: "from-amber-500 to-orange-500" },
  { icon: Cog, label: "Mechanical", desc: "Engines, turbines, gears & hydraulics", color: "from-orange-500 to-red-500" },
  { icon: CircuitBoard, label: "Electronics", desc: "Circuits, PCBs, IoT & embedded", color: "from-emerald-500 to-teal-500" },
  { icon: BotMessageSquare, label: "Robotics", desc: "Robot arms, drones, autonomous systems", color: "from-violet-500 to-purple-500" },
  { icon: Plane, label: "Aerospace", desc: "Aircraft, rockets, satellites & propulsion", color: "from-sky-500 to-blue-500" },
  { icon: Ship, label: "Marine", desc: "Ships, submarines & offshore platforms", color: "from-cyan-500 to-blue-500" },
  { icon: HeartPulse, label: "Biomedical", desc: "Prosthetics, implants & medical devices", color: "from-rose-500 to-pink-500" },
  { icon: Atom, label: "Energy", desc: "Reactors, solar, wind & power grid", color: "from-yellow-500 to-amber-500" },
  { icon: Factory, label: "Industrial", desc: "Manufacturing, CNC & automation", color: "from-stone-500 to-gray-600" },
  { icon: Leaf, label: "Environmental", desc: "Water treatment & sustainability", color: "from-green-500 to-emerald-500" },
  { icon: Satellite, label: "Telecom", desc: "Antennas, 5G & signal processing", color: "from-indigo-500 to-violet-500" },
];

const AI_FEATURES = [
  { icon: Brain, title: "AI Design Generation", desc: "Describe your vision in plain English — AI generates parametric 3D models, schematics, and engineering drawings instantly." },
  { icon: Sparkles, title: "Generative Optimization", desc: "AI analyzes stress, weight, cost, and performance to recommend optimal designs across any engineering domain." },
  { icon: Zap, title: "Real-Time Simulation", desc: "Physics-based FEA, CFD, thermal analysis, and circuit simulation with live results and interactive controls." },
  { icon: Gauge, title: "Performance Analytics", desc: "Comprehensive dashboards with charts, metrics, and KPIs — from fuel efficiency to structural load factors." },
  { icon: Lightbulb, title: "Intelligent Suggestions", desc: "Context-aware recommendations for materials, dimensions, tolerances, and manufacturing processes." },
  { icon: Globe, title: "Cross-Domain Integration", desc: "Seamlessly combine mechanical, electrical, and software components in unified multi-physics simulations." },
];

const STATS = [
  { value: "12+", label: "Engineering Domains" },
  { value: "9", label: "AI Models" },
  { value: "<2s", label: "Design Generation" },
  { value: "ISO", label: "Drawing Standards" },
];

const TESTIMONIALS = [
  { quote: "CDAI cut our preliminary design phase from weeks to hours. The AI nails the parameters every time.", name: "Dr. Lena Hoffmann", role: "Lead Mech. Engineer, AeroDyn", avatar: "LH" },
  { quote: "The cross-domain coupling is unreal — I can prototype a robotic arm and an automotive chassis in the same session.", name: "Rajiv Mehta", role: "Robotics R&D, AutoSys", avatar: "RM" },
  { quote: "Finally a tool where the 3D model and the blueprint actually agree. Saves countless QA cycles.", name: "Sara Okafor", role: "Structural Lead, BuildCorp", avatar: "SO" },
];

const STEPS = [
  { num: "01", title: "Describe", desc: "Tell the AI what you need: 'Design a 6-DOF robot arm with 1.2m reach'" },
  { num: "02", title: "Generate", desc: "Watch parametric 3D models, blueprints, and BOMs materialize in real time" },
  { num: "03", title: "Iterate", desc: "Compare AI models side-by-side. Tweak any parameter. Export to CAD." },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto flex items-center justify-between h-16 px-6">
          <button onClick={() => navigate("/")} className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-shadow">
              <Cpu className="w-5 h-5 text-white" />
            </div>
            <div className="text-left">
              <div className="text-lg font-bold text-foreground tracking-tight leading-none">CDAI</div>
              <div className="text-[10px] text-muted-foreground font-medium tracking-wide">Engineering Platform</div>
            </div>
          </button>
          <div className="hidden md:flex items-center gap-1 text-xs">
            <a href="#domains" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">Domains</a>
            <a href="#features" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">Features</a>
            <a href="#how" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">How it works</a>
            <a href="#testimonials" className="px-3 py-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary">Customers</a>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate("/admin/login")}
              className="hidden sm:flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary">
              <Shield className="w-3.5 h-3.5" />Admin
            </button>
            <button onClick={() => navigate("/auth")}
              className="flex items-center gap-1.5 text-xs font-semibold text-foreground transition-colors px-4 py-2 rounded-lg border border-border hover:bg-secondary">
              <LogIn className="w-3.5 h-3.5" /> Login
            </button>
            <button onClick={() => navigate("/auth")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-primary to-blue-700 text-white text-xs font-semibold hover:shadow-lg hover:shadow-primary/25 transition-all shadow-md">
              Get Started <ArrowRight className="w-3 h-3 inline ml-1" />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Animated grid background */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(hsl(var(--foreground)) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            maskImage: 'radial-gradient(ellipse at center, black 30%, transparent 75%)',
          }} />
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-10 left-1/4 w-[600px] h-[600px] rounded-full bg-primary/[0.06] blur-3xl animate-pulse" />
          <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full bg-violet-500/[0.04] blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-border/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-border/20" />
        </div>

        <div className="max-w-7xl mx-auto px-6 pt-20 pb-24 text-center relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20">
              <Rocket className="w-3.5 h-3.5" /> Now with side-by-side AI model comparison
            </div>
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-extrabold text-foreground leading-[1.05] mb-6 tracking-tight">
              Design Anything.<br />
              <span className="gradient-text">Engineer Everything.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-10 leading-relaxed">
              The AI-native engineering platform. From automotive to aerospace, robotics to biomedical —
              describe your design in natural language and get <strong className="text-foreground">parametric 3D models, ISO blueprints, and full BOMs</strong> instantly.
            </p>

            <div className="flex items-center justify-center gap-3 flex-wrap mb-12">
              <button onClick={() => navigate("/auth")}
                className="px-7 py-3.5 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white font-bold text-sm hover:shadow-2xl hover:shadow-primary/30 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5">
                Start Building Free <ArrowRight className="w-4 h-4 inline ml-2" />
              </button>
              <button onClick={() => navigate("/auth")}
                className="px-7 py-3.5 rounded-2xl bg-card text-foreground font-bold text-sm hover:bg-secondary transition-colors border border-border shadow-sm flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Login to your workspace
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto pt-6 border-t border-border/50">
              {STATS.map((s, i) => (
                <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.1 }} className="text-center">
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text">{s.value}</div>
                  <div className="text-xs text-muted-foreground font-medium mt-1 uppercase tracking-wider">{s.label}</div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Domains */}
      <section id="domains" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-semibold mb-4">
            <Globe className="w-3.5 h-3.5" /> Universal Engineering
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">12+ Engineering Domains</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">One platform for every engineering discipline. No domain left behind.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {DOMAINS.map((d, i) => (
            <motion.div key={d.label}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.04 }}
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

      {/* How it works */}
      <section id="how" className="bg-gradient-to-b from-secondary/30 to-background border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
              <Zap className="w-3.5 h-3.5" /> Workflow
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">From prompt to production in seconds</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {STEPS.map((s, i) => (
              <motion.div key={s.num}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="relative bg-card border border-border rounded-2xl p-7 hover:border-primary/30 transition-colors">
                <div className="text-5xl font-extrabold gradient-text mb-3 opacity-30">{s.num}</div>
                <h3 className="text-xl font-bold text-foreground mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Brain className="w-3.5 h-3.5" /> AI-Powered
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">Modern AI for serious engineering</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">Cutting-edge LLMs, generative design, and reinforcement-learned optimization built into every workflow.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {AI_FEATURES.map((f, i) => (
            <motion.div key={f.title}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.06 }}
              className="bg-card border border-border rounded-2xl p-6 hover:shadow-lg hover:border-primary/20 transition-all">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="bg-gradient-to-b from-secondary/30 to-background border-y border-border">
        <div className="max-w-7xl mx-auto px-6 py-24">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary text-muted-foreground text-xs font-semibold mb-4">
              <Star className="w-3.5 h-3.5 fill-current text-amber-500" /> Trusted by engineers
            </div>
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-4 tracking-tight">Built by engineers, for engineers</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div key={t.name}
                initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-7">
                <Quote className="w-6 h-6 text-primary/40 mb-4" />
                <p className="text-sm text-foreground leading-relaxed mb-6">"{t.quote}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-700 text-white text-sm font-bold flex items-center justify-center">
                    {t.avatar}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-foreground">{t.name}</div>
                    <div className="text-xs text-muted-foreground">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="bg-gradient-to-br from-primary/10 via-card to-violet-500/5 border border-border rounded-3xl p-12 md:p-16">
            <h2 className="text-4xl md:text-5xl font-extrabold text-foreground mb-5 tracking-tight">Ready to engineer the future?</h2>
            <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">Join thousands of engineers using AI to design, simulate, and build across every domain.</p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <button onClick={() => navigate("/auth")}
                className="px-8 py-4 rounded-2xl bg-gradient-to-r from-primary to-blue-700 text-white font-bold text-sm hover:shadow-2xl hover:shadow-primary/30 transition-all shadow-lg shadow-primary/20 flex items-center gap-2">
                Create Free Account <ArrowRight className="w-4 h-4" />
              </button>
              <button onClick={() => navigate("/auth")}
                className="px-8 py-4 rounded-2xl bg-card text-foreground font-bold text-sm hover:bg-secondary transition-colors border border-border flex items-center gap-2">
                <LogIn className="w-4 h-4" /> Login
              </button>
            </div>
            <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> 12+ engineering domains</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-500" /> Free tier forever</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center">
                  <Cpu className="w-4 h-4 text-white" />
                </div>
                <span className="text-base font-bold text-foreground">CDAI Platform</span>
              </div>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed mb-4">
                The AI-native engineering platform for cross-domain design, simulation, and optimization.
              </p>
              <div className="flex items-center gap-2">
                <a href="#" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Github className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Twitter className="w-4 h-4" /></a>
                <a href="#" className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"><Linkedin className="w-4 h-4" /></a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#domains" className="hover:text-foreground transition-colors">Domains</a></li>
                <li><a href="#features" className="hover:text-foreground transition-colors">Features</a></li>
                <li><a href="#how" className="hover:text-foreground transition-colors">Workflow</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-xs font-bold text-foreground uppercase tracking-wider mb-3">Account</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">Login</button></li>
                <li><button onClick={() => navigate("/auth")} className="hover:text-foreground transition-colors">Sign up</button></li>
                <li><button onClick={() => navigate("/admin/login")} className="hover:text-foreground transition-colors">Admin</button></li>
              </ul>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-center justify-between gap-3 pt-8 border-t border-border text-xs text-muted-foreground">
            <span>© 2026 CDAI Platform. All rights reserved.</span>
            <span>12+ Engineering Domains • AI-Powered • Real-Time 3D</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
