import React from "react";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export default function CreateGame() {
  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md m-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Create a new game</CardTitle>
            <CardDescription className="text-center">
              Fill out the details to schedule your match
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-1">
                <Label htmlFor="city">City</Label>
                <Input id="city" type="text" placeholder="City Name" />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="field">Field</Label>
                <Input id="field" type="text" placeholder="Field Name" />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="flex flex-col gap-1">
                  <Label htmlFor="date">Date</Label>
                  <Input id="date" type="date" />
                </div>
                <div className="flex flex-col gap-1">
                  <Label htmlFor="time">Time</Label>
                  <Input id="time" type="time" />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="maxPlayers">Max Players</Label>
                <Input id="maxPlayers" type="number" defaultValue="4" min="4" />
              </div>

              <div className="flex flex-col gap-1">
                <Label>Cleats</Label>
                <ToggleGroup variant="outline" type="single" className="w-full ">
                  <ToggleGroupItem value="yes" aria-label="Yes to cleats">
                    Yes
                  </ToggleGroupItem>
                  <ToggleGroupItem value="no" aria-label="No to cleats">
                    No
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Tackle</Label>
                <ToggleGroup variant="outline" type="single" className="w-full ">
                  <ToggleGroupItem value="yes" aria-label="Yes to tackle">
                    Yes
                  </ToggleGroupItem>
                  <ToggleGroupItem value="no" aria-label="No to tackle">
                    No
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

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
