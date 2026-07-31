import type { Grid } from "@/bindings";

import type { PaintTool, RectangleTool } from "@/AppContext/types";

import { useEffect, useReducer, useRef, useState } from "react";

import Paper from "@mui/material/Paper";

import {
  useCursorContext,
  useDataContext,
  useDispatchContext,
  useImagesContext,
  usePhaseContext,
  useWindowContext,
} from "@/AppContext";
import { commands } from "@/bindings";
import {
  cursorColor,
  markEquals,
  markEqualsCursor,
  setClick,
  studyStep,
} from "@/utils";

const letters = "ABCDEFGHJKLMNOPQRST".split("");

type GridAction =
  | {
      type: "set_temp";
      w: [number, number];
      cursor_tool: PaintTool | RectangleTool;
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
      if (action.cursor_tool.layer === "stone") {
        if (grid[r][c].stone ?? "Delete" !== action.cursor_tool.value) {
          const grid_ = structuredClone(grid);
          grid_[r][c].stone =
            action.cursor_tool.value === "Delete"
              ? null
              : action.cursor_tool.value;
          return grid_;
        }
      } else {
        if (
          !markEqualsCursor(
            grid[r][c].mark,
            action.cursor_tool.value,
            action.label,
          )
        ) {
          const grid_ = structuredClone(grid);
          grid_[r][c].mark =
            action.cursor_tool.value === "DeleteMark"
              ? null
              : action.cursor_tool.value !== "Label"
                ? { type: action.cursor_tool.value }
                : { type: "Label", label: action.label };
          return grid_;
        }
      }
      return grid;
    }
    case "set_grid": {
      if (
        action.grid.every((line, i) =>
          line.every(
            (loc, j) =>
              grid[i][j].stone === loc.stone &&
              markEquals(grid[i][j].mark, loc.mark),
          ),
        )
      ) {
        return grid;
      }
      return action.grid;
    }
  }
};

const ARRAY19 = [...Array(19)].map((_, i) => i);

const Board = () => {
  const [grid, gridDispatch] = useReducer(gridReducer, empty_grid);

  const { c_window } = useWindowContext();
  const { c_phase, c_studyPhase } = usePhaseContext();
  const { c_cursor, c_nextLabel } = useCursorContext();

  const { c_data } = useDataContext();
  const { c_images } = useImagesContext();
  const {
    c_handleError,
    c_setData,
    c_cursorDispatch,
    c_setStudyPhase,
    c_setWindow,
    c_setFeedback,
    c_setAnswerMessage,
  } = useDispatchContext();

  const board_svg = useRef<SVGSVGElement>(null);
  const paper = useRef<HTMLDivElement>(null);

  const square_size = 100;
  const margin = 150;
  const partial = 70; // dots for partial board.
  const partial_border = 0; // border from partial edges
  const board_size = 18 * square_size + 2 * margin;

  const [boardBoxWidth, setBoardBoxWidth] = useState("0px");
  const [boardBoxHeight, setBoardBoxHeight] = useState("0px");

  const data_window = useRef<[number, number, number, number]>([0, 18, 0, 18]);

  useEffect(() => {
    const new_data_window = c_data?.window ?? [0, 18, 0, 18];
    if (!data_window.current.every((v, i) => v === new_data_window[i])) {
      data_window.current = new_data_window;
      c_setWindow(new_data_window);
    }
  }, [c_data, c_setWindow]);

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

  const viewBox = [vbleft, vbtop, vbwidth, vbheight];

  const get_coord = (
    e: React.MouseEvent<SVGSVGElement>,
  ): [number, number] | null => {
    if (board_svg.current === null || c_data === null || c_data === undefined) {
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

    // correction for partial boards
    i += left + (left > 0 ? -partial_border / square_size : 0);
    j += top + (top > 0 ? -partial_border / square_size : 0);

    const si = Math.round(i);
    const sj = Math.round(j);
    if (!(si >= left && si <= right && sj >= top && sj <= bottom)) {
      return null;
    }

    if (c_cursor.type === "click") {
      if ((i - si) * (i - si) + (j - sj) * (j - sj) > 0.25) {
        return null;
      }
      if (c_data.game.grid[si][sj].stone !== null) {
        return null;
      }
    } else if (c_cursor.type === "paint") {
      if (
        c_cursor.tool.value === "Delete" ||
        c_cursor.tool.value === "DeleteMark"
      ) {
        return [si, sj];
      }
      if (c_cursor.tool.layer === "stone") {
        if (grid[si][sj].stone === c_cursor.tool.value) {
          return null;
        }
      } else {
        if (
          markEqualsCursor(grid[si][sj].mark, c_cursor.tool.value, c_nextLabel)
        ) {
          return null;
        }
      }
    }
    return [si, sj];
  };

  // fits board in app. This was easier than pure css.
  useEffect(() => {
    if (paper.current === null) {
      return;
    }

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
  }, [paper, vbwidth, vbheight]);

  useEffect(() => {
    if (c_data === null) {
      return;
    }

    gridDispatch({ type: "set_grid", grid: c_data.game.grid });
  }, [c_data]);

  const stroke_width = 0; // but it's 1??

  const partialLeft =
    left > 0 ? margin + square_size * left - partial - stroke_width / 2 : 0;

  const partialTop = top > 0 ? margin + square_size * top - partial : 0;

  const partialRight =
    right < 18
      ? margin + square_size * right + partial + stroke_width / 2
      : board_size;

  const partialBottom =
    bottom < 18 ? margin + square_size * bottom + partial : board_size;

  const borders: [number, number, string][] = [];
  if (left == 0) {
    for (let j = top; j <= bottom; j++) {
      borders.push([margin - 70, margin + square_size * j, String(19 - j)]);
    }
  }
  if (right == 18) {
    for (let j = top; j <= bottom; j++) {
      borders.push([
        board_size - margin + 70,
        margin + square_size * j,
        String(19 - j),
      ]);
    }
  }
  if (top == 0) {
    for (let i = left; i <= right; i++) {
      borders.push([margin + square_size * i, margin - 70, letters[i]]);
    }
  }
  if (bottom == 18) {
    for (let i = left; i <= right; i++) {
      borders.push([
        margin + square_size * i,
        board_size - margin + 70,
        letters[i],
      ]);
    }
  }

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
            touchAction: "none",
          }}
          onContextMenu={(e) => {
            e.preventDefault();
          }}
          onPointerDown={(e) => {
            if (board_svg.current !== null) {
              board_svg.current.setPointerCapture(e.pointerId);
            }
            e.preventDefault();
            const w = get_coord(e);
            if (e.button === 2) {
              c_cursorDispatch({
                type: "rightdown",
                w: w,
              });
            } else {
              c_cursorDispatch({
                type: "down",
                w: w,
              });

              if (c_cursor.type === "paint") {
                if (w !== null) {
                  gridDispatch({
                    type: "set_temp",
                    w: w,
                    cursor_tool: c_cursor.tool,
                    label: c_nextLabel,
                  });
                }
              }
            }

            /*   */
          }}
          onPointerMove={async (e) => {
            const w = get_coord(e);

            c_cursorDispatch({
              type: "move",
              w: w,
            });
            if (
              c_cursor.type === "paint" &&
              c_cursor.dragging !== null &&
              w !== null
            ) {
              gridDispatch({
                type: "set_temp",
                w: w,
                cursor_tool: c_cursor.tool,
                label: c_nextLabel,
              });
            }
          }}
          onPointerUp={(e) => {
            if (
              board_svg.current !== null &&
              board_svg.current.hasPointerCapture(e.pointerId)
            ) {
              board_svg.current.releasePointerCapture(e.pointerId);
            }
            const w = get_coord(e);
            if (c_cursor.type === "click") {
              if (e.button === 2) {
                if (!(c_phase === "Study" && c_studyPhase === "Guess")) {
                  commands
                    .undo()
                    .then(() => commands.getData())
                    .then((data) => {
                      c_setData(data);
                      setClick(data, c_cursorDispatch);
                      c_setStudyPhase((old_phase) =>
                        old_phase === "UnknownGuess" ? "Guess" : old_phase,
                      );
                    })
                    .catch((e) => c_handleError(e));
                }
              } else {
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
                    .catch((e) => c_handleError(e));
                }
              }
            } else if (c_cursor.type === "paint") {
              if (c_cursor.dragging !== null && c_cursor.dragging.length > 0) {
                commands
                  .paint(c_cursor.tool, c_cursor.dragging, c_nextLabel)
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) => c_handleError(e));
              }
            } else if (c_cursor.type === "rectangle") {
              if (w !== null && c_cursor.start !== null) {
                commands
                  .markRectangle(c_cursor.tool.value, c_cursor.start, [
                    w[0],
                    w[1],
                  ])
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) => c_handleError(e));
              }
            }
            c_cursorDispatch({
              type: "up",
            });
          }}
          onPointerCancel={() => {
            if (c_cursor.type === "paint") {
              if (c_cursor.dragging !== null && c_cursor.dragging.length > 0) {
                commands
                  .paint(c_cursor.tool, c_cursor.dragging, c_nextLabel)
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) => c_handleError(e));
              }
            }
            c_cursorDispatch({ type: "up" });
          }}
          onPointerLeave={() => {
            if (c_cursor.type === "paint") {
              if (c_cursor.dragging !== null && c_cursor.dragging.length > 0) {
                commands
                  .paint(c_cursor.tool, c_cursor.dragging, c_nextLabel)
                  .then(() => commands.getData())
                  .then((data) => c_setData(data))
                  .catch((e) => c_handleError(e));
              }
            }
            c_cursorDispatch({ type: "up" });
          }}
        >
          <defs>
            <mask id="viewMask" maskUnits="objectBoundingBox">
              <rect
                x={partialLeft}
                y={partialTop}
                width={partialRight - partialLeft}
                height={partialBottom - partialTop}
                fill="white"
              />
            </mask>
            <mask id="labelMask" maskUnits="objectBoundingBox">
              <rect
                x={partialLeft}
                y={partialTop}
                width={partialRight - partialLeft}
                height={partialBottom - partialTop}
                fill="white"
              />
              {ARRAY19.flatMap((i) => ARRAY19.map((j) => [i, j]))
                .filter(
                  ([i, j]) =>
                    grid[i][j].stone === null &&
                    ((grid[i][j].mark !== null &&
                      grid[i][j].mark.type !== "BlackTerritory" &&
                      grid[i][j].mark.type !== "WhiteTerritory") ||
                      (c_cursor.type === "paint" &&
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
              {ARRAY19.map((i) => (
                <path
                  d={`M${margin + square_size * i} ${margin} ${margin + square_size * i} ${board_size - margin}`}
                  stroke={"black"}
                  strokeWidth={`${1}px`}
                  vectorEffect="non-scaling-stroke"
                  shapeRendering="crispEdges"
                  key={JSON.stringify([i, "row"])}
                />
              ))}
            </g>
            <g>
              {ARRAY19.map((j) => (
                <path
                  d={`M${margin} ${margin + square_size * j} ${board_size - margin} ${margin + square_size * j}`}
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
          <g mask="url(#viewMask)">
            {ARRAY19.flatMap((i) =>
              ARRAY19.map(
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
          <g mask="url(#viewMask)">
            {ARRAY19.flatMap((i) =>
              ARRAY19.map(
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
          <g mask="url(#viewMask)">
            {c_cursor.ghosts.map(([row, col]) => {
              const label_color =
                grid[row][col].stone === "Black" ? "white" : "black";
              let filter = label_color === "black" ? "" : "url(#invert-color)";
              let opacity = "0.6";
              if (
                c_cursor.tool.value !== "Label" &&
                (c_cursor.tool.value === "BlackTerritory" ||
                  c_cursor.tool.value === "WhiteTerritory" ||
                  c_cursor.tool.value === "DeleteMark" ||
                  c_cursor.tool.value === "Delete")
              ) {
                filter = "";
                opacity = "0.5";
              }
              return c_cursor.tool.value === "Label" ? (
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
                  key={JSON.stringify([row, col, c_cursor.tool.value, "label"])}
                >
                  {c_nextLabel}
                </text>
              ) : (
                <image
                  x={square_size * row + margin - 0.5 * square_size}
                  y={square_size * col + margin - 0.5 * square_size}
                  width={square_size}
                  height={square_size}
                  href={c_images[c_cursor.tool.value]}
                  filter={filter}
                  opacity={opacity}
                  key={JSON.stringify([row, col, c_cursor.tool.value, "mark"])}
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
