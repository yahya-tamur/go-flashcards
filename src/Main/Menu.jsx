import { useEffect, useState, useRef, useContext } from "react";
import board_image from "../assets/oak.jpg";
import black_image from "../assets/black_night.png";
import white_image from "../assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "../utils";

import AppContext from "../AppContext";
import "../App.css";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import InboxIcon from "@mui/icons-material/Inbox";
import DraftsIcon from "@mui/icons-material/Drafts";
import InputBase from "@mui/material/InputBase";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";

export default (props) => {
  const context = useContext(AppContext);

  // "main", "exercises", "study"
  const [menu, setMenu] = useState("main");

  const [newExercise, setNewExercise] = useState("");

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
      }}
      elevation={7}
    >
      {menu === "main" ? (
        <>
          <Button
            variant="contained"
            sx={{ margin: "20px" }}
            onClick={() => {
              setMenu("exercises");
            }}
          >
            Edit
          </Button>
          <Button
            variant="contained"
            sx={{ margin: "20px" }}
            onClick={() => {
              setMenu("study");
            }}
          >
            Study
          </Button>
        </>
      ) : menu === "exercises" ? (
        <>
          <List sx={{ overflow: "scroll" }}>
            {props.exercises.map((e, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton
                  onClick={() => {
                    invoke("load_exercises", { exercise: e }).then(() => {
                      context.setPhase("Editing");
                    });
                  }}
                >
                  <ListItemText primary={e} />
                </ListItemButton>
              </ListItem>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                invoke("load_exercises", { exercise: newExercise }).then(() => {
                  context.setPhase("Editing");
                });
              }}
            >
              <ListItem
                secondaryAction={
                  <Button
                    disabled={props.exercises.some((a) => a === newExercise)}
                    type="submit"
                    variant="contained"
                  >
                    New
                  </Button>
                }
              >
                <TextField
                  value={newExercise}
                  onChange={(e) => {
                    setNewExercise(e.target.value);
                  }}
                  variant="outlined"
                  size="small"
                />
              </ListItem>
            </form>
          </List>
          <Button
            variant="contained"
            sx={{ margin: "20px" }}
            onClick={() => {
              setMenu("main");
            }}
          >
            Back
          </Button>
        </>
      ) : (
        <>
          <List sx={{ overflow: "scroll" }}>
            {props.studies.map((e, i) => (
              <ListItem key={i} disablePadding>
                <ListItemButton
                  onClick={() => {
                    invoke("load_study", { flashcardSet: e }).then(() => {
                      context.setPhase("Study");
                    });
                  }}
                >
                  <ListItemText primary={e} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            sx={{ margin: "20px" }}
            onClick={() => {
              setMenu("main");
            }}
          >
            Back
          </Button>
        </>
      )}
    </Paper>
  );
};
