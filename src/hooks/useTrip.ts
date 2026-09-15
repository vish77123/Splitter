import { useMemo } from "react";
import { useTripStore } from "../store";

export function useTrip() {
  const { trips, activeTripId } = useTripStore();
  return useMemo(() => trips.find(t => t.id === activeTripId) ?? null, [trips, activeTripId]);
}
