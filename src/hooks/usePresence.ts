import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { RealtimeChannel } from "@supabase/supabase-js";

export interface PresenceUser {
  user_id: string;
  email: string;
  full_name: string;
  avatar_initials: string;
  color: string;
  online_at: string;
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16"];

function colorFromId(id: string): string {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return COLORS[h % COLORS.length];
}

function initialsFrom(name: string, email: string): string {
  const src = (name || email || "?").trim();
  const parts = src.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return src.slice(0, 2).toUpperCase();
}

/**
 * Subscribe to a Supabase Realtime presence channel scoped by `roomId`.
 * Returns the list of currently-active users for that room.
 *
 * Useful for showing live collaborators on a design / viewport.
 */
export function usePresence(roomId: string) {
  const [users, setUsers] = useState<PresenceUser[]>([]);
  const [me, setMe] = useState<PresenceUser | null>(null);

  useEffect(() => {
    if (!roomId) return;
    let channel: RealtimeChannel | null = null;
    let cancelled = false;

    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || cancelled) return;

      const myPresence: PresenceUser = {
        user_id: user.id,
        email: user.email || "anon",
        full_name: (user.user_metadata as any)?.full_name || user.email || "User",
        avatar_initials: initialsFrom((user.user_metadata as any)?.full_name || "", user.email || ""),
        color: colorFromId(user.id),
        online_at: new Date().toISOString(),
      };
      setMe(myPresence);

      channel = supabase.channel(`presence:${roomId}`, {
        config: { presence: { key: user.id } },
      });

      channel
        .on("presence", { event: "sync" }, () => {
          if (!channel) return;
          const state = channel.presenceState<PresenceUser>();
          const flat: PresenceUser[] = [];
          for (const key of Object.keys(state)) {
            const arr = state[key];
            if (arr && arr.length > 0) flat.push(arr[0]);
          }
          setUsers(flat);
        })
        .subscribe(async (status) => {
          if (status === "SUBSCRIBED" && channel) {
            await channel.track(myPresence);
          }
        });
    })();

    return () => {
      cancelled = true;
      if (channel) supabase.removeChannel(channel);
    };
  }, [roomId]);

  return { users, me };
}
