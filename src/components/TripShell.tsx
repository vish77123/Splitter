import { useState } from "react";
import { BarChart3, CreditCard, Download, Moon, Receipt, Sun, Users } from "lucide-react";
import { useTripStore } from "../store";
import { useTrip } from "../hooks/useTrip";
import { Dashboard } from "./Dashboard";
import { ExpenseList } from "./ExpenseList";
import { Settlements } from "./Settlements";
import { Button, Modal, Input } from "./ui";
import { exportTrip, importTrip } from "../lib/storage";

type Tab="overview"|"expenses"|"settlements"|"people";

export function TripShell() {
  const trip=useTrip();
  export function TripShell() {
  const trip = useTrip();

  if (!trip) {
    return null;
  }

  const {dark,toggleDark,replaceTrip,updateTrip}=useTripStore();
  const [tab,setTab]=useState<Tab>("overview");
  const [peopleOpen,setPeopleOpen]=useState(false);
  const [newPerson,setNewPerson]=useState("");
  if(!trip) return null;

  function addPerson(){
    const name=newPerson.trim();
    if(!name || trip.participants.length>=50 || trip.participants.some(p=>p.name.toLowerCase()===name.toLowerCase())) return;
    updateTrip({participants:[...trip.participants,{id:crypto.randomUUID(),name}]});
    setNewPerson("");
  }
  function removePerson(id:string){
    if(trip.expenses.some(e=>e.paidBy===id || e.allocations.some(a=>a.participantId===id&&a.value>0))) return alert("This participant is used by an expense. Edit/remove those expenses first.");
    updateTrip({participants:trip.participants.filter(p=>p.id!==id)});
  }
  function backup(){ const blob=new Blob([exportTrip(trip)],{type:"application/json"}); const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=`${trip.name.replace(/\W+/g,"-")}.json`;a.click();URL.revokeObjectURL(a.href); }
  function restore(){ const input=document.createElement("input");input.type="file";input.accept="application/json";input.onchange=async()=>{const f=input.files?.[0];if(!f)return;try{replaceTrip(importTrip(await f.text()));}catch(e){alert("Invalid backup file.");}};input.click(); }

  const nav=[["overview","Overview",BarChart3],["expenses","Expenses",Receipt],["settlements","Settlements",CreditCard],["people",`People (${trip.participants.length})`,Users]] as const;

  return <div className="min-h-screen bg-slate-50 text-slate-950 dark:bg-slate-950 dark:text-slate-100">
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-slate-900 font-black text-white dark:bg-white dark:text-slate-900">TS</div>
        <div className="min-w-0 flex-1"><p className="truncate font-black">{trip.name}</p><p className="truncate text-xs text-slate-500">{trip.destination}</p></div>
        <Button variant="ghost" onClick={toggleDark}>{dark?<Sun size={18}/>:<Moon size={18}/>}</Button>
        <Button variant="secondary" className="hidden sm:inline-flex" onClick={backup}><Download size={16}/>Backup</Button>
      </div>
      <div className="mx-auto max-w-6xl overflow-x-auto px-4"><div className="flex gap-1 pb-2">{nav.map(([key,label,Icon])=><button key={key} onClick={()=>setTab(key)} className={`flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold ${tab===key?"bg-slate-900 text-white dark:bg-white dark:text-slate-900":"text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-900"}`}><Icon size={16}/>{label}</button>)}</div></div>
    </header>
    <main className="mx-auto max-w-6xl px-4 py-5 pb-20">
      {tab==="overview"&&<Dashboard trip={trip}/>}
      {tab==="expenses"&&<ExpenseList trip={trip}/>}
      {tab==="settlements"&&<Settlements trip={trip}/>}
      {tab==="people"&&<People trip={trip} onAdd={()=>setPeopleOpen(true)} onRemove={removePerson} onRestore={restore}/>}
    </main>
    <Modal open={peopleOpen} title="Add participant" onClose={()=>setPeopleOpen(false)}><div className="space-y-3"><Input autoFocus placeholder="Participant name" value={newPerson} onChange={e=>setNewPerson(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){addPerson();setPeopleOpen(false)}}}/><div className="flex justify-end gap-2"><Button variant="secondary" onClick={()=>setPeopleOpen(false)}>Cancel</Button><Button onClick={()=>{addPerson();setPeopleOpen(false)}}>Add</Button></div></div></Modal>
  </div>;
}

function People({trip,onAdd,onRemove,onRestore}:any){
  return <div className="space-y-4"><div className="flex items-center justify-between"><div><h1 className="text-2xl font-black">People</h1><p className="text-sm text-slate-500">Manage everyone sharing the trip.</p></div><Button onClick={onAdd} disabled={trip.participants.length>=50}>Add participant</Button></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{trip.participants.map((p:any)=><div key={p.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"><div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 font-bold dark:bg-slate-800">{p.name[0]}</div><p className="flex-1 font-semibold">{p.name}</p><button onClick={()=>onRemove(p.id)} className="text-xs font-semibold text-red-600">Remove</button></div>)}</div><div className="rounded-2xl border border-dashed border-slate-300 p-5 dark:border-slate-700"><p className="font-bold">Backup & restore</p><p className="mt-1 text-sm text-slate-500">Restore a JSON backup from another browser/device.</p><Button className="mt-3" variant="secondary" onClick={onRestore}>Restore JSON</Button></div></div>;
}
