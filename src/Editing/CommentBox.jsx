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

import AppContext from "../AppContext";

import { Avatar, Icon, IconButton, SvgIcon } from "@mui/material";
import { createSvgIcon } from "@mui/material/utils";

export default (props) => {
  let context = useContext(AppContext);
  const [comment, setComment] = useState("");
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
      {
        <TextField
          placeholder="Comment"
          multiline
          variant="standard"
          value={context.data?.comment ?? ""}
          onChange={(e) => {
            e.preventDefault();
            console.log(e.target.value);
            invoke("comment", {
              comment: e.target.value,
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
      }
    </Paper>
  );
};
