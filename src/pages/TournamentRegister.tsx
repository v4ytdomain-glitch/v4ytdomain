import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { api } from "../lib/api";

const steps = ["Player Info", "Game Info", "Team Info", "Confirm"];

export default function TournamentRegister() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [tournament, setTournament] = useState<any>(null);
  const [me, setMe] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(0);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({ 
    username: "", 
    playerId: "", 
    gameUid: "", 
    inGameName: "", 
    teamName: "", 
    teamMembers: "" 
  });

  useEffect(() => {
    // Fetch user data AND the specific tournament data simultaneously
    Promise.all([
      api.get("/auth/me"),
      api.get(`/tournaments/${id}`),
      api.get("/teams/")
    ])
      .then(([userData, targetTournament, teamData]) => {
        setMe(userData);
        setTeams(teamData);
        if (!targetTournament) {
          setError("Tournament not found.");
        } else {
          setTournament(targetTournament);
        }

        // Pre-fill the form with the real user's data
        setForm(f => ({
          ...f,
          username: userData.username,
          playerId: `V4YT-${String(userData.id).padStart(5, '0')}` // Generate a cool ID
        }));
        
        setLoading(false);
      })
      .catch(err => {
        console.error("Not authenticated", err);
        navigate("/login"); // Kick to login if they try to register logged out
      });
  }, [id, navigate]);

  const update = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleConfirm = async () => {
    setSubmitting(true);
    setError("");
    
    try {
      const chosenTeam = teams.find(team => team.name.toLowerCase() === form.teamName.trim().toLowerCase());
      if (tournament.team_mode && !chosenTeam) throw new Error("Choose a team that you belong to before registering.");
      // THE REAL API CALL
      await api.post(`/tournaments/${id}/register`, {
        team_id: chosenTeam?.id || null,
        game_uid: form.gameUid,
        in_game_name: form.inGameName
      });
      
      setDone(true);
    } catch (err: any) {
      setError(err.message || "Registration failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        LOADING REGISTRATION...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-400 font-bold tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
        {error || "TOURNAMENT NOT FOUND"}
      </div>
    );
  }

  if (done) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center slide-in-up">
        <div className="glass neon-border rounded-2xl p-8">
          <div className="w-16 h-16 bg-green-500/20 border border-green-500/50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl pulse-glow">✅</div>
          <h2 className="text-3xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>REGISTRATION CONFIRMED</h2>
          <div className="space-y-2 my-6 text-sm text-muted-foreground text-left border border-border rounded-xl p-4 bg-secondary/30">
            <div className="flex justify-between"><span>Tournament</span><span className="text-foreground font-semibold">{tournament.name}</span></div>
            <div className="flex justify-between"><span>Player</span><span className="text-foreground font-semibold">{form.username}</span></div>
            <div className="flex justify-between"><span>Player ID</span><span className="font-mono-data text-cyan-400">{form.playerId}</span></div>
            <div className="flex justify-between"><span>Status</span><span className="text-green-400 font-bold tracking-widest">CONFIRMED</span></div>
          </div>
          <div className="flex flex-col gap-3">
            <Link to={`/tournaments/${id}`} className="btn-primary">VIEW TOURNAMENT DETAILS</Link>
            <Link to="/tournaments" className="btn-secondary">BROWSE MORE EVENTS</Link>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12">
      <Link to={`/tournaments/${id}`} className="text-xs text-muted-foreground hover:text-foreground mb-6 inline-block transition-colors">← Back to {tournament.name}</Link>
      <h1 className="text-4xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>REGISTER</h1>
      <p className="text-muted-foreground mb-8 text-cyan-400 font-semibold">{tournament.name}</p>

      {/* Progress */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1 last:flex-none">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${i < step ? "bg-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.5)]" : i === step ? "bg-violet-600 text-white shadow-[0_0_10px_rgba(124,58,237,0.5)]" : "bg-secondary border border-border text-muted-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
              {i < step ? "✓" : i + 1}
            </div>
            <span className={`text-xs font-semibold hidden sm:block ${i === step ? "text-foreground" : "text-muted-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>{s.toUpperCase()}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px transition-colors ${i < step ? "bg-green-500/40" : "bg-border"}`}></div>}
          </div>
        ))}
      </div>

      <div className="glass border border-border rounded-2xl p-6 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
            {error}
          </div>
        )}

        {step === 0 && (
          <div className="space-y-4 fade-up">
            <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PLAYER INFORMATION</h3>
            <p className="text-xs text-muted-foreground mb-4">This information is pulled securely from your V4YT profile.</p>
            {[{ label: "Username", key: "username" }, { label: "V4YT Player ID", key: "playerId" }].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{f.label.toUpperCase()}</label>
                <input disabled value={form[f.key as keyof typeof form]} 
                  className="w-full bg-secondary/50 border border-border rounded-lg px-4 py-2.5 text-sm text-muted-foreground outline-none cursor-not-allowed" />
              </div>
            ))}
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4 fade-up">
            <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>GAME INFORMATION</h3>
            {[{ label: "Game UID", key: "gameUid", placeholder: "Your in-game UID" }, { label: "In-Game Name", key: "inGameName", placeholder: "Your exact character name" }].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{f.label.toUpperCase()}</label>
                <input autoFocus value={form[f.key as keyof typeof form]} onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-secondary border border-violet-500/30 rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500 focus:shadow-[0_0_10px_rgba(124,58,237,0.2)] transition-all" />
              </div>
            ))}
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-cyan-400 mt-2">
              <strong>Note:</strong> Ensure your in-game name matches exactly. Mismatches may result in disqualification.
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4 fade-up">
            <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TEAM INFORMATION</h3>
            <p className="text-xs text-muted-foreground">Optional — enter team details if competing as a squad.</p>
            {[{ label: "Team Name", key: "teamName", placeholder: "Your team name (optional)" }, { label: "Team Members", key: "teamMembers", placeholder: "Comma-separated usernames (optional)" }].map(f => (
              <div key={f.key}>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{f.label.toUpperCase()}</label>
                <input autoFocus value={form[f.key as keyof typeof form]} onChange={e => update(f.key, e.target.value)}
                  placeholder={f.placeholder}
                  className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500 transition-colors" />
              </div>
            ))}
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4 fade-up">
            <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>CONFIRM REGISTRATION</h3>
            <div className="space-y-2 bg-secondary/80 rounded-xl p-4 border border-border">
              {[["Tournament", tournament.name], ["Username", form.username], ["Player ID", form.playerId], ["Game UID", form.gameUid || "Not provided"], ["In-Game Name", form.inGameName || "Not provided"], ["Prize Pool", tournament.prize]].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm py-1 border-b border-border/50 last:border-0">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground font-semibold text-right">{v}</span>
                </div>
              ))}
            </div>
            <div className="p-3 bg-violet-500/10 border border-violet-500/20 rounded-lg text-xs text-violet-300">
              By confirming, you agree to follow the official tournament rules. Violations may result in disqualification and point penalties.
            </div>
          </div>
        )}

        <div className="flex gap-3 mt-8">
          {step > 0 && <button onClick={() => setStep(s => s - 1)} disabled={submitting} className="btn-secondary transition-transform active:scale-95">← BACK</button>}
          
          {step < 3 ? (
            <button 
              onClick={() => setStep(s => s + 1)} 
              // Disable 'Next' on step 1 if they haven't filled out required game info
              disabled={(step === 1 && (!form.gameUid || !form.inGameName))}
              className="btn-primary ml-auto transition-transform active:scale-95 disabled:opacity-50 disabled:active:scale-100"
            >
              NEXT STEP →
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={submitting} className="btn-primary ml-auto transition-transform active:scale-95 pulse-glow">
              {submitting ? "PROCESSING..." : "CONFIRM REGISTRATION ✓"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
