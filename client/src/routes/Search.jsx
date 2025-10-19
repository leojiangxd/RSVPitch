import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameCard from "@/components/GameCard";

function Search() {
  const { id } = useParams();

  const dummyEvents = [
    {
      field: "Central Park Fields",
      city: "New York",
      organizer: "NYC Soccer League",
      date: "October 26, 2025 - 10:00 AM",
      players: 14,
      maxPlayers: 16,
      id: 123,
    },
    {
      field: "Central Park Fields",
      city: "New York",
      organizer: "NYC Soccer League",
      date: "October 26, 2025 - 10:00 AM",
      players: 14,
      maxPlayers: 16,
      id: 1234,
    },
    {
      field: "Central Park Fields",
      city: "New York",
      organizer: "NYC Soccer League",
      date: "October 26, 2025 - 10:00 AM",
      players: 14,
      maxPlayers: 16,
      id: 12345,
    },
  ];

  return (
    <div className="w-[100wh] h-[100vh] flex flex-col">
      <Navbar />
      <div className="bg-zinc-800 flex-1">
        <div className="p-2 text-center text-lg text-muted-foreground">
          Matches in <span className="text-primary font-bold">{id}</span>
        </div>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto px-4">
          {dummyEvents.map((event) => (
            <GameCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;
