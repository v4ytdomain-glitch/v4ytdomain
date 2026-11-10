import { useState, useEffect } from "react";
import { api } from "../../lib/api";
import TournamentBracketEditor from "./TournamentBracketEditor";

export default function AdminTournaments() {
  const [creating, setCreating] = useState(false);
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [editingTournament, setEditingTournament] = useState<any>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: "",
    game: "Free Fire",
    date: "",
    time: "",
    max_players: 100,
    prize: "",
    status: "open",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    description: "Welcome to the latest V4YT Championship! Register now and prove you are the best."
  });

  // Load Tournaments on mount
  useEffect(() => {
    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    try {
      const data = await api.get("/tournaments/");
      setTournaments(data);
    } catch (err) {
      console.error("Failed to load tournaments", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      // Ensure max_players is an integer before sending
      const payload = {
        name: formData.name,
        game: formData.game,
        start_at: new Date(`${formData.date}T${formData.time || "20:00"}`).toISOString(),
        capacity: parseInt(formData.max_players.toString(), 10) || 100,
        prize: formData.prize,
        status: formData.status,
        image: formData.image,
        description: formData.description
      };

      const newTournament = await api.post("/admin/tournaments", payload);
      
      // Add the new tournament to the top of our list
      setTournaments([newTournament, ...tournaments]);
      
      // Close modal & reset form
      setCreating(false);
      setFormData({ ...formData, name: "", date: "", time: "", prize: "" });
    } catch (err: any) {
      setError(err.message || "Failed to create tournament.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TOURNAMENT MANAGEMENT</h1>
        <button onClick={() => { setCreating(true); setError(""); }} className="btn-primary text-xs">+ CREATE TOURNAMENT</button>
      </div>

      {/* CREATE TOURNAMENT MODAL */}
      {creating && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setCreating(false)}>
          <div className="glass border border-border rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-black text-white mb-5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>CREATE NEW TOURNAMENT</h3>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TOURNAMENT NAME</label>
                <input required name="name" value={formData.name} onChange={handleChange} placeholder="e.g. V4YT Championship #14" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>GAME</label>
                  <input required name="game" value={formData.game} onChange={handleChange} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>MAX PLAYERS</label>
                  <input required type="number" name="max_players" value={formData.max_players} onChange={handleChange} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>DATE</label>
                  <input required name="date" value={formData.date} onChange={handleChange} placeholder="e.g. Sep 15, 2026" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TIME</label>
                  <input required name="time" value={formData.time} onChange={handleChange} placeholder="e.g. 8:00 PM IST" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PRIZE POOL</label>
                <input required name="prize" value={formData.prize} onChange={handleChange} placeholder="e.g. ₹5,000 + Trophy" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
              </div>

              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>STATUS</label>
                <select name="status" value={formData.status} onChange={handleChange} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500">
                  <option value="soon">Coming Soon</option>
                  <option value="open">Registration Open</option>
                  <option value="live">Live</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div className="flex gap-3 mt-6 pt-4 border-t border-border">
                <button type="button" onClick={() => setCreating(false)} className="btn-secondary flex-1">CANCEL</button>
                <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-50">
                  {submitting ? "CREATING..." : "CREATE TOURNAMENT"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {editingTournament && <TournamentBracketEditor tournament={editingTournament} onClose={() => setEditingTournament(null)} />}

      {/* TOURNAMENT LIST */}
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-10 text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            LOADING TOURNAMENTS...
          </div>
        ) : tournaments.length === 0 ? (
          <div className="glass border border-border rounded-xl p-10 text-center">
            <p className="text-muted-foreground">No tournaments created yet.</p>
          </div>
        ) : (
          tournaments.map(t => (
            <div key={t.id} className="glass border border-border rounded-xl p-4 flex items-center gap-4 hover:border-violet-500/30 transition-colors">
              <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${t.status === "live" ? "bg-red-500 pulse-dot" : t.status === "open" ? "bg-green-500" : t.status === "soon" ? "bg-cyan-500" : "bg-muted-foreground"}`}></div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white truncate" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{t.name}</h4>
                <p className="text-xs text-muted-foreground truncate">{t.game} · {t.date} · {t.players}/{t.maxPlayers} players</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { setEditingTournament(t); setError(""); }} className="text-xs px-3 py-1.5 rounded bg-secondary border border-border text-muted-foreground hover:text-foreground transition-colors">Edit</button>
                <button className="text-xs px-3 py-1.5 rounded bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-colors">Delete</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
