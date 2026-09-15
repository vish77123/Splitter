import { useMemo } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid, LineChart, Line } from "recharts";
import { Trip } from "../types";
import { fundBalance, participantBalances } from "../lib/calculations";
import { Card, Badge } from "./ui";

export function Dashboard({ trip }: { trip: Trip }) {
  const balances = participantBalances(trip);
  const total = trip.expenses.reduce((s,e)=>s+e.amount,0);
  const category = useMemo(()=>Object.entries(trip.expenses.reduce((m,e)=>{m[e.category]=(m[e.category]||0)+e.amount; return m as Record<string,number>},{})).map(([name,value])=>({name,value})),[trip]);
  const payer = [...balances].sort((a,b)=>b.paidDirect-a.paidDirect)[0];
  const byPayer = balances.map(b=>({name:trip.participants.find(p=>p.id===b.participantId)?.name ?? "", paid:b.paidDirect, share:b.share}));
  const daily = Object.entries(trip.expenses.reduce((m,e)=>{m[e.date]=(m[e.date]||0)+e.amount;return m as Record<string,number>},{})).sort(([a],[b])=>a.localeCompare(b)).map(([date,value])=>({date:date.slice(5),value}));

  return <div className="space-y-4">
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {[
        ["Total trip cost", `₹${total.toLocaleString("en-IN",{maximumFractionDigits:2})}`],
        ["Expenses", String(trip.expenses.length)],
        ["Fund balance", `₹${fundBalance(trip).toLocaleString("en-IN",{maximumFractionDigits:2})}`],
        ["Top payer", payer ? trip.participants.find(p=>p.id===payer.participantId)?.name : "—"]
      ].map(([label,value])=><Card key={label}><p className="text-xs font-semibold text-slate-500">{label}</p><p className="mt-1 text-xl font-black">{value}</p></Card>)}
    </div>

    <div className="grid gap-4 lg:grid-cols-2">
      <Card><h3 className="mb-3 font-bold">Category breakdown</h3>{category.length?<div className="h-64"><ResponsiveContainer><PieChart><Pie data={category} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90}>{category.map((_,i)=><Cell key={i}/>)}</Pie><Tooltip/></PieChart></ResponsiveContainer></div>:<Empty/>}</Card>
      <Card><h3 className="mb-3 font-bold">Who paid vs consumed</h3>{byPayer.length?<div className="h-64"><ResponsiveContainer><BarChart data={byPayer}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="name"/><YAxis/><Tooltip/><Bar dataKey="paid" name="Paid"/><Bar dataKey="share" name="Consumed"/></BarChart></ResponsiveContainer></div>:<Empty/>}</Card>
      <Card className="lg:col-span-2"><h3 className="mb-3 font-bold">Daily spending</h3>{daily.length?<div className="h-56"><ResponsiveContainer><LineChart data={daily}><CartesianGrid strokeDasharray="3 3"/><XAxis dataKey="date"/><YAxis/><Tooltip/><Line type="monotone" dataKey="value" name="Spend" strokeWidth={2}/></LineChart></ResponsiveContainer></div>:<Empty/>}</Card>
    </div>

    <Card><h3 className="mb-3 font-bold">Participant balances</h3><div className="divide-y divide-slate-100 dark:divide-slate-800">{balances.map(b=>{const p=trip.participants.find(x=>x.id===b.participantId)!;return <div key={p.id} className="flex items-center gap-3 py-3"><div className="grid h-9 w-9 place-items-center rounded-full bg-slate-100 text-sm font-bold dark:bg-slate-800">{p.name[0]}</div><div className="flex-1"><p className="text-sm font-semibold">{p.name}</p><p className="text-xs text-slate-500">Paid ₹{b.paidDirect.toFixed(2)} · Share ₹{b.share.toFixed(2)}</p></div><Badge>{b.net>=0?"Receive":"Pay"} ₹{Math.abs(b.net).toFixed(2)}</Badge></div>})}</div></Card>
  </div>;
}
function Empty(){return <div className="grid h-56 place-items-center text-sm text-slate-500">No data yet. Add an expense to see analytics.</div>}
