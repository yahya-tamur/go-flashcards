const { commands } = await import("./bindings");

import type { Color, Variant } from "./bindings";

const { useEffect, useState, useRef, useContext } = await import("react");

const Paper = (await import("@mui/material/Paper")).default;
const { useTheme } = await import("@mui/material/styles");

await import("./App.css");

const AppContext = (await import("./AppContext")).default;

const black_image = (await import("./assets/black_night.png")).default;
const white_image = (await import("./assets/white_anime.png")).default;

export default () => {
  let context = useContext(AppContext);
  const treeBox = useRef<HTMLDivElement>(null);
  const [tableWidth, setTableWidth] = useState(100);
  const [tableHeight, setTableHeight] = useState(100);

  const theme = useTheme();
  const square_size = 30;
  const hl_radius = 21;
  const variant_square_diff = 1;
  const gap_size = 40;
  const margin = 20;

  const variantColorDict = {
    Correct: theme.palette.success.dark,
    Incorrect: theme.palette.error.dark,
    New: theme.palette.primary.light,
    None: null,
  };
  const variantColor = (v: Variant) => variantColorDict[v] ?? "#4480a6";

  useEffect(() => {
    const handle_key = (e: KeyboardEvent) => {
      if (e.currentTarget !== null) {
        let target = e.currentTarget as HTMLElement;
        if (/INPUT|TEXTAREA|SELECT/.test(target.tagName)) {
          return;
        }
      }
      if (context.data === null) {
        return;
      }
      let [r, c] = [context.data.row, context.data.col];
      switch (e.key) {
        case "ArrowRight":
          c += 1;
          break;
        case "ArrowUp":
          r -= 1;
          while (
            r > 0 &&
            (context.data.table[r][c] === null ||
              context.data.table[r][c] === undefined)
          ) {
            r -= 1;
          }
          break;
        case "ArrowDown":
          r += 1;
          while (
            r < context.data.table.length - 1 &&
            (context.data.table[r][c] === null ||
              context.data.table[r][c] === undefined)
          ) {
            r += 1;
          }
          break;
        case "ArrowLeft":
          c -= 1;
          while (r > 0 && context.data.table[r][c] === null) {
            r -= 1;
          }
          break;
        default:
          return;
      }

      if (
        context.data.table[r] !== undefined &&
        context.data.table[r][c] !== null &&
        context.data.table[r][c] !== undefined
      ) {
        commands
          .jump(r, c)
          .then(() => commands.getData())
          .then((data) => {
            context.setData(data);
          })
          .catch((e) => {
            console.log(e);
          });
      }
    };

    window.addEventListener("keydown", handle_key);

    return () => {
      window.removeEventListener("keydown", handle_key);
    };
  }, [context.data]);

  const get_coord = (e: React.MouseEvent<SVGSVGElement>) => {
    if (treeBox.current === null) {
      return null;
    }
    // coord in viewBox
    const rect = treeBox.current.getBoundingClientRect();
    let i = e.pageX - (rect.left + window.scrollX - treeBox.current.scrollLeft);
    let j = e.pageY - (rect.top + window.scrollY - treeBox.current.scrollTop);

    // coord in grid
    i = (i - (margin + square_size / 2)) / gap_size;
    j = (j - (margin + square_size / 2)) / gap_size;

    const si = Math.round(i);
    const sj = Math.round(j);

    if (si < 0 || sj < 0) {
      return null;
    }

    const r = (i - si) * (i - si) + (j - sj) * (j - sj);

    if (r < 0.2) {
      return [si, sj];
    }

    return null;
  };

  const [lines, setLines] = useState<[number, number, number, number][]>([]);
  const [paths, setPaths] = useState<
    [number, number, number, number, number, number, number, number][]
  >([]);
  const [moves, setMoves] = useState<
    [number, number, Color, string, Variant, string][]
  >([]);

  useEffect(() => {
    if (context.data === null || context.data === undefined) {
      return;
    }

    let table = context.data.table;
    let num_columns = table.reduce((m, a) => (a.length > m ? a.length : m), 1);
    let num_rows = table.length;
    setTableWidth(2 * margin + gap_size * (num_columns - 1) + square_size);
    setTableHeight(2 * margin + gap_size * (num_rows - 1) + square_size);

    let newLines: [number, number, number, number][] = [];

    // horizontal lines
    table.forEach((line, r) => {
      for (let c = 0; c < line.length - 1; c++) {
        if (line[c] !== null && line[c + 1] !== null) {
          newLines.push([r, c, r, c + 1]);
        }
      }
    });
    /*if (table[0].length > 1) {
      newLines.push([0, 0, 0, 1]);
    }*/
    setLines(newLines);

    let newPaths: [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ][] = [];
    //diagonal lines
    for (let r = 1; r < table.length; r++) {
      let c = 0;
      while (table[r][c] === null) {
        c += 1;
      }
      let c_ = c - 1;
      let r_ = r - 1;
      while (r_ > 0 && table[r_][c_] === null) {
        r_ -= 1;
      }
      const x1 = margin + gap_size * c + square_size / 2;
      const y1 = margin + gap_size * r + square_size / 2;
      const x2 = margin + gap_size * c_ + square_size / 2;
      const y2 = margin + gap_size * r_ + square_size / 2;
      newPaths.push([
        x2,
        y2,
        x2,
        y2,
        x1 - square_size,
        y1 - square_size,
        x1,
        y1,
      ]);
    }
    setPaths(newPaths);

    let newMoves: [number, number, Color, string, Variant, string][] = [];
    table.forEach((line, r) => {
      line.forEach((mov, c) => {
        if (mov === null || (r === 0 && c === 0)) {
          return;
        }
        let text =
          mov.loc === null
            ? "."
            : `${"ABCDEFGHJKLMNOPQRST"[mov.loc[0]]}${19 - mov.loc[1]}`;
        let key = JSON.stringify([r, c, mov.color, text, mov.variant]);
        newMoves.push([r, c, mov.color, text, mov.variant, key]);
      });
    });
    setMoves(newMoves);
  }, [context.data]);

  return (
    <Paper
      sx={{
        overflowX: "scroll",
        overflowY: "scroll",
        maxHeight: "100%",
        height: "100%",
      }}
      elevation={5}
      ref={treeBox}
    >
      {
        <svg
          viewBox={`0 0 ${tableWidth} ${tableHeight}`}
          style={{
            width: `${tableWidth}px`,
            height: `${tableHeight}px`,
          }}
          onClick={(e) => {
            const w = get_coord(e);
            if (
              w === null ||
              context.data === null ||
              context.data === undefined
            ) {
              return;
            }
            let [c, r] = w;
            if (
              r >= context.data.table.length ||
              c >= context.data.table[r].length
            ) {
              return;
            }
            if (context.data.table[r][c] === null) {
              return;
            }
            if (
              r < context.data.table.length &&
              c < context.data.table[r].length
            ) {
              commands
                .jump(r, c)
                .then(() => commands.getData())
                .then((data) => {
                  context.setData(data);
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          }}
        >
          <g>
            <circle
              cx={margin + square_size / 2}
              cy={margin + square_size / 2}
              r={3}
              stroke="none"
              strokeWidth={0}
              fill={theme.palette.primary.light}
            />
            <g>
              {lines.map(([r1, c1, r2, c2]) => (
                <line
                  x1={margin + gap_size * c1 + square_size / 2}
                  y1={margin + gap_size * r1 + square_size / 2}
                  x2={margin + gap_size * c2 + square_size / 2}
                  y2={margin + gap_size * r2 + square_size / 2}
                  stroke={theme.palette.primary.light}
                  strokeWidth={2}
                  key={JSON.stringify([r1, c1, r2, c2])}
                />
              ))}
            </g>
            <g>
              {paths.map(([a, b, c, d, e, f, g, h]) => (
                <path
                  d={`M ${a},${b} C ${c},${d} ${e},${f} ${g},${h}`}
                  stroke={theme.palette.primary.light}
                  strokeWidth={2}
                  fill="none"
                  key={JSON.stringify([a, b, c, d, e, f, g, h])}
                />
              ))}
            </g>
            <g>
              {moves
                .filter(
                  ([_r, _c, _color, _text, variant, _key]) =>
                    variant !== "None",
                )
                .map(([r, c, _color, _text, variant, key]) => (
                  <rect
                    x={
                      margin +
                      gap_size * c -
                      (gap_size - square_size) / 2 +
                      variant_square_diff
                    }
                    y={
                      margin +
                      gap_size * r -
                      (gap_size - square_size) / 2 +
                      variant_square_diff
                    }
                    width={gap_size - variant_square_diff * 2}
                    height={gap_size - variant_square_diff * 2}
                    stroke="none"
                    strokeWidth={0}
                    opacity="0.8"
                    fill={variantColor(variant)}
                    key={key}
                  />
                ))}
            </g>
            <circle
              cx={
                context.data === null
                  ? -10000
                  : margin + gap_size * context.data.col + square_size / 2
              }
              cy={
                context.data === null
                  ? -10000
                  : margin + gap_size * context.data.row + square_size / 2
              }
              r={hl_radius}
              stroke={"black"}
              strokeWidth={"2"}
              fill={theme.palette.primary.main}
              opacity={0.8}
            />
            <g>
              {moves.map(([r, c, color, _text, _variant, key]) => (
                <image
                  x={margin + gap_size * c}
                  y={margin + gap_size * r}
                  width={square_size}
                  height={square_size}
                  href={color === "Black" ? black_image : white_image}
                  key={key}
                />
              ))}
            </g>
            <g>
              {moves.map(([r, c, color, text, _variant, key]) => (
                <text
                  x={margin + gap_size * c + square_size / 2}
                  y={margin + gap_size * r + square_size / 2}
                  width={square_size}
                  height={square_size}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fill: color === "Black" ? "white" : "black",
                    WebkitUserSelect: "none",
                    font: "bold 14px sans-serif",
                  }}
                  key={key}
                >
                  {text}
                </text>
              ))}
            </g>
          </g>
        </svg>
      }
    </Paper>
  );
};
