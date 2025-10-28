import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import GameCard from "@/components/GameCard";

function Search() {
  const { id } = useParams();
  const [games, setGames] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setError(null);
        const response = await axios.get(
          `${import.meta.env.VITE_API_BASE_URL}/matches/search?city=${id}`,
          { withCredentials: true }
        );
        setGames(response.data);
      } catch (err) {
        setError("Failed to fetch games. Please try again later.");
        console.error(err);
      }
    };

    fetchGames();
  }, [id]);

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex-1">
        <div className="pt-4 text-center text-lg text-muted-foreground">
          Showing games in <span className="text-primary font-bold">{id}</span>
        </div>
        <div className="flex flex-col gap-4 max-w-3xl mx-auto p-4">
          {error ? (
            <div className="text-center p-10 text-destructive">{error}</div>
          ) : games.length === 0 ? (
            <div className="text-center p-10">No games found in {id}.</div>
          ) : (
            games.map((game) => <GameCard key={game._id} event={game} />)
          )}
        </div>
      </div>
    </div>
  );
}

export default Search;
