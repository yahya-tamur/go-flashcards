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

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import NumberSpinner from "./components/NumberSpinner";

import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

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
          Re-Initialize
        </Button>

        <ToggleButtonGroup
          value={mark}
          exclusive
          size="small"
          onChange={async (_e, newValue) => {
            setMark(newValue);
            if (newValue === null) {
              newValue = "None";
            }
            console.log(newValue, mark);
            invoke("set_mark", { variant: newValue })
              .then(() => invoke("get_data"))
              .then((data) => {
                props.setData(data);
              })
              .catch((e) => {
                console.log(e, "error");
              });
          }}
        >
          <ToggleButton value="Correct">
            <CheckIcon />
          </ToggleButton>
          <ToggleButton value="Incorrect">
            <ClearIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <NumberSpinner
          label="Exercise"
          size="small"
          defaultValue={props.data.edit_location[1]}
          min={1}
          max={props.data.edit_location[1]}
          onValueChange={async (v, e) => {
            console.log(v);
            invoke("jump_to_exercise", { index: v - 1 })
              .then(() => invoke("get_data"))
              .then((data) => {
                console.log(data);
                props.setData(data);
                props.setColor(data.tree.color === "Black" ? "White" : "Black");
              });
          }}
        />{" "}
        <Box sx={{ marginTop: "auto", marginLeft: "20px", height: "40px" }}>
          <Button
            variant="contained"
            sx={{ height: "100%" }}
            onClick={async () => {
              console.log(props.data);
              invoke("start_setup", { index: props.data["edit_location"][1] })
                .then(() => invoke("get_data"))
                .then((data) => {
                  console.log(data);
                  props.setData(data);
                  props.setColorMode("Black");
                  props.setColor("Black");

                  props.setPhase("Initialize");
                });
            }}
          >
            New
          </Button>

          <Button
            variant="contained"
            sx={{ height: "100%" }}
            onClick={async () => {
              console.log(props.data);
              invoke("save").then(() => alert("saved!"));
            }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            sx={{ height: "100%" }}
            onClick={async () => {
              console.log(props.data);
              invoke("load")
                .then(() => invoke("get_data"))
                .then((data) => {
                  props.setData(data);
                  props.setColor(
                    data.tree.color === "Black" ? "White" : "Black",
                  );
                });
            }}
          >
            Load
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};
export default MakeTreeMenu;
