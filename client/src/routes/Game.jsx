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

  // Live clock for the countdown display
  const [nowTs, setNowTs] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTs(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchGame = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/match/${id}`,
        { withCredentials: true }
      );
      setGame(response.data);
      setError(null);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to fetch game details.");
      setGame(null);
      console.error(err);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/user`,
          { withCredentials: true }
        );
        setUser(data);
      } catch (error) {
        navigate("/login");
      }
    };
    fetchUser();
    if (id) fetchGame();
  }, [id, navigate]);

  // Keep GK assignment fresh from the server (fast poll only when rotation is active)
  useEffect(() => {
    // only fast-poll if teams exist and any team is rotating
    const hasTeams =
      (Array.isArray(game?.team1) && game.team1.length > 0) ||
      (Array.isArray(game?.team2) && game.team2.length > 0);

    const rotationActive =
      Boolean(game?.gkRotation?.team1?.active) || Boolean(game?.gkRotation?.team2?.active);

    // 3s when rotating, otherwise 60s. (You can set this to 1000ms for near-instant updates.)
    const period = hasTeams && rotationActive ? 3000 : 60000;

    const interval = setInterval(fetchGame, period);
    return () => clearInterval(interval);
    // include deps that affect the decision
  }, [id, game?.team1?.length, game?.team2?.length, game?.gkRotation?.team1?.active, game?.gkRotation?.team2?.active]);


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
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/match/${id}/form-teams`,
        {},
        { withCredentials: true }
      );
      await fetchGame();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to form teams.");
    } finally {
      setIsFormingTeams(false);
    }
  };

  const handleDelete = async () => {
    setError(null);
    setIsDeletingMatch(true);
    try {
      await axios.delete(`${import.meta.env.VITE_API_BASE_URL}/match/delete`, {
        params: { id },
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
  const isPlayer =
    Array.isArray(game.players) &&
    game.players.some((p) => (p?._id || p) === userId);
  const isFull =
    Array.isArray(game.players) && game.maxPlayers
      ? game.players.length >= game.maxPlayers && !isPlayer
      : false;

  // Only render teams (and GK UI) after organizer has formed them
  const hasTeams =
    (Array.isArray(game.team1) && game.team1.length > 0) ||
    (Array.isArray(game.team2) && game.team2.length > 0);

  const getBadgeColor = (position) => {
    switch (String(position).toLowerCase()) {
      case "goalie":
      case "gk":
      case "goalkeeper":
      case "keeper":
        return "bg-yellow-600";
      case "outfielder":
        return "bg-blue-600";
      default:
        return "bg-zinc-700";
    }
  };

  const formatDate = (ts) =>
    ts
      ? new Date(ts).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      : "TBD";

  const formatTime = (ts) =>
    ts
      ? new Date(ts).toLocaleTimeString("en-US", {
          hour: "numeric",
          minute: "2-digit",
        })
      : "TBD";

  const renderTeam = (team, teamName, teamKey) => (
    <div>
      <h2 className="text-2xl font-semibold border-b pb-2">{teamName}</h2>

      {/* Countdown for rotating GK (only when active) */}
      {game?.gkRotation?.[teamKey]?.active && (
        <p className="text-xs text-muted-foreground mt-1">
          Next GK rotation in{" "}
          {(() => {
            const rot = game?.gkRotation?.[teamKey];
            if (!rot?.lastRotatedAt) return "15m 0s";
            const intervalMs = (rot.rotationIntervalMinutes || 15) * 60 * 1000;
            const nextTime = new Date(rot.lastRotatedAt).getTime() + intervalMs;
            const remaining = Math.max(0, nextTime - nowTs);
            const mins = Math.floor(remaining / 60000);
            const secs = Math.floor((remaining % 60000) / 1000);
            return `${mins}m ${secs}s`;
          })()}
        </p>
      )}

      <div className="space-y-2 mt-4">
        {Array.isArray(team) &&
          team.map((player) => {
            const positions = Array.isArray(player?.position)
              ? player.position
              : player?.position
              ? [player.position]
              : [];
            return (
              <div
                key={player?._id || String(player)}
                className="bg-zinc-800 p-3 text-sm font-medium flex justify-between items-center"
              >
                <div className="space-x-4">
                  <span>{player?.name || "Unknown Player"}</span>

                  {/* Highlight currently assigned rotating GK */}
                  {game?.gkRotation?.[teamKey]?.active &&
                    String(game?.gkRotation?.[teamKey]?.current) ===
                      String(player?._id) && (
                      <Badge className="bg-yellow-600 font-bold">
                        ASSIGNED GK
                      </Badge>
                    )}

                  <span className="text-xs font-bold text-muted-foreground">
                    {(player?.skillLevel ?? 0).toString().toUpperCase()}
                  </span>
                </div>

                <div className="flex items-center gap-4">
                  <div className="flex gap-2">
                    {positions.map((pos) => (
                      <Badge key={pos} className={`${getBadgeColor(pos)} font-bold`}>
                        {String(pos).toUpperCase()}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );

  const renderButton = () => {
    if (isOrganizer) {
      return (
        <div className="flex gap-4">
          <Button type="button" disabled={isFormingTeams} onClick={handleFormTeams}>
            {isFormingTeams ? "Forming..." : "Make Teams"}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isDeletingMatch}
            onClick={handleDelete}
          >
            {isDeletingMatch ? "Deleting..." : "Delete Match"}
          </Button>
        </div>
      );
    }
    if (!isPlayer && !isFull) {
      return (
        <Button type="button" disabled={isSubmitting} onClick={handleJoin}>
          {isSubmitting ? "Joining..." : "Join Game"}
        </Button>
      );
    }
    if (isPlayer) {
      return (
        <Button type="button" variant="secondary" disabled={isSubmitting} onClick={handleLeave}>
          {isSubmitting ? "Leaving..." : "Leave Game"}
        </Button>
      );
    }
    return (
      <Button type="button" variant="secondary" disabled>
        Game Full
      </Button>
    );
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-extrabold">{game.fieldName || "Unknown Field"}</h1>
          <div className="flex items-center text-lg text-muted-foreground">
            {game.cityName || "Unknown City"}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-4">
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
                <div>{formatDate(game.startDateTime)}</div>
                <div className="font-bold">{formatTime(game.startDateTime)}</div>
              </div>
            </div>

            <div className="flex items-center">
              <Users className="h-5 w-5 mr-3 text-muted-foreground" />
              <span className="font-semibold">
                {Array.isArray(game.players) ? game.players.length : 0} / {game.maxPlayers ?? "?"}
              </span>
            </div>

            <div className="flex items-center">
              <Footprints className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>{game.cleatsAllowed ? "Cleats allowed" : "Cleats not allowed"}</span>
            </div>

            <div className="flex items-center">
              <Shield className="h-5 w-5 mr-3 text-muted-foreground" />
              <span>{game.tacklesAllowed ? "Slide tackles allowed" : "Slide tackles not allowed"}</span>
            </div>
          </div>

          {/* Teams grid: only render after teams are formed */}
          {hasTeams ? (
              <div className="md:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-8">
              {renderTeam(game.team1 || [], "Team 1", "team1")}
              {renderTeam(game.team2 || [], "Team 2", "team2")}
            </div>
          ) : (
            // ✅ BEFORE teams are formed: show the "Players Joined" list
            <div className="md:col-span-3">
              <h2 className="text-2xl font-semibold border-b pb-2">
                Players Joined ({Array.isArray(game.players) ? game.players.length : 0})
              </h2>
              <div className="space-y-2 mt-4">
                {Array.isArray(game.players) &&
                  game.players.map((player) => {
                    const positions = Array.isArray(player?.position)
                      ? player.position
                      : player?.position
                      ? [player.position]
                      : [];
                    return (
                      <div
                        key={player?._id || String(player)}
                        className="bg-zinc-800 p-3 text-sm font-medium flex justify-between items-center"
                      >
                        <div className="space-x-4">
                          <span>{player?.name || "Unknown Player"}</span>
                          <span className="text-xs font-bold text-muted-foreground">
                            {(player?.skillLevel ?? 0).toString().toUpperCase()}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex gap-2">
                            {positions.map((pos) => (
                              <Badge key={pos} className={`${getBadgeColor(pos)} font-bold`}>
                                {String(pos).toUpperCase()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="sticky bottom-0 w-full bg-background border-t p-4 flex flex-col items-center">
        {error && <p className="text-destructive text-center mb-4">{error}</p>}
        {renderButton()}
      </div>
    </div>
  );
}
