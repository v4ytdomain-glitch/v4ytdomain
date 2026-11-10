import { useEffect, useState } from "react";
import { api } from "../lib/api";

const cats = ["Latest", "Popular", "Shorts", "Live", "Tournaments", "Highlights"];
export default function Videos() {
  const [cat,setCat]=useState("Latest"); const [videos,setVideos]=useState<any[]>([]); const [error,setError]=useState(""); const [playing,setPlaying]=useState<any>(null); const [loading,setLoading]=useState(true);
  useEffect(()=>{api.get<any[]>("/videos/").then(setVideos).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  const typeForCategory: Record<string,string>={Shorts:"short",Live:"live",Highlights:"highlight"};
  const filtered=videos.filter(v=>!typeForCategory[cat]||v.type===typeForCategory[cat]);
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><h1 className="text-5xl font-black text-white mb-8">VIDEOS</h1><div className="flex gap-2 mb-8 flex-wrap">{cats.map(c=><button key={c} onClick={()=>setCat(c)} className={`px-4 py-2 rounded-lg text-xs ${cat===c?"bg-red-600 text-white":"bg-secondary text-muted-foreground"}`}>{c.toUpperCase()}</button>)}</div>
    {error&&<p role="alert" className="text-red-400">{error}</p>}{loading&&<p className="text-muted-foreground">Loading videos…</p>}{!loading&&!videos.length&&!error&&<p className="text-muted-foreground">No published videos yet.</p>}{videos.length>0&&!filtered.length&&<p className="text-muted-foreground">No videos in this category.</p>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">{filtered.map(v=><button key={v.id} onClick={()=>setPlaying(v)} className="text-left glass border border-border rounded-xl overflow-hidden"><img src={v.thumb||""} alt="" className="w-full h-48 object-cover"/><div className="p-4"><span className="text-xs text-red-400">{v.type}</span><h2 className="text-white font-bold mt-2">{v.title}</h2><p className="text-xs text-muted-foreground">{v.views} views · {v.date}</p></div></button>)}</div>
    {playing&&<div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4" onClick={()=>setPlaying(null)}><div className="bg-card p-6 rounded-xl max-w-xl w-full" onClick={e=>e.stopPropagation()}><button className="float-right" onClick={()=>setPlaying(null)}>Close</button><h2 className="text-white font-bold">{playing.title}</h2><a className="btn-primary mt-4 inline-block" href={playing.url} target="_blank" rel="noreferrer">WATCH VIDEO</a></div></div>}</div>;
}
