import { useEffect, useState } from "react";
import board from "./assets/persimmon.jpg";

import { invoke } from "@tauri-apps/api/core";
import "./App.css";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const gen_grid = () => {
  return `<line x1="5" y1="5" x2="5" y2="195" stroke="black" strokeWidth="2" />`;
};

function Board() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  const greet2 = async () => {
    setGreetMsg(JSON.stringify(await invoke("greet2")));
  };

  useEffect(() => {
    const canvas = document.getElementById("board");
    console.log(canvas.getBoundingClientRect());
    const ctx = canvas.getContext("2d");

    ctx.beginPath();
    ctx.lineWidth = 0.5;
    ctx.moveTo(50, 50);
    ctx.lineTo(200, 200);
    ctx.stroke();
  }, []);

  return (
    <Box
      sx={{
        margin: "10px",
        backgroundImage: `url(${board})`,
        width: "calc(100% - 20px)",
        height: "auto",
        minHeight: 0,
        aspectRatio: "1 / 1",
      }}
    >
      <canvas
        id="board"
        style={{
          minWidth: "100%",
          minHeight: "100%",
          width: "100%",
          height: "100%",
        }}
      />
      {/*
      <svg id="board" viewBox="0 0 200 200" style={{ width: "100%", height: "100%" }} onClick={(e) => {

        console.log(e);
        console.log(e.target.getBoundingClientRect());
        console.log(e.pageX, e.pageY)
      }} onMouseOver={(e) => {

        console.log(e);
        console.log(e.target.getBoundingClientRect());
        console.log(e.pageX, e.pageY)

      }}>
        {Array.from({ length: 19 }).map((_, i) => (
          <line
            key={i}
            x1={10 * i + 10}
            y1="10"
            x2={10 * i + 10}
            y2="190"
            stroke="black"
            strokeWidth="0.5"
          />
        ))}
        {Array.from({ length: 19 }).map((_, i) => (
          <line
            key={i}
            y1={10 * i + 10}
            x1="10"
            y2={10 * i + 10}
            x2="190"
            stroke="black"
            strokeWidth="0.5"
          />
        ))}
      </svg>
      */}
    </Box>
  );
}

export default Board;
