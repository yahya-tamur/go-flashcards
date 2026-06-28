import { useEffect, useState, useRef, useContext } from "react";

import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import "./App.css";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Slider from "@mui/material/Slider";
import ClearIcon from "@mui/icons-material/Clear";

import AppContext from "./AppContext";

import { Avatar, Icon, IconButton, SvgIcon } from "@mui/material";
import { createSvgIcon } from "@mui/material/utils";

export default (props) => {
  let context = useContext(AppContext);
  const [comment, setComment] = useState("");
  useEffect(() => {
    console.log(context.data?.comment ?? "no data");
    if (context.data?.comment ?? null !== null) {
      setComment(context.data.comment);
    }
  }, [context.data]);
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
      {context.studyPhase !== "Edit" && context.phase === "Study" ? (
        <Box sx={{ height: "100%", margin: "10px", whiteSpace: "pre-wrap" }}>
          {comment}
        </Box>
      ) : (
        <TextField
          placeholder="Comment"
          multiline
          variant="standard"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
          onBlur={(e) => {
            invoke("comment", {
              comment: comment,
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
              });
          }}
          sx={{
            display: "flex",
            flexGrow: 1,

            "& .MuiInputBase-root": { padding: "10pt" },
          }}
          slotProps={{ input: { sx: { height: "100%", alignItems: "start" } } }}
        />
      )}
    </Paper>
  );
};
