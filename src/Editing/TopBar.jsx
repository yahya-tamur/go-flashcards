const { useEffect, useState, useRef, useContext } = await import("react");
const board_image = (await import("../assets/oak.jpg")).default;
const black_image = (await import("../assets/black_night.png")).default;
const white_image = (await import("../assets/white_anime.png")).default;
const { invoke } = await import("@tauri-apps/api/core");
const { createSVGElement } = await import("../utils");

import "../App.css";

const Button = (await import("@mui/material/Button")).default;
const ButtonGroup = (await import("@mui/material/ButtonGroup")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Box = (await import("@mui/material/Box")).default;
const TextField = (await import("@mui/material/TextField")).default;
const Slider = (await import("@mui/material/Slider")).default;

const Dialog = (await import("@mui/material/Dialog")).default;
const DialogActions = (await import("@mui/material/DialogActions")).default;
const DialogContent = (await import("@mui/material/DialogContent")).default;
const DialogContentText = (await import("@mui/material/DialogContentText"))
  .default;
const DialogTitle = (await import("@mui/material/DialogTitle")).default;
const Tooltip = (await import("@mui/material/Tooltip")).default;

const ClearIcon = (await import("@mui/icons-material/Clear")).default;
const FileUploadIcon = (await import("@mui/icons-material/FileUpload")).default;
const DownloadIcon = (await import("@mui/icons-material/Download")).default;

const KeyboardArrowDownOutlinedIcon = (
  await import("@mui/icons-material/KeyboardArrowDownOutlined")
).default;
const KeyboardArrowRightOutlinedIcon = (
  await import("@mui/icons-material/KeyboardArrowRightOutlined")
).default;

const { ask } = await import("@tauri-apps/plugin-dialog");

const NumberSpinner = (await import("../components/NumberSpinner")).default;

const AppContext = (await import("../AppContext")).default;

const { Avatar, Icon, IconButton, SvgIcon } = await import("@mui/material");
const { createSvgIcon } = await import("@mui/material/utils");

export default (props) => {
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
          variant="contained"
          sx={{ height: "40px" }}
          onClick={async () => {
            invoke("main_menu").then(() => {
              context.setPhase("Main");
              context.setConfig(null);
              context.setNextLabel("A");
            });
          }}
        >
          Exit
        </Button>
        <NumberSpinner
          label="Exercise"
          disabled={context.editingPhase === "Initialize"}
          size="small"
          value={(context.data?.current_location ?? 0) + 1}
          min={1}
          max={context.data?.max_location ?? 1}
          onValueChange={async (v, e) => {
            if (context.data === null || context.data === undefined) {
              return;
            }
            invoke("jump_to_exercise", { index: v - 1 })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setCursor(data.color === "Black" ? "White" : "Black");
              });
          }}
        />

        <ButtonGroup variant="outlined" size="small" color="gray">
          <Tooltip title="delete exercise">
            <span>
              <Button
                size="small"
                sx={{ height: "40px" }}
                disabled={context.editingPhase === "Initialize"}
                onClick={async () => {
                  invoke("delete_exercise")
                    .then(() => invoke("get_data"))
                    .then((data) => {
                      if (
                        data.table.length === 1 &&
                        data.table[0].length === 1
                      ) {
                        context.setEditingPhase("Initialize");
                      } else {
                        context.setEditingPhase("MakeTree");
                      }
                      context.setData(data);
                      context.setCursor(
                        data.color === "Black" ? "White" : "Black",
                      );
                    });
                }}
              >
                <ClearIcon color="error" />
              </Button>
            </span>
          </Tooltip>
          <Tooltip title="insert new exercise">
            <span>
              <Button
                sx={{ height: "40px" }}
                disabled={context.editingPhase === "Initialize"}
                onClick={async () => {
                  invoke("new_exercise", { insert: true })
                    .then(() => invoke("get_data"))
                    .then((data) => {
                      context.setData(data);
                      context.setCursor("Black");
                      context.setEditingPhase("Initialize");
                    });
                }}
              >
                <KeyboardArrowDownOutlinedIcon />
              </Button>
            </span>
          </Tooltip>

          <Tooltip title="new exercise">
            <span>
              <Button
                sx={{ height: "40px" }}
                disabled={context.editingPhase === "Initialize"}
                onClick={async () => {
                  invoke("new_exercise", { insert: false })
                    .then(() => invoke("get_data"))
                    .then((data) => {
                      context.setData(data);
                      context.setCursor("Black");
                      context.setEditingPhase("Initialize");
                    });
                }}
              >
                <KeyboardArrowRightOutlinedIcon />
              </Button>
            </span>
          </Tooltip>
        </ButtonGroup>

        <ButtonGroup size="small">
          <Tooltip title="import one from sgf">
            <span>
              <IconButton
                variant="contained"
                onClick={async () => {
                  invoke("import_sgf")
                    .then(() => invoke("get_data"))
                    .then((data) => {
                      if (
                        data.table.length === 1 &&
                        data.table[0].length === 1
                      ) {
                        context.setEditingPhase("Initialize");
                      } else {
                        context.setEditingPhase("MakeTree");
                      }
                      context.setData(data);
                      context.setCursor(
                        data.color === "Black" ? "White" : "Black",
                      );
                    })
                    .catch((e) => {
                      console.log(e);
                    });
                }}
              >
                <DownloadIcon />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="export all to sgf">
            <span>
              {" "}
              <IconButton
                label="export"
                variant="contained"
                onClick={async () => {
                  invoke("export_sgf")
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
              </IconButton>
            </span>
          </Tooltip>
        </ButtonGroup>
        <Button
          size="small"
          disabled={context.editingPhase === "Initialize"}
          variant="contained"
          sx={{ height: "40px" }}
          onClick={async () => {
            invoke("save_exercises").then(() => {
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
