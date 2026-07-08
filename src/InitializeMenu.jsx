const { useContext } = await import("react");
const board_image = (await import("./assets/oak.jpg")).default;
const black_image = (await import("./assets/black_night.png")).default;
const white_image = (await import("./assets/white_anime.png")).default;
const { invoke } = await import("@tauri-apps/api/core");
const { createSVGElement } = await import("./utils");

const mui_clear = (await import("./assets/mui_clear.svg")).default;
const triangle_icon = (await import("./assets/triangle.svg")).default;
const square_icon = (await import("./assets/square.svg")).default;
const circle_icon = (await import("./assets/circle.svg")).default;
const cross_icon = (await import("./assets/cross.svg")).default;
const black_territory_icon = (await import("./assets/black_territory.svg"))
  .default;
const white_territory_icon = (await import("./assets/white_territory.svg"))
  .default;
const delete_mark_icon = (await import("./assets/delete_mark.svg")).default;

await import("./App.css");

const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Box = (await import("@mui/material/Box")).default;
const ClearIcon = (await import("@mui/icons-material/Clear")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;
const TextField = (await import("@mui/material/TextField")).default;

const BoardSlider = (await import("./components/BoardSlider")).default;

const AppContext = (await import("./AppContext")).default;

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
        justifyContent: "space-around",
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
        }}
      >
        <ToggleButtonGroup
          value={context.cursor}
          exclusive
          size="small"
          onChange={(e, newValue) => {
            context.setCursor(newValue);
          }}
        >
          <ToggleButton value="Black">
            <img src={black_image} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="White">
            <img src={white_image} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="BlackTerritory">
            <img
              src={black_territory_icon}
              style={{ height: "30px", width: "30px" }}
            />
          </ToggleButton>
          <ToggleButton value="WhiteTerritory">
            <img
              src={white_territory_icon}
              style={{ height: "30px", width: "30px" }}
            />
          </ToggleButton>
          <ToggleButton value="Delete">
            <ClearIcon color="error" sx={{ height: "30px", width: "30px" }} />
          </ToggleButton>
        </ToggleButtonGroup>

        <ToggleButtonGroup
          value={context.cursor}
          exclusive
          size="small"
          onChange={(e, newValue) => {
            if (newValue === null) {
              context.setCursor("Black");
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
            <img src={square_icon} style={{ height: "30px", width: "30px" }} />
          </ToggleButton>
          <ToggleButton value="Circle">
            <img src={circle_icon} style={{ height: "30px", width: "30px" }} />
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
          variant="contained"
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

      <Box></Box>
    </Paper>
  );
};
