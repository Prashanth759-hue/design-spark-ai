import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import Landing from "./pages/Landing";
import Index from "./pages/Index";
import DrivingSimulator from "./pages/DrivingSimulator";
import BuildingSimulator from "./pages/BuildingSimulator";
import MachineSimulator from "./pages/MachineSimulator";
import CircuitSimulator from "./pages/CircuitSimulator";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import RoboticsSimulator from "./pages/RoboticsSimulator";
import AerospaceSimulator from "./pages/AerospaceSimulator";
import MarineSimulator from "./pages/MarineSimulator";
import BiomedicalSimulator from "./pages/BiomedicalSimulator";
import IndustrialSimulator from "./pages/IndustrialSimulator";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={session ? <Index /> : <Landing />} />
            <Route path="/auth" element={<Auth />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminDashboard />} />

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
                <Route path="/dashboard" element={<Dashboard />} />
              </>
            )}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
