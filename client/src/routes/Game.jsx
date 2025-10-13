import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function Game() {
  const { id } = useParams();

  return (
    <>
      <Navbar />
      <div>Game ID: {id}</div>
    </>
  );
}

export default Game;
