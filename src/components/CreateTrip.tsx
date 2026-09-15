import { useState } from "react";
import { MapPin, Plus, Users } from "lucide-react";
import { useTripStore } from "../store";
import { Button, Input } from "./ui";

export function CreateTrip(){
  const createTrip=useTripStore(s=>s.createTrip);
  const [name,setName]=useState(""); const [destination,setDestination]=useState(""); const [people,setPeople]=useState(["",""]);
  function submit(e:React.FormEvent){e.preventDefault();const participants=people.map(n=>n.trim()).filter(Boolean);if(name.trim()&&participants.length>=2&&participants.length<=50)createTrip(name.trim(),destination.trim(),participants.map(n=>({id:crypto.randomUUID(),name:n})));}

  return <div className="min-h-screen bg-slate-50 px-4 py-8 dark:bg-slate-950"><div className="mx-auto max-w-xl">
    <div className="mb-8 text-center"><div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-slate-900 text-xl font-black text-white dark:bg-white dark:text-slate-900">TS</div><h1 className="text-3xl font-black tracking-tight">Plan the trip. Split the cost.</h1><p className="mt-2 text-slate-500">A fast, private expense manager for groups.</p></div>
    <form onSubmit={submit} className="space-y-4 rounded-3xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <label className="text-sm font-semibold">Trip name<Input required value={name} onChange={e=>setName(e.target.value)} placeholder="Goa 2026"/></label>
      <label className="text-sm font-semibold">Destination<div className="relative"><MapPin size={16} className="absolute left-3 top-3 text-slate-400"/><Input className="pl-9" value={destination} onChange={e=>setDestination(e.target.value)} placeholder="Goa, India"/></div></label>
      <div><div className="mb-2 flex items-center justify-between"><label className="text-sm font-semibold">Participants</label><span className="text-xs text-slate-500">{people.filter(Boolean).length}/50 · minimum 2</span></div><div className="space-y-2">{people.map((p,i)=><Input key={i} value={p} onChange={e=>setPeople(a=>a.map((x,j)=>j===i?e.target.value:x))} placeholder={`Person ${i+1}`}/>)}</div><button type="button" className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-slate-600" onClick={()=>setPeople(a=>a.length<50?[...a,""]:a)}><Plus size={15}/> Add person</button></div>
      <Button type="submit" className="w-full py-3"><Users size={17}/>Create trip</Button>
    </form>
  </div></div>;
}
