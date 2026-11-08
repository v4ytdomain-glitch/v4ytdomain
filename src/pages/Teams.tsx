import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router";
import { api } from "../lib/api";

export default function Teams() {
  const [teams, setTeams] = useState<any[]>([]);
  const [me, setMe] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Creation State
  const [creating, setCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", logo: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Fetch User independently (so the button always knows you are logged in)
    api.get("/auth/me")
      .then(userData => setMe(userData))
      .catch(() => setMe(null));

    // 2. Fetch Teams independently
    api.get("/teams/")
      .then(teamsData => {
        setTeams(teamsData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching teams data", err);
        setLoading(false); // Stop the loading screen even if this fails
      });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!me) {
      navigate("/login");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const newTeam = await api.post("/teams/", formData);
      setTeams([...teams, newTeam]); // Optimistically update UI
      setCreating(false);
      setFormData({ name: "", logo: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create team.");
    } finally {
      setSubmitting(false);
    }
  };

  // Find if the current logged-in user belongs to any team
  const myTeam = me ? teams.find(t => t.members.includes(me.username)) : null;

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-cyan-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING TEAMS...</div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-cyan-400 mb-2 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>COMMUNITY</p>
          <h1 className="text-5xl md:text-6xl font-black text-white fade-up delay-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TEAMS</h1>
        </div>
        {!myTeam && (
          <button onClick={() => { 
            if (!me) navigate("/login");
            else setCreating(true); 
          }} className="btn-primary fade-up delay-200">+ CREATE TEAM</button>
        )}
      </div>

      {/* CREATE MODAL */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setCreating(false)}>
          <div className="glass border border-border rounded-2xl p-6 max-w-md w-full scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>CREATE NEW TEAM</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleCreate} className="space-y-4 mb-5">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TEAM NAME</label>
                <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Enter team name..."
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TEAM LOGO (1-2 Characters)</label>
                <input required maxLength={2} value={formData.logo} onChange={e => setFormData({...formData, logo: e.target.value})} placeholder="e.g. V4"
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500 uppercase" />
              </div>
              <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-cyan-400">
                You will automatically be assigned as the Team Captain.
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setCreating(false)} className="btn-secondary flex-1">CANCEL</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                  {submitting ? "CREATING..." : "CREATE TEAM"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MY TEAM SECTION */}
      {myTeam && (
        <div className="glass neon-border rounded-xl p-6 mb-10 fade-up">
          <h3 className="text-xl font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>MY TEAM — {myTeam.name}</h3>
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-3">
              {myTeam.members.map((m: string) => (
                <div key={m} className="text-center">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs mx-auto mb-1 shadow-[0_0_15px_rgba(124,58,237,0.3)]">
                    {m.slice(0,2).toUpperCase()}
                  </div>
                  <p className="text-xs text-muted-foreground">{m}</p>
                  {m === myTeam.captain_name && <p className="text-[10px] text-yellow-400 font-bold">CAPTAIN</p>}
                </div>
              ))}
            </div>
            {me?.username === myTeam.captain_name && (
               <div className="ml-auto flex gap-3">
                 <button className="btn-secondary text-xs">INVITE PLAYERS</button>
               </div>
            )}
          </div>
        </div>
      )}

      {/* TEAM LEADERBOARD */}
      <h2 className="text-2xl font-black text-white mb-6 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>GLOBAL TEAM LEADERBOARD</h2>
      
      {teams.length === 0 ? (
        <div className="glass border border-border rounded-xl p-10 text-center text-muted-foreground fade-up">
          No teams established yet.
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {teams.map((t, i) => (
            <div key={t.id} className={`glass border rounded-xl p-5 card-hover fade-up ${i === 0 ? "border-yellow-500/30 bg-yellow-500/5 shadow-[0_0_20px_rgba(245,158,11,0.1)]" : "border-border"}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="flex items-start justify-between mb-4">
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-violet-700 to-cyan-600 flex items-center justify-center text-white font-black text-lg border border-border">{t.logo}</div>
                <span className="text-xl">{i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i + 1}`}</span>
              </div>
              <h3 className="text-xl font-black text-white mb-0.5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{t.name}</h3>
              <p className="text-xs text-muted-foreground mb-4">Captain: <span className="font-bold text-foreground">{t.captain_name}</span></p>
              
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="bg-secondary/50 rounded-lg p-2 text-center border border-border">
                  <p className="text-xs text-muted-foreground">Wins</p>
                  <p className="text-lg font-black text-white font-mono-data">{t.wins}</p>
                </div>
                <div className="bg-secondary/50 rounded-lg p-2 text-center border border-border">
                  <p className="text-xs text-muted-foreground">Points</p>
                  <p className="text-lg font-black text-white font-mono-data">{t.points.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-1.5 mb-4 min-h-[24px]">
                {t.members.map((m: string) => (
                  <span key={m} className="text-xs px-2 py-0.5 rounded-full bg-secondary border border-border text-muted-foreground">{m}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}