import type { RectangleMark } from "@/bindings";

import { useContext } from "react";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import AppContext from "@/AppContext";
import { setClick } from "@/utils";

type RectLabelGroupProps = {
  default: "click" | "place";
};

const RectLabelGroup = (props: RectLabelGroupProps) => {
  const { c_data, c_images, c_cursor, c_cursorDispatch } =
    useContext(AppContext);

  const img_size = "24px";

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
        onChange={(_e, newValue: RectangleMark | null) => {
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
              type: "set_rectangle",
              value: new_tool,
            });
          }
        }}
      >
        <ToggleButton
          value={JSON.stringify({ type: "rectangle", tool: "BlackTerritory" })}
        >
          <img
            src={c_images["BlackTerritory"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton
          value={JSON.stringify({ type: "rectangle", tool: "WhiteTerritory" })}
        >
          <img
            src={c_images["WhiteTerritory"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton
          value={JSON.stringify({ type: "rectangle", tool: "DeleteMark" })}
        >
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
