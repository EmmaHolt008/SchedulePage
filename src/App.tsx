// import { useEvents } from "./hooks/useEvents";

// export default function App() {
//   const { events, isLoading, error } = useEvents();

//   if (isLoading) return <p>Loading...</p>;
//   if (error) return <p>Something went wrong: {error}</p>;

//   return (

import "./styles/theme.css";
import { OceanBackground } from "./components/OceanBackground";
import { SchedulePage } from "./components/SchedulePage";

export default function App() {
  return (
    <>
      <OceanBackground />
      <SchedulePage />
    </>
  );
}

