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
import ClearIcon from "@mui/icons-material/Clear";
import TextField from "@mui/material/TextField";
import SearchIcon from "@mui/icons-material/Search";
import DirectionsIcon from "@mui/icons-material/Directions";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";

export default (props) => {
  const context = useContext(AppContext);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");

  // "main", "exercises", "study"
  const [menu, setMenu] = useState("main");

  const [newExercise, setNewExercise] = useState("");

  const exercise_name_invalid = (s) =>
    /\/|\\|[\u{0000}-\u{0008}]|[\u{000A}-\u{001F}]|\u{007F}/u.test(s);

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
            disableRipple
            sx={{ margin: "20px" }}
            onClick={() => {
              setMenu("exercises");
            }}
          >
            Edit
          </Button>
          <Button
            disableRipple
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
              <ListItem
                key={i}
                disablePadding
                secondaryAction={
                  <IconButton
                    edge="end"
                    onClick={() => {
                      setFileToDelete(e);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <ClearIcon />
                  </IconButton>
                }
              >
                <ListItemButton
                  onClick={() => {
                    invoke("load_exercises", { exercise: e })
                      .then(() => invoke("get_config"))
                      .then((config) => {
                        context.setConfig(config);
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
                invoke("load_exercises", { exercise: newExercise })
                  .then(() => invoke("get_config"))
                  .then((config) => {
                    context.setConfig(config);
                    context.setPhase("Editing");
                  });
              }}
            >
              <ListItem
                secondaryAction={
                  <Button
                    disabled={
                      props.exercises.some((a) => a === newExercise) ||
                      exercise_name_invalid(newExercise) ||
                      newExercise.length == 0
                    }
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
                    console.log(
                      exercise_name_invalid,
                      exercise_name_invalid(newExercise),
                    );
                  }}
                  variant="outlined"
                  size="small"
                />
              </ListItem>
            </form>
          </List>
          <Button
            variant="contained"
            disableRipple
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
                    invoke("load_study", { flashcardSet: e })
                      .then(() => invoke("get_config"))
                      .then((config) => {
                        context.setConfig(config);
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
            disableRipple
            sx={{ margin: "20px" }}
            onClick={() => {
              setMenu("main");
            }}
          >
            Back
          </Button>
        </>
      )}

      <Dialog
        open={deleteDialogOpen}
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{fileToDelete}"?{" "}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            autoFocus
            onClick={() => {
              setDeleteDialogOpen(false);
            }}
          >
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={() => {
              invoke("delete_exercise_file", { exercise: fileToDelete }).then(
                () => {
                  invoke("list_exercises").then((a) => {
                    props.setExercises(a);
                    setDeleteDialogOpen(false);
                    props.setConfigSignal(props.configSignal + 1);
                  });
                },
              );
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};
