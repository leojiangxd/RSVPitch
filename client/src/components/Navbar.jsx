import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Searchbar from "./Searchbar";

export default function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const updateUser = () => {
      const storedUser = localStorage.getItem("user");
      setUser(storedUser ? JSON.parse(storedUser) : null);
    };

    updateUser();
    window.addEventListener("storage", updateUser);

    return () => {
      window.removeEventListener("storage", updateUser);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await axios.post(
        `${import.meta.env.VITE_API_BASE_URL}/user/logout`,
        {},
        { withCredentials: true }
      );
    } catch (error) {
      console.error("Logout failed", error);
    } finally {
      localStorage.removeItem("user");
      window.dispatchEvent(new Event("storage"));
      navigate("/");
    }
  };

  return (
    <div className="bg-zinc-900 w-full flex items-center p-2 justify-between lg:justify-normal sticky top-0 z-50">
      <div className="lg:flex-1 lg:flex">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/">
            <Home />
          </Link>
        </Button>
      </div>

      <div className="flex-1 max-w-3xl mx-5 lg:flex-none lg:w-full lg:mx-8">
        <Searchbar />
      </div>

      <div className="lg:flex-1 lg:flex lg:justify-end">
        {user ? (
          // LOGGED-IN
          <div className="flex items-center space-x-1">
            <Button type="create" aria-label="Create a game">
              <Link to="/creategame">Create a game</Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full cursor-pointer">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="min-w-50" align="end">
                <DropdownMenuLabel>
                  <div className="flex flex-col gap-1">
                    <p className="text-sm">{user.name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Link to="/edit">Edit Profile</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleLogout} variant="destructive">
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          // LOGGED OUT
          <div className="flex gap-1">
            <Button variant="outline">
              <Link to="/login">Login</Link>
            </Button>
            <Button>
              <Link to="/register">Register</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
