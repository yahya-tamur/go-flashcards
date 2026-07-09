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

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { createSVGElement } = await import("../utils");

const black_image = (await import("../assets/black_night.png")).default;
const black_territory_icon = (await import("../assets/black_territory.svg"))
  .default;
const circle_icon = (await import("../assets/circle.svg")).default;
const cross_icon = (await import("../assets/cross.svg")).default;
const delete_mark_icon = (await import("../assets/delete_mark.svg")).default;
const mui_clear = (await import("../assets/mui_clear.svg")).default;
const board_image = (await import("../assets/oak.jpg")).default;
const square_icon = (await import("../assets/square.svg")).default;
const triangle_icon = (await import("../assets/triangle.svg")).default;
const white_image = (await import("../assets/white_anime.png")).default;
const white_territory_icon = (await import("../assets/white_territory.svg"))
  .default;

export default (props) => {
  let context = useContext(AppContext);

  const img_size = "25px";

  return (
    <Box>
      <ToggleButtonGroup
        color="toggle"
        value={context.cursor}
        exclusive
        size="small"
        onChange={(e, newValue) => {
          context.setCursor(newValue);
        }}
      >
        <ToggleButton value="BlackTerritory">
          <img
            src={black_territory_icon}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="WhiteTerritory">
          <img
            src={white_territory_icon}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="DeleteMark">
          <img
            src={delete_mark_icon}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
