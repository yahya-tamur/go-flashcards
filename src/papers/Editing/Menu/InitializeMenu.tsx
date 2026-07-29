const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const TextField = (await import("@mui/material/TextField")).default;

const AppContext = (await import("../../../AppContext")).default;
const { commands } = await import("../../../bindings");
const { cursorColor, handleError } = await import("../../../utils");

const BoardSlider = (await import("../../../components/BoardSlider")).default;
const PlaceMarkGroup = (await import("../../../components/PlaceMarkGroup"))
  .default;
const PlaceStoneGroup = (await import("../../../components/PlaceStoneGroup"))

  .default;

await import("@/App.css");

const RectLabelGroup = (await import("../../../components/RectLabelGroup"))
  .default;

const InitializeMenu = () => {
  const {
    c_setData,
    c_cursor,
    c_cursorDispatch,
    c_nextLabel,
    c_setNextLabel,
    c_setEditingPhase,
    c_setErrorMessage,
    c_setErrorWindowOpen,
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
          paddingTop: "10px",
          marginBottom: "-10px",
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
        <PlaceMarkGroup default="place" />
        <TextField
          sx={{ width: "30px" }}
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
        />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <PlaceStoneGroup default="place" />
        <RectLabelGroup default="place" />
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
          disabled={cursorColor(c_cursor) === null}
          onClick={async () => {
            const color = cursorColor(c_cursor);
            if (color !== null) {
              commands
                .finishSetup(color === "Black" ? "White" : "Black")
                .then(() => commands.getData())
                .then((data) => {
                  c_cursorDispatch({
                    type: "set_click",
                    value: color,
                  });
                  // setClick(data, c_cursorDispatch);
                  c_setData(data);
                  c_setEditingPhase("MakeTree");
                })
                .catch((e) =>
                  handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                );
            }
          }}
        >
          Start
        </Button>
      </Box>
    </Paper>
  );
};

export default InitializeMenu;
