import { Trip } from "../types";

const KEY = "trip-splitter:v1";

export function loadTrips(): Trip[] {
  try { return JSON.parse(localStorage.getItem(KEY) || "[]"); }
  catch { return []; }
}

export function saveTrips(trips: Trip[]) {
  localStorage.setItem(KEY, JSON.stringify(trips));
}

export function exportTrip(trip: Trip): string {
  return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), trip }, null, 2);
}

export function importTrip(json: string): Trip {
  const parsed = JSON.parse(json);
  if (!parsed.trip?.id || !Array.isArray(parsed.trip.participants)) throw new Error("Invalid Trip Splitter backup.");
  return parsed.trip as Trip;
}
