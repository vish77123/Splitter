import { useMemo, useState } from "react";
import { Expense, ExpenseCategory, SplitMethod } from "../types";
import { FUND_ID, validateAllocation } from "../lib/calculations";
import { Button, Input, Select } from "./ui";

const categories: ExpenseCategory[] = ["Food","Travel","Stay","Activities","Fuel","Shopping","Miscellaneous"];

export function ExpenseForm({ participants, initial, onSave, onCancel }: any) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [amount, setAmount] = useState(String(initial?.amount ?? ""));
  const [category, setCategory] = useState<ExpenseCategory>(initial?.category ?? "Food");
  const [paidBy, setPaidBy] = useState(initial?.paidBy ?? participants[0]?.id ?? FUND_ID);
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [date, setDate] = useState(initial?.date ?? new Date().toISOString().slice(0,10));
  const [method, setMethod] = useState<SplitMethod>(initial?.splitMethod ?? "equal");
  const [alloc, setAlloc] = useState<Record<string, number>>(
    Object.fromEntries(participants.map((p: any) => [p.id, initial?.allocations?.find((a: any) => a.participantId === p.id)?.value ?? 1]))
  );

  const draft = useMemo<Expense>(() => ({
    id: initial?.id ?? crypto.randomUUID(), title, amount: Number(amount), category, paidBy, notes, date,
    splitMethod: method, allocations: participants.map((p: any) => ({ participantId: p.id, value: Number(alloc[p.id] ?? 0) }))
  }), [title, amount, category, paidBy, notes, date, method, alloc, participants, initial]);

  const error = amount && title ? validateAllocation(draft) : null;

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || Number(amount) <= 0 || error) return;
    onSave(draft);
  }

  return <form onSubmit={submit} className="space-y-4">
    <div className="grid gap-3 sm:grid-cols-2">
      <label className="text-sm font-medium">Title<Input required value={title} onChange={e=>setTitle(e.target.value)} placeholder="Dinner at the beach"/></label>
      <label className="text-sm font-medium">Amount (₹)<Input required min="0" step="0.01" type="number" value={amount} onChange={e=>setAmount(e.target.value)} placeholder="2500"/></label>
      <label className="text-sm font-medium">Category<Select value={category} onChange={e=>setCategory(e.target.value as ExpenseCategory)}>{categories.map(c=><option key={c}>{c}</option>)}</Select></label>
      <label className="text-sm font-medium">Paid by<Select value={paidBy} onChange={e=>setPaidBy(e.target.value)}><option value={FUND_ID}>Trip Fund</option>{participants.map((p:any)=><option key={p.id} value={p.id}>{p.name}</option>)}</Select></label>
      <label className="text-sm font-medium">Date<Input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label>
      <label className="text-sm font-medium">Split method<Select value={method} onChange={e=>setMethod(e.target.value as SplitMethod)}><option value="equal">Equal</option><option value="amount">Exact amounts</option><option value="percentage">Percentage</option><option value="weight">Weights</option></Select></label>
    </div>

    <div className="rounded-2xl bg-slate-50 p-3 dark:bg-slate-950">
      <div className="mb-2 flex items-center justify-between"><p className="text-sm font-bold">Who consumed this?</p><p className="text-xs text-slate-500">{method === "amount" ? `Total ₹${Number(amount||0).toFixed(2)}` : method === "percentage" ? "Total 100%" : method === "weight" ? "Weights can be 1, 2, 3…" : "Equal shares"}</p></div>
      <div className="space-y-2">
        {participants.map((p:any) => <label key={p.id} className="flex items-center gap-3 rounded-xl bg-white p-2.5 dark:bg-slate-900">
          <input type="checkbox" checked={Number(alloc[p.id] ?? 0) > 0} onChange={e=>setAlloc(a=>({...a,[p.id]:e.target.checked ? (method==="percentage"?100/participants.length:method==="weight"?1:1):0}))}/>
          <span className="flex-1 text-sm">{p.name}</span>
          {method !== "equal" && <Input className="w-28" type="number" min="0" step="0.01" value={alloc[p.id] ?? 0} onChange={e=>setAlloc(a=>({...a,[p.id]:Number(e.target.value)}))}/>}
        </label>)}
      </div>
      {error && <p className="mt-2 text-xs font-semibold text-red-600">{error}</p>}
    </div>
    <label className="text-sm font-medium">Notes<textarea value={notes} onChange={e=>setNotes(e.target.value)} className="mt-1 min-h-20 w-full rounded-xl border border-slate-200 bg-white p-3 text-sm dark:border-slate-700 dark:bg-slate-950" placeholder="Optional details"/></label>
    <div className="flex justify-end gap-2"><Button variant="secondary" onClick={onCancel}>Cancel</Button><Button type="submit">Save expense</Button></div>
  </form>;
}
