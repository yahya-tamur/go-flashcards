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
          value={context.data?.window.slice(0, 2) ?? [0, 18]}
          marks
          onChange={async (event, newValue) => {
            if (context.data === null || context.data === undefined) {
              return;
            }

            let [row_start, row_end] = newValue;
            let [col_start, col_end] = context.data.window.slice(2, 4);

            await invoke("set_window", {
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
          value={context.data?.window.slice(2, 4) ?? [0, 18]}
          marks
          onChange={async (event, newValue) => {
            if (context.data === null || context.data === undefined) {
              return;
            }

            let [row_start, row_end] = context.data.window.slice(0, 2);
            let [col_start, col_end] = newValue;

            await invoke("set_window", {
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
        <Box sx={{ marginTop: "auto", marginLeft: "20px", height: "40px" }}>
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
        </Box>
      </Box>
    </Paper>
  );
};
