const { useEffect, useState, useRef, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const CheckIcon = (await import("@mui/icons-material/Check")).default;
const ClearIcon = (await import("@mui/icons-material/Clear")).default;

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Dialog = (await import("@mui/material/Dialog")).default;
const DialogActions = (await import("@mui/material/DialogActions")).default;
const DialogContent = (await import("@mui/material/DialogContent")).default;
const DialogContentText = (await import("@mui/material/DialogContentText"))
  .default;
const DialogTitle = (await import("@mui/material/DialogTitle")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Slider = (await import("@mui/material/Slider")).default;
const TextField = (await import("@mui/material/TextField")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const InitializeMenu = (await import("../InitializeMenu")).default;
const MakeTreeMenu = (await import("../MakeTreeMenu")).default;

const black_image = (await import("../assets/black_night.png")).default;
const board_image = (await import("../assets/oak.jpg")).default;
const white_image = (await import("../assets/white_anime.png")).default;

const NumberSpinner = (await import("../components/NumberSpinner")).default;

export default (props) => {
  let context = useContext(AppContext);

  let [history, setHistory] = useState([]);

  // decided to try this instead of setting history in 3? separate places in board
  useEffect(() => {
    let f = async () => {
      await invoke("get_history").then((h) => {
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
          <Box sx={{ marginBottom: "20px" }}>
            {context.exerciseColor} to play.
          </Box>
          <Box>
            <Button
              onClick={async () => {
                invoke("play", {
                  color: context.cursor,
                })
                  .then(() => invoke("get_data"))
                  .then((data) => {
                    context.setData(data);
                    context.setCursor(
                      data.color === "Black" ? "White" : "Black",
                    );
                    switch (data.variant) {
                      case "Correct":
                        invoke("answer", { correct: true })
                          .then(() => invoke("get_data"))
                          .then((data) => {
                            context.setData(data);
                            context.setFeedback("Correct");
                            context.setStudyPhase("View");
                          });
                        break;
                      case "Incorrect":
                        invoke("answer", { correct: false })
                          .then(() => invoke("get_data"))
                          .then((data) => {
                            context.setData(data);
                            context.setFeedback("Incorrect");
                            context.setStudyPhase("View");
                          });
                        break;
                      case "New":
                        if (context.cursor === context.exerciseColor) {
                          invoke("answer", { correct: false })
                            .then(() => invoke("get_data"))
                            .then((data) => {
                              context.setData(data);
                              context.setFeedback("Incorrect");
                              context.setStudyPhase("View");
                            });
                        } else {
                          context.setStudyPhase("UnknownGuess");
                        }

                        break;
                      default:
                        break;
                    }
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
                let [row, col] = [context.data.row, context.data.col];
                // todo: why is this in the frontend??
                do {
                  col -= 1;
                  while (context.data.table[row][col] === null) {
                    row -= 1;
                  }
                } while (context.data.table[row][col].variant === "New");

                invoke("jump", { r: row, c: col })
                  .then(() => invoke("get_data"))
                  .then((data) => {
                    context.setData(data);
                    context.setCursor(
                      data.color === "Black" ? "White" : "Black",
                    );
                    context.setStudyPhase("Guess");
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
                invoke("get_data")
                  .then((data) => {
                    context.setData(data);
                    context.setCursor(
                      data.color === "Black" ? "White" : "Black",
                    );
                    context.setStudyPhase("View");
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
