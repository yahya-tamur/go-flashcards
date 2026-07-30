import { useContext } from "react";

import Slider from "@mui/material/Slider";

import AppContext from "@/AppContext";
import { commands } from "@/bindings";
import { handleError } from "@/utils";

type BoardSliderProps = {
  side: "row" | "column";
  force: boolean;
};

const BoardSlider = (props: BoardSliderProps) => {
  const {
    c_data,
    c_setData,
    c_setErrorMessage,
    c_setErrorWindowOpen,
    c_window,
    c_setWindow,
  } = useContext(AppContext);

  const [l, r] = props.side === "row" ? [0, 1] : [2, 3];

  return (
    <Slider
      value={c_window.slice(l, r + 1)}
      marks
      onChange={(e, newVal) => {
        if (e.target === null) {
          return;
        }
        const [a, b] = newVal;
        if (a !== c_window[l] || b !== c_window[r]) {
          c_setWindow((window) => {
            const new_window: [number, number, number, number] = [...window];
            new_window[l] = a;
            new_window[r] = b;
            return new_window;
          });
        }
      }}
      onChangeCommitted={() => {
        const contextdata = c_data;
        if (contextdata === null) {
          return;
        }

        const new_window: [number, number, number, number] = [...c_window];
        if (!props.force && contextdata.min_window !== null) {
          if (contextdata.min_window[l] < c_window[l]) {
            new_window[l] = contextdata.min_window[l];
          }
          if (contextdata.min_window[r] > c_window[r]) {
            new_window[r] = contextdata.min_window[r];
          }
        }
        if (
          new_window.every(
            (value, index) => contextdata.window[index] === value,
          )
        ) {
          if (!new_window.every((value, index) => c_window[index] === value)) {
            c_setWindow(new_window);
          }
          return;
        }
        commands
          .setWindow(new_window)
          .then(() => commands.getData())
          .then((data) => {
            c_setData(data);
          })
          .catch((e) =>
            handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
          );
      }}
      step={1}
      min={0}
      max={18}
      sx={{ margin: "5px 30px", width: "calc(100% - 60px)" }}
    />
  );
};

export default BoardSlider;
