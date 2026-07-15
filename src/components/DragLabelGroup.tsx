import { MarkPaint } from "../bindings";
import { setClick } from "../utils";

const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const ToggleButton = (await import("@mui/material/ToggleButton")).default;
const ToggleButtonGroup = (await import("@mui/material/ToggleButtonGroup"))
  .default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;

type DragLabelGroupProps = {
  default: "click" | "place";
};

const DragLabelGroup = (props: DragLabelGroupProps) => {
  const { c_data, c_images, c_cursor, c_cursorDispatch, c_nextLabel } =
    useContext(AppContext);

  const img_size = "25px";

  return (
    <Box>
      <ToggleButtonGroup
        color="toggle"
        value={c_cursor.paint.value}
        exclusive
        size="small"
        onChange={(_e, newValue: MarkPaint) => {
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
        <ToggleButton value="Triangle">
          <img
            src={c_images["Triangle"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="Square">
          <img
            src={c_images["Square"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="Circle">
          <img
            src={c_images["Circle"]}
            style={{ height: img_size, width: img_size }}
          />
        </ToggleButton>
        <ToggleButton value="Cross">
          <img
            src={c_images["Cross"]}
            style={{ height: img_size, width: img_size }}
          />
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
