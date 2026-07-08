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
const { createSVGElement } = await import("./utils");

const black_image = (await import("./assets/black_night.png")).default;
const circle_icon = (await import("./assets/circle.svg")).default;
const cross_icon = (await import("./assets/cross.svg")).default;
const delete_mark_icon = (await import("./assets/delete_mark.svg")).default;
const board_image = (await import("./assets/oak.jpg")).default;
const square_icon = (await import("./assets/square.svg")).default;
const triangle_icon = (await import("./assets/triangle.svg")).default;
const white_image = (await import("./assets/white_anime.png")).default;

const BoardSlider = (await import("./components/BoardSlider")).default;
const NumberSpinner = (await import("./components/NumberSpinner")).default;

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
        justifyContent: "space-around",
      }}
      elevation={7}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
        }}
      >
        <Slider
          value={context.window.slice(0, 2)}
          marks
          onChange={(e) => {
            let [a, b] = e.target.value;
            if (a !== context.window[0] || b !== context.window[1]) {
              context.setWindow((window) => {
                let new_window = [...window];
                new_window[0] = a;
                new_window[1] = b;
                return new_window;
              });
            }
          }}
          onChangeCommitted={async (event, newValue) => {
            if (context.data === null || context.data === undefined) {
              return;
            }

            if (context.data.min_window !== null) {
              if (context.data.min_window[0] < context.window[0]) {
                context.setWindow((window) => {
                  let new_window = [...window];
                  new_window[0] = context.data.min_window[0];
                  return new_window;
                });
              }
              if (context.data.min_window[1] > context.window[1]) {
                context.setWindow((window) => {
                  let new_window = [...window];
                  new_window[1] = context.data.min_window[1];
                  return new_window;
                });
              }
            }

            if (
              context.window.every(
                (value, index) => context.data.window[index] === value,
              )
            ) {
              return;
            }
            await invoke("set_window", {
              window: context.window,
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                if (
                  data.window[0] !== context.window[0] ||
                  data.window[1] !== context.window[1]
                ) {
                  context.setData(data);
                }
              })
              .catch((e) => {
                console.log(e);
              });
          }}
          step={1}
          min={0}
          max={18}
          sx={{ margin: "5px 30px", width: "calc(100% - 60px)" }}
        />
        <BoardSlider side={"row"} force={false} />
        <BoardSlider side={"column"} force={false} />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-around",
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
          variant="contained"
        >
          Re-Initialize
        </Button>
        <Button
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
          variant="contained"
        >
          Pass
        </Button>

        <ToggleButtonGroup
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
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: "100%",
            height: "40px",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <Button
            variant="contained"
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
            Delete
          </Button>

          <ToggleButtonGroup
            value={context.cursor}
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
            <ToggleButton value="Triangle">
              <img
                src={triangle_icon}
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
            <ToggleButton value="Square">
              <img
                src={square_icon}
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
            <ToggleButton value="Circle">
              <img
                src={circle_icon}
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
            <ToggleButton value="Cross">
              <img src={cross_icon} style={{ height: "30px", width: "30px" }} />
            </ToggleButton>
            <ToggleButton value="DeleteMark">
              <img
                src={delete_mark_icon}
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
            <ToggleButton value={"Label"}>
              <TextField
                sx={{ width: "60px" }}
                size="small"
                variant="standard"
                value={context.nextLabel}
                onChange={(e) => {
                  e.stopPropagation();
                  context.setNextLabel(e.target.value);
                  context.setCursor("Label");
                }}
              ></TextField>
            </ToggleButton>
          </ToggleButtonGroup>

          <ToggleButtonGroup
            value={context.cursor}
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
                style={{ height: "30px", width: "30px" }}
              />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>
    </Paper>
  );
};
