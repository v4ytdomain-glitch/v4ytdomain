import { useState, useEffect } from "react";
import { api } from "../lib/api";

const catColors: Record<string, string> = {
  Tournament: "badge-open",
  Winner: "badge-live",
  Community: "badge-soon",
  Update: "badge-done",
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/announcements/")
      .then(data => {
        setAnnouncements(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch announcements", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-violet-400 font-bold tracking-widest animate-pulse" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          LOADING LATEST NEWS...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-8">
        <p className="text-xs font-semibold tracking-widest text-green-400 mb-2 fade-up" style={{ fontFamily: "'Rajdhani', sans-serif" }}>V4YT OFFICIAL</p>
        <h1 className="text-5xl md:text-6xl font-black text-white fade-up delay-100" style={{ fontFamily: "'Rajdhani', sans-serif" }}>ANNOUNCEMENTS</h1>
      </div>

      {announcements.length === 0 ? (
        <div className="glass border border-border rounded-xl p-20 text-center">
          <div className="text-5xl mb-4">📰</div>
          <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NO NEWS YET</h3>
          <p className="text-muted-foreground">Check back later for community updates and tournament news.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {announcements.map((a, i) => (
            <div key={a.id} className={`glass border border-border rounded-xl overflow-hidden card-hover fade-up ${i === 0 ? "md:col-span-2" : ""}`} style={{ animationDelay: `${i * 0.1}s` }}>
              <div className={`relative ${i === 0 ? "h-64" : "h-44"} overflow-hidden bg-secondary`}>
                <img src={a.image || "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=800&h=400&fit=crop"} alt={a.title} className="w-full h-full object-cover opacity-60 hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 to-transparent"></div>
                <div className="absolute top-4 left-4">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-[0_0_15px_rgba(0,0,0,0.5)] ${catColors[a.category] || "badge-done"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {a.category.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="p-5">
                <p className="text-xs text-muted-foreground mb-2">{a.date}</p>
                <h3 className={`font-black text-white mb-2 ${i === 0 ? "text-3xl text-glow-white" : "text-xl"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>{a.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{a.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}