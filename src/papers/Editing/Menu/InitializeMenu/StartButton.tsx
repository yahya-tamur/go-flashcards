import { useContext } from "react";

import Button from "@mui/material/Button";

import AppContext from "@/AppContext";
import { commands } from "@/bindings";
import { cursorColor, handleError } from "@/utils";

const StartButton = () => {
  const {
    c_cursor,
    c_cursorDispatch,
    c_setData,
    c_setEditingPhase,
    c_setErrorMessage,
    c_setErrorWindowOpen,
  } = useContext(AppContext);

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
            .catch((e) =>
              handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
            );
        }
      }}
    >
      Start
    </Button>
  );
};

export default StartButton;
