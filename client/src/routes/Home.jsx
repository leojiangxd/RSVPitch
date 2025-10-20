import React from "react";
import Navbar from "../components/Navbar";
import Searchbar from "@/components/Searchbar";
import homeBg from "../assets/home.jpg";

const Home = () => {
  return (
    <div
      className="relative w-[100vw] h-[100vh] bg-zinc-800 flex flex-col bg-cover bg-center"
      style={{
        backgroundImage: `url(${homeBg})`,
      }}
    >
      <Navbar />
      <div className="bg-black/60 flex-1 flex flex-col justify-center gap-1">
        <div className="text-6xl font-mono font-bold flex justify-center">RSVPitch</div>
        <Searchbar widthStyle="max-w-[50%]" />
      </div>
    </div>
  );
};

export default Home;
