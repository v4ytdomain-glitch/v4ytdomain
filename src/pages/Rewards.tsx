import { useEffect, useState } from "react";
import { api } from "../lib/api";

export default function Rewards() {
  const [rewards,setRewards]=useState<any[]>([]); const [balance,setBalance]=useState(0); const [claimed,setClaimed]=useState<string[]>([]); const [error,setError]=useState(""); const [loading,setLoading]=useState(true);
  useEffect(()=>{Promise.all([api.get<any[]>("/rewards/"),api.get<any>("/auth/me"),api.get<any>("/rewards/redemptions/mine").catch(()=>({items:[]}))]).then(([items,me,redemptions])=>{setRewards(items);setBalance(me.points||0);setClaimed((redemptions.items||[]).filter((r:any)=>r.status!=="refunded"&&r.status!=="cancelled").map((r:any)=>r.reward));}).catch(e=>setError(e.message)).finally(()=>setLoading(false));},[]);
  const redeem=async(r:any)=>{setError("");try{await api.post(`/rewards/${r.id}/redeem`,{});setBalance(v=>v-r.cost);setClaimed(c=>[...c,r.name]);}catch(e:any){setError(e.message);}};
  return <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12"><p className="text-xs text-violet-400 mb-2">EARN MORE</p><h1 className="text-5xl font-black text-white mb-2">REWARDS</h1><p className="text-muted-foreground mb-8">Unlock exclusive rewards with V4YT Points.</p>
    <div className="glass neon-border rounded-xl p-5 mb-8"><p className="text-xs text-muted-foreground">Your Balance</p><p className="text-3xl font-black text-white">{balance.toLocaleString()} <span className="text-violet-400">V4YT PTS</span></p></div>
    {error&&<p role="alert" className="mb-4 text-red-400">{error}</p>}{loading&&<p className="text-muted-foreground">Loading rewards…</p>}{!loading&&!rewards.length&&!error&&<p className="text-muted-foreground">No rewards are available.</p>}
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">{rewards.map(r=>{const claimedReward=claimed.includes(r.name);const canAfford=balance>=r.cost&&r.available;return <div key={r.id} className="glass border border-border rounded-xl p-5"><div className="text-4xl">{r.icon}</div><h2 className="text-lg font-black text-white mt-3">{r.name}</h2><p className="text-xs text-muted-foreground my-3">{r.desc}</p><div className="flex items-center justify-between"><b className="text-violet-400">{r.cost.toLocaleString()} PTS</b>{claimedReward?<span className="text-green-400">PENDING</span>:<button onClick={()=>redeem(r)} disabled={!canAfford} className="btn-primary disabled:opacity-50">{r.available?"REDEEM":"OUT OF STOCK"}</button>}</div></div>;})}</div>
  </div>;
}
