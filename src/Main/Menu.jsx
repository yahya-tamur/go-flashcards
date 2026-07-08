const { useEffect, useState, useRef, useContext } = await import("react");
const board_image = (await import("../assets/oak.jpg")).default;
const black_image = (await import("../assets/black_night.png")).default;
const white_image = (await import("../assets/white_anime.png")).default;
const { invoke } = await import("@tauri-apps/api/core");
const { createSVGElement } = await import("../utils");

const AppContext = (await import("../AppContext")).default;
await import("../App.css");

const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Box = (await import("@mui/material/Box")).default;
const List = (await import("@mui/material/List")).default;
const ListItem = (await import("@mui/material/ListItem")).default;
const ListItemButton = (await import("@mui/material/ListItemButton")).default;
const ListItemIcon = (await import("@mui/material/ListItemIcon")).default;
const ListItemText = (await import("@mui/material/ListItemText")).default;
const Divider = (await import("@mui/material/Divider")).default;
const InboxIcon = (await import("@mui/icons-material/Inbox")).default;
const DraftsIcon = (await import("@mui/icons-material/Drafts")).default;
const InputBase = (await import("@mui/material/InputBase")).default;
const IconButton = (await import("@mui/material/IconButton")).default;
const ClearIcon = (await import("@mui/icons-material/Clear")).default;
const TextField = (await import("@mui/material/TextField")).default;
const SearchIcon = (await import("@mui/icons-material/Search")).default;
const DirectionsIcon = (await import("@mui/icons-material/Directions")).default;

const Dialog = (await import("@mui/material/Dialog")).default;
const DialogActions = (await import("@mui/material/DialogActions")).default;
const DialogContent = (await import("@mui/material/DialogContent")).default;
const DialogContentText = (await import("@mui/material/DialogContentText"))
  .default;
const DialogTitle = (await import("@mui/material/DialogTitle")).default;

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
