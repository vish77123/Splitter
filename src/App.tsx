import { useTripStore } from "./store";
import { CreateTrip } from "./components/CreateTrip";
import { TripShell } from "./components/TripShell";

export default function App(){
  const {trips,dark}=useTripStore();
  return <div className={dark?"dark":""}>{trips.length?<TripShell/>:<CreateTrip/>}</div>;
}
