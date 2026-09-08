// import { useEvents } from "./hooks/useEvents";

// export default function App() {
//   const { events, isLoading, error } = useEvents();

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Something went wrong: {error}</p>;

//   return (
//     <div>
//       <h1>Hello, ocean 🌊</h1>
//       <p>Loaded {events.length} events.</p>
//       <pre>{JSON.stringify(events[0], null, 2)}</pre>
//     </div>
//   );
// }
import { SchedulePage } from "./components/SchedulePage";

export default function App() {
  return <SchedulePage />;
}