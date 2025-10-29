import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Footprints, Shield, User, Users } from "lucide-react";

export default function Game() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFormingTeams, setIsFormingTeams] = useState(false);
  const [isDeletingMatch, setIsDeletingMatch] = useState(false);

  const fetchGame = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/match/${id}`, {
        withCredentials: true,
      });
      setGame(response.data);
    } catch (err) {
      setError("Failed to fetch game details.");
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user`, {
          withCredentials: true,
        });
        setUser(data);
      } catch (error) {
        navigate("/login");
      }
    };
    fetchUser();

    if (id) {
      fetchGame();
    }
  }, [id, navigate]);

  const handleJoin = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/match/${id}/join`,
        {},
        { withCredentials: true }
      );
      await fetchGame();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to join game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLeave = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/match/${id}/leave`,
        {},
        { withCredentials: true }
      );
      await fetchGame();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to leave game.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormTeams = async () => {
    setError(null);
    setIsFormingTeams(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/match/${id}/form-teams`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      setError(err.response?.data?.message || "Failed to form teams.");
    } finally {
      await fetchGame();
      setIsFormingTeams(false);
    }
  };

  const handleDeleteMatch = async () => {
    setError(null);
    if (!window.confirm("Are you sure you want to delete this match? This cannot be undone.")) {
      return;
    }
    setIsDeletingMatch(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/match/delete?id=${id}`, {
        withCredentials: true,
      });
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete match.");
    } finally {
      setIsDeletingMatch(false);
    }
  };

  if (!game) {
    return (
      <div className="min-h-screen bg-muted flex flex-col">
        <Navbar />
        <div className="flex-1 text-center p-10">
          <h1 className="text-2xl">Game not found</h1>
          {error && <p className="text-destructive mt-2">{error}</p>}
        </div>
      </div>
    );
  }

  const userId = user?._id;
  const isOrganizer = game.organizer?._id === userId;
  const isPlayer = game.players.some((p) => p._id === userId);
  const isFull = game.players.length >= game.maxPlayers && !isPlayer;

  const getBadgeColor = (position) => {
    switch (position) {
      case "goalie":
        return "bg-yellow-600";
      case "outfielder":
        return "bg-green-400";
      default:
        return "bg-gray-500";
    }
  };

  const getSkillLevelName = (level) => {
    const skillLevels = ["New", "Novice", "Intermediate", "Advanced", "Pro"];
    return skillLevels[level] || "Unknown";
  };

  const renderTeam = (team, teamName) => (
    <div className="md:col-span-2">
      <h2 className="text-2xl font-semibold border-b pb-2">{teamName}</h2>
      <div className="space-y-2 mt-4">
        {team.map((player) => (
          <div
            key={player._id}
            className="bg-zinc-800 p-3 text-sm font-medium flex justify-between items-center"
          >
            <div className="space-x-4">
              <span>{player.name}</span>
              <span className="text-xs font-bold text-muted-foreground">
                {getSkillLevelName(player.skillLevel).toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex gap-2">
                {player.position.map((pos) => (
                  <Badge key={pos} className={`${getBadgeColor(pos)} font-bold`}>
                    {pos.toUpperCase()}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderButton = () => {
    if (isOrganizer) {
      return (
        <div className="flex gap-2 w-full max-w-sm">
          <Button
            size="lg"
            className="flex-1 cursor-pointer"
            onClick={handleFormTeams}
            disabled={isFormingTeams || isDeletingMatch}
          >
            {isFormingTeams ? "Forming Teams..." : "Form Teams"}
          </Button>
          <Button
            size="lg"
            variant="destructive"
            onClick={handleDeleteMatch}
            className="cursor-pointer"
            disabled={isFormingTeams || isDeletingMatch}
          >
            {isDeletingMatch ? "Deleting..." : "Delete Match"}
          </Button>
        </div>
      );
    }
    if (isPlayer) {
      return (
        <Button
          size="lg"
          variant="destructive"
          className="w-full max-w-sm cursor-pointer"
          onClick={handleLeave}
          disabled={isSubmitting}
        >
          {isSubmitting ? "Leaving..." : "Leave Game"}
        </Button>
      );
    }
    return (
      <Button
        size="lg"
        className="w-full max-w-sm cursor-pointer disabled:cursor-not-allowed"
        disabled={isFull || isSubmitting}
        onClick={handleJoin}
      >
        {isSubmitting ? "Joining..." : isFull ? "Game Full" : "Join Game"}
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex-1 w-full max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-4xl font-bold">{game.fieldName}</h1>
          <div className="flex items-center text-lg text-muted-foreground">{game.cityName}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md-col-span-1 space-y-4">
            <h2 className="text-2xl font-semibold border-b pb-2">Details</h2>
            <div className="flex items-center">
              <User className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>
                Organized by{" "}
                <span className="font-semibold">{game.organizer?.name || "Unknown"}</span>
              </span>
            </div>
            <div className="flex items-center">
              <Calendar className="h-5 w-5 mr-3 text-muted-foreground" />
              <div className="flex flex-col">
                <div>
                  {new Date(game.startDateTime).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
                <div className="font-bold">
                  {new Date(game.startDateTime).toLocaleTimeString("en-US", {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>{`${game.players.length} / ${game.maxPlayers} players`}</span>
            </div>
            <div className="flex items-center">
              <Footprints className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>
                Cleats:{" "}
                <span
                  className={
                    game.cleatsAllowed ? "text-green-400 semi-bold" : "text-red-400 semi-bold"
                  }
                >
                  {game.cleatsAllowed ? "Allowed" : "Not Allowed"}
                </span>
              </span>
            </div>
            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>
                Tackles:
                <span
                  className={
                    game.tacklesAllowed ? "text-green-400 semi-bold" : "text-red-400 semi-bold"
                  }
                >
                  {game.tacklesAllowed ? " Allowed" : " Not Allowed"}
                </span>
              </span>
            </div>
          </div>

          <div className="md:col-span-3">
            <h2 className="text-2xl font-semibold border-b pb-2">
              Players Joined ({game.players.length})
            </h2>
            <div className="space-y-2 mt-4">
              {game.players.map((player) => (
                <div
                  key={player._id}
                  className="bg-zinc-800 p-3 text-sm font-medium flex justify-between items-center"
                >
                  <div className="space-x-4">
                    <span>{player.name}</span>
                    <span className="text-xs font-bold text-muted-foreground">
                      {getSkillLevelName(player.skillLevel).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex gap-2">
                      {player.position.map((pos) => (
                        <Badge key={pos} className={`${getBadgeColor(pos)} font-bold`}>
                          {pos.toUpperCase()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {game.team1 && game.team1.length > 0 && renderTeam(game.team1, "Team 1")}
          {game.team2 && game.team2.length > 0 && renderTeam(game.team2, "Team 2")}
        </div>
      </div>

      <div className="sticky bottom-0 w-full bg-background border-t p-4 flex flex-col items-center">
        {error && <p className="text-destructive text-center mb-4">{error}</p>}
        {renderButton()}
      </div>
    </div>
  );
}
