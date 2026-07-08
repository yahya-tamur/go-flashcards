const { useEffect, useState, useRef, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const Slider = (await import("@mui/material/Slider")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;

console.log(AppContext);
// side: "row" or "column"
// force: true or false
export default ({ side, commit, ...props }) => {
  let context = useContext(AppContext);

  const [l, r, ll, rr] = side === "row" ? [0, 1, 2, 3] : [2, 3, 0, 1];

  return (
    <Slider
      value={context.window.slice(l, r + 1)}
      marks
      onChange={(e) => {
        let [a, b] = e.target.value;
        if (a !== context.window[0] || b !== context.window[1]) {
          context.setWindow((window) => {
            let new_window = [...window];
            new_window[l] = a;
            new_window[r] = b;
            return new_window;
          });
        }
      }}
      onChangeCommitted={async (event, newValue) => {
        if (context.data === null || context.data === undefined) {
          return;
        }

        if (!force && context.data.min_window !== null) {
          if (context.data.min_window[l] < context.window[l]) {
            context.setWindow((window) => {
              let new_window = [...window];
              new_window[l] = context.data.min_window[l];
              return new_window;
            });
          }
          if (context.data.min_window[r] > context.window[r]) {
            context.setWindow((window) => {
              let new_window = [...window];
              new_window[r] = context.data.min_window[r];
              return new_window;
            });
          }
        }

        if (
          context.window.every(
            (value, index) => context.data.window[index] === value,
          )
        ) {
          return;
        }
        await invoke("set_window", {
          window: context.window,
        })
          .then(() => invoke("get_data"))
          .then((data) => {
            if (
              data.window[l] !== context.window[l] ||
              data.window[r] !== context.window[r]
            ) {
              context.setData(data);
            }
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
