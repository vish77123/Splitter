import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Trip } from "../types";
import { useTripStore } from "../store";
import { allocationAmounts } from "../lib/calculations";
import { Button, Card, Modal, Badge } from "./ui";
import { ExpenseForm } from "./ExpenseForm";

export function ExpenseList({ trip }: { trip: Trip }) {
  const { addExpense, updateExpense, removeExpense } = useTripStore();
  const [open,setOpen]=useState(false);
  const [editing,setEditing]=useState<any>(null);
  const name=(id:string)=>trip.participants.find(p=>p.id===id)?.name ?? (id==="__fund__"?"Trip Fund":"Unknown");
  const sorted=[...trip.expenses].sort((a,b)=>b.date.localeCompare(a.date));

  return <Card>
    <div className="mb-3 flex items-center justify-between"><div><h2 className="font-bold">Expenses</h2><p className="text-xs text-slate-500">{trip.expenses.length} recorded</p></div><Button onClick={()=>{setEditing(null);setOpen(true)}}><Plus size={16}/>Add expense</Button></div>
    {sorted.length===0 ? <div className="grid min-h-52 place-items-center rounded-2xl bg-slate-50 text-center dark:bg-slate-950"><div><p className="font-bold">No expenses yet</p><p className="mt-1 text-sm text-slate-500">Add your first trip expense.</p></div></div> :
    <div className="space-y-2">{sorted.map(e=><div key={e.id} className="group rounded-2xl border border-slate-200 p-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-950"><div className="flex items-start gap-3"><div className="flex-1"><div className="flex flex-wrap items-center gap-2"><p className="font-semibold">{e.title}</p><Badge>{e.category}</Badge></div><p className="mt-1 text-xs text-slate-500">{e.date} · paid by {name(e.paidBy)} · {e.splitMethod} split</p><p className="mt-2 text-xs text-slate-500">{allocationAmounts(e).filter(a=>a.value>0).map(a=>`${name(a.participantId)} ₹${a.value.toFixed(2)}`).join(" · ")}</p></div><p className="font-black">₹{e.amount.toFixed(2)}</p><div className="flex gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"><Button variant="ghost" onClick={()=>{setEditing(e);setOpen(true)}}><Pencil size={15}/></Button><Button variant="ghost" onClick={()=>removeExpense(e.id)}><Trash2 size={15}/></Button></div></div></div>)}</div>}
    <Modal open={open} title={editing?"Edit expense":"Add expense"} onClose={()=>setOpen(false)}><ExpenseForm participants={trip.participants} initial={editing} onCancel={()=>setOpen(false)} onSave={(e:any)=>{editing?updateExpense(e):addExpense(e);setOpen(false)}}/></Modal>
  </Card>;
}
