import { StonePaint } from "../bindings";
import { setClick } from "../utils";

const { useContext } = await import("react");

const ClearIcon = (await import("@mui/icons-material/Clear")).default;

const Box = (await import("@mui/material/Box")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;

type PlaceStoneGroupProps = {
  default: "click" | "place";
};

const PlaceStoneGroup = (props: PlaceStoneGroupProps) => {
  const { c_data, c_images, c_cursor, c_cursorDispatch } =
    useContext(AppContext);

  const img_size = "25px";

  return (
    <Box>
      <ToggleButtonGroup
        color="toggle"
        value={c_cursor}
        exclusive
        size="small"
        onChange={(_e, newValue: StonePaint) => {
          if (newValue === null) {
            if (props.default === "click") {
              setClick(c_data, c_cursorDispatch)
            } else {
              c_cursorDispatch({
                type: "set_paint",
                value: "Black",
              });
            }
          } else {
            c_cursorDispatch({
              type: "set_paint",
              value: newValue,
            });
          }
        }}
      >
        <ToggleButton value="Black">
          <img
            src={c_images["Black"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="White">
          <img
            src={c_images["White"]}
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

export default PlaceStoneGroup;
