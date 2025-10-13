import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import { Link } from "react-router-dom";

export default function NavbarButtons() {
  return (
    <div className="bg-zinc-900 w-full flex items-center p-2 justify-between">
      {/* Home button */}
      <Button variant="ghost" size="icon" asChild>
        <Link to="/">
          <Home />
        </Link>
      </Button>

      {/* Login & Register button*/}
      <div className="flex gap-1">
        <Button variant="outline" asChild>
          <Link to="/login">Login</Link>
        </Button>
        <Button asChild>
          <Link to="/register">Register</Link>
        </Button>
      </div>
    </div>
  );
}
