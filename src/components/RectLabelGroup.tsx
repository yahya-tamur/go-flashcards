import type { RectangleMark } from "../bindings";

const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { setClick } = await import("../utils");

type RectLabelGroupProps = {
  default: "click" | "place";
};

const RectLabelGroup = (props: RectLabelGroupProps) => {
  const { c_data, c_images, c_cursor, c_cursorDispatch } =
    useContext(AppContext);

  const img_size = "25px";

  return (
    <Box>
      <ToggleButtonGroup
        color="toggle"
        value={c_cursor.paint.value}
        exclusive
        size="small"
        onChange={(_e, newValue: RectangleMark | null) => {
          if (newValue === null) {
            if (props.default === "click") {
              setClick(c_data, c_cursorDispatch);
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
        <ToggleButton value="BlackTerritory">
          <img
            src={c_images["BlackTerritory"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="WhiteTerritory">
          <img
            src={c_images["WhiteTerritory"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="DeleteMark">
          <img
            src={c_images["DeleteMark"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default RectLabelGroup;
