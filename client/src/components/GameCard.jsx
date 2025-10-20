import { Calendar, User, Users } from "lucide-react";
import { Link } from "react-router-dom";

export default function GameCard({ event }) {
  const { field, city, organizer, date, playerList, maxPlayers, id } = event;

  return (
    <Link to={`/game/${id}`} className="h-full">
      <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 flex flex-col transition-transform transform hover:scale-105 h-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold ">{field}</h3>
          <div className="flex items-center text-sm text-muted-foreground">
            <p>{city}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span>
              Organized by <span className="font-semibold">{organizer}</span>
            </span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span>{date}</span>
          </div>
          <div className="flex items-center">
            <Users className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
            <span>
              {playerList.length} / {maxPlayers} players
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}
