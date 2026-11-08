import { useState, useEffect } from "react";
import { Link } from "react-router";
import { api } from "../../lib/api";

const tierColors: Record<string, string> = { legend: "#f59e0b", master: "#c084fc", diamond: "#b9f2ff", platinum: "#00b4d8", gold: "#ffd700", silver: "#c0c0c0", bronze: "#cd7f32" };

export default function AdminPlayers() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    // Fetch all players using the admin endpoint (which includes emails)
    api.get("/admin/players")
      .then(data => {
        setPlayers(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to load players", err);
        setLoading(false);
      });
  }, []);

  // Filter players based on search input (checks username and email)
  const filteredPlayers = players.filter(p => 
    p.username.toLowerCase().includes(search.toLowerCase()) || 
    (p.email && p.email.toLowerCase().includes(search.toLowerCase())) ||
    String(p.id).includes(search)
  );

  if (loading) {
    return <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING PLAYER DIRECTORY...</div>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PLAYER DIRECTORY</h1>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-64">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input 
            value={search} 
            onChange={e => setSearch(e.target.value)} 
            placeholder="Search users..."
            className="w-full bg-secondary border border-border rounded-lg pl-9 pr-4 py-2 text-sm text-foreground outline-none focus:border-violet-500 transition-colors" 
          />
        </div>
      </div>

      <div className="glass border border-border rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-secondary/80 border-b border-border">
              <tr>
                <th className="px-6 py-4 font-black text-muted-foreground tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ID</th>
                <th className="px-6 py-4 font-black text-muted-foreground tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>USER</th>
                <th className="px-6 py-4 font-black text-muted-foreground tracking-widest hidden md:table-cell" style={{ fontFamily: "'Rajdhani', sans-serif" }}>EMAIL</th>
                <th className="px-6 py-4 font-black text-muted-foreground tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>STATS</th>
                <th className="px-6 py-4 font-black text-muted-foreground tracking-widest text-right" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ROLE</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {filteredPlayers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                    No players found matching "{search}".
                  </td>
                </tr>
              ) : (
                filteredPlayers.map(p => (
                  <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4 font-mono-data text-muted-foreground">
                      {String(p.id).padStart(4, "0")}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs shrink-0 shadow-[0_0_10px_rgba(124,58,237,0.2)]">
                          {p.avatar || "V4"}
                        </div>
                        <div>
                          <Link to={`/players/${p.id}`} className="font-bold text-white hover:text-violet-400 transition-colors block">
                            {p.username}
                          </Link>
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: tierColors[p.tier] || "#fff", fontFamily: "'Rajdhani', sans-serif" }}>
                            {p.tier}
                          </span>
                        </div>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-muted-foreground hidden md:table-cell">
                      {p.email}
                    </td>
                    
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-foreground font-mono-data"><span className="text-muted-foreground">PTS:</span> {p.points.toLocaleString()}</span>
                        <span className="text-xs text-foreground font-mono-data"><span className="text-muted-foreground">LVL:</span> {p.level}</span>
                        <span className="text-xs text-foreground font-mono-data"><span className="text-muted-foreground">WINS:</span> {p.wins}</span>
                      </div>
                    </td>
                    
                    <td className="px-6 py-4 text-right">
                      <span className={`text-[10px] px-2 py-1 rounded font-bold tracking-widest ${p.is_admin ? "bg-red-500/20 text-red-400 border border-red-500/30" : "bg-secondary border border-border text-muted-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                        {p.is_admin ? "ADMIN" : "PLAYER"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-3 border-t border-border bg-secondary/30 flex items-center justify-between text-xs text-muted-foreground">
          <span>Showing {filteredPlayers.length} total players</span>
          <span>V4YT Official System</span>
        </div>
      </div>
    </div>
  );
}