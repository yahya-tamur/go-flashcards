import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import Board from "./Board.jsx";
import "./App.css";

import Box from "@mui/material/Box";

function App() {
  const [game, setGame] = useState(null);
  const [color, setColor] = useState("Black");

  const swapColor = () => {
    if (color === "Black") {
      setColor("White");
    } else if (color === "White") {
      setColor("Black");
    } else {
      console.log("Tried to swap invalid color!");
    }
  };

  useEffect(() => {
    const load_board = async () => {
      let game = await invoke("get_game");

      setGame(game);
    };
    load_board();
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", flexBasis: "60%" }}>
        <Board
          game={game}
          setGame={setGame}
          color={color}
          swapColor={swapColor}
        />
      </Box>
      <Box sx={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
        <Box sx={{ flexBasis: "30%" }}>blorb 1</Box>
        <Box sx={{ flexBasis: "20%" }}>blorb 2</Box>
        <Box sx={{ flexGrow: 1 }}>blorb 3</Box>
      </Box>
    </main>
  );
}

export default App;
