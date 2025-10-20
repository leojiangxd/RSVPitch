import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import GameCard from "@/components/GameCard";

function Search() {
  const { id } = useParams();

  const dummyEvents = [
    {
      id: 123,
      field: "Flavet Field",
      city: "Gainesville",
      organizer: "asdf",
      date: "October 28, 2025 - 6:00 PM",
      playerList: Array.from({ length: 10 }),
      maxPlayers: 12,
    },
    {
      id: 789,
      field: "Flavet Field",
      city: "Gainesville",
      organizer: "asdf",
      date: "November 1, 2025 - 11:00 AM",
      playerList: Array.from({ length: 7 }),
      maxPlayers: 10,
    },
  ];

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="pt-4 text-center text-lg text-muted-foreground">
          Games in <span className="text-primary font-bold">{id}</span>
        </div>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto p-4">
          {dummyEvents.map((event) => (
            <GameCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Search;
