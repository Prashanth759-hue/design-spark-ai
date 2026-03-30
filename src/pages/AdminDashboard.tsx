import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield, Users, FileText, BarChart3, LogOut, Search, Trash2,
  Home, Settings, Activity, ChevronRight, TrendingUp, Clock,
  UserCheck, UserX, Eye, MoreVertical, RefreshCw, Cpu
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

type TabId = "overview" | "users" | "designs" | "settings";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [designs, setDesigns] = useState<any[]>([]);
  const [userRoles, setUserRoles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { checkAdmin(); }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }
    const { data: roles } = await supabase
      .from("user_roles").select("role")
      .eq("user_id", user.id).eq("role", "admin");
    if (!roles || roles.length === 0) {
      toast({ title: "Access Denied", description: "You are not an admin.", variant: "destructive" });
      navigate("/admin/login");
      return;
    }
    setIsAdmin(true);
    setLoading(false);
    fetchData();
  };

  const fetchData = async () => {
    setRefreshing(true);
    const [profilesRes, designsRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("designs").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (designsRes.data) setDesigns(designsRes.data);
    if (rolesRes.data) setUserRoles(rolesRes.data);
    setRefreshing(false);
  };

  const handleDeleteDesign = async (id: string) => {
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setDesigns(prev => prev.filter(d => d.id !== id));
    toast({ title: "Design deleted" });
  };

  const handleAddAdminRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as any });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Admin role added!" });
    fetchData();
  };

  const handleRemoveAdminRole = async (roleId: string) => {
    const { error } = await supabase.from("user_roles").delete().eq("id", roleId);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Role removed" });
    fetchData();
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/admin/login");
  };

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) return null;

  const adminUserIds = new Set(userRoles.filter(r => r.role === "admin").map(r => r.user_id));

  const filteredProfiles = profiles.filter(p =>
    (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const filteredDesigns = designs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS: { id: TabId; label: string; icon: any; count?: number }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users, count: profiles.length },
    { id: "designs", label: "Designs", icon: FileText, count: designs.length },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const stats = [
    { label: "Total Users", value: profiles.length, icon: Users, trend: "+12%", color: "from-blue-500 to-blue-600" },
    { label: "Total Designs", value: designs.length, icon: FileText, trend: "+8%", color: "from-emerald-500 to-teal-500" },
    { label: "Admin Users", value: userRoles.filter(r => r.role === "admin").length, icon: Shield, trend: "", color: "from-violet-500 to-purple-500" },
    { label: "Active Domains", value: new Set(designs.map(d => d.domain)).size || 0, icon: Activity, trend: "", color: "from-orange-500 to-amber-500" },
  ];

  return (
    <div className="h-screen w-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-64 border-r border-border bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-3 px-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <div>
            <span className="text-sm font-bold text-foreground block leading-tight">Admin Panel</span>
            <span className="text-[10px] text-muted-foreground">CDAI Platform</span>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                activeTab === tab.id
                  ? "bg-primary/10 text-primary font-semibold shadow-sm"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
              <div className="flex items-center gap-2.5">
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </div>
              {tab.count !== undefined && (
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  activeTab === tab.id ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                }`}>{tab.count}</span>
              )}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-border space-y-1">
          <button onClick={() => navigate("/")}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <Home className="w-4 h-4" /> Back to App
          </button>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
          <div className="flex items-center gap-3">
            <h1 className="text-lg font-bold text-foreground">{TABS.find(t => t.id === activeTab)?.label}</h1>
            <button onClick={fetchData}
              className={`p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-all ${refreshing ? "animate-spin" : ""}`}>
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users, designs..."
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }}>

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                    {stats.map((s, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{s.label}</span>
                          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-sm`}>
                            <s.icon className="w-4.5 h-4.5 text-white" />
                          </div>
                        </div>
                        <p className="text-3xl font-extrabold text-foreground">{s.value}</p>
                        {s.trend && (
                          <div className="flex items-center gap-1 mt-2">
                            <TrendingUp className="w-3 h-3 text-emerald-500" />
                            <span className="text-xs font-medium text-emerald-600">{s.trend} this month</span>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <Clock className="w-4 h-4 text-primary" /> Recent Designs
                      </h3>
                      <div className="space-y-3">
                        {designs.slice(0, 6).map(d => (
                          <div key={d.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{d.title}</p>
                                <p className="text-[11px] text-muted-foreground">{new Date(d.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono px-2 py-1 rounded-lg bg-secondary text-muted-foreground capitalize">{d.domain}</span>
                          </div>
                        ))}
                        {designs.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No designs yet.</p>}
                      </div>
                    </div>

                    <div className="bg-card border border-border rounded-2xl p-6">
                      <h3 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4 text-primary" /> Recent Users
                      </h3>
                      <div className="space-y-3">
                        {profiles.slice(0, 6).map(p => (
                          <div key={p.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                {(p.full_name || "U")[0].toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-foreground">{p.full_name || "Unnamed"}</p>
                                <p className="text-[11px] text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</p>
                              </div>
                            </div>
                            {adminUserIds.has(p.id) && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                                <Shield className="w-2.5 h-2.5" /> Admin
                              </span>
                            )}
                          </div>
                        ))}
                        {profiles.length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">No users yet.</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "users" && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">User</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">ID</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Role</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Joined</th>
                        <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map(p => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-xs font-bold text-primary">
                                {(p.full_name || "U")[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-foreground">{p.full_name || "Unnamed"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5"><span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded">{p.id.slice(0, 8)}...</span></td>
                          <td className="px-5 py-3.5">
                            {adminUserIds.has(p.id) ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground px-2.5 py-1 rounded-full bg-secondary">
                                <UserCheck className="w-3 h-3" /> User
                              </span>
                            )}
                          </td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            {!adminUserIds.has(p.id) ? (
                              <button onClick={() => handleAddAdminRole(p.id)}
                                className="inline-flex items-center gap-1 text-xs text-primary hover:bg-primary/10 px-3 py-1.5 rounded-lg font-medium transition-colors">
                                <UserCheck className="w-3 h-3" /> Make Admin
                              </button>
                            ) : (
                              <button onClick={() => {
                                const role = userRoles.find(r => r.user_id === p.id && r.role === "admin");
                                if (role) handleRemoveAdminRole(role.id);
                              }} className="inline-flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg font-medium transition-colors">
                                <UserX className="w-3 h-3" /> Remove Admin
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "designs" && (
                <div className="bg-card border border-border rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/40">
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Title</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Domain</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">User</th>
                        <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Created</th>
                        <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3.5">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDesigns.map(d => (
                        <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/20 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center">
                                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                              </div>
                              <span className="text-sm font-medium text-foreground">{d.title}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className="text-[11px] font-mono px-2.5 py-1 rounded-lg bg-secondary text-muted-foreground capitalize">{d.domain}</span>
                          </td>
                          <td className="px-5 py-3.5 text-xs font-mono text-muted-foreground">{d.user_id.slice(0, 8)}...</td>
                          <td className="px-5 py-3.5 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                          <td className="px-5 py-3.5 text-right">
                            <button onClick={() => handleDeleteDesign(d.id)}
                              className="inline-flex items-center gap-1 text-xs text-destructive hover:bg-destructive/10 px-3 py-1.5 rounded-lg font-medium transition-colors">
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredDesigns.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-12 text-center text-sm text-muted-foreground">No designs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {activeTab === "settings" && (
                <div className="max-w-2xl space-y-6">
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-foreground mb-5 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-primary" /> Platform Information
                    </h3>
                    <div className="space-y-3">
                      {[
                        { label: "Platform", value: "CDAI Engineering Platform" },
                        { label: "Version", value: "3.0.0" },
                        { label: "Domains", value: "12+ (Automotive, Aerospace, Robotics, ...)" },
                        { label: "AI Engine", value: "Multi-Model AI (Gemini, GPT)" },
                        { label: "Backend", value: "Lovable Cloud" },
                      ].map(item => (
                        <div key={item.label} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                          <span className="text-sm text-muted-foreground">{item.label}</span>
                          <span className="text-sm font-medium text-foreground">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-card border border-destructive/20 rounded-2xl p-6">
                    <h3 className="text-sm font-bold text-destructive mb-2">Danger Zone</h3>
                    <p className="text-xs text-muted-foreground mb-4">Administrative actions that require caution.</p>
                    <button onClick={handleLogout}
                      className="px-4 py-2.5 rounded-xl bg-destructive/10 text-destructive text-sm font-semibold hover:bg-destructive/20 transition-colors">
                      Sign Out of Admin Panel
                    </button>
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
