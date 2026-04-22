import { useEffect, useState } from "react";
import { AlertCircle, X } from "lucide-react";

export function NotificationCenter({
  notifications = [],
  onRemove = () => {},
}) {
  const [visibleNotifications, setVisibleNotifications] = useState([]);

  useEffect(() => {
    // Keep only the last 3 notifications
    if (notifications.length > 0) {
      const latest = notifications.slice(-3);
      setVisibleNotifications(latest);

      // Auto-dismiss each notification after 5 seconds
      const timers = latest.map((notif) => {
        const timer = setTimeout(() => {
          onRemove(notif.id);
        }, 5000);
        return timer;
      });

      return () => {
        timers.forEach((timer) => clearTimeout(timer));
      };
    }
  }, [notifications, onRemove]);

  if (visibleNotifications.length === 0) return null;

  return (
    <div className="pointer-events-auto fixed bottom-6 right-6 space-y-2 z-50">
      {visibleNotifications.map((notif) => {
        const isBullish = notif.movement >= 0;
        return (
          <div
            key={notif.id}
            className={`flex items-start gap-3 rounded-2xl border p-4 shadow-lg backdrop-blur-xl animate-in fade-in slide-in-from-right-4 duration-300 ${
              isBullish
                ? "border-emerald-400/30 bg-emerald-400/10 text-emerald-100"
                : "border-rose-400/30 bg-rose-400/10 text-rose-100"
            }`}
          >
            <div
              className={`mt-1 rounded-lg p-1.5 ${
                isBullish
                  ? "bg-emerald-500/20 text-emerald-300"
                  : "bg-rose-500/20 text-rose-300"
              }`}
            >
              <AlertCircle className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs uppercase tracking-wide font-semibold opacity-80">
                {notif.ticker}
              </p>
              <p className="text-sm mt-1">
                Moved {Math.abs(notif.movement).toFixed(1)}%
              </p>
            </div>
            <button
              onClick={() => onRemove(notif.id)}
              className="mt-1 rounded-lg p-1 opacity-50 hover:opacity-100 hover:bg-white/10 transition"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
