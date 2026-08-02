import { useState } from "react";

import ClearIcon from "@mui/icons-material/Clear";
import DownloadIcon from "@mui/icons-material/Download";
import FileUploadIcon from "@mui/icons-material/FileUpload";
import KeyboardArrowDownOutlinedIcon from "@mui/icons-material/KeyboardArrowDownOutlined";
import KeyboardArrowRightOutlinedIcon from "@mui/icons-material/KeyboardArrowRightOutlined";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import Paper from "@mui/material/Paper";
import Tooltip from "@mui/material/Tooltip";

import {
  useDataContext,
  useDispatchContext,
  useExerciseNumberContext,
} from "@/AppContext";
import { commands } from "@/bindings";
import { editNewExercise } from "@/utils";

import NumberSpinner from "@/components/NumberSpinner";

import ExitButton from "./components/ExitButton";

const TopBar = () => {
  const { c_exerciseNumber } = useExerciseNumberContext();

  const { c_data } = useDataContext();
  const {
    c_setData,
    c_cursorDispatch,
    c_setExerciseNumber,
    c_setEditingPhase,
    c_handleError,
  } = useDispatchContext();

  const [dialogContent, setDialogContent] = useState("");
  const [savedMsgOpen, setSavedMsgOpen] = useState(false);

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
        <ExitButton />
        <NumberSpinner
          size="small"
          value={c_exerciseNumber[0]}
          min={1}
          max={c_exerciseNumber[1]}
          onValueChange={async (v) => {
            if (c_data === null || v === null) {
              return;
            }
            commands
              .jumpToExercise(v - 1)
              .then(() => commands.getData())
              .then((data) => {
                editNewExercise(data, c_cursorDispatch, c_setEditingPhase);
                c_setData(data);
              })
              .then(() => commands.getExerciseNumber())
              .then((e) => c_setExerciseNumber(e))
              .catch((e) => c_handleError(e));
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
                    editNewExercise(data, c_cursorDispatch, c_setEditingPhase);
                    c_setData(data);
                  })
                  .then(() => commands.getExerciseNumber())
                  .then((e) => c_setExerciseNumber(e))
                  .catch((e) => c_handleError(e));
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
                    editNewExercise(data, c_cursorDispatch, c_setEditingPhase);
                    c_setData(data);
                  })
                  .then(() => commands.getExerciseNumber())
                  .then((e) => c_setExerciseNumber(e))
                  .catch((e) => c_handleError(e));
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
                    editNewExercise(data, c_cursorDispatch, c_setEditingPhase);
                    c_setData(data);
                  })
                  .then(() => commands.getExerciseNumber())
                  .then((e) => c_setExerciseNumber(e))
                  .catch((e) => c_handleError(e));
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
                      editNewExercise(
                        data,
                        c_cursorDispatch,
                        c_setEditingPhase,
                      );
                      c_setData(data);
                    })
                    .then(() => commands.getExerciseNumber())
                    .then((e) => c_setExerciseNumber(e))
                    .catch((e) => c_handleError(e));
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
                      setDialogContent("Export complete.");
                      setSavedMsgOpen(true);
                    })
                    .catch((e) => c_handleError(e));
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
            commands
              .saveExercises()
              .then(() => {
                setDialogContent("Saved.");
                setSavedMsgOpen(true);
              })
              .catch((e) => c_handleError(e));
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
