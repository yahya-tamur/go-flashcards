import { useEffect, useState, useRef, useContext } from "react";
import board_image from "../assets/oak.jpg";
import black_image from "../assets/black_night.png";
import white_image from "../assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "../utils";

import "../App.css";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import ClearIcon from "@mui/icons-material/Clear";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import NumberSpinner from "../components/NumberSpinner";

import AppContext from "../AppContext";

import { Avatar, Icon, IconButton, SvgIcon } from "@mui/material";
import { createSvgIcon } from "@mui/material/utils";

export default (props) => {
  let context = useContext(AppContext);
  const [savedMsgOpen, setSavedMsgOpen] = useState(false);
  //  useEffect(
  //    setComment(props.data?.tree?.comment)
  //
  //  , [props.data])
  return (
    <Paper
      sx={{
        height: "100%",
        minHeight: 0,
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        justifyContent: "space-around",
      }}
      elevation={10}
    >
      <Box
        sx={{
          height: "100%",
          minHeight: 0,
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          overflow: "scroll",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Button
          variant="contained"
          sx={{ height: "40px" }}
          onClick={async () => {
            invoke("main_menu").then(() => {
              context.setPhase("Main");
              context.setConfig(null);
            });
          }}
        >
          Exit
        </Button>
        <NumberSpinner
          label="Exercise"
          disabled={context.editingPhase === "Initialize"}
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
        />
        <Button
          variant="contained"
          disabled={context.editingPhase === "Initialize"}
          sx={{ height: "40px" }}
          onClick={async () => {
            invoke("new_exercise")
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setColorMode("Black");
                context.setColor("Black");
                context.setEditingPhase("Initialize");
              });
          }}
        >
          New
        </Button>
        <Button
          disabled={context.editingPhase === "Initialize"}
          variant="contained"
          sx={{ height: "40px" }}
          onClick={async () => {
            invoke("save_exercises").then(() => setSavedMsgOpen(true));
          }}
        >
          Save
        </Button>
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
