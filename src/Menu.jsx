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
import Slider from "@mui/material/Slider";

const Menu = (props) => {
  return (
    <Paper
      sx={{
        height: "100%",
        maxHeight: "100%",
        minHeight: 0,
        width: "100%",
        maxWidth: "100%",
      }}
      elevation={7}
    >
      <Slider
        value={props.horizontalBound}
        marks
        onChange={(event, newValue) => {
          props.setHorizontalBound(newValue);
          // actually delete stones
        }}
        step={1}
        min={0}
        max={18}
        sx={{ margin: "5px 30px", width: "calc(100% - 40px)" }}
      />
      <Slider
        value={props.verticalBound}
        marks
        onChange={(event, newValue) => {
          props.setVerticalBound(newValue);
          // actually delete stones
        }}
        step={1}
        min={0}
        max={18}
        sx={{ margin: "5px 30px", width: "calc(100% - 40px)" }}
      />
    </Paper>
  );
};

export default Menu;
