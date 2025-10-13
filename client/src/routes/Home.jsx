import React from "react";
import Navbar from "../components/Navbar";
import Searchbar from "@/components/Searchbar";

const Home = () => {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center">
        <Searchbar />
      </div>
    </div>
  );
};

export default Home;
