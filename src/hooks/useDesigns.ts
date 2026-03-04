import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface Design {
  id: string;
  domain: string;
  title: string;
  params: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export function useDesigns() {
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDesigns = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data, error } = await supabase
      .from("designs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);
    if (error) {
      console.error("Error fetching designs:", error);
    } else {
      setDesigns((data || []) as Design[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => { fetchDesigns(); }, [fetchDesigns]);

  const saveDesign = useCallback(async (domain: string, title: string, params: Record<string, any>) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Not authenticated", variant: "destructive" });
      return null;
    }
    const { data, error } = await supabase
      .from("designs")
      .insert({ user_id: user.id, domain, title, params })
      .select()
      .single();
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return null;
    }
    toast({ title: "Design saved", description: `"${title}" saved successfully` });
    await fetchDesigns();
    return data as Design;
  }, [fetchDesigns]);

  const deleteDesign = useCallback(async (id: string) => {
    const { error } = await supabase.from("designs").delete().eq("id", id);
    if (error) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    } else {
      setDesigns(prev => prev.filter(d => d.id !== id));
      toast({ title: "Design deleted" });
    }
  }, []);

  return { designs, loading, saveDesign, deleteDesign, refetch: fetchDesigns };
}
