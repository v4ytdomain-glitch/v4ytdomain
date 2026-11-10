import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function AdminPoints() {
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedPlayer, setSelectedPlayer] = useState("");
  const [pointsChange, setPointsChange] = useState("");
  const [reason, setReason] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/admin/players")
      .then(data => {
        setPlayers(data);
        if (data.length > 0) {
          setSelectedPlayer(data[0].id.toString());
        }
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError("Failed to load players.");
        setLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlayer || !pointsChange || !reason.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      await api.post("/admin/adjust-points", {
        user_id: selectedPlayer,
        amount: parseInt(pointsChange),
        reason
      });

      setSuccess("Transaction successful! The player's balance has been updated and they have been notified.");
      setPointsChange("");
      setReason("");
    } catch (err: any) {
      setError(err.message || "Failed to adjust points.");
    } finally {
      setSubmitting(false);
    }
  };

  const isDeduction = parseInt(pointsChange || "0") < 0;

  if (loading) {
    return <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING ECONOMY ENGINE...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6" style={{ fontFamily: "'Rajdhani', sans-serif" }}>POINTS & ECONOMY</h1>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="glass border border-border rounded-xl p-6">
          <h3 className="text-sm font-black text-white mb-5" style={{ fontFamily: "'Rajdhani', sans-serif" }}>MANUAL ADJUSTMENT</h3>
          
          {success && (
            <div className="mb-5 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 font-bold">
              ✓ {success}
            </div>
          )}
          
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TARGET PLAYER</label>
              <select 
                value={selectedPlayer} 
                onChange={e => setSelectedPlayer(e.target.value)}
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500"
              >
                {players.map(p => (
                  <option key={p.id} value={p.id}>{p.username} (Lv. {p.level} - {p.points} PTS)</option>
                ))}
              </select>
            </div>

            <div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT POINTS (+ / -)</label>
                <input 
                  type="number" 
                  required 
                  value={pointsChange} 
                  onChange={e => setPointsChange(e.target.value)} 
                  placeholder="e.g. 500 or -100"
                  className={`w-full bg-secondary border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500 transition-colors ${parseInt(pointsChange) < 0 ? 'border-red-500/50' : parseInt(pointsChange) > 0 ? 'border-green-500/50' : 'border-border'}`} 
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>REASON (Visible to Player)</label>
              <input 
                required 
                value={reason} 
                onChange={e => setReason(e.target.value)} 
                placeholder="e.g. Won the Discord Trivia Night!"
                className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" 
              />
            </div>

            <div className="pt-2">
              <button 
                type="submit" 
                disabled={submitting} 
                className={`w-full py-3 rounded-lg text-sm font-bold tracking-widest transition-all ${isDeduction ? 'bg-red-600 hover:bg-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.4)]' : 'bg-violet-600 hover:bg-violet-500 text-white shadow-[0_0_15px_rgba(124,58,237,0.4)]'} disabled:opacity-50`}
                style={{ fontFamily: "'Rajdhani', sans-serif" }}
              >
                {submitting ? "PROCESSING..." : isDeduction ? "CONFIRM PENALTY DEDUCTION" : "AWARD POINTS & XP"}
              </button>
            </div>
          </form>
        </div>

        <div className="space-y-4">
          <div className="glass border border-border rounded-xl p-5">
            <h3 className="text-sm font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>HOW IT WORKS</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              Use positive numbers (e.g. <code>500</code>) to reward players for community engagement, mini-games, or manual corrections.
              Use negative numbers (e.g. <code>-200</code>) to penalize players for rule violations or no-shows.
            </p>
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
              <strong>Note:</strong> The system automatically prevents a player's balance from dropping below 0, and automatically adjusts their Level based on the new XP total.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
