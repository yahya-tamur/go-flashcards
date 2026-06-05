import { useState, useEffect, useContext } from "react";

import { invoke } from "@tauri-apps/api/core";

import Board from "./Board.jsx";
import Tree from "./Tree.jsx";
import InitializeMenu from "./InitializeMenu.jsx";
import MakeTreeMenu from "./MakeTreeMenu.jsx";
import EditCommentBox from "./EditCommentBox";
import EditingTopBar from "./EditingTopBar";
import "./App.css";
import AppContext from "./AppContext";
import Box from "@mui/material/Box";

export default () => {
  let context = useContext(AppContext);
  // useEffect: load exercise.

  useEffect(() => {
    invoke("get_data")
      .then((data) => {
        if (data.table.length === 1 && data.table[0].length === 1) {
          context.setEditingPhase("Initialize");
        } else {
          context.setEditingPhase("MakeTree");
        }
        context.setData(data);
        context.setColor(data.color === "Black" ? "White" : "Black");
        context.setColorMode(data.color === "Black" ? "White" : "Black");
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
          <EditingTopBar />
        </Box>
        <Box sx={{ height: "calc(100vh - 80px)" }}>
          <Board />
        </Box>
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
