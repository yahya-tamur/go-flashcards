import Button from "@mui/material/Button";

import { useCursorContext, useDispatchContext } from "@/AppContext";
import { commands } from "@/bindings";
import { cursorColor } from "@/utils";

const StartButton = () => {
  const { c_cursor } = useCursorContext();

  const { c_handleError, c_setData, c_setEditingPhase, c_cursorDispatch } =
    useDispatchContext();

  return (
    <Button
      variant="outlined"
      color="button"
      disabled={cursorColor(c_cursor) === null}
      onClick={async () => {
        const color = cursorColor(c_cursor);
        if (color !== null) {
          commands
            .finishSetup(color === "Black" ? "White" : "Black")
            .then(() => commands.getData())
            .then((data) => {
              c_cursorDispatch({
                type: "set_click",
                value: color,
              });
              // setClick(data, c_cursorDispatch);
              c_setData(data);
              c_setEditingPhase("MakeTree");
            })
            .catch((e) => c_handleError(e));
        }
      }}
    >
      Start
    </Button>
  );
};

export default StartButton;
