const { useState, useContext } = await import("react");

const ClearIcon = (await import("@mui/icons-material/Clear")).default;
const DownloadIcon = (await import("@mui/icons-material/Download")).default;
const FileUploadIcon = (await import("@mui/icons-material/FileUpload")).default;
const KeyboardArrowDownOutlinedIcon = (
  await import("@mui/icons-material/KeyboardArrowDownOutlined")
).default;
const KeyboardArrowRightOutlinedIcon = (
  await import("@mui/icons-material/KeyboardArrowRightOutlined")
).default;

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const ButtonGroup = (await import("@mui/material/ButtonGroup")).default;
const Dialog = (await import("@mui/material/Dialog")).default;
const DialogActions = (await import("@mui/material/DialogActions")).default;
const DialogContent = (await import("@mui/material/DialogContent")).default;
const DialogContentText = (await import("@mui/material/DialogContentText"))
  .default;
const Paper = (await import("@mui/material/Paper")).default;
const Tooltip = (await import("@mui/material/Tooltip")).default;

await import("../App.css");

await import("../AppContext");
const AppContext = (await import("../AppContext")).default;
const { CursorType, EditingPhaseType, PhaseType } =
  await import("../AppContext");
const { commands } = await import("../bindings");

const NumberSpinner = (await import("../components/NumberSpinner")).default;

const TopBar = () => {
  const {
    c_data,
    c_setData,
    c_setCursor,
    c_setNextLabel,
    c_setPhase,
    c_setEditingPhase,
  } = useContext(AppContext);
  const [dialogContent, setDialogContent] = useState("");
  const [savedMsgOpen, setSavedMsgOpen] = useState(false);
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
      <Box
        sx={{
          height: "100%",
          minHeight: 0,
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          overflow: "scroll",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <Button
          variant="outlined"
          color="button"
          sx={{ height: "40px" }}
          onClick={async () => {
            commands.mainMenu().then(() => {
              c_setPhase(PhaseType.Main);
              //c_setConfig(null);
              c_setNextLabel("A");
            });
          }}
        >
          Exit
        </Button>
        <NumberSpinner
          size="small"
          value={(c_data?.current_location ?? 0) + 1}
          min={1}
          max={c_data?.max_location ?? 1}
          onValueChange={async (v) => {
            if (c_data === null || v === null) {
              return;
            }
            commands
              .jumpToExercise(v - 1)
              .then(() => commands.getData())
              .then((data) => {
                c_setData(data);
                if (data.table.length === 1 && data.table[0].length === 1) {
                  c_setEditingPhase(EditingPhaseType.Initialize);
                } else {
                  c_setEditingPhase(EditingPhaseType.MakeTree);
                }
              });
          }}
        />

        <ButtonGroup variant="outlined" size="small" color="gray">
          <Tooltip title="delete exercise">
            <Button
              size="small"
              variant="outlined"
              color="button"
              sx={{ height: "40px" }}
              onClick={async () => {
                commands
                  .deleteExercise()
                  .then(() => commands.getData())
                  .then((data) => {
                    if (data.table.length === 1 && data.table[0].length === 1) {
                      c_setEditingPhase(EditingPhaseType.Initialize);
                    } else {
                      c_setEditingPhase(EditingPhaseType.MakeTree);
                    }
                    c_setData(data);
                  });
              }}
            >
              <ClearIcon color="error" />
            </Button>
          </Tooltip>
          <Tooltip title="insert new exercise">
            <Button
              variant="outlined"
              color="button"
              sx={{ height: "40px" }}
              onClick={async () => {
                commands
                  .newExercise(true)
                  .then(() => commands.getData())
                  .then((data) => {
                    c_setData(data);
                    c_setCursor(CursorType.Black);
                    c_setEditingPhase(EditingPhaseType.Initialize);
                  });
              }}
            >
              <KeyboardArrowDownOutlinedIcon />
            </Button>
          </Tooltip>

          <Tooltip title="new exercise">
            <Button
              variant="outlined"
              color="button"
              sx={{ height: "40px" }}
              onClick={async () => {
                commands
                  .newExercise(false)
                  .then(() => commands.getData())
                  .then((data) => {
                    c_setData(data);
                    c_setCursor(CursorType.Black);
                    c_setEditingPhase(EditingPhaseType.Initialize);
                  });
              }}
            >
              <KeyboardArrowRightOutlinedIcon />
            </Button>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup>
          <Tooltip title="import one from sgf">
            <span>
              <Button
                sx={{ height: "40px" }}
                variant="outlined"
                color="button"
                onClick={async () => {
                  commands
                    .importSgf()
                    .then(() => commands.getData())
                    .then((data) => {
                      if (
                        data.table.length === 1 &&
                        data.table[0].length === 1
                      ) {
                        c_setEditingPhase(EditingPhaseType.Initialize);
                      } else {
                        c_setEditingPhase(EditingPhaseType.MakeTree);
                      }
                      c_setData(data);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                }}
              >
                <DownloadIcon />
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="export all to sgf">
            <span>
              {" "}
              <Button
                sx={{ height: "40px" }}
                variant="outlined"
                color="button"
                onClick={async () => {
                  commands
                    .exportSgf()
                    .then(() => {
                      setDialogContent("Exported to sgf, under app_data/sgf.");
                      setSavedMsgOpen(true);
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                }}
              >
                <FileUploadIcon />
              </Button>
            </span>
          </Tooltip>
        </ButtonGroup>
        <Button
          size="small"
          variant="outlined"
          color="button"
          sx={{ height: "40px" }}
          onClick={async () => {
            commands.saveExercises().then(() => {
              setDialogContent("Saved.");
              setSavedMsgOpen(true);
            });
          }}
        >
          Save
        </Button>
      </Box>
      <Dialog
        open={savedMsgOpen}
        fullWidth
        maxWidth="xs"
        onClose={() => setSavedMsgOpen(false)}
      >
        <DialogContent>
          <DialogContentText>{dialogContent}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button variant="contained" onClick={() => setSavedMsgOpen(false)}>
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default TopBar;
