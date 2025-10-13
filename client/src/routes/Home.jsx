import React from "react";
import Navbar from "../components/Navbar";
import Searchbar from "@/components/Searchbar";

const Home = () => {
  return (
    <div className="w-screen h-screen flex flex-col">
      <Navbar />
      <div className="bg-zinc-800 flex-1 flex flex-col justify-center gap-1">
        <div className="text-6xl font-mono font-bold flex justify-center ">RSVPitch</div>
        <Searchbar />
      </div>
    </div>
  );
};

export default Home;
