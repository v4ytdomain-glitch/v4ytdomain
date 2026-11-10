import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { api } from "../lib/api";

export default function LiveTournament() {
  const { id } = useParams(); const [tournament,setTournament]=useState<any>(null); const [players,setPlayers]=useState<any[]>([]); const [error,setError]=useState("");
  useEffect(()=>{Promise.all([api.get<any>(`/tournaments/${id}`),api.get<any[]>(`/tournaments/${id}/participants`)]).then(([t,p])=>{setTournament(t);setPlayers(p);}).catch(e=>setError(e.message));},[id]);
  if(error)return <div className="max-w-5xl mx-auto p-10 text-red-400">{error}</div>;
  if(!tournament)return <div className="min-h-screen flex items-center justify-center text-cyan-400">Loading live tournament…</div>;
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><div className="flex items-center gap-3 mb-2"><span className="w-2 h-2 bg-red-500 rounded-full pulse-dot"/><span className="text-red-400 font-black tracking-widest">{tournament.status.toUpperCase()}</span></div><h1 className="text-4xl font-black text-white">{tournament.name}</h1><p className="text-muted-foreground mb-8">{tournament.game} · {tournament.date} · {tournament.time}</p>
    <section className="glass border border-border rounded-xl p-5"><h2 className="text-lg font-black text-white mb-4">REGISTERED PARTICIPANTS ({players.length})</h2><div className="space-y-2">{players.map((p:any,index:number)=><div key={p.id} className="flex items-center gap-3 rounded-lg bg-secondary/50 p-3"><span className="w-7 text-center text-muted-foreground">#{index+1}</span><span className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 flex items-center justify-center text-white font-black text-xs">{p.avatar}</span><span className="text-white font-bold">{p.username}</span></div>)}{!players.length&&<p className="text-muted-foreground">No participants are registered.</p>}</div><p className="text-xs text-muted-foreground mt-5">Live match telemetry and elimination events require an external game feed.</p></section>
  </div>;
}
