import React from "react";
import Navbar from "../components/Navbar";
import Searchbar from "@/components/Searchbar";
import homeBg from "../assets/home.jpg";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Search, CalendarPlus, Users, Swords } from "lucide-react";

const Home = () => {
  return (
    <div
      className="relative w-[100vw] h-[100vh] bg-zinc-800 flex flex-col bg-cover bg-center"
      style={{
        backgroundImage: `url(${homeBg})`,
      }}
    >
      <Navbar />
      <div className="bg-black/60 flex-1 flex flex-col justify-center items-center p-4">
        <div className="w-full max-w-4xl space-y-4">
          <div className="text-6xl font-mono font-bold text-center">RSVPitch</div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="size-5" /> Find a Game
                </CardTitle>
                <CardDescription>
                  Search for pickup soccer games in your city and join one that fits your schedule.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CalendarPlus className="size-5" /> Create a Game
                </CardTitle>
                <CardDescription>
                  Organize your own matches. Set the location, time, player limit, and rules.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="size-5" /> Join and Play
                </CardTitle>
                <CardDescription>
                  RSVP to games, see who's playing, and get ready for match day.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Swords className="size-5" /> Balanced Teams
                </CardTitle>
                <CardDescription>
                  Automatically form balanced teams based on player skill and positions.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
