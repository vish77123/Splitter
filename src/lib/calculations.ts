import { Allocation, Expense, ParticipantBalance, Settlement, Trip } from "../types";

export const FUND_ID = "__fund__";
export const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

export function allocationAmounts(expense: Expense): Allocation[] {
  const active = expense.allocations.filter(a => a.value > 0);
  if (!active.length) return [];

  switch (expense.splitMethod) {
    case "equal": {
      const each = expense.amount / active.length;
      return active.map(a => ({ ...a, value: each }));
    }
    case "amount":
      return active.map(a => ({ ...a, value: a.value }));
    case "percentage":
      return active.map(a => ({ ...a, value: expense.amount * a.value / 100 }));
    case "weight": {
      const totalWeight = active.reduce((s, a) => s + a.value, 0);
      return totalWeight === 0 ? [] : active.map(a => ({ ...a, value: expense.amount * a.value / totalWeight }));
    }
  }
}

export function validateAllocation(expense: Expense): string | null {
  const active = expense.allocations.filter(a => a.value > 0);
  if (!active.length) return "Select at least one participant.";

  if (expense.splitMethod === "amount") {
    const total = active.reduce((s, a) => s + a.value, 0);
    return Math.abs(total - expense.amount) < 0.01
      ? null
      : `Allocation must equal ${expense.amount.toFixed(2)}. Current: ${total.toFixed(2)}.`;
  }
  if (expense.splitMethod === "percentage") {
    const total = active.reduce((s, a) => s + a.value, 0);
    return Math.abs(total - 100) < 0.01 ? null : `Percentages must total 100%. Current: ${total.toFixed(2)}%.`;
  }
  if (expense.splitMethod === "weight") {
    const total = active.reduce((s, a) => s + a.value, 0);
    return total <= 0 ? "Total weight must be greater than zero." : null;
  }
  return null;
}

export function participantBalances(trip: Trip): ParticipantBalance[] {
  const map = new Map<string, ParticipantBalance>();
  for (const p of trip.participants) {
    map.set(p.id, { participantId: p.id, paidDirect: 0, paidFund: 0, share: 0, contribution: 0, net: 0 });
  }

  for (const c of trip.contributions) {
    const b = map.get(c.participantId);
    if (b) b.contribution += c.amount;
  }

  for (const e of trip.expenses) {
    const paid = allocationAmounts(e);
    for (const a of paid) {
      const b = map.get(a.participantId);
      if (b) b.share += a.value;
    }
    if (e.paidBy !== FUND_ID) {
      const b = map.get(e.paidBy);
      if (b) b.paidDirect += e.amount;
    } else {
      for (const b of map.values()) b.paidFund += 0;
    }
  }

  // Contributions enter the trip wallet and therefore are not personal "payments"
  // toward another participant. Fund-paid expenses are removed from the wallet,
  // while direct-paid expenses are credited to the payer.
  for (const b of map.values()) {
    b.net = round2(b.paidDirect + b.contribution - b.share);
  }
  return [...map.values()];
}

export function fundBalance(trip: Trip): number {
  const contributions = trip.contributions.reduce((s, c) => s + c.amount, 0);
  const fundExpenses = trip.expenses
    .filter(e => e.paidBy === FUND_ID)
    .reduce((s, e) => s + e.amount, 0);
  return round2(contributions - fundExpenses);
}

/**
 * Greedy debt settlement. Positive net = receives money; negative net = pays.
 * Each iteration settles the largest debtor against the largest creditor.
 * This minimizes transaction count for the resulting net positions in the common case.
 */
export function optimizedSettlements(trip: Trip): Settlement[] {
  const balances = participantBalances(trip)
    .map(b => ({ id: b.participantId, net: round2(b.net) }))
    .filter(b => Math.abs(b.net) >= 0.01);

  const creditors = balances.filter(b => b.net > 0).sort((a, b) => b.net - a.net);
  const debtors = balances.filter(b => b.net < 0).sort((a, b) => a.net - b.net);
  const result: Settlement[] = [];
  let i = 0, j = 0;

  while (i < debtors.length && j < creditors.length) {
    const amount = round2(Math.min(-debtors[i].net, creditors[j].net));
    if (amount > 0) result.push({ from: debtors[i].id, to: creditors[j].id, amount });
    debtors[i].net = round2(debtors[i].net + amount);
    creditors[j].net = round2(creditors[j].net - amount);
    if (Math.abs(debtors[i].net) < 0.01) i++;
    if (Math.abs(creditors[j].net) < 0.01) j++;
  }
  return result;
}
