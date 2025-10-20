import React, { useState } from "react";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { Link } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";

export default function Edit() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md m-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Edit your profile</CardTitle>
            <CardDescription className="text-center">
              Update your account information below
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Name</Label>
                <Input id="name" type="text" placeholder="Your name" />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="email@domain.com" />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Create a strong password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((visible) => !visible)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="skill-level">Skill Level</Label>
                <div className="text-xs flex gap-1 items-center border border-input rounded-md px-3">
                  <span className="select-none">New</span>
                  <Slider id="skill-level" defaultValue={[2]} max={4} step={1} className="py-4" />
                  <span className="select-none">Pro</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Position</Label>
                <ToggleGroup variant="outline" type="multiple" className="w-full ">
                  <ToggleGroupItem value="goalie" aria-label="Toggle Goalie">
                    Goalie
                  </ToggleGroupItem>
                  <ToggleGroupItem value="Outfielder" aria-label="Toggle Outfielder">
                    Outfielder
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Button type="submit" className="w-full">
                Save
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
