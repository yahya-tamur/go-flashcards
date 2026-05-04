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
import ClearIcon from "@mui/icons-material/Clear";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import { createSvgIcon } from "@mui/material/utils";

const InitializeMenu = (props) => {
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
            let [row_start, row_end] = newValue;
            let [col_start, col_end] = props.verticalBound;
            invoke("clear_to", {
              rows: [row_start + 1, row_end + 1],
              cols: [col_start + 1, col_end + 1],
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                props.setData(data);
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
          value={props.verticalBound}
          marks
          onChange={(event, newValue) => {
            props.setVerticalBound(newValue);
            let [row_start, row_end] = props.horizontalBound;
            let [col_start, col_end] = newValue;

            invoke("clear_to", {
              rows: [row_start + 1, row_end + 1],
              cols: [col_start + 1, col_end + 1],
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                props.setData(data);
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
          value={props.colorMode}
          exclusive
          size="small"
          onChange={(e, newValue) => {
            props.setColorMode(newValue);
            if (newValue === "Black" || newValue === "White") {
              props.setColor(newValue);
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
            invoke("initialize_tree", {
              color: props.color === "Black" ? "White" : "Black",
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                props.setData(data);
                props.setColorMode(props.color);
                props.setPhase("MakeTree");
                console.log("AAA");
              });
          }}
        >
          Start Tree
        </Button>
      </Box>

      <Box></Box>
    </Paper>
  );
};

export default InitializeMenu;
