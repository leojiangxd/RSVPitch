import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function CreateGame() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [field, setField] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [maxPlayers, setMaxPlayers] = useState(4);
  const [cleatsAllowed, setCleatsAllowed] = useState(false);
  const [tacklesAllowed, setTacklesAllowed] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      navigate("/login");
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/match/create`,
        { city, field, date, time, maxPlayers, cleatsAllowed, tacklesAllowed },
        { withCredentials: true }
      );
      navigate(`/game/${response.data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while creating the game.");
    }
  };

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md m-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Create a new game</CardTitle>
            <CardDescription className="text-center">
              Fill out the details to schedule your game
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
              <div className="flex flex-col gap-1">
                {" "}
                <Label htmlFor="city">City</Label>{" "}
                <Input
                  id="city"
                  type="text"
                  placeholder="e.g., Gainesville"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />{" "}
              </div>{" "}
              <div className="flex flex-col gap-1">
                {" "}
                <Label htmlFor="field">Field</Label>{" "}
                <Input
                  id="field"
                  type="text"
                  placeholder="e.g., Flavet Field"
                  value={field}
                  onChange={(e) => setField(e.target.value)}
                  required
                />{" "}
              </div>{" "}
              <div className="grid grid-cols-2 gap-2">
                {" "}
                <div className="flex flex-col gap-1">
                  {" "}
                  <Label htmlFor="date">Date</Label>{" "}
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                  />{" "}
                </div>{" "}
                <div className="flex flex-col gap-1">
                  {" "}
                  <Label htmlFor="time">Time</Label>{" "}
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    required
                  />{" "}
                </div>{" "}
              </div>{" "}
              <div className="flex flex-col gap-1">
                {" "}
                <Label htmlFor="maxPlayers">Max Players</Label>{" "}
                <Input
                  id="maxPlayers"
                  type="number"
                  value={maxPlayers}
                  onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10))}
                  min="4"
                  required
                />{" "}
              </div>
              <div className="flex flex-col gap-1">
                <Label>Cleats</Label>
                <ToggleGroup
                  variant="outline"
                  type="single"
                  className="w-full"
                  value={cleatsAllowed ? "yes" : "no"} // controlled value
                  onValueChange={(value) => setCleatsAllowed(value === "yes")}
                >
                  <ToggleGroupItem value="yes" aria-label="Yes to cleats">
                    Yes
                  </ToggleGroupItem>
                  <ToggleGroupItem value="no" aria-label="No to cleats">
                    No
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              <div className="flex flex-col gap-1">
                <Label>Tackles</Label>
                <ToggleGroup
                  variant="outline"
                  type="single"
                  className="w-full"
                  value={tacklesAllowed ? "yes" : "no"} // controlled value
                  onValueChange={(value) => setTacklesAllowed(value === "yes")}
                >
                  <ToggleGroupItem value="yes" aria-label="Yes to tackle">
                    Yes
                  </ToggleGroupItem>
                  <ToggleGroupItem value="no" aria-label="No to tackle">
                    No
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>
              {error && <p className="text-sm text-destructive text-center">{error}</p>}
              <Button type="submit" className="w-full">
                Create Game
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
