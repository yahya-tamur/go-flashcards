import type { Holding } from "./AppContext";
import type { Grid } from "./bindings";

await import("react");
const { useEffect, useState, useRef, useContext, useCallback, useReducer } =
  await import("react");

const Paper = (await import("@mui/material/Paper")).default;

const AppContext = (await import("./AppContext")).default;
const { commands } = await import("./bindings");
const { handleError, studyStep, cursorColor, markEqualsCursor, setClick } =
  await import("./utils");

const letters = "ABCDEFGHJKLMNOPQRST".split("");

type GridAction =
  | {
      type: "set_temp";
      w: [number, number];
      holding: Holding;
      label: string;
    }
  | {
      type: "set_grid";
      grid: Grid;
    };

const empty_grid = Array.from({ length: 19 }, () =>
  Array(19).fill({ stone: null, mark: null }),
) as Grid;

const gridReducer = (grid: Grid, action: GridAction): Grid => {
  switch (action.type) {
    case "set_temp": {
      const [r, c] = action.w;
      if (action.holding.layer === "stone") {
        if (grid[r][c].stone ?? "Delete" !== action.holding.value) {
          const grid_ = structuredClone(grid);
          grid_[r][c].stone =
            action.holding.value === "Delete" ? null : action.holding.value;
          return grid_;
        }
      } else {
        if (
          !markEqualsCursor(grid[r][c].mark, action.holding.value, action.label)
        ) {
          const grid_ = structuredClone(grid);
          grid_[r][c].mark =
            action.holding.value === "DeleteMark"
              ? null
              : action.holding.value !== "Label"
                ? { type: action.holding.value }
                : { type: "Label", label: action.label };
          return grid_;
        }
      }
      return grid;
    }
    case "set_grid": {
      return action.grid;
    }
  }
};

/*
  have: dragStart <works in DragRectangle, DragPlace>, dragCurrent

  useEffect({if !dragStart {commands.setGrid(grid)} [grid, dragStart] )
  useEffect setGhosts: probably ok, but maybe inline or usememo or something?

  snapshot should return grid, not whatever it returns now.
  can even change backend to use grid instead

*/

const Board = () => {
  const [grid, gridDispatch] = useReducer(gridReducer, empty_grid);

  const {
    c_phase,
    c_images,
    c_studyPhase,
    c_data,
    c_setData,
    c_cursor,
    c_cursorDispatch,
    c_nextLabel,
    c_window,
    c_setFeedback,
    c_setStudyPhase,
    c_setAnswerMessage,
    c_setWindow,
    c_setErrorMessage,
    c_setErrorWindowOpen,
  } = useContext(AppContext);
  const board_svg = useRef<SVGSVGElement>(null);
  const paper = useRef<HTMLDivElement>(null);

  const square_size = 100;
  const margin = 150;
  const partial = 70; // dots for partial board.
  const partial_border = 0; // border from partial edges

  const [boardBoxWidth, setBoardBoxWidth] = useState("0px");
  const [boardBoxHeight, setBoardBoxHeight] = useState("0px");

  useEffect(() => {
    const contextdata = c_data;
    if (contextdata === null) {
      return;
    }
    c_setWindow((window) =>
      window.every((val, index) => contextdata.window[index] === val)
        ? window
        : contextdata.window,
    );
  }, [c_data, c_setWindow]);

  const [viewBox, setViewBox] = useState<[number, number, number, number]>([
    0, 0, 2100, 2100,
  ]);

  const get_coord = useCallback(
    (e: React.MouseEvent<SVGSVGElement>): [number, number] | null => {
      if (
        board_svg.current === null ||
        c_data === null ||
        c_data === undefined
      ) {
        return null;
      }
      // get coord in board in [0, 1]
      const rect = board_svg.current.getBoundingClientRect();
      let i = (e.pageX - (rect.left + window.scrollX)) / rect.width;
      let j = (e.pageY - (rect.top + window.scrollY)) / rect.height;

      // coord in board viewBox
      i = viewBox[2] * i;
      j = viewBox[3] * j;

      // if board is 19 x 19, this labels the top left square (0, 0),
      // and linearly increases by 1 per square_size .

      i = (i - margin) / square_size;
      j = (j - margin) / square_size;

      const [left, right, top, bottom] = c_window;

      // correction for partial boards
      i += left + (left > 0 ? -partial_border / square_size : 0);
      j += top + (top > 0 ? -partial_border / square_size : 0);

      const si = Math.round(i);
      const sj = Math.round(j);
      if (!(si >= left && si <= right && sj >= top && sj <= bottom)) {
        return null;
      }

      if (c_cursor.type === "Click") {
        if ((i - si) * (i - si) + (j - sj) * (j - sj) > 0.25) {
          return null;
        }
        if (c_data.game.grid[si][sj].stone !== null) {
          return null;
        }
      } else if (c_cursor.type === "Place") {
        if (c_cursor.paint.layer === "stone") {
          if (grid[si][sj].stone === c_cursor.paint.value) {
            return null;
          }
        } else {
          if (
            markEqualsCursor(
              grid[si][sj].mark,
              c_cursor.paint.value,
              c_nextLabel,
            )
          ) {
            return null;
          }
        }
      }
      return [si, sj];
    },
    [c_cursor, c_data, c_nextLabel, c_window, grid, viewBox],
  );

  // fits board in app. This was easier than pure css.
  useEffect(() => {
    if (paper.current === null) {
      return;
    }

    const [left, right, top, bottom] = c_window;

    // Offset viewBox.

    //maybe add bigger margin for edges or letters on every side
    const vbleft = square_size * left + (left > 0 ? -partial_border : 0);
    const vbtop = square_size * top + (top > 0 ? -partial_border : 0);
    const vbwidth =
      2 * margin +
      (right - left) * square_size +
      (left > 0 ? partial_border : 0) +
      (right < 18 ? partial_border : 0);
    const vbheight =
      2 * margin +
      (bottom - top) * square_size +
      (top > 0 ? partial_border : 0) +
      (bottom < 18 ? partial_border : 0);

    setViewBox([vbleft, vbtop, vbwidth, vbheight]);

    const observer = new ResizeObserver(() => {
      if (paper.current === null) {
        return;
      }
      const current_size: [number, number] = [
        paper.current.offsetWidth,
        paper.current.offsetHeight,
      ];
      const [width, height] = current_size;

      const ratio = Math.min(
        (width - 2 * 20) / vbwidth,
        (height - 2 * 20) / vbheight,
      );
      setBoardBoxWidth(`${vbwidth * ratio}px`);
      setBoardBoxHeight(`${vbheight * ratio}px`);
    });
    observer.observe(paper.current);
    return () => {
      observer.disconnect();
    };
  }, [paper, c_window]);

  useEffect(() => {
    if (c_data === null) {
      return;
    }

    gridDispatch({ type: "set_grid", grid: c_data.game.grid });
  }, [c_window, c_data]);

  //maybe just always do 0..19?
  const [rows, setRows] = useState<number[]>([]);
  const [cols, setCols] = useState<number[]>([]);
  const [lines, setLines] = useState<number[]>([]);
  const [borders, setBorders] = useState<[number, number, string][]>([]);

  useEffect(() => {
    const [left, right, top, bottom] = c_window;

    const newRows: number[] = [];
    for (let i = left; i <= right; i++) {
      newRows.push(i);
    }
    setRows(newRows);

    const newCols: number[] = [];
    for (let j = top; j <= bottom; j++) {
      newCols.push(j);
    }
    setCols(newCols);

    const stroke_width = 0; // but it's 1??
    const hline_start =
      margin +
      square_size * left +
      (left > 0 ? -partial : 0) -
      stroke_width / 2;
    const hline_end =
      margin +
      square_size * right +
      (right < 18 ? partial : 0) +
      stroke_width / 2;
    const vline_start = margin + square_size * top + (top > 0 ? -partial : 0);
    const vline_end =
      margin + square_size * bottom + (bottom < 18 ? partial : 0);
    setLines([hline_start, hline_end, vline_start, vline_end]);

    const newBorders: [number, number, string][] = [];
    if (left == 0) {
      for (let j = top; j <= bottom; j++) {
        newBorders.push([
          hline_start - 70,
          margin + square_size * j,
          String(19 - j),
        ]);
      }
    }
    if (right == 18) {
      for (let j = top; j <= bottom; j++) {
        newBorders.push([
          hline_end + 70,
          margin + square_size * j,
          String(19 - j),
        ]);
      }
    }
    if (top == 0) {
      for (let i = left; i <= right; i++) {
        newBorders.push([
          margin + square_size * i,
          vline_start - 70,
          letters[i],
        ]);
      }
    }
    if (bottom == 18) {
      for (let i = left; i <= right; i++) {
        newBorders.push([margin + square_size * i, vline_end + 70, letters[i]]);
      }
    }
    setBorders(newBorders);
  }, [c_window]);

  return (
    <Paper
      ref={paper}
      sx={{
        height: "100vh",
        maxHeight: "100%",
        minHeight: 0,
        width: "100%",
        display: "grid",
        placeItems: "center",
      }}
      elevation={3}
    >
      {
        <svg
          ref={board_svg}
          id="board"
          viewBox={`${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}`}
          style={{
            width: boardBoxWidth,
            height: boardBoxHeight,
            margin: "20px",
          }}
          onPointerDown={(e) => {
            const w = get_coord(e);
            c_cursorDispatch({
              type: "down",
              w: w,
            });
            if (c_cursor.type === "Place") {
              if (w !== null) {
                gridDispatch({
                  type: "set_temp",
                  w: w,
                  holding: c_cursor.paint,
                  label: c_nextLabel,
                });
              }
            }
          }}
          onPointerMove={async (e) => {
            const w = get_coord(e);

            c_cursorDispatch({
              type: "move",
              w: w,
            });
            if (c_cursor.type === "Place" && c_cursor.dragging && w !== null) {
              gridDispatch({
                type: "set_temp",
                w: w,
                holding: c_cursor.paint,
                label: c_nextLabel,
              });
            }
          }}
          onPointerUp={(e) => {
            const w = get_coord(e);
            if (c_cursor.type === "Click") {
              if (w !== null) {
                commands
                  .play([w[0], w[1]])
                  .then(() => commands.getData())
                  .then((data) => {
                    if (
                      c_data !== null &&
                      c_data.game.grid[w[0]][w[1]].stone ===
                        data.game.grid[w[0]][w[1]].stone
                    ) {
                      return;
                    }
                    setClick(data, c_cursorDispatch);
                    c_setData(data);
                    if (c_phase === "Study" && c_studyPhase === "Guess") {
                      return studyStep(
                        data,
                        c_setData,
                        c_setFeedback,
                        c_setStudyPhase,
                        c_setAnswerMessage,
                      );
                    }
                  })
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
              }
            } else if (c_cursor.type === "Place") {
              if (c_cursor.dragging !== null && c_cursor.dragging.length > 0) {
                commands
                  .paint(c_cursor.paint, c_cursor.dragging, c_nextLabel)
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
              }
            } else if (c_cursor.type === "Drag") {
              if (w !== null && c_cursor.start !== null) {
                commands
                  .markRectangle(c_cursor.paint.value, c_cursor.start, [
                    w[0],
                    w[1],
                  ])
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
              }
            }
            c_cursorDispatch({
              type: "up",
            });
          }}
          onPointerCancel={() => {
            if (c_cursor.type === "Place") {
              if (c_cursor.dragging !== null && c_cursor.dragging.length > 0) {
                commands
                  .paint(c_cursor.paint, c_cursor.dragging, c_nextLabel)
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
              }
            }
            c_cursorDispatch({ type: "up" });
          }}
          onPointerLeave={() => {
            if (c_cursor.type === "Place") {
              if (c_cursor.dragging !== null && c_cursor.dragging.length > 0) {
                commands
                  .paint(c_cursor.paint, c_cursor.dragging, c_nextLabel)
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) =>
                    handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                  );
              }
            }
            c_cursorDispatch({ type: "up" });
          }}
        >
          <defs>
            <mask id="labelMask" maskUnits="objectBoundingBox">
              <rect
                x={viewBox[0]}
                y={viewBox[1]}
                width={viewBox[2]}
                height={viewBox[3]}
                fill="white"
              />
              {rows
                .flatMap((i) => cols.map((j) => [i, j]))
                .filter(
                  ([i, j]) =>
                    grid[i][j].stone === null &&
                    ((grid[i][j].mark !== null &&
                      grid[i][j].mark.type !== "BlackTerritory" &&
                      grid[i][j].mark.type !== "WhiteTerritory") ||
                      (c_cursor.type === "Place" &&
                        c_cursor.ghosts.some(
                          ([ii, jj]) => i == ii && j == jj,
                        ))),
                )
                .map(([i, j]) => (
                  <circle
                    cx={margin + square_size * i}
                    cy={margin + square_size * j}
                    r={0.4 * square_size}
                    strokeWidth={0}
                    fill="#00000"
                    filter="url(#gaussian-blur)"
                    key={JSON.stringify([i, j, "hole"])}
                  />
                ))}
            </mask>

            <filter id="flatten-alpha">
              <feComponentTransfer>
                <feFuncA type="linear" slope="999" />
              </feComponentTransfer>
            </filter>
            <filter id="invert-color">
              <feColorMatrix
                in="SourceGraphic"
                type="matrix"
                values="-1  0  0  0  1 
                         0 -1  0  0  1 
                         0  0 -1  0  1
                         0  0  0  1  0"
              />
            </filter>
            <filter id="gaussian-blur">
              <feGaussianBlur stdDeviation="5" />
            </filter>
          </defs>

          <image
            x="0"
            y="0"
            width={2 * margin + 18 * square_size}
            height={2 * margin + 18 * square_size}
            href={c_images.Board}
          />
          <g mask="url(#labelMask)" filter="url(#flatten-alpha)">
            <g>
              {rows.map((i) => (
                <path
                  d={`M${margin + square_size * i} ${lines[2]} ${margin + square_size * i} ${lines[3]}`}
                  stroke={"black"}
                  strokeWidth={`${1}px`}
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="crispEdges"
                  key={JSON.stringify([i, "row"])}
                />
              ))}
            </g>
            <g>
              {cols.map((j) => (
                <path
                  d={`M${lines[0]} ${margin + square_size * j} ${lines[1]} ${margin + square_size * j}`}
                  stroke={"black"}
                  strokeWidth={`${1}px`}
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="crispEdges"
                  key={JSON.stringify([j, "column"])}
                />
              ))}
            </g>
            <g>
              {[3, 9, 15]
                .flatMap((i) => [3, 9, 15].map((j) => [i, j]))
                .filter(([i, j]) => {
                  const [left, right, top, bottom] = c_window;
                  return top <= j && j <= bottom && left <= i && i <= right;
                })
                .map(([i, j]) => (
                  <circle
                    cx={margin + square_size * i}
                    cy={margin + square_size * j}
                    r={12}
                    fill="black"
                    key={JSON.stringify([i, j, "grid dot"])}
                  />
                ))}
            </g>
            <g>
              {borders.map(([x, y, text]) => (
                <text
                  x={x}
                  y={y}
                  width={square_size}
                  height={square_size}
                  textAnchor="middle"
                  dominantBaseline="central"
                  style={{
                    fill: "black",
                    WebkitUserSelect: "none",
                    font: "bold 40pt sans-serif",
                  }}
                  key={JSON.stringify([x, y, text])}
                >
                  {text}
                </text>
              ))}
            </g>
          </g>
          <g>
            {rows.flatMap((i) =>
              cols.map(
                (j) =>
                  grid[i][j].stone !== null && (
                    <image
                      x={square_size * i + margin - 0.5 * square_size}
                      y={square_size * j + margin - 0.5 * square_size}
                      width={square_size}
                      height={square_size}
                      href={c_images[grid[i][j].stone]}
                      key={JSON.stringify([i, j, grid[i][j].stone])}
                    />
                  ),
              ),
            )}
          </g>
          <g>
            {rows.flatMap((i) =>
              cols.map(
                (j) =>
                  grid[i][j].mark !== null &&
                  (grid[i][j].mark.type === "Label" ? (
                    <text
                      x={margin + square_size * i}
                      y={margin + square_size * j}
                      width={square_size}
                      height={square_size}
                      textAnchor="middle"
                      dominantBaseline="central"
                      key={JSON.stringify([i, j, grid[i][j].mark])}
                      style={{
                        fill:
                          grid[i][j].stone === "Black" ||
                          (c_cursor.ghosts.some(
                            ([ii, jj]) => i === ii && j === jj,
                          ) &&
                            cursorColor(c_cursor) === "Black")
                            ? "white"
                            : "black",
                        WebkitUserSelect: "none",
                        font: "bold 40pt sans-serif",
                      }}
                    >
                      {grid[i][j].mark.label}
                    </text>
                  ) : (
                    <image
                      x={square_size * i + margin - 0.5 * square_size}
                      y={square_size * j + margin - 0.5 * square_size}
                      width={square_size}
                      height={square_size}
                      href={c_images[grid[i][j].mark.type]}
                      filter={
                        !(
                          grid[i][j].mark.type === "BlackTerritory" ||
                          grid[i][j].mark.type === "WhiteTerritory"
                        ) &&
                        (grid[i][j].stone === "Black" ||
                          (c_cursor.ghosts.some(
                            ([ii, jj]) => i === ii && j === jj,
                          ) &&
                            cursorColor(c_cursor) === "Black"))
                          ? "url(#invert-color)"
                          : ""
                      }
                      key={JSON.stringify([i, j, grid[i][j].mark.type])}
                    />
                  )),
              ),
            )}
          </g>
          <g>
            {c_cursor.ghosts.map(([row, col]) => {
              const label_color =
                grid[row][col].stone === "Black" ? "white" : "black";
              let filter = label_color === "black" ? "" : "url(#invert-color)";
              let opacity = "0.6";
              if (
                c_cursor.paint.value !== "Label" &&
                (c_cursor.paint.value === "BlackTerritory" ||
                  c_cursor.paint.value === "WhiteTerritory" ||
                  c_cursor.paint.value === "DeleteMark" ||
                  c_cursor.paint.value === "Delete")
              ) {
                filter = "";
                opacity = "0.5";
              }
              return c_cursor.paint.value === "Label" ? (
                <text
                  x={margin + square_size * row}
                  y={margin + square_size * col}
                  width={square_size}
                  height={square_size}
                  textAnchor="middle"
                  dominantBaseline="central"
                  opacity={opacity}
                  style={{
                    fill: label_color,
                    WebkitUserSelect: "none",
                    font: "bold 40pt sans-serif",
                  }}
                  key={JSON.stringify([row, col, c_cursor, "label"])}
                >
                  {c_nextLabel}
                </text>
              ) : (
                <image
                  x={square_size * row + margin - 0.5 * square_size}
                  y={square_size * col + margin - 0.5 * square_size}
                  width={square_size}
                  height={square_size}
                  href={c_images[c_cursor.paint.value]}
                  filter={filter}
                  opacity={opacity}
                  key={JSON.stringify([row, col, c_cursor, "mark"])}
                />
              );
            })}
          </g>
        </svg>
      }
    </Paper>
  );
};

export default Board;
