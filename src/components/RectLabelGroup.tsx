const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { CursorType } = await import("../AppContext");

const black_territory_icon = (await import("../assets/black_territory.svg"))
  .default;
const delete_mark_icon = (await import("../assets/delete_mark.svg")).default;
const white_territory_icon = (await import("../assets/white_territory.svg"))
  .default;

export default () => {
  let context = useContext(AppContext);

  const img_size = "25px";

  return (
    <Box>
      <ToggleButtonGroup
        color="toggle"
        value={context.cursor}
        exclusive
        size="small"
        onChange={(_e, newValue) => {
          if (newValue === null) {
            context.setCursor(
              context.data?.color === "Black"
                ? CursorType.White
                : CursorType.Black,
            );
          } else {
            context.setCursor(newValue);
          }
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
