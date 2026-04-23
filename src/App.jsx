import { useState } from "react";
import reactLogo from "./assets/react.svg";
import { invoke } from "@tauri-apps/api/core";
import Board from "./Board.jsx";
import "./App.css";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

function App() {
  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", flexBasis: "60%" }}>
        <Board />
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
