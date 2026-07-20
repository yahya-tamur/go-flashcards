const { useEffect, useState, useContext } = await import("react");

const CheckIcon = (await import("@mui/icons-material/Check")).default;
const ClearIcon = (await import("@mui/icons-material/Clear")).default;

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const TextField = (await import("@mui/material/TextField")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("./App.css");

const AppContext = (await import("./AppContext")).default;
const { commands } = await import("./bindings");
const { handleError, setClick } = await import("./utils");

const BoardSlider = (await import("./components/BoardSlider")).default;
const DragLabelGroup = (await import("./components/DragLabelGroup")).default;
const RectLabelGroup = (await import("./components/RectLabelGroup")).default;

const MakeTreeMenu = () => {
  const {
    c_data,
    c_setData,
    c_cursor,
    c_cursorDispatch,
    c_images,
    c_nextLabel,
    c_setNextLabel,
    c_setEditingPhase,
    c_setErrorMessage,
    c_setErrorWindowOpen,
  } = useContext(AppContext);
  const [variant, setVariant] = useState("None");

  // i think the array access interfered with state ?

  useEffect(() => {
    setVariant(c_data?.variant ?? "None");
  }, [c_data]);

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
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      draggable="false"
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
          value={c_nextLabel}
          onChange={(e) => {
            c_setNextLabel(e.target.value);
            c_cursorDispatch({
              type: "set_paint",
              value: "Label",
            });
          }}
          onFocus={() => {
            c_cursorDispatch({
              type: "set_paint",
              value: "Label",
            });
          }}
        ></TextField>
        <DragLabelGroup default="click" />
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
          value={c_cursor}
          color="toggle"
          exclusive
          size="small"
          onChange={() => {
            setClick(c_data, c_cursorDispatch);
          }}
        >
          <ToggleButton value={c_data?.color === "Black" ? "White" : "Black"}>
            <img
              src={
                c_data?.color === "Black"
                  ? c_images["White"]
                  : c_images["Black"]
              }
              style={{ height: "25px", width: "25px" }}
            />
          </ToggleButton>
        </ToggleButtonGroup>

        <Button
          sx={{ height: "40px" }}
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
              })
              .catch((e) =>
                handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
              );
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
            commands
              .setVariant(newValue)
              .then(() => commands.getData())
              .then((data) => {
                c_setData(data);
              })
              .catch((e) =>
                handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
              );
          }}
        >
          <ToggleButton value="Correct">
            <CheckIcon />
          </ToggleButton>
          <ToggleButton value="Incorrect">
            <ClearIcon />
          </ToggleButton>
        </ToggleButtonGroup>

        <RectLabelGroup default="click" />
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
            commands
              .collapseTree()
              .then(() => commands.getData())
              .then((data) => {
                c_setData(data);
                c_setEditingPhase("Initialize");
                c_cursorDispatch({
                  type: "set_paint",
                  value: "Black",
                });
              })
              .catch((e) =>
                handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
              );
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
          disabled={(c_data?.row ?? 0) == 0 && (c_data?.col ?? 0) == 0}
          onClick={async () => {
            commands
              .deleteBranch()
              .then(() => commands.getData())
              .then((data) => {
                c_setData(data);
              })
              .catch((e) =>
                handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
              );
          }}
        >
          Delete Branch
        </Button>
      </Box>
    </Paper>
  );
};

export default MakeTreeMenu;
