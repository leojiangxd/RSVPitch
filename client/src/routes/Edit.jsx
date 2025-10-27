import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Slider } from "@/components/ui/slider";
import axios from "axios";

export default function Edit() {
  const [showPassword, setShowPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [skillLevel, setSkillLevel] = useState(2);
  const [position, setPosition] = useState([]);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { data: user } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/user`, {
          withCredentials: true,
        });
        setName(user.name || "");
        setEmail(user.email || "");
        setSkillLevel(user.skillLevel || 2);
        setPosition(user.position || []);
      } catch (err) {
        console.error("Failed to fetch user data:", err);
        navigate("/login");
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccess("");

    const payload = { name, email, skillLevel, position };

    if (oldPassword && newPassword) {
      payload.oldPassword = oldPassword;
      payload.newPassword = newPassword;
    }

    try {
      const response = await axios.put(`${import.meta.env.VITE_API_BASE_URL}/user/update`, payload, {
        withCredentials: true,
      });

      localStorage.setItem("user", JSON.stringify(response.data));
      window.dispatchEvent(new Event("storage"));

      setSuccess("Profile updated successfully!");
    } catch (err) {
      setError(err.response?.data?.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

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
            <form className="flex flex-col gap-4" onSubmit={handleUpdate}>
              <div className="flex flex-col gap-1">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="email@domain.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="old-password">Old Password</Label>
                <div className="relative">
                  <Input
                    id="old-password"
                    type={showOldPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-primary"
                    aria-label={showOldPassword ? "Hide password" : "Show password"}
                  >
                    {showOldPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label htmlFor="new-password">New Password</Label>
                <div className="relative">
                  <Input
                    id="new-password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Leave blank to keep current password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
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
                  <Slider
                    id="skill-level"
                    value={[skillLevel]}
                    max={4}
                    step={1}
                    className="py-4"
                    onValueChange={(value) => setSkillLevel(value[0])}
                  />
                  <span className="select-none">Pro</span>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <Label>Position</Label>
                <ToggleGroup
                  variant="outline"
                  type="multiple"
                  className="w-full"
                  value={position}
                  onValueChange={setPosition}
                >
                  <ToggleGroupItem value="goalie" aria-label="Toggle Goalie">
                    Goalie
                  </ToggleGroupItem>
                  <ToggleGroupItem value="outfielder" aria-label="Toggle Outfielder">
                    Outfielder
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {error && <p className="text-sm text-red-500 text-center">{error}</p>}
              {success && <p className="text-sm text-green-500 text-center">{success}</p>}

              <Button type="submit" className="w-full" disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
