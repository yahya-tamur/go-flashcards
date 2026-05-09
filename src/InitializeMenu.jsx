import { useEffect, useState, useRef, useContext } from "react";
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
import ClearIcon from "@mui/icons-material/Clear";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { createSvgIcon } from "@mui/material/utils";

import AppContext from "./AppContext";

export default (props) => {
  let context = useContext(AppContext);
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
          value={context.data?.game.window.slice(0, 2) ?? [0, 18]}
          marks
          onChange={(event, newValue) => {
            //to DO: INvoke SetWindow
            let [row_start, row_end] = newValue;
            let [col_start, col_end] = context.data?.game.window.slice(2, 4);
            invoke("set_window", {
              window: [row_start, row_end, col_start, col_end],
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
              })
              .catch((e) => {
                console.log("error");
              });
          }}
          step={1}
          min={0}
          max={18}
          sx={{ margin: "5px 30px", width: "calc(100% - 60px)" }}
        />
        <Slider
          value={context.data?.game.window.slice(2, 4) ?? [0, 18]}
          marks
          onChange={(event, newValue) => {
            let [row_start, row_end] = context.data?.game.window.slice(0, 2);
            let [col_start, col_end] = newValue;

            invoke("set_window", {
              window: [row_start, row_end, col_start, col_end],
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
              })
              .catch((e) => {
                console.log("error");
              });
            // actually delete stones
          }}
          step={1}
          min={0}
          max={18}
          sx={{ margin: "5px 30px 0px 30px", width: "calc(100% - 60px)" }}
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
        <ToggleButtonGroup
          value={context.colorMode}
          exclusive
          size="small"
          onChange={(e, newValue) => {
            context.setColorMode(newValue);
            if (newValue === "Black" || newValue === "White") {
              context.setColor(newValue);
            }
          }}
        >
          <ToggleButton value="Black">
            <img src={black_image} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="White">
            <img src={white_image} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          {/* <ToggleButton value="BlackWhite">
            <svg
              viewBox="0 0 100 100"
              style={{ height: "30px", width: "30px" }}
            >
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
          </ToggleButton>*/}
          <ToggleButton value="Delete">
            <ClearIcon color="error" sx={{ height: "30px", width: "30px" }} />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Button
          variant="contained"
          onClick={async () => {
            invoke("finish_setup", {
              color: context.color === "Black" ? "White" : "Black",
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setColorMode(context.color);
                context.setEditingPhase("MakeTree");
              });
          }}
        >
          Start
        </Button>
      </Box>

      <Box></Box>
    </Paper>
  );
};
