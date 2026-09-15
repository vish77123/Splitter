import { create } from "zustand";
import { Trip, Expense, FundContribution, Participant } from "./types";
import { loadTrips, saveTrips } from "./lib/storage";

type Store = {
  trips: Trip[];
  activeTripId: string | null;
  dark: boolean;
  setActiveTrip: (id: string | null) => void;
  toggleDark: () => void;
  createTrip: (name: string, destination: string, participants: Participant[]) => string;
  updateTrip: (patch: Partial<Trip>) => void;
  addExpense: (expense: Expense) => void;
  updateExpense: (expense: Expense) => void;
  removeExpense: (id: string) => void;
  addContribution: (c: FundContribution) => void;
  removeContribution: (id: string) => void;
  replaceTrip: (trip: Trip) => void;
};

const initial = loadTrips();

export const useTripStore = create<Store>((set, get) => ({
  trips: initial,
  activeTripId: initial[0]?.id ?? null,
  dark: localStorage.getItem("trip-splitter:dark") === "1",

  setActiveTrip: activeTripId => set({ activeTripId }),
  toggleDark: () => set(s => {
    const dark = !s.dark;
    localStorage.setItem("trip-splitter:dark", dark ? "1" : "0");
    return { dark };
  }),

  createTrip: (name, destination, participants) => {
    const now = new Date().toISOString();
    const trip: Trip = {
      id: crypto.randomUUID(), name, destination, participants,
      expenses: [], contributions: [], createdAt: now, updatedAt: now
    };
    const trips = [...get().trips, trip];
    saveTrips(trips);
    set({ trips, activeTripId: trip.id });
    return trip.id;
  },

  updateTrip: patch => set(s => {
    if (!s.activeTripId) return s;
    const trips = s.trips.map(t => t.id === s.activeTripId ? { ...t, ...patch, updatedAt: new Date().toISOString() } : t);
    saveTrips(trips);
    return { trips };
  }),

  addExpense: expense => set(s => {
    const trips = s.trips.map(t => t.id === s.activeTripId ? { ...t, expenses: [...t.expenses, expense], updatedAt: new Date().toISOString() } : t);
    saveTrips(trips); return { trips };
  }),
  updateExpense: expense => set(s => {
    const trips = s.trips.map(t => t.id === s.activeTripId ? { ...t, expenses: t.expenses.map(e => e.id === expense.id ? expense : e), updatedAt: new Date().toISOString() } : t);
    saveTrips(trips); return { trips };
  }),
  removeExpense: id => set(s => {
    const trips = s.trips.map(t => t.id === s.activeTripId ? { ...t, expenses: t.expenses.filter(e => e.id !== id), updatedAt: new Date().toISOString() } : t);
    saveTrips(trips); return { trips };
  }),
  addContribution: c => set(s => {
    const trips = s.trips.map(t => t.id === s.activeTripId ? { ...t, contributions: [...t.contributions, c], updatedAt: new Date().toISOString() } : t);
    saveTrips(trips); return { trips };
  }),
  removeContribution: id => set(s => {
    const trips = s.trips.map(t => t.id === s.activeTripId ? { ...t, contributions: t.contributions.filter(c => c.id !== id), updatedAt: new Date().toISOString() } : t);
    saveTrips(trips); return { trips };
  }),
  replaceTrip: trip => set(s => {
    const trips = s.trips.some(t => t.id === trip.id) ? s.trips.map(t => t.id === trip.id ? trip : t) : [...s.trips, trip];
    saveTrips(trips); return { trips, activeTripId: trip.id };
  })
}));
