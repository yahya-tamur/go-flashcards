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
import InitializeMenu from "../InitializeMenu";
import MakeTreeMenu from "../MakeTreeMenu";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import NumberSpinner from "../components/NumberSpinner";

import AppContext from "../AppContext";

import CheckIcon from "@mui/icons-material/Check";
import ClearIcon from "@mui/icons-material/Clear";

export default (props) => {
  let context = useContext(AppContext);

  let [history, setHistory] = useState([]);

  // decided to try this instead of setting history in 3? separate places in board
  useEffect(() => {
    let f = async () => {
      await invoke("get_history").then((h) => {
        setHistory(h.map((t) => (t ? "🌟" : "❌")).join(""));
      });
    };
    f();
  }, [context.studyPhase, context.data]);

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
      {context.studyPhase === "Guess" ? (
        <Box
          sx={{
            margin: "20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "start",
          }}
        >
          <Box sx={{ marginBottom: "20px" }}>
            {context.exerciseColor} to play.
          </Box>
          <Box>
            <Button
              onClick={async () => {
                invoke("play", {
                  color: context.color,
                })
                  .then(() => invoke("get_data"))
                  .then((data) => {
                    context.setData(data);
                    context.setColor(
                      data.color === "Black" ? "White" : "Black",
                    );
                    switch (data.variant) {
                      case "Correct":
                        invoke("answer", { correct: true })
                          .then(() => invoke("get_data"))
                          .then((data) => {
                            context.setData(data);
                            context.setFeedback("Correct");
                            context.setStudyPhase("View");
                          });
                        break;
                      case "Incorrect":
                        invoke("answer", { correct: false })
                          .then(() => invoke("get_data"))
                          .then((data) => {
                            context.setData(data);
                            context.setFeedback("Incorrect");
                            context.setStudyPhase("View");
                          });
                        break;
                      case "New":
                        if (context.color === context.exerciseColor) {
                          invoke("answer", { correct: false })
                            .then(() => invoke("get_data"))
                            .then((data) => {
                              context.setData(data);
                              context.setFeedback("Incorrect");
                              context.setStudyPhase("View");
                            });
                        } else {
                          context.setStudyPhase("UnknownGuess");
                        }

                        break;
                      default:
                        break;
                    }
                  });
              }}
              variant="contained"
            >
              Pass
            </Button>
          </Box>
        </Box>
      ) : context.studyPhase === "UnknownGuess" ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            Unknown Opponent Response.
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                let [row, col] = [context.data.row, context.data.col];
                do {
                  col -= 1;
                  while (context.data.table[row][col] === null) {
                    row -= 1;
                  }
                } while (context.data.table[row][col].variant === "New");

                invoke("jump", { r: row, c: col })
                  .then(() => invoke("get_data"))
                  .then((data) => {
                    context.setData(data);
                    context.setColor(
                      data.color === "Black" ? "White" : "Black",
                    );
                    context.setStudyPhase("Guess");
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                invoke("get_data")
                  .then((data) => {
                    context.setData(data);
                    context.setColor(
                      data.color === "Black" ? "White" : "Black",
                    );
                    context.setStudyPhase("View");
                    context.setFeedback("");
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }}
            >
              View Problem
            </Button>
          </Box>
        </>
      ) : context.studyPhase === "View" ? (
        <Box
          style={{
            height: "100%",
            maxHeight: "100%",
            minHeight: 0,
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box>{context.feedback}</Box>

          <Box>{history}</Box>
        </Box>
      ) : context.studyPhase === "Edit" ? (
        context.editingPhase === "Initialize" ? (
          <InitializeMenu />
        ) : (
          <MakeTreeMenu />
        )
      ) : (
        <>unknown phase {context.studyPhase}</>
      )}
    </Paper>
  );
};
