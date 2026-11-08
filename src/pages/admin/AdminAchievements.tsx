import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function AdminAchievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Create Form State
  const [newBadge, setNewBadge] = useState({ name: "", description: "", icon: "🏆" });
  const [creating, setCreating] = useState(false);
  
  // Award Form State
  const [awardUserId, setAwardUserId] = useState("");
  const [awardBadgeId, setAwardBadgeId] = useState("");
  const [awarding, setAwarding] = useState(false);
  
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    Promise.all([
      api.get("/achievements/"),
      api.get("/admin/players")
    ])
    .then(([aData, pData]) => {
      setAchievements(aData);
      setPlayers(pData);
      setLoading(false);
    })
    .catch(err => {
      console.error(err);
      setMessage({ type: "error", text: "Failed to load database data." });
      setLoading(false);
    });
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setMessage({ type: "", text: "" });

    try {
      const created = await api.post("/achievements/", newBadge);
      setAchievements([...achievements, created]);
      setNewBadge({ name: "", description: "", icon: "🏆" });
      setMessage({ type: "success", text: "New achievement badge created!" });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to create badge." });
    } finally {
      setCreating(false);
    }
  };

  const handleAward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!awardUserId || !awardBadgeId) {
      setMessage({ type: "error", text: "Select both a player and a badge." });
      return;
    }

    setAwarding(true);
    setMessage({ type: "", text: "" });

    try {
      await api.post(`/achievements/award?user_id=${awardUserId}&achievement_id=${awardBadgeId}`, {});
      setMessage({ type: "success", text: "Badge awarded! The player has been notified." });
      setAwardUserId("");
      setAwardBadgeId("");
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to award badge." });
    } finally {
      setAwarding(false);
    }
  };

  if (loading) return <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING ACHIEVEMENTS...</div>;

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ACHIEVEMENTS SYSTEM</h1>

      {message.text && (
        <div className={`mb-6 p-4 rounded-xl text-sm font-bold tracking-wide ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
          {message.type === 'success' ? '✓ ' : '⚠️ '}{message.text}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Create Badge Card */}
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>CREATE NEW BADGE</h3>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="flex gap-4">
              <div className="w-20">
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ICON</label>
                <input required value={newBadge.icon} onChange={e => setNewBadge({...newBadge, icon: e.target.value})} className="w-full bg-secondary border border-border rounded-lg px-2 py-2.5 text-center text-xl outline-none focus:border-violet-500" />
              </div>
              <div className="flex-1">
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>BADGE NAME</label>
                <input required value={newBadge.name} onChange={e => setNewBadge({...newBadge, name: e.target.value})} placeholder="e.g. First Blood" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>REQUIREMENT / DESCRIPTION</label>
              <input required value={newBadge.description} onChange={e => setNewBadge({...newBadge, description: e.target.value})} placeholder="e.g. Win your first tournament" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
            </div>
            <button type="submit" disabled={creating} className="btn-secondary w-full disabled:opacity-50 mt-2">
              {creating ? "CREATING..." : "+ ADD TO DATABASE"}
            </button>
          </form>
        </div>

        {/* Award Badge Card */}
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>AWARD BADGE TO PLAYER</h3>
          <form onSubmit={handleAward} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>SELECT PLAYER</label>
              <select required value={awardUserId} onChange={e => setAwardUserId(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500">
                <option value="">-- Choose Player --</option>
                {players.map(p => <option key={p.id} value={p.id}>{p.username}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>SELECT BADGE</label>
              <select required value={awardBadgeId} onChange={e => setAwardBadgeId(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500">
                <option value="">-- Choose Achievement --</option>
                {achievements.map(a => <option key={a.id} value={a.id}>{a.icon} {a.name}</option>)}
              </select>
            </div>
            <button type="submit" disabled={awarding || achievements.length === 0} className="btn-primary w-full disabled:opacity-50 mt-2">
              {awarding ? "AWARDING..." : "GRANT ACHIEVEMENT"}
            </button>
          </form>
        </div>
      </div>

      {/* Master List */}
      <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>MASTER BADGE LIST ({achievements.length})</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {achievements.map(a => (
          <div key={a.id} className="glass border border-border rounded-xl p-4 text-center">
            <div className="text-3xl mb-2">{a.icon}</div>
            <h4 className="text-sm font-bold text-white mb-1">{a.name}</h4>
            <p className="text-xs text-muted-foreground">{a.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}