const { useEffect, useState, useRef, useContext } = await import("react");
const board_image = (await import("../assets/oak.jpg")).default;
const black_image = (await import("../assets/black_night.png")).default;
const white_image = (await import("../assets/white_anime.png")).default;
const { invoke } = await import("@tauri-apps/api/core");
const { createSVGElement } = await import("../utils");

await import("../App.css");

const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Box = (await import("@mui/material/Box")).default;
const TextField = (await import("@mui/material/TextField")).default;
const Slider = (await import("@mui/material/Slider")).default;
const ClearIcon = (await import("@mui/icons-material/Clear")).default;

const Dialog = (await import("@mui/material/Dialog")).default;
const DialogActions = (await import("@mui/material/DialogActions")).default;
const DialogContent = (await import("@mui/material/DialogContent")).default;
const DialogContentText = (await import("@mui/material/DialogContentText"))
  .default;
const DialogTitle = (await import("@mui/material/DialogTitle")).default;

const NumberSpinner = (await import("../components/NumberSpinner")).default;

const AppContext = (await import("../AppContext")).default;

const { Avatar, Icon, IconButton, SvgIcon } = await import("@mui/material");
const { createSvgIcon } = await import("@mui/material/utils");

export default (props) => {
  let context = useContext(AppContext);
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
          onValueChange={async (v, e) => {
            if (context.data === null || context.data === undefined) {
              return;
            }
            invoke("jump_to_exercise", { index: v - 1 })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setFeedback("");
                context.setCursor(data.color === "Black" ? "White" : "Black");
              });
          }}
        />
        {context.studyPhase === "Edit" ? (
          <Button
            variant="contained"
            sx={{ height: "40px" }}
            onClick={async () => {
              invoke("stop_editing", { save: true })
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setCursor(data.color === "Black" ? "White" : "Black");
                  context.setExerciseColor(
                    data.color === "Black" ? "White" : "Black",
                  );
                  context.setStudyPhase("View");
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
              context.setStudyPhase("Edit");
              context.setEditingPhase("MakeTree");
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
              invoke("stop_editing", { save: false })
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setCursor(data.color === "Black" ? "White" : "Black");
                  context.setExerciseColor(
                    data.color === "Black" ? "White" : "Black",
                  );
                  context.setStudyPhase("View");
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
              invoke("next_exercise")
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setCursor(data.color === "Black" ? "White" : "Black");
                  context.setExerciseColor(
                    data.color === "Black" ? "White" : "Black",
                  );
                  context.setStudyPhase("Guess");
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
