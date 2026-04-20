import { PresenceUser } from "@/hooks/usePresence";
import { Users } from "lucide-react";

interface PresenceAvatarsProps {
  users: PresenceUser[];
  meId?: string;
  max?: number;
}

/**
 * Stack of overlapping avatars representing live collaborators.
 * Shows a count badge if more than `max` users are present.
 */
export function PresenceAvatars({ users, meId, max = 4 }: PresenceAvatarsProps) {
  if (!users || users.length === 0) {
    return (
      <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
        <Users className="w-3 h-3" /> Solo
      </div>
    );
  }

  // Put "me" last so others appear first in the stack
  const sorted = [...users].sort((a, b) => {
    if (a.user_id === meId) return 1;
    if (b.user_id === meId) return -1;
    return a.online_at.localeCompare(b.online_at);
  });

  const visible = sorted.slice(0, max);
  const overflow = sorted.length - visible.length;

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center -space-x-1.5">
        {visible.map((u) => (
          <div
            key={u.user_id}
            title={`${u.full_name}${u.user_id === meId ? " (you)" : ""}`}
            className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-white border-2 border-card shadow-sm"
            style={{ backgroundColor: u.color }}
          >
            {u.avatar_initials}
          </div>
        ))}
        {overflow > 0 && (
          <div className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-bold text-foreground border-2 border-card bg-secondary">
            +{overflow}
          </div>
        )}
      </div>
      <span className="text-[10px] font-mono text-muted-foreground">
        {users.length} live
      </span>
    </div>
  );
}
