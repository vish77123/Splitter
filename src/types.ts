export type SplitMethod = "equal" | "amount" | "percentage" | "weight";
export type ExpenseCategory =
  | "Food" | "Travel" | "Stay" | "Activities" | "Fuel" | "Shopping" | "Miscellaneous";

export interface Participant {
  id: string;
  name: string;
  email?: string;
}

export interface Allocation {
  participantId: string;
  value: number; // amount, percentage, or weight depending on method
}

export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: ExpenseCategory;
  paidBy: string; // participant id, or "__fund__"
  notes?: string;
  date: string;
  splitMethod: SplitMethod;
  allocations: Allocation[];
}

export interface FundContribution {
  id: string;
  participantId: string;
  amount: number;
  date: string;
  note?: string;
}

export interface Trip {
  id: string;
  name: string;
  destination: string;
  participants: Participant[];
  expenses: Expense[];
  contributions: FundContribution[];
  createdAt: string;
  updatedAt: string;
}

export interface Settlement {
  from: string;
  to: string;
  amount: number;
}

export interface ParticipantBalance {
  participantId: string;
  paidDirect: number;
  paidFund: number;
  share: number;
  contribution: number;
  net: number;
}
