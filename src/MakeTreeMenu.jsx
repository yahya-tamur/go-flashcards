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

  const [savedMsgOpen, setSavedMsgOpen] = useState(false);

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
        <Button
          onClick={async () => {
            invoke("collapse_tree")
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setEditingPhase("Initialize");
                context.setColorMode("Black");
                context.setColor("Black");
              });
          }}
          variant="contained"
        >
          Re-Initialize
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
          value={(context.data?.current_location ?? 0) + 1}
          min={1}
          max={context.data?.max_location ?? 1}
          onValueChange={async (v, e) => {
            if (context.data === null || context.data === undefined) {
              return;
            }
            invoke("jump_to_exercise", { index: v - 1 })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setColor(data.color === "Black" ? "White" : "Black");
              });
          }}
        />{" "}
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
            onClick={async () => {
              invoke("start_setup", { index: context.data?.max_location ?? 0 })
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setColorMode("Black");
                  context.setColor("Black");
                  console.log("AA");
                  context.setEditingPhase("Initialize");
                });
            }}
          >
            New
          </Button>

          <Button
            variant="contained"
            sx={{ height: "100%" }}
            onClick={async () => {
              invoke("save_exercises").then(() => setSavedMsgOpen(true));
            }}
          >
            Save
          </Button>
          <Button
            variant="contained"
            sx={{ height: "100%" }}
            onClick={async () => {
              // unsaved alert?
              invoke("main_menu").then(() => context.setPhase("Main"));
            }}
          >
            Back
          </Button>
        </Box>
      </Box>
      <Dialog
        open={savedMsgOpen}
        fullWidth
        maxWidth="xs"
        onClose={() => setSavedMsgOpen(false)}
      >
        <DialogContent>
          <DialogContentText>Saved.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSavedMsgOpen(false)}>Ok</Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
