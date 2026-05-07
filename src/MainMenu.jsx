import { useEffect, useState, useRef } from "react";
import board_image from "./assets/oak.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import "./App.css";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

const MainMenu = (props) => {
  return (
    <Paper
      sx={{
        height: "100%",
        maxHeight: "100%",
        minHeight: 0,
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
      }}
      elevation={7}
    >
      <Button
        variant="contained"
        sx={{ margin: "20px" }}
        onClick={() => {
        //  props.setPhase("Initialize");
          invoke("list_exercises")
            .then((a) => {
              console.log(a);
            });
        }}
      >
        Edit Exercises (test)
      </Button>
      <Button variant="contained" sx={{ margin: "20px" }} onClick={() => {}} disabled>
        Study
      </Button>
    </Paper>
  );
};

export default MainMenu;
