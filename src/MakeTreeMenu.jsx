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
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import ClearIcon from "@mui/icons-material/Clear";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

const MakeTreeMenu = (props) => {
  const [mark, setMark] = useState("None");

  useEffect(() => {
    setMark(props.data?.tree?.mark);
  }, [props.data]);

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
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <Button
          onClick={async () => {
            invoke("collapse_tree")
              .then(() => invoke("get_data"))
              .then((data) => {
                props.setData(data);
                props.setColorMode("BlackWhite");
                props.setPhase("Initialize");
              });
          }}
          variant="contained"
        >
          Back to Setup
        </Button>

        <ToggleButtonGroup
          value={mark}
          exclusive
          size="small"
          onChange={async (_e, newValue) => {
            setMark(newValue);
            console.log("aaa!!!!");

            invoke("set_mark", { variant: newValue })
              .then(() => invoke("get_data"))
              .then((data) => {
                props.setData(data);
              })
              .catch((e) => {
                console.log("error");
              });
          }}
        >
          <ToggleButton value="Correct">Correct</ToggleButton>
          <ToggleButton value="Incorrect">Incorrect</ToggleButton>
          <ToggleButton value="None">None</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Paper>
  );
};
export default MakeTreeMenu;
