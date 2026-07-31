import type { Dispatch, SetStateAction } from "react";

import { useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import ClearIcon from "@mui/icons-material/Clear";

import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import IconButton from "@mui/material/IconButton";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Paper from "@mui/material/Paper";
import SwipeableDrawer from "@mui/material/SwipeableDrawer";
import TextField from "@mui/material/TextField";

import { useDispatchContext } from "@/AppContext";
import { commands } from "@/bindings";
import { editNewExercise, setClick } from "@/utils";

interface MenuProps {
  drawerWidth: string;
  exercises: string[];
  studies: string[];
  setExercises: Dispatch<SetStateAction<string[]>>;
  configSignal: number;
  setConfigSignal: Dispatch<SetStateAction<number>>;
}

const Menu = (props: MenuProps) => {
  const {
    c_setData,
    c_cursorDispatch,
    c_setStudyPhase,
    c_handleError,
    c_setPhase,
    c_setEditingPhase,
    c_setExerciseNumber,
  } = useDispatchContext();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState("");

  const [editOpen, setEditOpen] = useState(false);
  const [studyOpen, setStudyOpen] = useState(false);

  const [newExercise, setNewExercise] = useState("");

  /* eslint-disable no-control-regex */

  const exercise_name_invalid = (s: string) =>
    /\/|\\|[\u{0000}-\u{0008}]|[\u{000A}-\u{001F}]|\u{007F}/u.test(s);

  /* eslint-enable no-control-regex */

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
      <Button
        variant="contained"
        sx={{ margin: "20px" }}
        onClick={() => {
          setEditOpen(true);
        }}
      >
        Edit
      </Button>
      <Button
        variant="contained"
        sx={{ margin: "20px" }}
        onClick={() => {
          setStudyOpen(true);
        }}
      >
        Study
      </Button>
      <SwipeableDrawer
        open={editOpen}
        anchor="right"
        variant="persistent"
        onClose={() => {
          setStudyOpen(false);
        }}
        onOpen={() => {
          setStudyOpen(true);
        }}
        sx={{
          width: props.drawerWidth,
          "& .MuiDrawer-paper": {
            width: props.drawerWidth,
          },
        }}
        slotProps={{
          paper: {
            sx: {
              marginTop: "env(safe-area-inset-top)",
              marginBottom: "env(safe-area-inset-bottom)",
            },
          },
        }}
      >
        <Paper
          elevation={4}
          sx={{
            height:
              "calc((100vh - env(safe-area-inset-top)) - env(safe-area-inset-bottom))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <List sx={{ overflow: "scroll" }}>
            {props.exercises.map((e, i) => (
              <ListItem
                key={JSON.stringify([e, i])}
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
                    commands
                      .loadExercises(e)
                      //.then(() => invoke("get_config"))
                      .then(() => commands.getData())
                      .then((data) => {
                        //c_setConfig(config);
                        editNewExercise(
                          data,
                          c_cursorDispatch,
                          c_setEditingPhase,
                        );
                        c_setPhase("Editing");
                        c_setData(data);
                      })
                      .then(() => commands.getExerciseNumber())
                      .then((en) => c_setExerciseNumber(en))
                      .catch((e) => c_handleError(e));
                  }}
                >
                  <ListItemText primary={e} />
                </ListItemButton>
              </ListItem>
            ))}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                commands
                  .loadExercises(newExercise)
                  .then(() => commands.getData())
                  .then((data) => {
                    c_setData(data);
                    c_setPhase("Editing");
                    editNewExercise(data, c_cursorDispatch, c_setEditingPhase);
                  })
                  .then(() => commands.getExerciseNumber())
                  .then((en) => c_setExerciseNumber(en))
                  .catch((e) => c_handleError(e));
              }}
            >
              <ListItem
                secondaryAction={
                  <IconButton
                    disabled={
                      props.exercises.some((a) => a === newExercise) ||
                      exercise_name_invalid(newExercise) ||
                      newExercise.length == 0
                    }
                    edge="end"
                    type="submit"
                  >
                    <AddIcon />
                  </IconButton>
                }
              >
                <TextField
                  value={newExercise}
                  sx={{ width: "100%" }}
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
            sx={{ margin: "20px", width: "calc(100% - 40px)" }}
            onClick={() => {
              setEditOpen(false);
            }}
          >
            Back
          </Button>
        </Paper>
      </SwipeableDrawer>
      <SwipeableDrawer
        open={studyOpen}
        variant="persistent"
        onClose={() => {
          setStudyOpen(false);
        }}
        onOpen={() => {
          setStudyOpen(true);
        }}
        sx={{
          width: props.drawerWidth,
          "& .MuiDrawer-paper": {
            width: props.drawerWidth,
          },
        }}
        anchor="right"
        slotProps={{
          paper: {
            sx: {
              marginTop: "env(safe-area-inset-top)",
              marginBottom: "env(safe-area-inset-bottom)",
            },
          },
        }}
      >
        <Paper
          elevation={4}
          sx={{
            height:
              "calc((100vh - env(safe-area-inset-top)) - env(safe-area-inset-bottom))",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <List sx={{ overflow: "scroll", width: "100%" }}>
            {props.studies.map((e, i) => (
              <ListItem key={JSON.stringify([e, i])} disablePadding>
                <ListItemButton
                  onClick={() => {
                    commands
                      .loadStudy(e)
                      //.then(() => invoke("get_config"))
                      .then(() => commands.getData())
                      .then((data) => {
                        c_setData(data);
                        setClick(data, c_cursorDispatch);
                        c_setStudyPhase("Guess");
                        //c_setConfig(config);
                        c_setPhase("Study");
                      })
                      .then(() => commands.getExerciseNumber())
                      .then((en) => c_setExerciseNumber(en))
                      .catch((e) => c_handleError(e));
                  }}
                >
                  <ListItemText primary={e} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
          <Button
            variant="contained"
            sx={{ margin: "20px", width: "calc(100% - 40px)" }}
            onClick={() => {
              setStudyOpen(false);
            }}
          >
            Back
          </Button>
        </Paper>
      </SwipeableDrawer>

      <Dialog
        open={deleteDialogOpen}
        fullWidth
        maxWidth="xs"
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete &quot;{fileToDelete}&quot;?
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
              commands
                .deleteExerciseFile(fileToDelete)

                .then(async () => {
                  return commands.listExercises().then((a) => {
                    props.setExercises(a);
                    setDeleteDialogOpen(false);
                    props.setConfigSignal(props.configSignal + 1);
                  });
                })
                .catch((e) => c_handleError(e));
            }}
          >
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default Menu;
