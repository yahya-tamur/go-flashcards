import { cursorColor } from "./utils";

const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const TextField = (await import("@mui/material/TextField")).default;

await import("./App.css");

const AppContext = (await import("./AppContext")).default;
const { commands } = await import("./bindings");

const BoardSlider = (await import("./components/BoardSlider")).default;
const DragLabelGroup = (await import("./components/DragLabelGroup")).default;
const PlaceStoneGroup = (await import("./components/PlaceStoneGroup")).default;
const RectLabelGroup = (await import("./components/RectLabelGroup")).default;

const InitializeMenu = () => {
  const {
    c_setData,
    c_cursor,
    c_cursorDispatch,
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
            c_cursorDispatch({
              type: "set_mode",
              mode: {
                type: "mark",
                value: "Label",
              },
            });
          }}
          onFocus={() => {
            c_cursorDispatch({
              type: "set_mode",
              mode: {
                type: "mark",
                value: "Label",
              },
            });
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
          disabled={cursorColor(c_cursor) !== null}
          onClick={async () => {
            const color = cursorColor(c_cursor);
            if (color !== null) {
              commands
                .finishSetup(color)
                .then(() => commands.getData())
                .then((data) => {
                  c_setData(data);
                  c_setEditingPhase("MakeTree");
                });
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
