import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import {
  useCursorContext,
  useDataContext,
  useDispatchContext,
  useImagesContext,
} from "@/AppContext";
import { setClick } from "@/utils";

type PlaceStoneGroupProps = {
  default: "click" | "place";
};

const PlaceStoneGroup = (props: PlaceStoneGroupProps) => {
  const { c_cursor } = useCursorContext();

  const { c_data } = useDataContext();
  const { c_images } = useImagesContext();
  const { c_cursorDispatch } = useDispatchContext();

  const img_size = "25px";

  return (
    <Box>
      <ToggleButtonGroup
        color="toggle"
        value={JSON.stringify({
          type: c_cursor.type,
          tool: c_cursor.tool.value,
        })}
        exclusive
        size="small"
        onChange={(_e, newValue: string | null) => {
          const new_tool = newValue && JSON.parse(newValue).tool;
          if (new_tool === null) {
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
              value: new_tool,
            });
          }
        }}
      >
        <ToggleButton value={JSON.stringify({ type: "paint", tool: "Black" })}>
          <img
            src={c_images["Black"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value={JSON.stringify({ type: "paint", tool: "White" })}>
          <img
            src={c_images["White"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value={JSON.stringify({ type: "paint", tool: "Delete" })}>
          <img
            src={c_images["Delete"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
};

export default PlaceStoneGroup;
