const { useState, useContext } = await import("react");

const ClearIcon = (await import("@mui/icons-material/Clear")).default;
const DownloadIcon = (await import("@mui/icons-material/Download")).default;
const FileUploadIcon = (await import("@mui/icons-material/FileUpload")).default;

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

const { CursorType, EditingPhaseType, PhaseType } =
  await import("../AppContext");
const { commands } = await import("../bindings");

const KeyboardArrowDownOutlinedIcon = (
  await import("@mui/icons-material/KeyboardArrowDownOutlined")
).default;
const KeyboardArrowRightOutlinedIcon = (
  await import("@mui/icons-material/KeyboardArrowRightOutlined")
).default;

const NumberSpinner = (await import("../components/NumberSpinner")).default;

const AppContext = (await import("../AppContext")).default;

export default () => {
  let context = useContext(AppContext);
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
              context.setPhase(PhaseType.Main);
              //context.setConfig(null);
              context.setNextLabel("A");
            });
          }}
        >
          Exit
        </Button>
        <NumberSpinner
          label="Exercise"
          size="small"
          value={(context.data?.current_location ?? 0) + 1}
          min={1}
          max={context.data?.max_location ?? 1}
          onValueChange={async (v) => {
            if (context.data === null || v === null) {
              return;
            }
            commands
              .jumpToExercise(v - 1)
              .then(() => commands.getData())
              .then((data) => {
                context.setData(data);
                if (data.table.length === 1 && data.table[0].length === 1) {
                  context.setEditingPhase(EditingPhaseType.Initialize);
                } else {
                  context.setEditingPhase(EditingPhaseType.MakeTree);
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
                      context.setEditingPhase(EditingPhaseType.Initialize);
                    } else {
                      context.setEditingPhase(EditingPhaseType.MakeTree);
                    }
                    context.setData(data);
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
                    context.setData(data);
                    context.setCursor(CursorType.Black);
                    context.setEditingPhase(EditingPhaseType.Initialize);
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
                    context.setData(data);
                    context.setCursor(CursorType.Black);
                    context.setEditingPhase(EditingPhaseType.Initialize);
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
                        context.setEditingPhase(EditingPhaseType.Initialize);
                      } else {
                        context.setEditingPhase(EditingPhaseType.MakeTree);
                      }
                      context.setData(data);
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
