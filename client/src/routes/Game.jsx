import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Footprints, Shield, User, Users } from "lucide-react";

const dummyGame = {
  id: 123,
  field: "Flavet Field",
  city: "Gainesville",
  organizer: "asdf",
  date: "October 26, 2025",
  time: "10:00 AM",
  maxPlayers: 16,
  cleats: true,
  tackles: false,
  playerList: [
    { name: "Player 1", level: 3, positions: ["Outfielder"] },
    { name: "Player 2", level: 5, positions: ["Outfielder"] },
    { name: "Player 3", level: 2, positions: ["Outfielder"] },
    { name: "Player 4", level: 4, positions: ["Goalie"] },
    { name: "Player 5", level: 3, positions: ["Outfielder"] },
    { name: "Player 6", level: 1, positions: ["Outfielder"] },
    { name: "Player 7", level: 5, positions: ["Outfielder"] },
    { name: "Player 8", level: 2, positions: ["Outfielder"] },
    { name: "Player 9", level: 3, positions: ["Outfielder"] },
    { name: "Player 10", level: 4, positions: ["Outfielder"] },
    { name: "Player 11", level: 4, positions: ["Outfielder"] },
    { name: "Player 12", level: 5, positions: ["Outfielder", "Goalie"] },
  ],
};

export default function Game() {
  const { id } = useParams();
  const game = dummyGame.id.toString() === id ? dummyGame : null;

  if (!game) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Navbar />
        <div className="flex-1 text-center p-10">
          <h1 className="text-2xl">Game not found</h1>
        </div>
      </div>
    );
  }

  const isFull = game.playerList.length >= game.maxPlayers;

  const getBadgeColor = (position) => {
    switch (position) {
      case "Goalie":
        return "bg-yellow-600";
      case "Outfielder":
        return "bg-green-400";
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold">{game.field}</h1>
          <div className="flex items-center text-lg text-muted-foreground">{game.city}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md-col-span-1 space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Details</h2>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>
                Organized by <span className="font-semibold">{game.organizer}</span>
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>{`${game.date} at ${game.time}`}</span>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>{`${game.playerList.length} / ${game.maxPlayers} players`}</span>
            </div>
            <div className="flex items-center">
              <Footprints className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>
                Cleats:{" "}
                <span className={game.cleats ? "text-green-400" : "text-red-400"}>
                  {game.cleats ? "Allowed" : "Not Allowed"}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>
                Tackles:{" "}
                <span className={game.tackles ? "text-green-400" : "text-red-400"}>
                  {game.tackles ? "Allowed" : "Not Allowed"}
                </span>
              </span>
            </div>
          </div>

          <div className="md:col-span-2">
            <h2 className="text-2xl font-semibold border-b pb-2">
              Players Joined ({game.playerList.length})
            </h2>
            <div className="space-y-2 mt-4">
              {game.playerList.map((player) => (
                <div
                  key={player.name}
                  className="bg-zinc-800 p-3 text-sm font-medium flex justify-between items-center"
                >
                  <div className="space-x-4">
                    <span>{player.name}</span>
                    <span className="text-xs font-semibold text-muted-foreground">
                      LVL {player.level}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {player.positions.map((pos) => (
                        <Badge key={pos} className={getBadgeColor(pos)}>
                          {pos}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 w-full bg-background border-t p-4 flex justify-center">
        <Button
          size="lg"
          className="w-full max-w-sm cursor-pointer disabled:cursor-not-allowed"
          disabled={isFull}
        >
          {isFull ? "Game Full" : "Join Game"}
        </Button>
      </div>
    </div>
  );
}
