const { useContext } = await import("react");

const ClearIcon = (await import("@mui/icons-material/Clear")).default;

const Box = (await import("@mui/material/Box")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { CursorType } = await import("../AppContext");

const black_image = (await import("../assets/black_night.png")).default;
const white_image = (await import("../assets/white_anime.png")).default;

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
        <ToggleButton value="Black">
          <img
            src={black_image}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="White">
          <img
            src={white_image}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="Delete">
          <ClearIcon color="error" sx={{ height: img_size, width: img_size }} />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};
