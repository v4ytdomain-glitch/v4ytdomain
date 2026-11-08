import { useState, useEffect } from "react";
import { useNavigate } from "react-router";
import { api } from "../lib/api";

const sections = ["Profile", "Notifications", "Privacy", "Security", "Connected Accounts"];

export default function Settings() {
  const [section, setSection] = useState("Profile");
  const [notifSettings, setNotifSettings] = useState({ tournaments: true, achievements: true, messages: false, marketing: false });
  const navigate = useNavigate();

  // Profile Form State
  const [me, setMe] = useState<any>(null);
  const [formData, setFormData] = useState({ username: "", email: "", avatar: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  useEffect(() => {
    api.get("/auth/me")
      .then(data => {
        setMe(data);
        setFormData({
          username: data.username,
          email: data.email,
          avatar: data.avatar || "V4"
        });
        setLoading(false);
      })
      .catch(err => {
        console.error("Not logged in", err);
        navigate("/login");
      });
  }, [navigate]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: "", text: "" });

    try {
      const updatedUser = await api.put("/auth/me", formData);
      setMe(updatedUser);
      setFormData({
        username: updatedUser.username,
        email: updatedUser.email,
        avatar: updatedUser.avatar
      });
      setMessage({ type: "success", text: "Profile updated successfully! Check your Dashboard." });
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING SETTINGS...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <h1 className="text-4xl font-black text-white mb-8" style={{ fontFamily: "'Rajdhani', sans-serif" }}>SETTINGS</h1>
      <div className="grid md:grid-cols-4 gap-6">
        
        {/* Sidebar nav */}
        <div className="glass border border-border rounded-xl p-2 h-fit">
          {sections.map(s => (
            <button key={s} onClick={() => setSection(s)}
              className={`w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${section === s ? "bg-violet-600/20 text-violet-400" : "text-muted-foreground hover:text-foreground hover:bg-white/5"}`}>
              {s}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="md:col-span-3">
          <div className="glass border border-border rounded-xl p-6">
            
            {section === "Profile" && (
              <form onSubmit={handleProfileUpdate} className="space-y-5">
                <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>PROFILE SETTINGS</h3>
                
                {message.text && (
                  <div className={`p-3 rounded-lg text-sm font-bold tracking-wide ${message.type === 'success' ? 'bg-green-500/10 border border-green-500/30 text-green-400' : 'bg-red-500/10 border border-red-500/30 text-red-400'}`}>
                    {message.type === 'success' ? '✓ ' : '⚠️ '}{message.text}
                  </div>
                )}

                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xl shadow-[0_0_20px_rgba(124,58,237,0.3)]">
                    {formData.avatar}
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>AVATAR (Max 3 Chars/Emojis)</label>
                    <input 
                      value={formData.avatar} 
                      onChange={e => setFormData({...formData, avatar: e.target.value.substring(0, 3)})} 
                      className="bg-secondary border border-border rounded-lg px-4 py-2 text-sm text-foreground outline-none focus:border-violet-500 w-32" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>USERNAME</label>
                  <input 
                    required
                    value={formData.username} 
                    onChange={e => setFormData({...formData, username: e.target.value})} 
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" 
                  />
                </div>
                
                <div>
                  <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>EMAIL</label>
                  <input 
                    required
                    type="email"
                    value={formData.email} 
                    onChange={e => setFormData({...formData, email: e.target.value})} 
                    className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" 
                  />
                </div>

                <button type="submit" disabled={saving} className="btn-primary transition-transform active:scale-95 disabled:opacity-50">
                  {saving ? "SAVING..." : "SAVE CHANGES"}
                </button>
              </form>
            )}

            {/* Other static tabs remain unchanged visually for now */}
            {section === "Notifications" && (
              <div className="space-y-5 opacity-70 pointer-events-none">
                <h3 className="text-lg font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NOTIFICATIONS (COMING SOON)</h3>
                {[["tournaments", "Tournament Updates", "Registration opens, match starts, results"],
                  ["achievements", "Achievement Alerts", "When you unlock new achievements"]].map(([key, label, desc]) => (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{label}</p>
                      <p className="text-xs text-muted-foreground">{desc}</p>
                    </div>
                    <button className={`relative w-10 h-5 rounded-full transition-colors bg-violet-600`}>
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform translate-x-5`}></div>
                    </button>
                  </div>
                ))}
              </div>
            )}

            {section !== "Profile" && section !== "Notifications" && (
              <div className="space-y-4 opacity-70 pointer-events-none">
                <h3 className="text-lg font-black text-white uppercase" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{section} (COMING SOON)</h3>
                <p className="text-sm text-muted-foreground">This section is currently under development.</p>
              </div>
            )}
            
          </div>
        </div>
      </div>
    </div>
  );
}