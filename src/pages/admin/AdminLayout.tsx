import { useEffect, useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router";
import { api } from "../../lib/api";

const navItems = [
  { label: "Dashboard", path: "/admin", icon: "⬛" },
  { label: "Players", path: "/admin/players", icon: "👥" },
  { label: "Tournaments", path: "/admin/tournaments", icon: "🏆" },
  { label: "Results", path: "/admin/results", icon: "📊" },
  { label: "Points", path: "/admin/points", icon: "⚡" },
  { label: "Achievements", path: "/admin/achievements", icon: "🎖️" },
  { label: "Announcements", path: "/admin/announcements", icon: "📢" },
  { label: "Settings", path: "/admin/settings", icon: "⚙️" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if the current user is an admin
    api.get("/auth/me")
      .then(user => {
        if (user.is_admin) {
          setIsAdmin(true);
          setLoading(false);
        } else {
          // If logged in but NOT an admin, send them to the regular dashboard
          navigate("/dashboard");
        }
      })
      .catch(() => {
        // If not logged in at all, send them to login
        navigate("/login");
      });
  }, [navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        VERIFYING ADMIN CLEARANCE...
      </div>
    );
  }

  if (!isAdmin) return null;

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 glass border-r border-border flex flex-col">
        <div className="p-5 border-b border-border">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">V4</div>
            <div>
              <p className="text-white font-black text-xs leading-none" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT OFFICIAL</p>
              <p className="text-muted-foreground text-xs">Admin Panel</p>
            </div>
          </Link>
        </div>
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map(item => (
            <Link key={item.path} to={item.path}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${(pathname === item.path || (item.path !== "/admin" && pathname.startsWith(item.path))) ? "bg-violet-600/20 text-violet-400" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-border">
          <Link to="/dashboard" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">← Back to Dashboard</Link>
        </div>
      </aside>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        <div className="border-b border-border px-6 py-3 flex items-center justify-between glass">
          <span className="text-xs text-muted-foreground font-mono-data">ADMIN MODE · V4YT OFFICIAL</span>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="w-2 h-2 bg-green-400 rounded-full pulse-dot"></span>
            <span>System Online</span>
          </div>
        </div>
        <div className="p-6 page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
}