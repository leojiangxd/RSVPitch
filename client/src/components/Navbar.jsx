import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
  const [isLoggedIn, setIsLoggedIn] = useState(true);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="bg-zinc-900 w-full flex items-center p-2 justify-between sticky top-0 z-50">
      {/* Home button */}
      <Button variant="ghost" size="icon" asChild>
        <Link to="/">
          <Home />
        </Link>
      </Button>

      <div className="flex-1 max-w-[50%]">
        <Searchbar />
      </div>

      {/* Conditionally render UI based on login state */}
      {isLoggedIn ? (
        // LOGGED-IN
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full cursor-pointer">
              <Avatar className="h-9 w-9">
                <AvatarImage />
                <AvatarFallback>?</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="min-w-40" align="end">
            <DropdownMenuLabel>
              <div className="flex flex-col gap-1">
                <p className="text-sm">Username</p>
                <p className="text-xs text-muted-foreground">user@example.com</p>
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
  );
}
