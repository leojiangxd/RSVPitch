import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function Search() {
  const { id } = useParams();

  return (
    <div className="w-[100wh] h-[100vh] flex flex-col">
      <Navbar />
      <div className="bg-zinc-800 flex-1">
        <div>Search Param: {id}</div>
      </div>
    </div>
  );
}

export default Search;
