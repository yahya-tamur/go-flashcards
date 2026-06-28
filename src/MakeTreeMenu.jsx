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
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import NumberSpinner from "./components/NumberSpinner";

import AppContext from "./AppContext";

import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

import triangle_icon from "./assets/triangle.svg";
import square_icon from "./assets/square.svg";
import circle_icon from "./assets/circle.svg";
import cross_icon from "./assets/cross.svg";
import delete_mark_icon from "./assets/delete_mark.svg";

export default (props) => {
  let context = useContext(AppContext);
  const [variant, setVariant] = useState("None");

  // i think the array access interfered with state ?

  useEffect(() => {
    setVariant(context.data?.variant ?? "None");
  }, [context.data]);

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

            if (context.data.min_window !== null) {
              if (context.data.min_window[0] < context.window[0]) {
                context.window[0] = context.data.min_window[0];
                context.setWindow([...context.window]);
              }
              if (context.data.min_window[1] > context.window[1]) {
                context.window[1] = context.data.min_window[1];
                context.setWindow([...context.window]);
              }
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
                  data.window[0] !== context.window[0] ||
                  data.window[1] !== context.window[1]
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

            if (context.data.min_window !== null) {
              if (context.data.min_window[2] < context.window[2]) {
                context.window[2] = context.data.min_window[2];
                context.setWindow([...context.window]);
              }
              if (context.data.min_window[3] > context.window[3]) {
                context.window[3] = context.data.min_window[3];
                context.setWindow([...context.window]);
              }
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
                  data.window[2] !== context.window[2] ||
                  data.window[3] !== context.window[3]
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
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <Button
          onClick={async () => {
            invoke("collapse_tree")
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setEditingPhase("Initialize");
                context.setCursor("Black");
              });
          }}
          variant="contained"
        >
          Re-Initialize
        </Button>
        <Button
          onClick={async () => {
            invoke("play", {
              color: context.cursor,
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setCursor(data.color === "Black" ? "White" : "Black");
              });
          }}
          variant="contained"
        >
          Pass
        </Button>

        <ToggleButtonGroup
          value={variant}
          exclusive
          size="small"
          onChange={async (_e, newValue) => {
            setVariant(newValue);
            if (newValue === null) {
              newValue = "None";
            }
            invoke("set_variant", { variant: newValue })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
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
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            height: "40px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <Button
            variant="contained"
            sx={{ height: "100%" }}
            disabled={
              (context.data?.row ?? 0) == 0 && (context.data?.col ?? 0) == 0
            }
            onClick={async () => {
              invoke("delete_branch")
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setCursor(data.color === "Black" ? "White" : "Black");
                  context.setData(data);
                });
            }}
          >
            Delete
          </Button>

          <ToggleButtonGroup
            value={context.cursor}
            exclusive
            size="small"
            onChange={(e, newValue) => {
              if (newValue === null) {
                context.setCursor(
                  context.data.color === "Black" ? "White" : "Black",
                );
              } else {
                context.setCursor(newValue);
              }
            }}
          >
            <ToggleButton value="Triangle">
              <img
                src={triangle_icon}
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
            <ToggleButton value="Square">
              <img
                src={square_icon}
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
            <ToggleButton value="Circle">
              <img
                src={circle_icon}
                style={{ height: "30px", width: "30px" }}
              />
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

          <ToggleButtonGroup
            value={context.cursor}
            exclusive
            size="small"
            onChange={(e, newValue) => {
              if (newValue === null) {
                context.setCursor(
                  context.data.color === "Black" ? "White" : "Black",
                );
              } else {
                context.setCursor(newValue);
              }
            }}
          >
            <ToggleButton
              value={context.data.color === "Black" ? "White" : "Black"}
            >
              <img
                src={context.data.color === "Black" ? white_image : black_image}
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Paper>
  );
};
