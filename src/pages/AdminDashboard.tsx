import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Shield, Users, FileText, BarChart3, LogOut, Search, Trash2, UserPlus, ChevronDown, Home, Settings, Database, Activity } from "lucide-react";
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
  const [newAdminEmail, setNewAdminEmail] = useState("");

  useEffect(() => {
    checkAdmin();
  }, []);

  const checkAdmin = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/admin/login"); return; }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .eq("role", "admin");

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
    const [profilesRes, designsRes, rolesRes] = await Promise.all([
      supabase.from("profiles").select("*").order("created_at", { ascending: false }),
      supabase.from("designs").select("*").order("created_at", { ascending: false }),
      supabase.from("user_roles").select("*"),
    ]);
    if (profilesRes.data) setProfiles(profilesRes.data);
    if (designsRes.data) setDesigns(designsRes.data);
    if (rolesRes.data) setUserRoles(rolesRes.data);
  };

  const handleDeleteDesign = async (id: string) => {
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setDesigns(prev => prev.filter(d => d.id !== id));
    toast({ title: "Design deleted" });
  };

  const handlePromoteToAdmin = async () => {
    if (!newAdminEmail.trim()) return;
    // Look up user by email in profiles - we need their id
    const { data: matchedProfiles } = await supabase
      .from("profiles")
      .select("id, full_name");

    // Since we can't filter by email on profiles, we use a workaround:
    // Admin must provide the user_id or we search profiles
    toast({ title: "Info", description: "To add an admin, first register the user, then add their role via the database. Use the user ID from the users list below." });
    setNewAdminEmail("");
  };

  const handleAddAdminRole = async (userId: string) => {
    const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" as any });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
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
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAdmin) return null;

  const filteredProfiles = profiles.filter(p =>
    (p.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDesigns = designs.filter(d =>
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.domain.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const TABS: { id: TabId; label: string; icon: any }[] = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "users", label: "Users", icon: Users },
    { id: "designs", label: "Designs", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  const adminUserIds = new Set(userRoles.filter(r => r.role === "admin").map(r => r.user_id));

  return (
    <div className="h-screen w-screen bg-background flex overflow-hidden">
      {/* Sidebar */}
      <div className="w-60 border-r border-border bg-card flex flex-col shrink-0">
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-border">
          <Shield className="w-5 h-5 text-primary" />
          <span className="text-sm font-bold text-foreground">Admin Panel</span>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1">
          {TABS.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all ${
                activeTab === tab.id ? "bg-primary/10 text-primary font-semibold" : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-border space-y-1">
          <button onClick={() => navigate("/")} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-secondary hover:text-foreground transition-all">
            <Home className="w-4 h-4" /> Back to App
          </button>
          <button onClick={handleLogout} className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-destructive hover:bg-destructive/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-card shrink-0">
          <h1 className="text-lg font-bold text-foreground">{TABS.find(t => t.id === activeTab)?.label}</h1>
          <div className="relative w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search users, designs..."
              className="w-full pl-10 pr-4 py-2 bg-background border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-6">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
            {activeTab === "overview" && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  {[
                    { label: "Total Users", value: profiles.length, icon: Users, color: "text-blue-600 bg-blue-50" },
                    { label: "Total Designs", value: designs.length, icon: FileText, color: "text-emerald-600 bg-emerald-50" },
                    { label: "Admin Users", value: userRoles.filter(r => r.role === "admin").length, icon: Shield, color: "text-purple-600 bg-purple-50" },
                    { label: "Domains Active", value: 4, icon: Database, color: "text-orange-600 bg-orange-50" },
                  ].map((stat, i) => (
                    <div key={i} className="bg-card border border-border rounded-xl p-5">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</span>
                        <div className={`w-9 h-9 rounded-lg ${stat.color} flex items-center justify-center`}>
                          <stat.icon className="w-4 h-4" />
                        </div>
                      </div>
                      <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="bg-card border border-border rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-4 h-4 text-primary" /> Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {designs.slice(0, 5).map(d => (
                      <div key={d.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <div>
                          <p className="text-sm font-medium text-foreground">{d.title}</p>
                          <p className="text-xs text-muted-foreground">{d.domain} • {new Date(d.created_at).toLocaleDateString()}</p>
                        </div>
                        <span className="text-xs font-mono px-2 py-1 rounded bg-secondary text-muted-foreground">{d.domain}</span>
                      </div>
                    ))}
                    {designs.length === 0 && <p className="text-sm text-muted-foreground">No designs yet.</p>}
                  </div>
                </div>
              </div>
            )}

            {activeTab === "users" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">User</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">ID</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Role</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Joined</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredProfiles.map(p => (
                        <tr key={p.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                          <td className="px-5 py-3">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary">
                                {(p.full_name || "U")[0].toUpperCase()}
                              </div>
                              <span className="text-sm font-medium text-foreground">{p.full_name || "Unnamed"}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3"><span className="text-xs font-mono text-muted-foreground">{p.id.slice(0, 8)}...</span></td>
                          <td className="px-5 py-3">
                            {adminUserIds.has(p.id) ? (
                              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-purple-50 text-purple-700">
                                <Shield className="w-3 h-3" /> Admin
                              </span>
                            ) : (
                              <span className="text-xs text-muted-foreground">User</span>
                            )}
                          </td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(p.created_at).toLocaleDateString()}</td>
                          <td className="px-5 py-3 text-right">
                            {!adminUserIds.has(p.id) ? (
                              <button onClick={() => handleAddAdminRole(p.id)}
                                className="text-xs text-primary hover:underline font-medium">
                                Make Admin
                              </button>
                            ) : (
                              <button onClick={() => {
                                const role = userRoles.find(r => r.user_id === p.id && r.role === "admin");
                                if (role) handleRemoveAdminRole(role.id);
                              }} className="text-xs text-destructive hover:underline font-medium">
                                Remove Admin
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                      {filteredProfiles.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "designs" && (
              <div className="space-y-4">
                <div className="bg-card border border-border rounded-xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-secondary/50">
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Title</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Domain</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">User ID</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Created</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider px-5 py-3">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredDesigns.map(d => (
                        <tr key={d.id} className="border-b border-border last:border-0 hover:bg-secondary/30 transition-colors">
                          <td className="px-5 py-3 text-sm font-medium text-foreground">{d.title}</td>
                          <td className="px-5 py-3">
                            <span className="text-xs font-mono px-2 py-0.5 rounded bg-secondary text-muted-foreground capitalize">{d.domain}</span>
                          </td>
                          <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{d.user_id.slice(0, 8)}...</td>
                          <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(d.created_at).toLocaleString()}</td>
                          <td className="px-5 py-3 text-right">
                            <button onClick={() => handleDeleteDesign(d.id)} className="text-xs text-destructive hover:underline font-medium flex items-center gap-1 ml-auto">
                              <Trash2 className="w-3 h-3" /> Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredDesigns.length === 0 && (
                        <tr><td colSpan={5} className="px-5 py-8 text-center text-sm text-muted-foreground">No designs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === "settings" && (
              <div className="max-w-lg space-y-6">
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-4">Platform Information</h3>
                  <div className="space-y-3">
                    {[
                      { label: "Platform", value: "CDAI Engineering Platform" },
                      { label: "Version", value: "2.0.0" },
                      { label: "Domains", value: "Vehicles, Buildings, Machines, Circuits" },
                      { label: "Database", value: "Lovable Cloud" },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm text-muted-foreground">{item.label}</span>
                        <span className="text-sm font-medium text-foreground">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-foreground mb-2">Danger Zone</h3>
                  <p className="text-xs text-muted-foreground mb-4">Administrative actions that require caution.</p>
                  <button onClick={handleLogout} className="px-4 py-2 rounded-lg bg-destructive/10 text-destructive text-sm font-medium hover:bg-destructive/20 transition-colors">
                    Sign Out of Admin Panel
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
