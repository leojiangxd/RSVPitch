import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

export default function Searchbar() {
  return (
    <>
      <Input type="search" placeholder="Enter a Location" className="max-w-[50%] mr-1" />
      <Button variant="outline" size="icon" aria-label="Submit">
        <Search />
      </Button>
    </>
  );
}
