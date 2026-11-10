import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { api } from "../lib/api";

export default function PlayerProfile() {
  const { id } = useParams();
  const [player,setPlayer]=useState<any>(null); const [badges,setBadges]=useState<any[]>([]); const [points,setPoints]=useState<any[]>([]); const [results,setResults]=useState<any[]>([]); const [error,setError]=useState("");
  useEffect(()=>{Promise.all([api.get<any>(`/players/${id}`),api.get<any[]>(`/achievements/user/${id}`),api.get<any[]>(`/players/${id}/points`),api.get<any[]>(`/players/${id}/results`)]).then(([p,b,pt,r])=>{setPlayer(p);setBadges(b);setPoints(pt);setResults(r);}).catch(e=>setError(e.message));},[id]);
  if(error)return <div className="min-h-screen flex flex-col items-center justify-center text-center"><p className="text-red-400">{error}</p><Link to="/players" className="btn-primary mt-4">BACK TO PLAYERS</Link></div>;
  if(!player)return <div className="min-h-screen flex items-center justify-center text-cyan-400">Loading player…</div>;
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><div className="glass neon-border rounded-2xl p-8 mb-8 flex items-center gap-6"><div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-3xl">{player.avatar}</div><div><h1 className="text-4xl font-black text-white">{player.username}</h1><p className="text-muted-foreground">Level {player.level} · {player.tier}</p><p className="text-sm text-muted-foreground">{player.points.toLocaleString()} points · {player.wins} wins · {player.winRate}% win rate</p></div></div>
    <div className="grid lg:grid-cols-2 gap-8"><section><h2 className="text-2xl font-black text-white mb-4">RECENT RESULTS</h2><div className="space-y-2">{results.map((r:any,i:number)=><div key={i} className="glass border border-border rounded-lg p-4 flex justify-between text-white"><span>#{r.placement} · {r.tournament}</span><span>{new Date(r.date).toLocaleDateString()}</span></div>)}{!results.length&&<p className="text-muted-foreground">No tournament results yet.</p>}</div>
      <h2 className="text-2xl font-black text-white mt-8 mb-4">POINT HISTORY</h2><div className="glass border border-border rounded-xl divide-y divide-border">{points.map((p:any)=><div key={p.id} className="p-4 flex justify-between"><span className="text-white">{p.action}</span><span className={p.points>=0?"text-green-400":"text-red-400"}>{p.points>0?"+":""}{p.points}</span></div>)}{!points.length&&<p className="p-4 text-muted-foreground">No point transactions yet.</p>}</div></section>
      <section><h2 className="text-2xl font-black text-white mb-4">ACHIEVEMENTS</h2><div className="grid grid-cols-3 gap-3">{badges.map((b:any)=><div key={b.id} className="glass border border-yellow-500/30 rounded-xl p-4 text-center"><div className="text-2xl">{b.icon}</div><p className="text-xs text-white">{b.name}</p></div>)}</div>{!badges.length&&<p className="text-muted-foreground">No achievements unlocked yet.</p>}</section></div>
  </div>;
}
