import { useState } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";

export default function Login() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (mode === "register") {
        // 1. Register the user
        await api.post("/auth/register", { username, email, password });
        
        // 2. Automatically log them in after registration
        const formData = new URLSearchParams();
        formData.append("username", username);
        formData.append("password", password);
        
        const loginRes = await api.login(formData);
        localStorage.setItem("v4yt_token", loginRes.access_token);
        navigate("/dashboard");

      } else {
        // Login Mode
        const formData = new URLSearchParams();
        formData.append("username", username); 
        formData.append("password", password);

        const res = await api.login(formData);
        localStorage.setItem("v4yt_token", res.access_token);
        navigate("/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30"></div>
      <div className="absolute inset-0" style={{ background: "radial-gradient(ellipse 60% 60% at 50% 40%, rgba(124,58,237,0.15) 0%, transparent 70%)" }}></div>

      <div className="relative w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl mx-auto mb-3 neon-border">V4</div>
          <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT OFFICIAL</h1>
          <p className="text-sm text-muted-foreground">The Gaming Community Platform</p>
        </div>

        <div className="glass neon-border rounded-2xl p-6">
          <div className="flex rounded-lg overflow-hidden border border-border mb-5">
            <button type="button" onClick={() => { setMode("login"); setError(""); }} className={`flex-1 py-2.5 text-sm font-bold transition-colors ${mode === "login" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOGIN</button>
            <button type="button" onClick={() => { setMode("register"); setError(""); }} className={`flex-1 py-2.5 text-sm font-bold transition-colors ${mode === "register" ? "bg-violet-600 text-white" : "text-muted-foreground hover:text-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>REGISTER</button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400 text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {mode === "register" && (
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>EMAIL</label>
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="your@email.com" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
              </div>
            )}
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>USERNAME</label>
              <input type="text" required value={username} onChange={e => setUsername(e.target.value)} placeholder="Your username" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PASSWORD</label>
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
            </div>
            
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2 opacity-100 disabled:opacity-50">
              {loading ? "PROCESSING..." : mode === "login" ? "LOGIN" : "CREATE ACCOUNT"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}