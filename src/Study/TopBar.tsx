import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

import {
  useDataContext,
  useDispatchContext,
  useExerciseNumberContext,
  usePhaseContext,
} from "@/AppContext";
import { commands } from "@/bindings";
import { setClick } from "@/utils";

import NumberSpinner from "@/components/NumberSpinner";

const TopBar = () => {
  const { c_exerciseNumber } = useExerciseNumberContext();
  const { c_studyPhase } = usePhaseContext();

  const { c_data } = useDataContext();
  const {
    c_setData,
    c_cursorDispatch,
    c_setStudyPhase,
    c_setFeedback,
    c_setExerciseNumber,
    c_setPhase,
    c_setEditingPhase,
    c_setNextLabel,
    c_handleError,
  } = useDispatchContext();

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
            commands
              .mainMenu()
              .then(() => {
                c_setPhase("Main");
                //c_setConfig(null);
                c_setNextLabel("A");
              })
              .catch((e) => c_handleError(e));
          }}
        >
          Exit
        </Button>
        <NumberSpinner
          disabled={["Guess", "UnknownGuess"].some((a) => a === c_studyPhase)}
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
                c_setData(data);
                c_setFeedback("");
              })
              .then(() => commands.getExerciseNumber())
              .then((e) => c_setExerciseNumber(e))
              .catch((e) => c_handleError(e));
          }}
        />
        {c_studyPhase === "Edit" ? (
          <Button
            variant="contained"
            sx={{ height: "40px" }}
            onClick={async () => {
              commands
                .stopEditing(true)
                .then(() => commands.getData())
                .then((data) => {
                  c_setData(data);
                  //c_setExerciseColor(
                  //  data.color === "Black" ? CursorType.White : CursorType.Black,
                  //);
                  c_setStudyPhase("View");
                  c_setNextLabel("A");
                })
                .catch((e) => c_handleError(e));
            }}
          >
            Save
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={c_studyPhase !== "View"}
            sx={{ height: "40px" }}
            onClick={async () => {
              c_setStudyPhase("Edit");
              c_setEditingPhase("MakeTree");
              c_setFeedback("");
            }}
          >
            Edit
          </Button>
        )}
        {c_studyPhase === "Edit" ? (
          <Button
            variant="contained"
            sx={{ height: "40px" }}
            onClick={async () => {
              commands
                .stopEditing(false)
                .then(() => commands.getData())
                .then((data) => {
                  c_setData(data);
                  //c_setExerciseColor(
                  //data.color === "Black" ? "White" : "Black",
                  //);
                  c_setStudyPhase("View");
                  c_setNextLabel("A");
                })
                .catch((e) => c_handleError(e));
            }}
          >
            Discard
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={["Guess", "UnknownGuess"].some((a) => a === c_studyPhase)}
            sx={{ height: "40px" }}
            onClick={async () => {
              commands
                .nextExercise()
                .then(() => commands.getData())
                .then((data) => {
                  c_setData(data);
                  //c_setExerciseColor(
                  //data.color === "Black" ? "White" : "Black",
                  //);
                  setClick(data, c_cursorDispatch);
                  c_setStudyPhase("Guess");
                })
                .then(() => commands.getExerciseNumber())
                .then((e) => c_setExerciseNumber(e))
                .catch((e) => c_handleError(e));
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Paper>
  );
};

export default TopBar;
