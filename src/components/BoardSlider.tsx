const { useContext } = await import("react");

const Slider = (await import("@mui/material/Slider")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { commands } = await import("../bindings");

interface BoardSliderProps {
  side: "row" | "column";
  force: boolean;
}

export default (props: BoardSliderProps) => {
  let context = useContext(AppContext);

  const [l, r] = props.side === "row" ? [0, 1] : [2, 3];

  return (
    <Slider
      value={context.window.slice(l, r + 1)}
      marks
      onChange={(e, newVal) => {
        if (e.target === null) {
          return;
        }
        let [a, b] = newVal;
        if (a !== context.window[l] || b !== context.window[r]) {
          context.setWindow((window) => {
            let new_window: [number, number, number, number] = [...window];
            new_window[l] = a;
            new_window[r] = b;
            return new_window;
          });
        }
      }}
      onChangeCommitted={async () => {
        let contextdata = context.data;
        if (contextdata === null) {
          return;
        }

        let new_window: [number, number, number, number] = [...context.window];
        if (!props.force && contextdata.min_window !== null) {
          if (contextdata.min_window[l] < context.window[l]) {
            new_window[l] = contextdata.min_window[l];
          }
          if (contextdata.min_window[r] > context.window[r]) {
            new_window[r] = contextdata.min_window[r];
          }
        }
        if (
          new_window.every(
            (value, index) => contextdata.window[index] === value,
          )
        ) {
          if (
            !new_window.every((value, index) => context.window[index] === value)
          ) {
            context.setWindow(new_window);
          }
          return;
        }
        await commands
          .setWindow(new_window)
          .then(() => commands.getData())
          .then((data) => {
            context.setData(data);
          })
          .catch((e) => {
            console.log(e);
          });
      }}
      step={1}
      min={0}
      max={18}
      sx={{ margin: "5px 30px", width: "calc(100% - 60px)" }}
    />
  );
};
