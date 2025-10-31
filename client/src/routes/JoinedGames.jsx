import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import GameCard from "@/components/GameCard";

export default function JoinedGames() {
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  const fetchJoinedGames = async () => {
    try {
      setError(null);
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL}/matches/my`,
        { withCredentials: true }
      );
      setGames(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load your games.");
      setGames([]);
    }
  };

  useEffect(() => {
    fetchJoinedGames();
  }, []);

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="pt-4 text-center text-lg font-bold">
          My Games
        </div>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto p-4">
          {error ? (
            <div className="text-center p-10 text-destructive">{error}</div>
          ) : games.length === 0 ? (
            <div className="text-center p-10">
              You haven’t joined or created any games yet.
            </div>
          ) : (
            games.map((game) => <GameCard key={game._id} event={game} />)
          )}
        </div>
      </div>
    </div>
  );
}
