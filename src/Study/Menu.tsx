const { useEffect, useState, useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { StudyPhaseType } = await import("../AppContext");
const InitializeMenu = (await import("../InitializeMenu")).default;
const MakeTreeMenu = (await import("../MakeTreeMenu")).default;
const { commands } = await import("../bindings");
const { studyStep } = await import("../utils");

export default () => {
  let context = useContext(AppContext);

  let [history, setHistory] = useState<string>("");

  // decided to try this instead of setting history in 3? separate places in board
  useEffect(() => {
    let f = async () => {
      await commands.getHistory().then((h) => {
        setHistory(h.map((t) => (t ? "🌟" : "❌")).join(""));
      });
    };
    f();
  }, [context.studyPhase, context.data]);

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
      {context.studyPhase === "Guess" ? (
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
          <Box sx={{ marginBottom: "20px" }}>{context.cursor} to play.</Box>
          <Box>
            <Button
              onClick={async () => {
                let contextdata = context.data;
                if (contextdata === null) {
                  return;
                }
                commands
                  .play(
                    null,
                    contextdata.table[contextdata.row][contextdata.col]
                      ?.color === "Black"
                      ? "White"
                      : "Black",
                  )
                  .then(() => commands.getData())
                  .then((data) => {
                    context.setData(data);
                    studyStep(data, context);
                  });
              }}
              variant="contained"
            >
              Pass
            </Button>
          </Box>
        </Box>
      ) : context.studyPhase === "UnknownGuess" ? (
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
                let contextdata = context.data;
                if (contextdata === null) {
                  return;
                }

                let [row, col] = [contextdata.row, contextdata.col];
                // todo: why is this in the frontend??
                do {
                  col -= 1;
                  while (contextdata.table[row][col] === null) {
                    row -= 1;
                  }
                } while (contextdata.table[row][col]?.variant === "New");

                commands
                  .jump(row, col)
                  .then(() => commands.getData())
                  .then((data) => {
                    context.setData(data);
                    context.setStudyPhase(StudyPhaseType.Guess);
                  })
                  .catch((e) => {
                    console.log(e);
                  });
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
                    context.setData(data);
                    context.setStudyPhase(StudyPhaseType.View);
                    context.setFeedback("");
                  })
                  .catch((e) => {
                    console.log(e);
                  });
              }}
            >
              View Problem
            </Button>
          </Box>
        </>
      ) : context.studyPhase === "View" ? (
        <Box
          style={{
            height: "100%",
            maxHeight: "100%",
            minHeight: 0,
            width: "100%",
            maxWidth: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box>{context.feedback}</Box>

          <Box>{history}</Box>
        </Box>
      ) : context.studyPhase === "Edit" ? (
        context.editingPhase === "Initialize" ? (
          <InitializeMenu />
        ) : (
          <MakeTreeMenu />
        )
      ) : (
        <>unknown phase {context.studyPhase}</>
      )}
    </Paper>
  );
};
