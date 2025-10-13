import { useParams } from "react-router-dom";
import Navbar from "../components/Navbar";

function Search() {
  const { id } = useParams();

  return (
    <>
      <Navbar />
      <div>Search Param: {id}</div>
    </>
  );
}

export default Search;
