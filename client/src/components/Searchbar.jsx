// src/components/Searchbar.js

import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Searchbar({ widthStyle = "" }) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() === "") return;
    navigate(`/search/${encodeURIComponent(query.trim())}`);
  };

  return (
    // Combine base classes with the passed-in className
    <form onSubmit={handleSubmit} className={`flex justify-center items-center`}>
      <Input
        type="search"
        placeholder="Enter a Location"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className={`mr-1 ${widthStyle}`}
      />
      <Button type="submit" variant="outline" size="icon" aria-label="Submit">
        <Search />
      </Button>
    </form>
  );
}
