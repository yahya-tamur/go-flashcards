import { useEffect, useState, useRef, useContext } from "react";
import board_image from "./assets/oak.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import mui_clear from "./assets/mui_clear.svg";
import triangle_icon from "./assets/triangle.svg";
import square_icon from "./assets/square.svg";
import circle_icon from "./assets/circle.svg";
import cross_icon from "./assets/cross.svg";
import delete_mark_icon from "./assets/delete_mark.svg";

import "./App.css";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";
import ClearIcon from "@mui/icons-material/Clear";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import TextField from "@mui/material/TextField";

import { createSvgIcon } from "@mui/material/utils";

import AppContext from "./AppContext";

export default (props) => {
  let context = useContext(AppContext);

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
          value={context.window.slice(0, 2)}
          marks
          onChange={(e) => {
            let [a, b] = e.target.value;
            if (a !== context.window[0] || b !== context.window[1]) {
              context.setWindow([a, b, context.window[2], context.window[3]]);
            }
          }}
          onChangeCommitted={async (event, newValue) => {
            if (context.data === null || context.data === undefined) {
              return;
            }

            if (
              context.window.every(
                (value, index) => context.data.window[index] === value,
              )
            ) {
              return;
            }
            await invoke("set_window", {
              window: context.window,
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                if (
                  data.window[0] !== context.data.window[0] ||
                  data.window[1] !== context.data.window[1]
                ) {
                  context.setData(data);
                }
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
          value={context.window.slice(2, 4)}
          marks
          onChange={(e) => {
            let [a, b] = e.target.value;
            if (a !== context.window[2] || b !== context.window[3]) {
              context.setWindow([context.window[0], context.window[1], a, b]);
            }
          }}
          onChangeCommitted={async (event, newValue) => {
            if (context.data === null || context.data === undefined) {
              return;
            }

            if (
              context.window.every(
                (value, index) => context.data.window[index] === value,
              )
            ) {
              return;
            }
            await invoke("set_window", {
              window: context.window,
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                if (
                  data.window[2] !== context.data.window[2] ||
                  data.window[3] !== context.data.window[3]
                ) {
                  context.setData(data);
                }
              })
              .catch((e) => {
                console.log("error");
              });
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
          value={context.cursor}
          exclusive
          size="small"
          onChange={(e, newValue) => {
            context.setCursor(newValue);
          }}
        >
          <ToggleButton value="Black">
            <img src={black_image} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="White">
            <img src={white_image} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="Delete">
            <ClearIcon color="error" sx={{ height: "30px", width: "30px" }} />
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={context.cursor}
          exclusive
          size="small"
          onChange={(e, newValue) => {
            if (newValue === null) {
              context.setCursor("Black");
            } else {
              context.setCursor(newValue);
            }
            console.log(newValue);
          }}
        >
          <ToggleButton value="Triangle">
            <img
              src={triangle_icon}
              style={{ height: "30px", width: "30px" }}
            />
          </ToggleButton>
          <ToggleButton value="Square">
            <img src={square_icon} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="Circle">
            <img src={circle_icon} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="Cross">
            <img src={cross_icon} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="DeleteMark">
            <img
              src={delete_mark_icon}
              style={{ height: "30px", width: "30px" }}
            />
          </ToggleButton>
          <ToggleButton value={"Label"}>
            <TextField
              sx={{ width: "60px" }}
              size="small"
              variant="standard"
              value={context.nextLabel}
              onChange={(e) => {
                e.stopPropagation();
                context.setNextLabel(e.target.value);
                context.setCursor("Label");
                console.log(context.cursor);
              }}
            ></TextField>
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
          disabled={context.cursor !== "Black" && context.cursor !== "White"}
          onClick={async () => {
            invoke("finish_setup", {
              color: context.cursor === "Black" ? "White" : "Black",
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
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
