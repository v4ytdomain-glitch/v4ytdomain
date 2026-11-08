import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function AdminResults() {
  const [tournaments, setTournaments] = useState<any[]>([]);
  const [players, setPlayers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [selectedTournament, setSelectedTournament] = useState("");
  const [firstPlace, setFirstPlace] = useState("");
  const [secondPlace, setSecondPlace] = useState("");
  const [thirdPlace, setThirdPlace] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch tournaments and players
    Promise.all([
      api.get("/tournaments/"),
      api.get("/admin/players")
    ]).then(([tData, pData]) => {
      // Only show tournaments that aren't completed yet
      const pendingTournaments = tData.filter((t: any) => t.status !== "completed");
      setTournaments(pendingTournaments);
      setPlayers(pData);
      
      if (pendingTournaments.length > 0) {
        setSelectedTournament(pendingTournaments[0].id.toString());
      }
      setLoading(false);
    }).catch(err => {
      console.error(err);
      setError("Failed to load backend data.");
      setLoading(false);
    });
  }, []);

  const handleSubmit = async () => {
    // Basic validation
    if (!selectedTournament || !firstPlace || !secondPlace || !thirdPlace) {
      setError("Please select a tournament and all 3 winners.");
      return;
    }
    if (firstPlace === secondPlace || secondPlace === thirdPlace || firstPlace === thirdPlace) {
      setError("A player cannot hold multiple winning spots!");
      return;
    }

    setSubmitting(true);
    setError("");
    setSaved(false);

    try {
      await api.post("/admin/results", {
        tournament_id: parseInt(selectedTournament),
        first_place_id: parseInt(firstPlace),
        second_place_id: parseInt(secondPlace),
        third_place_id: parseInt(thirdPlace)
      });
      
      setSaved(true);
      
      // Remove completed tournament from the dropdown
      setTournaments(tournaments.filter(t => t.id.toString() !== selectedTournament));
      setFirstPlace("");
      setSecondPlace("");
      setThirdPlace("");
    } catch(err: any) {
      setError(err.message || "Failed to submit results");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING RESULT MATRIX...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-black text-white mb-6" style={{ fontFamily: "'Rajdhani', sans-serif" }}>RESULT MANAGEMENT</h1>

      <div className="glass border border-border rounded-xl p-5 mb-5">
        <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>SELECT PENDING TOURNAMENT</h3>
        
        {tournaments.length === 0 ? (
          <div className="p-3 bg-secondary border border-border rounded-lg text-sm text-muted-foreground">
            No pending tournaments available to score.
          </div>
        ) : (
          <select value={selectedTournament} onChange={e => setSelectedTournament(e.target.value)}
            className="bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500 w-full md:w-auto">
            {tournaments.map(t => <option key={t.id} value={t.id}>{t.name} ({t.date})</option>)}
          </select>
        )}
      </div>

      <div className={`glass border border-border rounded-xl p-5 transition-opacity ${tournaments.length === 0 ? 'opacity-50 pointer-events-none' : ''}`}>
        <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>AWARD WINNERS</h3>
        
        {saved && (
          <div className="mb-4 p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-400 font-bold tracking-wide">
            ✓ RESULTS SAVED! Leaderboards, profiles, and XP have been automatically updated.
          </div>
        )}
        
        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="space-y-3">
          {[
            { pos: "Champion (1st Place)", icon: "🥇", points: "+500", xp: "+1000 XP", val: firstPlace, setter: setFirstPlace },
            { pos: "Runner-up (2nd Place)", icon: "🥈", points: "+300", xp: "+500 XP", val: secondPlace, setter: setSecondPlace },
            { pos: "Third Place (3rd Place)", icon: "🥉", points: "+200", xp: "+250 XP", val: thirdPlace, setter: setThirdPlace }
          ].map((r, i) => (
            <div key={r.pos} className={`flex items-center gap-4 p-3 rounded-lg border ${i === 0 ? 'bg-yellow-500/5 border-yellow-500/20' : 'border-transparent'}`}>
              <span className="text-2xl">{r.icon}</span>
              <div className="flex-1">
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{r.pos.toUpperCase()}</label>
                <select value={r.val} onChange={e => r.setter(e.target.value)} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500">
                  <option value="">-- Select Player --</option>
                  {players.map(p => <option key={p.id} value={p.id}>{p.username} (Lv. {p.level})</option>)}
                </select>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-muted-foreground">Rewards</p>
                <p className="text-sm font-black text-green-400 font-mono-data">{r.points} PTS</p>
                <p className="text-[10px] text-violet-400 font-bold">{r.xp}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300 leading-relaxed">
          <strong>CRITICAL SYSTEM NOTE:</strong> Submitting results is final. This action immediately issues V4YT Points, calculates new Level XP, updates Win Rates, and transitions the tournament status to COMPLETED across the entire public platform.
        </div>

        <button onClick={handleSubmit} disabled={submitting || tournaments.length === 0} className="btn-primary mt-4 w-full md:w-auto disabled:opacity-50 transition-transform active:scale-95">
          {submitting ? "PROCESSING TRANSACTION..." : "CONFIRM & SUBMIT RESULTS"}
        </button>
      </div>
    </div>
  );
}