import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";

import {
  useCursorContext,
  useDataContext,
  useDispatchContext,
  useFeedbackContext,
  usePhaseContext,
} from "@/AppContext";
import { commands } from "@/bindings";
import { cursorColor, setClick, studyStep } from "@/utils";

import ProgressBar from "@/components/ProgressBar";

import EditingMenu from "@/papers/Editing/Menu";

const Menu = () => {
  const { c_feedback, c_answerMessage } = useFeedbackContext();
  const { c_studyPhase } = usePhaseContext();
  const { c_cursor } = useCursorContext();

  const { c_data } = useDataContext();
  const {
    c_setData,
    c_cursorDispatch,
    c_setStudyPhase,
    c_setFeedback,
    c_handleError,
    c_setAnswerMessage,
  } = useDispatchContext();

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
        justifyContent: "space-around",
      }}
      elevation={7}
    >
      {c_studyPhase === "Guess" ? (
        <Box
          sx={{
            margin: "20px",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-start",
            justifyContent: "start",
          }}
        >
          <Box sx={{ marginBottom: "20px" }}>
            {cursorColor(c_cursor)} to play.
          </Box>
          <Box>
            <Button
              onClick={async () => {
                const contextdata = c_data;
                if (contextdata === null) {
                  return;
                }
                commands
                  .play(null)
                  .then(() => commands.getData())
                  .then((data) => {
                    c_setData(data);
                    return studyStep(
                      data,
                      c_setData,
                      c_setFeedback,
                      c_setStudyPhase,
                      c_setAnswerMessage,
                    );
                  })
                  .catch((e) => c_handleError(e));
              }}
              variant="contained"
            >
              Pass
            </Button>
          </Box>
        </Box>
      ) : c_studyPhase === "UnknownGuess" ? (
        <>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            Unknown Opponent Response.
          </Box>

          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-around",
            }}
          >
            <Button
              variant="contained"
              onClick={() => {
                const contextdata = c_data;
                if (contextdata === null) {
                  return;
                }
                commands
                  .undo()
                  .then(() => commands.getData())
                  .then((data) => {
                    c_setData(data);
                    setClick(data, c_cursorDispatch);
                    c_setStudyPhase("Guess");
                  })
                  .catch((e) => c_handleError(e));
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              onClick={() => {
                commands
                  .getData()
                  .then((data) => {
                    c_setData(data);
                    c_setStudyPhase("View");
                    c_setFeedback("");
                  })
                  .catch((e) => c_handleError(e));
              }}
            >
              View Problem
            </Button>
          </Box>
        </>
      ) : c_studyPhase === "View" ? (
        <Box
          style={{
            height: "100%",
            maxHeight: "100%",
            minHeight: 0,
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "flex-start",
            alignItems: "center",
            gap: "20px",
            paddingTop: "20px",
          }}
        >
          <Box>{c_feedback}</Box>
          <ProgressBar />
          <Box>{c_answerMessage}</Box>
        </Box>
      ) : (
        <EditingMenu />
      )}
    </Paper>
  );
};

export default Menu;
