import { useState, useEffect, useContext } from "react";

import { invoke } from "@tauri-apps/api/core";

import Board from "./Board.jsx";
import Tree from "./Tree.jsx";
import InitializeMenu from "./InitializeMenu.jsx";
import MakeTreeMenu from "./MakeTreeMenu.jsx";
import EditCommentBox from "./EditCommentBox";
import "./App.css";
import AppContext from "./AppContext";
import Box from "@mui/material/Box";

export default () => {
  let context = useContext(AppContext);
  // useEffect: load exercise.

  useEffect(() => {
    invoke("load_exercises", { exercise: context.exerciseFile })
      .then(() => invoke("get_data"))
      .then((data) => {
        console.log(data);
        context.setData(data);
        context.setColor(data.color === "Black" ? "White" : "Black");
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", flexBasis: "60%", minWidth: 0 }}>
        <Board />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexBasis: "40%",
          flexDirection: "column",
          minWidth: 0,
          maxHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexBasis: "40%", minHeight: 0 }}>
          <Tree />
        </Box>
        <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
          {context.editingPhase === "Initialize" ? (
            <InitializeMenu />
          ) : (
            <MakeTreeMenu />
          )}
        </Box>
        <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
          {context.editingPhase === "MakeTree" ? <EditCommentBox /> : <Box />}
        </Box>
      </Box>
    </main>
  );
};
