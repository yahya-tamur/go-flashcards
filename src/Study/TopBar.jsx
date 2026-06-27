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
          disabled={["Guess", "UnknownGuess"].some(
            (a) => a === context.studyPhase,
          )}
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
                context.setFeedback("");
                context.setCursor(data.color === "Black" ? "White" : "Black");
              });
          }}
        />
        {context.studyPhase === "Edit" ? (
          <Button
            variant="contained"
            sx={{ height: "40px" }}
            onClick={async () => {
              invoke("stop_editing", { save: true })
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setCursor(data.color === "Black" ? "White" : "Black");
                  context.setExerciseColor(
                    data.color === "Black" ? "White" : "Black",
                  );
                  context.setStudyPhase("View");
                  context.setNextLabel("A");
                })
                .catch((e) => {
                  console.log(e);
                });
            }}
          >
            Save
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={context.studyPhase !== "View"}
            sx={{ height: "40px" }}
            onClick={async () => {
              context.setStudyPhase("Edit");
              context.setEditingPhase("MakeTree");
              context.setFeedback("");
            }}
          >
            Edit
          </Button>
        )}
        {context.studyPhase === "Edit" ? (
          <Button
            variant="contained"
            sx={{ height: "40px" }}
            onClick={async () => {
              invoke("stop_editing", { save: false })
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setCursor(data.color === "Black" ? "White" : "Black");
                  context.setExerciseColor(
                    data.color === "Black" ? "White" : "Black",
                  );
                  context.setStudyPhase("View");
                  context.setNextLabel("A");
                })
                .catch((e) => {
                  console.log(e);
                });
            }}
          >
            Discard
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={["Guess", "UnknownGuess"].some(
              (a) => a === context.studyPhase,
            )}
            sx={{ height: "40px" }}
            onClick={async () => {
              invoke("next_exercise")
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setCursor(data.color === "Black" ? "White" : "Black");
                  context.setExerciseColor(
                    data.color === "Black" ? "White" : "Black",
                  );
                  context.setStudyPhase("Guess");
                })
                .catch((e) => {
                  console.log(e);
                });
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Paper>
  );
};
