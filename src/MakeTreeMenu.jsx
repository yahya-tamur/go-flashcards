const { useEffect, useState, useRef, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const { withTheme } = await import("@emotion/react");

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

await import("./App.css");

const AppContext = (await import("./AppContext")).default;

const black_image = (await import("./assets/black_night.png")).default;
const circle_icon = (await import("./assets/circle.svg")).default;
const cross_icon = (await import("./assets/cross.svg")).default;
const delete_mark_icon = (await import("./assets/delete_mark.svg")).default;
const board_image = (await import("./assets/oak.jpg")).default;
const square_icon = (await import("./assets/square.svg")).default;
const triangle_icon = (await import("./assets/triangle.svg")).default;
const white_image = (await import("./assets/white_anime.png")).default;

const BoardSlider = (await import("./components/BoardSlider")).default;
const DragLabelGroup = (await import("./components/DragLabelGroup")).default;
const NumberSpinner = (await import("./components/NumberSpinner")).default;
const PlaceStoneGroup = (await import("./components/PlaceStoneGroup")).default;
const RectLabelGroup = (await import("./components/RectLabelGroup")).default;

export default (props) => {
  let context = useContext(AppContext);
  const [variant, setVariant] = useState("None");

  // i think the array access interfered with state ?

  useEffect(() => {
    setVariant(context.data?.variant ?? "None");
  }, [context.data]);

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
        justifyContent: "start",
        gap: "20px",
      }}
      elevation={7}
    >
      <Box
        sx={{
          flex: "0 1 auto",
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <BoardSlider side={"row"} force={false} />
        <BoardSlider side={"column"} force={false} />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <TextField
          sx={{ width: "60px" }}
          size="small"
          variant="standard"
          value={context.nextLabel}
          onChange={(e) => {
            context.setNextLabel(e.target.value);
            context.setCursor("Label");
          }}
          onFocus={(e) => {
            context.setCursor("Label");
          }}
        ></TextField>
        <DragLabelGroup />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-evenly",
          alignItems: "center",
        }}
      >
        <ToggleButtonGroup
          value={context.cursor}
          color="toggle"
          exclusive
          size="small"
          onChange={(e, newValue) => {
            if (newValue === null) {
              context.setCursor(
                context.data.color === "Black" ? "White" : "Black",
              );
            } else {
              context.setCursor(newValue);
            }
          }}
        >
          <ToggleButton
            value={context.data.color === "Black" ? "White" : "Black"}
          >
            <img
              src={context.data.color === "Black" ? white_image : black_image}
              style={{ height: "25px", width: "25px" }}
            />
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          sx={{ height: "40px" }}
          onClick={async () => {
            invoke("play", {
              color: context.cursor,
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setCursor(data.color === "Black" ? "White" : "Black");
              });
          }}
          color="button"
          variant="outlined"
        >
          Pass
        </Button>

        <ToggleButtonGroup
          color="toggle"
          value={variant}
          exclusive
          size="small"
          onChange={async (_e, newValue) => {
            setVariant(newValue);
            if (newValue === null) {
              newValue = "None";
            }
            invoke("set_variant", { variant: newValue })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
              });
          }}
        >
          <ToggleButton value="Correct">
            <CheckIcon />
          </ToggleButton>
          <ToggleButton value="Incorrect">
            <ClearIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <RectLabelGroup />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-evenly",
        }}
      >
        <Button
          onClick={async () => {
            invoke("collapse_tree")
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setEditingPhase("Initialize");
                context.setCursor("Black");
              });
          }}
          color="button"
          variant="outlined"
        >
          Collapse Tree
        </Button>
        <Button
          color="button"
          variant="outlined"
          sx={{ height: "100%" }}
          disabled={
            (context.data?.row ?? 0) == 0 && (context.data?.col ?? 0) == 0
          }
          onClick={async () => {
            invoke("delete_branch")
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setCursor(data.color === "Black" ? "White" : "Black");
                context.setData(data);
              });
          }}
        >
          Delete Branch
        </Button>
      </Box>
    </Paper>
  );
};
