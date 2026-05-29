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
import Button from "@mui/material/Button"

export default () => {
  let context = useContext(AppContext);

  useEffect(() => {
    invoke("get_data")
      .then((data) => {
        context.setStudyPhase("Guess");
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
          {context.studyPhase === "Guess" ?
            <>guess!</> : context.studyPhase === "UnknownGuess" ?
            <>Unknown Opponent Response.
            <Button onClick={() => {
              let [row, col] = [context.data.row, context.data.col];
              col -= 1;
              while (context.data.table[row][col] === null) {
                row -= 1;
              }
              invoke("jump", { r: row, c: col })
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setColor(data.color === "Black" ? "White" : "Black");
                  context.setStudyPhase("Guess");
                })
                .catch((e) => {
                  console.log(e);
                });


            }}>Back</Button>
            <Button onClick={() => {
              invoke("get_data")
                .then((data) => {
                  context.setData(data);
                  context.setColor(data.color === "Black" ? "White" : "Black");
                  context.setStudyPhase("View");
                })
                .catch((e) => {
                  console.log(e);
                });

            }}>View Problem</Button>
            
            </> : context.studyPhase === "View" ?
            <>view</> : <>unknown phase {context.studyPhase}</>
          }
        <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
          comments here
        </Box>
      </Box>
    </main>
  );
};
