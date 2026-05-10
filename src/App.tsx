import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Component, lazy, Suspense, useState, useEffect, type ReactNode } from "react";
import Landing from "./pages/Landing";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();
const Index = lazy(() => import("./pages/Index"));
const DrivingSimulator = lazy(() => import("./pages/DrivingSimulator"));
const BuildingSimulator = lazy(() => import("./pages/BuildingSimulator"));
const MachineSimulator = lazy(() => import("./pages/MachineSimulator"));
const CircuitSimulator = lazy(() => import("./pages/CircuitSimulator"));
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const AdminLogin = lazy(() => import("./pages/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const RoboticsSimulator = lazy(() => import("./pages/RoboticsSimulator"));
const AerospaceSimulator = lazy(() => import("./pages/AerospaceSimulator"));
const MarineSimulator = lazy(() => import("./pages/MarineSimulator"));
const BiomedicalSimulator = lazy(() => import("./pages/BiomedicalSimulator"));
const IndustrialSimulator = lazy(() => import("./pages/IndustrialSimulator"));
const ComparePage = lazy(() => import("./pages/ComparePage"));

const hasBackendConfig = Boolean(import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY);

const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-background">
    <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
  </div>
);

const BackendConfigNotice = () => (
  <div className="min-h-screen bg-background flex items-center justify-center p-6">
    <div className="max-w-lg rounded-lg border border-border bg-card p-6 text-center shadow-sm">
      <h1 className="text-lg font-semibold text-foreground mb-2">Backend configuration required</h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your local app is running, but authentication needs local environment values. Add
        <code className="mx-1 rounded bg-secondary px-1.5 py-0.5 text-xs">VITE_SUPABASE_URL</code>
        and
        <code className="mx-1 rounded bg-secondary px-1.5 py-0.5 text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code>
        to your local <code className="rounded bg-secondary px-1.5 py-0.5 text-xs">.env</code>, then restart the dev server.
      </p>
    </div>
  </div>
);

class AppErrorBoundary extends Component<{ children: ReactNode }, { error: Error | null }> {
  state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="max-w-xl rounded-lg border border-destructive/30 bg-card p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-foreground mb-2">Application failed to load</h1>
          <p className="text-sm text-muted-foreground leading-relaxed mb-4">
            Restart the local dev server after pulling the latest changes. If this remains, the message below identifies the exact module/runtime error.
          </p>
          <pre className="max-h-48 overflow-auto rounded bg-secondary p-3 text-xs text-foreground whitespace-pre-wrap">
            {this.state.error.message}
          </pre>
        </div>
      </div>
    );
  }
}

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasBackendConfig) {
      setLoading(false);
      return;
    }

    let mounted = true;
    let unsubscribe: (() => void) | undefined;

    import("@/integrations/supabase/client").then(({ supabase }) => {
      if (!mounted) return;
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
      });
      unsubscribe = () => subscription.unsubscribe();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!mounted) return;
        setSession(session);
        setLoading(false);
      });
    }).catch(() => {
      if (mounted) setLoading(false);
    });

    return () => {
      mounted = false;
      unsubscribe?.();
    };
  }, []);

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingScreen />}>
              <Routes>
              {/* Public routes */}
              <Route path="/" element={session ? <Index /> : <Landing />} />
              <Route path="/auth" element={hasBackendConfig ? <Auth /> : <BackendConfigNotice />} />
              <Route path="/admin/login" element={hasBackendConfig ? <AdminLogin /> : <BackendConfigNotice />} />
              <Route path="/admin" element={hasBackendConfig ? <AdminDashboard /> : <BackendConfigNotice />} />

              {/* Protected routes */}
              {session && (
                <>
                  <Route path="/drive" element={<DrivingSimulator />} />
                  <Route path="/building" element={<BuildingSimulator />} />
                  <Route path="/machine" element={<MachineSimulator />} />
                  <Route path="/circuit" element={<CircuitSimulator />} />
                  <Route path="/robotics" element={<RoboticsSimulator />} />
                  <Route path="/aerospace" element={<AerospaceSimulator />} />
                  <Route path="/marine" element={<MarineSimulator />} />
                  <Route path="/biomedical" element={<BiomedicalSimulator />} />
                  <Route path="/industrial" element={<IndustrialSimulator />} />
                  <Route path="/compare" element={<ComparePage />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                </>
              )}
              <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
        </TooltipProvider>
      </QueryClientProvider>
    </AppErrorBoundary>
  );
};

export default App;
