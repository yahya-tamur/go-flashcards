const { EditingPhaseType, PhaseType, StudyPhaseType } =
  await import("../AppContext");
const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { commands } = await import("../bindings");

const NumberSpinner = (await import("../components/NumberSpinner")).default;

export default () => {
  let context = useContext(AppContext);
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
            commands.mainMenu().then(() => {
              context.setPhase(PhaseType.Main);
              //context.setConfig(null);
            });
          }}
        >
          Exit
        </Button>
        <NumberSpinner
          label="Exercise"
          disabled={["Guess", "UnknownGuess"].some(
            (a) => a === context.studyPhase,
          )}
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
                context.setFeedback("");
              });
          }}
        />
        {context.studyPhase === "Edit" ? (
          <Button
            variant="contained"
            sx={{ height: "40px" }}
            onClick={async () => {
              commands
                .stopEditing(true)
                .then(() => commands.getData())
                .then((data) => {
                  context.setData(data);
                  //context.setExerciseColor(
                  //  data.color === "Black" ? CursorType.White : CursorType.Black,
                  //);
                  context.setStudyPhase(StudyPhaseType.View);
                  context.setNextLabel("A");
                })
                .catch((e) => {
                  console.log(e);
                });
            }}
          >
            Save
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={context.studyPhase !== "View"}
            sx={{ height: "40px" }}
            onClick={async () => {
              context.setStudyPhase(StudyPhaseType.Edit);
              context.setEditingPhase(EditingPhaseType.MakeTree);
              context.setFeedback("");
            }}
          >
            Edit
          </Button>
        )}
        {context.studyPhase === "Edit" ? (
          <Button
            variant="contained"
            sx={{ height: "40px" }}
            onClick={async () => {
              commands
                .stopEditing(false)
                .then(() => commands.getData())
                .then((data) => {
                  context.setData(data);
                  //context.setExerciseColor(
                  //data.color === "Black" ? "White" : "Black",
                  //);
                  context.setStudyPhase(StudyPhaseType.View);
                  context.setNextLabel("A");
                })
                .catch((e) => {
                  console.log(e);
                });
            }}
          >
            Discard
          </Button>
        ) : (
          <Button
            variant="contained"
            disabled={["Guess", "UnknownGuess"].some(
              (a) => a === context.studyPhase,
            )}
            sx={{ height: "40px" }}
            onClick={async () => {
              commands
                .nextExercise()
                .then(() => commands.getData())
                .then((data) => {
                  context.setData(data);
                  //context.setExerciseColor(
                  //data.color === "Black" ? "White" : "Black",
                  //);
                  context.setStudyPhase(StudyPhaseType.Guess);
                })
                .catch((e) => {
                  console.log(e);
                });
            }}
          >
            Next
          </Button>
        )}
      </Box>
    </Paper>
  );
};
