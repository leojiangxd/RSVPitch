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

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="min-h-screen bg-muted flex flex-col">
      <Navbar />
      <div className="flex flex-1 items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-2xl">Create an account</CardTitle>
            <CardDescription className="text-center">
              Enter your details below to create your account
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form className="flex flex-col gap-2" onSubmit={(e) => e.preventDefault()}>
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
                <div className="text-xs flex gap-1 items-center">
                  New
                  <Slider id="skill-level" defaultValue={[3]} max={4} step={1} className="py-4" />
                  Pro
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Position</Label>
                <ToggleGroup type="single" className="w-full border border-input">
                  <ToggleGroupItem value="goalie" aria-label="Toggle Goalie">
                    Goalie
                  </ToggleGroupItem>
                  <ToggleGroupItem value="Outfielder" aria-label="Toggle Outfielder">
                    Outfielder
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              <Button type="submit" className="w-full">
                Create account
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
