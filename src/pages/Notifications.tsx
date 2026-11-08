import { useState, useEffect } from "react";
import { api } from "../lib/api";

// Utility to format "2 hours ago", "Just now", etc.
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function Notifications() {
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/notifications/")
      .then(data => {
        setNotifs(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load notifications", err);
        setLoading(false);
      });
  }, []);

  const markAll = async () => {
    // Optimistic UI update
    setNotifs(n => n.map(x => ({ ...x, read: true })));
    try {
      await api.put("/notifications/mark-all-read", {});
    } catch (err) {
      console.error(err);
    }
  };

  const markOne = async (id: number, currentReadStatus: boolean) => {
    if (currentReadStatus) return; // Don't hit the API if already read
    
    // Optimistic UI update
    setNotifs(n => n.map(x => x.id === id ? { ...x, read: true } : x));
    try {
      await api.put(`/notifications/${id}/read`, {});
    } catch (err) {
      console.error(err);
    }
  };

  const unread = notifs.filter(n => !n.read).length;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>FETCHING ALERTS...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NOTIFICATIONS</h1>
          {unread > 0 && <p className="text-sm text-muted-foreground">{unread} unread</p>}
        </div>
        {unread > 0 && <button onClick={markAll} className="btn-secondary text-xs transition-transform active:scale-95">MARK ALL READ</button>}
      </div>

      {notifs.length === 0 ? (
        <div className="text-center py-20 glass border border-border rounded-xl">
          <div className="text-5xl mb-4">🔔</div>
          <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NO NOTIFICATIONS</h3>
          <p className="text-muted-foreground">You're all caught up! Go win a tournament to get some alerts.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifs.map(n => (
            <div key={n.id} onClick={() => markOne(n.id, n.read)}
              className={`glass border rounded-xl px-5 py-4 flex items-start gap-4 transition-all ${n.read ? "border-border opacity-70" : "border-violet-500/30 bg-violet-500/10 cursor-pointer hover:border-violet-500/60"}`}>
              <span className="text-2xl mt-0.5">{n.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground mb-0.5">{n.text}</p>
                <p className="text-xs text-muted-foreground">{n.sub}</p>
                <p className="text-xs text-muted-foreground mt-1 font-mono-data">{timeAgo(n.created_at)}</p>
              </div>
              {!n.read && <div className="w-2 h-2 bg-violet-500 rounded-full shrink-0 mt-2 shadow-[0_0_10px_rgba(124,58,237,0.8)]"></div>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}