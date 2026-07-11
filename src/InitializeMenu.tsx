const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const TextField = (await import("@mui/material/TextField")).default;

await import("./App.css");

const AppContext = (await import("./AppContext")).default;
const { CursorType, EditingPhaseType } = await import("./AppContext");
const { commands } = await import("./bindings");

const BoardSlider = (await import("./components/BoardSlider")).default;
const DragLabelGroup = (await import("./components/DragLabelGroup")).default;
const PlaceStoneGroup = (await import("./components/PlaceStoneGroup")).default;
const RectLabelGroup = (await import("./components/RectLabelGroup")).default;

const InitializeMenu = () => {
  const {
    c_setData,
    c_cursor,
    c_setCursor,
    c_nextLabel,
    c_setNextLabel,
    c_setEditingPhase,
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
        <BoardSlider side={"row"} force={true} />
        <BoardSlider side={"column"} force={true} />
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
            c_setCursor(CursorType.Label);
          }}
          onFocus={() => {
            c_setCursor(CursorType.Label);
          }}
        ></TextField>
        <DragLabelGroup />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <PlaceStoneGroup />
        <RectLabelGroup />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <Button
          variant="outlined"
          color="button"
          disabled={c_cursor !== "Black" && c_cursor !== "White"}
          onClick={async () => {
            commands
              .finishSetup(c_cursor === "Black" ? "White" : "Black")
              .then(() => commands.getData())
              .then((data) => {
                c_setData(data);
                c_setEditingPhase(EditingPhaseType.MakeTree);
              });
          }}
        >
          Start
        </Button>
      </Box>
    </Paper>
  );
};

export default InitializeMenu;
