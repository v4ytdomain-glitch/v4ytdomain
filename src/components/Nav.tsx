import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import { api } from "../lib/api";

const navLinks = [
  { label: "Home", path: "/" },
  { label: "Tournaments", path: "/tournaments" },
  { label: "Leaderboard", path: "/leaderboard" },
  { label: "Players", path: "/players" },
  { label: "Hall of Fame", path: "/hall-of-fame" },
];

// Utility to format "2 hours ago"
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  return `${Math.floor(diffInSeconds / 86400)}d ago`;
}

export default function Nav() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [menuOpen, setMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);

  // Dynamic Data States
  const [me, setMe] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Fetch User and Notifications on mount and when location changes (to keep it fresh)
  useEffect(() => {
    const token = localStorage.getItem("v4yt_token");
    if (token) {
      api.get("/auth/me")
        .then(setMe)
        .catch(() => {
          localStorage.removeItem("v4yt_token");
          setMe(null);
        });

      api.get("/notifications/")
        .then(setNotifications)
        .catch(err => console.error("Failed to fetch notifications", err));
    } else {
      setMe(null);
      setNotifications([]);
    }
  }, [location.pathname]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("v4yt_token");
    setMe(null);
    setProfileOpen(false);
    navigate("/login");
  };

  const handleNotifClick = async (id: number, read: boolean) => {
    if (!read) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
      try {
        await api.put(`/notifications/${id}/read`, {});
      } catch (err) {
        console.error(err);
      }
    }
    setNotifOpen(false);
    navigate("/notifications");
  };

  const isActive = (path: string) =>
    path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "glass border-b border-violet-500/10" : "bg-transparent border-b border-transparent"}`}
        style={{ backdropFilter: scrolled ? "blur(20px)" : "none" }}
      >
        {/* Top neon line */}
        {scrolled && (
          <div className="absolute top-0 left-0 right-0 h-px" style={{ background: "linear-gradient(90deg, transparent, rgba(124,58,237,0.6), rgba(6,182,212,0.6), rgba(124,58,237,0.6), transparent)" }}></div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center h-16 gap-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 mr-2 group">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-sm transition-all group-hover:scale-110" style={{ boxShadow: "0 0 20px rgba(124,58,237,0.4)" }}>V4</div>
            <div className="hidden sm:block">
              <span className="font-black text-white text-lg tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.1em" }}>
                V4YT
              </span>
              <span className="text-violet-400 ml-1.5 text-xs font-bold tracking-widest align-top mt-1 inline-block">OFFICIAL</span>
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-0.5 flex-1">
            {navLinks.map(link => (
              <Link
                key={link.path}
                to={link.path}
                className={`relative px-3.5 py-2 text-xs font-bold tracking-widest transition-all rounded-md group cyber-line ${isActive(link.path) ? "text-white" : "text-muted-foreground hover:text-white"}`}
                style={{ fontFamily: "'Rajdhani', sans-serif", letterSpacing: "0.08em" }}
              >
                {isActive(link.path) && (
                  <>
                    <span className="absolute inset-0 rounded-md bg-violet-500/10 border border-violet-500/20"></span>
                    <span className="absolute inset-x-2 bottom-0 h-px bg-gradient-to-r from-transparent via-violet-400 to-transparent" style={{ boxShadow: "0 0 8px rgba(124,58,237,0.8)" }}></span>
                  </>
                )}
                <span className="relative z-10">{link.label.toUpperCase()}</span>
              </Link>
            ))}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1.5 ml-auto">
            {/* Search */}
            {searchOpen ? (
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <div className="relative">
                  <input
                    autoFocus
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search..."
                    className="bg-secondary/80 border border-violet-500/30 rounded-lg px-3 py-1.5 text-sm text-foreground placeholder-muted-foreground outline-none focus:border-violet-500 focus:shadow-[0_0_15px_rgba(124,58,237,0.3)] w-48 transition-all"
                  />
                </div>
                <button type="button" onClick={() => setSearchOpen(false)} className="text-muted-foreground hover:text-foreground text-sm w-7 h-7 flex items-center justify-center rounded">✕</button>
              </form>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-violet-500/10 transition-all group">
                <svg className="w-4 h-4 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            )}

            {/* Notifications */}
            {me && (
              <div className="relative">
                <button onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                  className="p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-violet-500/10 transition-all relative group">
                  <svg className="w-4 h-4 group-hover:text-violet-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full pulse-dot"></span>
                  )}
                </button>
                
                {notifOpen && (
                  <div className="absolute right-0 top-12 w-80 glass border border-violet-500/20 rounded-xl shadow-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.15)" }}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"></div>
                    <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-secondary/30">
                      <span className="text-sm font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NOTIFICATIONS</span>
                      <Link to="/notifications" onClick={() => setNotifOpen(false)} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">View all</Link>
                    </div>
                    
                    {notifications.length === 0 ? (
                      <div className="px-4 py-6 text-center text-muted-foreground text-sm">
                        No notifications yet.
                      </div>
                    ) : (
                      <div className="max-h-[300px] overflow-y-auto">
                        {notifications.slice(0, 5).map((n) => (
                          <div key={n.id} onClick={() => handleNotifClick(n.id, n.read)} className={`flex items-start gap-3 px-4 py-3 cursor-pointer border-b border-border/40 last:border-0 transition-colors ${n.read ? 'hover:bg-white/5 opacity-70' : 'bg-violet-500/10 hover:bg-violet-500/20'}`}>
                            <span className="text-lg mt-0.5">{n.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-foreground leading-snug">{n.text}</p>
                              <p className="text-xs text-muted-foreground mt-0.5 font-mono-data">{timeAgo(n.created_at)}</p>
                            </div>
                            {!n.read && <div className="w-1.5 h-1.5 bg-violet-500 rounded-full mt-1.5 shrink-0 pulse-dot shadow-[0_0_8px_rgba(124,58,237,0.8)]"></div>}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Profile */}
            {me ? (
              <div className="relative">
                <button onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                  className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-violet-500/10 transition-all border border-transparent hover:border-violet-500/20 group">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs group-hover:scale-110 transition-transform shadow-[0_0_12px_rgba(124,58,237,0.4)]">
                    {me.avatar || "V4"}
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-xs font-bold text-white leading-none truncate max-w-[100px]" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{me.username}</p>
                    <p className="text-[10px] text-violet-400 leading-none mt-1 uppercase font-bold tracking-wider" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{me.tier || "BRONZE"}</p>
                  </div>
                  <svg className="w-3 h-3 text-muted-foreground hidden sm:block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-12 w-56 glass border border-violet-500/20 rounded-xl shadow-2xl overflow-hidden" style={{ boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 0 30px rgba(124,58,237,0.15)" }}>
                    <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/60 to-transparent"></div>
                    <div className="px-4 py-3 border-b border-border bg-secondary/30">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0">
                          {me.avatar || "V4"}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-black text-white truncate" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{me.username}</p>
                          <p className="text-xs text-violet-400 uppercase truncate">Level {me.level} · {me.tier}</p>
                        </div>
                      </div>
                    </div>
                    {[
                      { label: "Dashboard", path: "/dashboard", icon: "⬛" },
                      { label: "My Profile", path: `/players/${me.id}`, icon: "👤" },
                      { label: "Achievements", path: "/achievements", icon: "🏆" },
                      { label: "Settings", path: "/settings", icon: "⚙️" },
                    ].map(item => (
                      <Link key={item.path} to={item.path} onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:text-white hover:bg-violet-500/10 transition-all">
                        <span>{item.icon}</span>{item.label}
                      </Link>
                    ))}
                    
                    {me.is_admin && (
                      <Link to="/admin" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-all border-t border-border">
                        <span>🛡️</span>Admin Panel
                      </Link>
                    )}

                    <div className="border-t border-border">
                      <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-muted-foreground hover:text-red-400 hover:bg-red-500/10 transition-colors">
                        <span>🚪</span> Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="btn-primary text-xs px-4 py-2 pulse-glow">LOGIN</Link>
            )}

            {/* Mobile hamburger */}
            <button className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-white hover:bg-violet-500/10 transition-all" onClick={() => setMenuOpen(!menuOpen)}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden glass border-t border-violet-500/20 scale-in">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
            {navLinks.map((link, i) => (
              <Link key={link.path} to={link.path} onClick={() => setMenuOpen(false)}
                className={`flex items-center justify-between px-6 py-3.5 text-sm font-bold tracking-widest border-b border-border/40 transition-all ${isActive(link.path) ? "text-violet-400 bg-violet-500/8" : "text-muted-foreground hover:text-white hover:bg-white/5"}`}
                style={{ fontFamily: "'Rajdhani', sans-serif", animationDelay: `${i * 0.05}s` }}>
                {link.label.toUpperCase()}
                {isActive(link.path) && <span className="w-1.5 h-1.5 bg-violet-500 rounded-full"></span>}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Mobile bottom nav */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 flex border-t border-violet-500/15" style={{ background: "rgba(5,6,9,0.95)", backdropFilter: "blur(20px)" }}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent"></div>
        {[
          { label: "Home", path: "/", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg> },
          { label: "Tournaments", path: "/tournaments", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" /></svg> },
          { label: "Leaderboard", path: "/leaderboard", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg> },
          { label: "Profile", path: me ? `/players/${me.id}` : "/login", icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg> },
        ].map(item => (
          <Link key={item.path} to={item.path}
            className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs transition-all relative ${isActive(item.path) ? "text-violet-400" : "text-muted-foreground"}`}
            style={{ fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 }}>
            {isActive(item.path) && (
              <span className="absolute top-0 inset-x-3 h-0.5 bg-gradient-to-r from-transparent via-violet-500 to-transparent rounded-b-full"></span>
            )}
            <span className={isActive(item.path) ? "text-glow scale-110 transition-transform" : ""}>{item.icon}</span>
            {item.label}
          </Link>
        ))}
      </div>

      {(notifOpen || profileOpen) && (
        <div className="fixed inset-0 z-40" onClick={() => { setNotifOpen(false); setProfileOpen(false); }} />
      )}
    </>
  );
}
