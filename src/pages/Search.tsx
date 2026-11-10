import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router";
import { api } from "../lib/api";

export default function Search() {
  const [params] = useSearchParams(); const q = params.get("q") || "";
  const [data, setData] = useState<any>({ players: [], tournaments: [], videos: [] }); const [error, setError] = useState(""); const [loading,setLoading]=useState(false);
  useEffect(() => { if (q) {setLoading(true);api.get<any>(`/search?q=${encodeURIComponent(q)}`).then(setData).catch(e => setError(e.message)).finally(()=>setLoading(false));} }, [q]);
  const total = data.players.length + data.tournaments.length + data.videos.length;
  return <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12"><h1 className="text-4xl font-black text-white mb-2">SEARCH RESULTS</h1><p className="text-muted-foreground mb-8">{q ? `“${q}” · ${total} results` : "Enter a search term."}</p>
    {error && <p role="alert" className="text-red-400">{error}</p>}{loading&&<p className="text-muted-foreground">Searching…</p>}{!loading&&!error && q && !total && <p className="text-muted-foreground">No results found for “{q}”.</p>}
    <div className="space-y-8">{data.players.map((p:any)=><Link key={p.id} to={`/players/${p.id}`} className="block glass border border-border rounded-xl p-4 text-white">Player · {p.username} · {p.points.toLocaleString()} points</Link>)}
      {data.tournaments.map((t:any)=><Link key={t.id} to={`/tournaments/${t.id}`} className="block glass border border-border rounded-xl p-4 text-white">Tournament · {t.name} · {t.game} · {t.status}</Link>)}
      {data.videos.map((v:any)=><div key={v.id} className="glass border border-border rounded-xl p-4 text-white">Video · {v.title}</div>)}</div></div>;
}
