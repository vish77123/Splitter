import { Trip } from "../types";
import { optimizedSettlements, participantBalances } from "../lib/calculations";
import { Card, Badge } from "./ui";

export function Settlements({ trip }: { trip: Trip }) {
  const balances = participantBalances(trip);
  const settlements = optimizedSettlements(trip);
  const name = (id:string) => trip.participants.find(p=>p.id===id)?.name ?? "Unknown";

  return <div className="space-y-4">
    <Card><h2 className="text-lg font-bold">Settlement summary</h2><div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{balances.map(b=><div key={b.participantId} className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950"><p className="font-semibold">{name(b.participantId)}</p><p className="mt-1 text-xs text-slate-500">Paid ₹{b.paidDirect.toFixed(2)} · Consumed ₹{b.share.toFixed(2)} · Fund contribution ₹{b.contribution.toFixed(2)}</p><p className={`mt-2 text-lg font-black ${b.net>=0?"text-emerald-600":"text-red-600"}`}>{b.net>=0?"Receive":"Pay"} ₹{Math.abs(b.net).toFixed(2)}</p></div>)}</div></Card>
    <Card><div className="flex items-center justify-between"><h2 className="text-lg font-bold">Recommended settlements</h2><Badge>{settlements.length} transaction{settlements.length===1?"":"s"}</Badge></div><div className="mt-3 space-y-2">{settlements.length ? settlements.map((s,i)=><div key={i} className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 p-3 dark:border-slate-800"><span className="font-semibold text-red-600">{name(s.from)}</span><span className="text-slate-400">pays</span><span className="font-semibold text-emerald-600">{name(s.to)}</span><span className="ml-auto text-lg font-black">₹{s.amount.toFixed(2)}</span></div>) : <p className="py-8 text-center text-sm text-slate-500">Everyone is settled up 🎉</p>}</div></Card>
  </div>;
}
