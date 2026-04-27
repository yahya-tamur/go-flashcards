import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import Board from "./Board.jsx";
import Tree from "./Tree.jsx";
import "./App.css";

import Box from "@mui/material/Box";

function App() {
  const [game, setGame] = useState(null);
  const [tree, setTree] = useState(null);
  const [loc, setLoc] = useState(null);
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
      let _ = await invoke("initialize_tree", { stone: "Black" });
      let game = await invoke("get_game");
      let tree = await invoke("get_tree");
      console.log(tree);
      setGame(game);
      setTree(tree);
      setLoc([0, 0]);
    };
    load_board();
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", flexBasis: "60%", minWidth: 0 }}>
        <Board
          game={game}
          setGame={setGame}
          setTree={setTree}
          setLoc={setLoc}
          color={color}
          swapColor={swapColor}
          loc={loc}
        />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexBasis: "40%",
          flexDirection: "column",
          minWidth: 0,
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexBasis: "40%" }}>
          <Tree tree={tree} setTree={setTree} setGame={setGame} />
        </Box>
        <Box sx={{ flexBasis: "30%" }}>blorb 2</Box>
        <Box sx={{ flexGrow: 1 }}>blorb 3</Box>
      </Box>
    </main>
  );
}

export default App;
