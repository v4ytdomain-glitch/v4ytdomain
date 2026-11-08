import { useState, useEffect } from "react";
import { api } from "../../lib/api";

export default function AdminAnnouncements() {
  const [creating, setCreating] = useState(false);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    title: "",
    category: "Update",
    desc: "",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop",
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  });

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const fetchAnnouncements = async () => {
    try {
      const data = await api.get("/announcements/");
      setAnnouncements(data);
    } catch (err) {
      console.error("Failed to load announcements", err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const newAnn = await api.post("/admin/announcements", formData);
      setAnnouncements([newAnn, ...announcements]); // Add to top of list
      setCreating(false);
      setFormData({ ...formData, title: "", desc: "" }); // Reset form
    } catch (err) {
      console.error("Failed to publish", err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>LOADING ANNOUNCEMENTS...</div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ANNOUNCEMENTS</h1>
        <button onClick={() => setCreating(true)} className="btn-primary text-xs transition-transform active:scale-95">+ NEW ANNOUNCEMENT</button>
      </div>

      {creating && (
        <div className="glass border border-border rounded-xl p-5 mb-6 fade-up">
          <h3 className="text-sm font-black text-white mb-4" style={{ fontFamily: "'Rajdhani', sans-serif" }}>CREATE ANNOUNCEMENT</h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>TITLE</label>
              <input required name="title" value={formData.title} onChange={handleChange} placeholder="Announcement title" className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>CATEGORY</label>
                <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500">
                  <option value="Update">Update</option>
                  <option value="Tournament">Tournament</option>
                  <option value="Winner">Winner</option>
                  <option value="Community">Community</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>DISPLAY DATE</label>
                <input required name="date" value={formData.date} onChange={handleChange} className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>IMAGE URL</label>
              <input required name="image" value={formData.image} onChange={handleChange} placeholder="https://..." className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500" />
            </div>

            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 tracking-widest" style={{ fontFamily: "'Rajdhani', sans-serif" }}>DESCRIPTION</label>
              <textarea required name="desc" value={formData.desc} onChange={handleChange} rows={4} placeholder="Announcement content..." className="w-full bg-secondary border border-border rounded-lg px-4 py-2.5 text-sm text-foreground outline-none focus:border-violet-500 resize-none"></textarea>
            </div>
            
            <div className="flex gap-3 mt-4">
              <button type="button" onClick={() => setCreating(false)} className="btn-secondary">CANCEL</button>
              <button type="submit" disabled={submitting} className="btn-primary disabled:opacity-50">
                {submitting ? "PUBLISHING..." : "PUBLISH ANNOUNCEMENT"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="space-y-3">
        {announcements.length === 0 ? (
          <div className="glass border border-border rounded-xl p-10 text-center text-muted-foreground">
            No announcements published yet.
          </div>
        ) : (
          announcements.map((a, i) => (
            <div key={a.id} className="glass border border-border rounded-xl p-4 flex items-start gap-4 fade-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-lg bg-secondary overflow-hidden shrink-0">
                <img src={a.image} alt="" className="w-full h-full object-cover opacity-60" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs px-2 py-0.5 rounded bg-violet-500/20 text-violet-400 font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{a.category.toUpperCase()}</span>
                  <span className="text-xs text-muted-foreground">{a.date}</span>
                </div>
                <h4 className="text-sm font-bold text-white truncate" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{a.title}</h4>
                <p className="text-xs text-muted-foreground truncate">{a.desc}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}