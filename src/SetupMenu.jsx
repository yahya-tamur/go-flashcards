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
import ClearIcon from '@mui/icons-material/Clear';

import { Avatar, Icon, IconButton, SvgIcon } from "@mui/material";
import { createSvgIcon } from "@mui/material/utils";

const Menu = (props) => {
  const button_size = 70;
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
        justifyContent: "space-around",
      }}
      elevation={7}
    >
      <Box
        sx={{
          flex: "0 1 auto",
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
        }}
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
          sx={{ margin: "5px 30px", width: "calc(100% - 60px)" }}
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
          sx={{ margin: "5px 30px", width: "calc(100% - 60px)" }}
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Button variant={props.colorMode=="Black" ? "contained" : "text"} onClick={() => {
          props.setColorMode("Black");
          props.setColor("Black");
        }}>
          <img src={black_image} style={{ height: "30px", width: "30px" }} />
        </Button>
        <Button variant={props.colorMode=="White" ? "contained" : "text"} onClick={() => {
          props.setColorMode("White");
          props.setColor("White");
        }}>
          <img src={white_image} style={{ height: "30px", width: "30px" }} />
        </Button>
        <Button variant={props.colorMode=="BlackWhite" ? "contained" : "text"} onClick={() => {
          props.setColorMode("BlackWhite");
        }}>
          <svg viewBox="0 0 100 100" style={{ height: "30px", width: "30px" }}>
            <defs>
              <clipPath id="left-half">
                <rect x="0" y="0" width="50" height="100" />
              </clipPath>
              <clipPath id="right-half">
                <rect x="50" y="0" width="50" height="100" />
              </clipPath>
            </defs>
            <image
              href={black_image}
              width="100"
              height="100"
              clipPath="url(#left-half)"
            />
            <image
              href={white_image}
              width="100"
              height="100"
              clipPath="url(#right-half)"
            />
          </svg>
        </Button>
        <Button variant={props.colorMode=="Delete" ? "contained" : "text"} onClick={() => {
          props.setColorMode("Delete");
        }}>
          <ClearIcon sx={{ height: "30px", width: "30px" }} />
        </Button>
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Button variant="contained">Start Tree</Button>
      </Box>
    </Paper>
  );
};

export default Menu;
