import { useState } from "react";
import { videos } from "../data/mock";

const cats = ["Latest", "Popular", "Shorts", "Live", "Tournaments", "Highlights"];

export default function Videos() {
  const [cat, setCat] = useState("Latest");
  const [playing, setPlaying] = useState<number | null>(null);

  const filtered = videos.filter(v => {
    if (cat === "Latest") return true;
    if (cat === "Shorts") return v.type === "short";
    if (cat === "Live") return v.type === "live";
    if (cat === "Highlights") return v.type === "highlight";
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-red-400 mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>YOUTUBE</p>
          <h1 className="text-5xl md:text-6xl font-black text-white" style={{ fontFamily: "'Rajdhani', sans-serif" }}>VIDEOS</h1>
        </div>
        <a href="https://youtube.com" target="_blank" rel="noopener"
          className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-bold transition-colors"
          style={{ fontFamily: "'Rajdhani', sans-serif" }}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg>
          SUBSCRIBE
        </a>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-8 flex-wrap">
        {cats.map(c => (
          <button key={c} onClick={() => setCat(c)}
            className={`px-4 py-2 rounded-lg text-xs font-bold tracking-widest transition-all ${cat === c ? "bg-red-600 text-white" : "bg-secondary border border-border text-muted-foreground hover:text-foreground"}`}
            style={{ fontFamily: "'Rajdhani', sans-serif" }}>
            {c.toUpperCase()}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="text-5xl mb-4">📹</div>
          <h3 className="text-2xl font-black text-white mb-2" style={{ fontFamily: "'Rajdhani', sans-serif" }}>NO VIDEOS</h3>
          <p className="text-muted-foreground">No videos in this category yet.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(v => (
            <div key={v.id} className="glass border border-border rounded-xl overflow-hidden card-hover group cursor-pointer" onClick={() => setPlaying(v.id)}>
              <div className="relative h-48 bg-secondary overflow-hidden">
                <img src={v.thumb} alt={v.title} className="w-full h-full object-cover opacity-70 group-hover:opacity-90 group-hover:scale-105 transition-all duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                {v.type === "live" && (
                  <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2 py-0.5 bg-red-500 rounded text-white text-xs font-bold" style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    <div className="w-1.5 h-1.5 bg-white rounded-full pulse-dot"></div> LIVE
                  </div>
                )}
                {v.type !== "live" && (
                  <div className="absolute bottom-2 right-2 px-1.5 py-0.5 bg-black/80 rounded text-white text-xs font-mono-data">{v.duration}</div>
                )}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-14 h-14 rounded-full bg-red-600/90 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white ml-1" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  </div>
                </div>
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs px-2 py-0.5 rounded font-bold ${v.type === "short" ? "bg-pink-500/20 text-pink-400" : v.type === "live" ? "bg-red-500/20 text-red-400" : v.type === "highlight" ? "bg-yellow-500/20 text-yellow-400" : "bg-secondary text-muted-foreground"}`} style={{ fontFamily: "'Rajdhani', sans-serif" }}>
                    {v.type.toUpperCase()}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-white mb-1 line-clamp-2 leading-snug" style={{ fontFamily: "'Rajdhani', sans-serif" }}>{v.title}</h4>
                <p className="text-xs text-muted-foreground">{v.views} views · {v.date}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {playing && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={() => setPlaying(null)}>
          <div className="bg-card border border-border rounded-2xl overflow-hidden max-w-2xl w-full" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-border">
              <span className="text-sm font-bold text-foreground">{videos.find(v => v.id === playing)?.title}</span>
              <button onClick={() => setPlaying(null)} className="text-muted-foreground hover:text-foreground text-xl">✕</button>
            </div>
            <div className="aspect-video bg-secondary flex items-center justify-center">
              <div className="text-center text-muted-foreground">
                <div className="text-4xl mb-3">▶</div>
                <p className="text-sm">YouTube embed would load here.</p>
                <a href="https://youtube.com" target="_blank" rel="noopener" className="btn-primary mt-3 inline-block">WATCH ON YOUTUBE</a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
