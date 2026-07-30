import { useContext } from "react";

import TextField from "@mui/material/TextField";

import AppContext from "@/AppContext";

const LabelInput = () => {
  const { c_nextLabel, c_setNextLabel, c_cursorDispatch } =
    useContext(AppContext);

  return (
    <TextField
      sx={{ width: "30px" }}
      size="small"
      variant="standard"
      value={c_nextLabel}
      onChange={(e) => {
        c_setNextLabel(e.target.value);
        c_cursorDispatch({
          type: "set_paint",
          value: "Label",
        });
      }}
      onFocus={() => {
        c_cursorDispatch({
          type: "set_paint",
          value: "Label",
        });
      }}
    />
  );
};

export default LabelInput;
