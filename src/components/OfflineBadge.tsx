import { useOnline } from "@/lib/online";
import { WifiOff } from "lucide-react";

export function OfflineBadge() {
  const online = useOnline();
  if (online) return null;
  return (
    <div
      role="status"
      className="mt-3 flex items-center gap-2 rounded-full bg-muted px-3 py-1.5 text-xs font-bold text-muted-foreground"
    >
      <WifiOff className="size-3.5" aria-hidden />
      Offline — everything still works. Progress will sync when you reconnect.
    </div>
  );
}