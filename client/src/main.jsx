import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { Routes, Route, BrowserRouter } from "react-router-dom";
import { Home, Search, Game, Login, Register, Edit, CreateGame } from "./routes";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/search/:id" element={<Search />} />
        <Route path="/game/:id" element={<Game />} />
        <Route path="/creategame" element={<CreateGame />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/edit" element={<Edit />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
