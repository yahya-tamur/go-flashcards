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

const Menu = () => {
  const {
    c_editingPhase,
    c_studyPhase,
    c_data,
    c_setData,
    c_cursor,
    c_setStudyPhase,
    c_feedback,
    c_setFeedback,
  } = useContext(AppContext);

  const [history, setHistory] = useState<string>("");

  // decided to try this instead of setting history in 3? separate places in board
  useEffect(() => {
    const f = async () => {
      await commands.getHistory().then((h) => {
        setHistory(h.map((t) => (t ? "🌟" : "❌")).join(""));
      });
    };
    f();
  }, [c_studyPhase, c_data]);

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
          <Box sx={{ marginBottom: "20px" }}>{c_cursor} to play.</Box>
          <Box>
            <Button
              onClick={async () => {
                const contextdata = c_data;
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
                    c_setData(data);
                    studyStep(
                      data,
                      c_setData,
                      c_setFeedback,
                      c_setStudyPhase,
                      c_cursor,
                    );
                  });
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
                    c_setData(data);
                    c_setStudyPhase(StudyPhaseType.Guess);
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
                    c_setData(data);
                    c_setStudyPhase(StudyPhaseType.View);
                    c_setFeedback("");
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
            justifyContent: "space-around",
            alignItems: "center",
          }}
        >
          <Box>{c_feedback}</Box>

          <Box>{history}</Box>
        </Box>
      ) : c_studyPhase === "Edit" ? (
        c_editingPhase === "Initialize" ? (
          <InitializeMenu />
        ) : (
          <MakeTreeMenu />
        )
      ) : (
        <>unknown phase {c_studyPhase}</>
      )}
    </Paper>
  );
};

export default Menu;
