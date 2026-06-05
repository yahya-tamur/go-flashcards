import { useState, useEffect, useContext } from "react";

import { invoke } from "@tauri-apps/api/core";

import Board from "./Board.jsx";
import Tree from "./Tree.jsx";
import InitializeMenu from "./InitializeMenu.jsx";
import MakeTreeMenu from "./MakeTreeMenu.jsx";
import EditCommentBox from "./EditCommentBox";
import StudyTopBar from "./StudyTopBar";
import StudyMenu from "./StudyMenu";
import StudyCommentBox from "./StudyCommentBox";
import "./App.css";
import AppContext from "./AppContext";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

export default () => {
  let context = useContext(AppContext);

  useEffect(() => {
    invoke("get_data")
      .then((data) => {
        context.setStudyPhase("Guess");
        context.setData(data);
        context.setColor(data.color === "Black" ? "White" : "Black");
        //context.setColorMode(data.color === "Black" ? "White" : "Black");
        context.setExerciseColor(data.color === "Black" ? "White" : "Black");
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box
        sx={{
          height: "100vh",
          flexBasis: "60%",
          minWidth: 0,
          flexDirection: "col",
        }}
      >
        <Box sx={{ height: "80px" }}>
          <StudyTopBar />
        </Box>
        <Box sx={{ height: "calc(100vh - 80px)" }}>
          <Board />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexBasis: "40%",
          flexDirection: "column  ",
          minWidth: 0,
          maxHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexBasis: "40%", minHeight: 0 }}>
          {context.studyPhase === "Guess" ||
          context.studyPhase === "UnknownGuess" ? (
            <Paper
              sx={{
                maxHeight: "100%",
                height: "100%",
              }}
              elevation={5}
            />
          ) : (
            <Tree />
          )}
        </Box>
        <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
          <StudyMenu />
        </Box>
        <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
          <StudyCommentBox />
        </Box>
      </Box>
    </main>
  );
};
