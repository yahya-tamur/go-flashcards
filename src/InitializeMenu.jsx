const { useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

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
const { createSVGElement } = await import("./utils");

const black_image = (await import("./assets/black_night.png")).default;
const black_territory_icon = (await import("./assets/black_territory.svg"))
  .default;
const circle_icon = (await import("./assets/circle.svg")).default;
const cross_icon = (await import("./assets/cross.svg")).default;
const delete_mark_icon = (await import("./assets/delete_mark.svg")).default;
const mui_clear = (await import("./assets/mui_clear.svg")).default;
const board_image = (await import("./assets/oak.jpg")).default;
const square_icon = (await import("./assets/square.svg")).default;
const triangle_icon = (await import("./assets/triangle.svg")).default;
const white_image = (await import("./assets/white_anime.png")).default;
const white_territory_icon = (await import("./assets/white_territory.svg"))
  .default;

const BoardSlider = (await import("./components/BoardSlider")).default;
const DragLabelGroup = (await import("./components/DragLabelGroup")).default;
const PlaceStoneGroup = (await import("./components/PlaceStoneGroup")).default;
const RectLabelGroup = (await import("./components/RectLabelGroup")).default;

export default (props) => {
  let context = useContext(AppContext);

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
          disabled={context.cursor !== "Black" && context.cursor !== "White"}
          onClick={async () => {
            invoke("finish_setup", {
              color: context.cursor === "Black" ? "White" : "Black",
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
                context.setEditingPhase("MakeTree");
              });
          }}
        >
          Start
        </Button>
      </Box>
    </Paper>
  );
};
