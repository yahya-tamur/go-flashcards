const { useContext } = await import("react");

const EditingMenu = (await import("@/papers/Editing/Menu")).default;

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { commands } = await import("../bindings");
const { cursorColor, handleError, setClick } = await import("../utils");
const { studyStep } = await import("../utils");

const ProgressBar = (await import("../components/ProgressBar")).default;

const Menu = () => {
  const {
    c_studyPhase,
    c_data,
    c_setData,
    c_cursor,
    c_setStudyPhase,
    c_feedback,
    c_setFeedback,
    c_answerMessage,
    c_setAnswerMessage,
    c_cursorDispatch,
    c_setErrorMessage,
    c_setErrorWindowOpen,
  } = useContext(AppContext);

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
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
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
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
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
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
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
