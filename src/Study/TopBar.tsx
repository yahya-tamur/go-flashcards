const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;

await import("../App.css");

await import("../AppContext");
const AppContext = (await import("../AppContext")).default;
const { commands } = await import("../bindings");
const { handleError, setClick } = await import("../utils");

const NumberSpinner = (await import("../components/NumberSpinner")).default;

const TopBar = () => {
  const {
    c_studyPhase,
    c_data,
    c_setData,
    c_exerciseNumber,
    c_setExerciseNumber,
    c_setNextLabel,
    c_setStudyPhase,
    c_setPhase,
    c_setFeedback,
    c_cursorDispatch,
    c_setEditingPhase,
    c_setErrorMessage,
    c_setErrorWindowOpen,
  } = useContext(AppContext);
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
              .catch((e) =>
                handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
              );
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
              .catch((e) =>
                handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
              );
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
                .catch((e) =>
                  handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                );
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
                .catch((e) =>
                  handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                );
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
                .catch((e) =>
                  handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                );
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
