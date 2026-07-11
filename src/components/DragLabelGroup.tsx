const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { CursorType } = await import("../AppContext");

const circle_icon = (await import("../assets/circle.svg")).default;
const cross_icon = (await import("../assets/cross.svg")).default;
const square_icon = (await import("../assets/square.svg")).default;
const triangle_icon = (await import("../assets/triangle.svg")).default;

const DragLabelGroup = () => {
  const { c_data, c_cursor, c_setCursor, c_nextLabel } = useContext(AppContext);

  const img_size = "25px";

  return (
    <Box>
      <ToggleButtonGroup
        color="toggle"
        value={c_cursor}
        exclusive
        size="small"
        onChange={(_e, newValue) => {
          if (newValue === null) {
            c_setCursor(
              c_data?.color === "Black" ? CursorType.White : CursorType.Black,
            );
          } else {
            c_setCursor(newValue);
          }
        }}
      >
        <ToggleButton value="Triangle">
          <img
            src={triangle_icon}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="Square">
          <img
            src={square_icon}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="Circle">
          <img
            src={circle_icon}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="Cross">
          <img src={cross_icon} style={{ height: img_size, width: img_size }} />
        </ToggleButton>
        <ToggleButton
          value={"Label"}
          sx={{
            fontSize: "12pt",
            display: "flex",
            textTransform: "none",
            width: "80px",
            maxWidth: "80px",
            overflow: "hidden",
            justifyContent: "flex-start",
            textAlign: "start",
          }}
        >
          {c_nextLabel}
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default DragLabelGroup;
