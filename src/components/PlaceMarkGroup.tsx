import { useContext } from "react";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";

import AppContext from "@/AppContext";
import { setClick } from "@/utils";

type DragLabelGroupProps = {
  default: "click" | "place";
};

const DragLabelGroup = (props: DragLabelGroupProps) => {
  const { c_data, c_images, c_cursor, c_cursorDispatch, c_nextLabel } =
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
        <ToggleButton
          value={JSON.stringify({ type: "paint", tool: "Triangle" })}
        >
          <img
            src={c_images["Triangle"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value={JSON.stringify({ type: "paint", tool: "Square" })}>
          <img
            src={c_images["Square"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value={JSON.stringify({ type: "paint", tool: "Circle" })}>
          <img
            src={c_images["Circle"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value={JSON.stringify({ type: "paint", tool: "Cross" })}>
          <img
            src={c_images["Cross"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton
          value={JSON.stringify({ type: "paint", tool: "DeleteMark" })}
        >
          <img
            src={c_images["DeleteMark"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton
          value={JSON.stringify({ type: "paint", tool: "Label" })}
          sx={{
            fontSize: "12pt",
            display: "flex",
            textTransform: "none",
            width: "40px",
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
