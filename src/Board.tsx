import type { Color, Mark } from "./bindings";

await import("react");
const { useEffect, useState, useRef, useContext, useCallback } =
  await import("react");

const Paper = (await import("@mui/material/Paper")).default;

const AppContext = (await import("./AppContext")).default;
const { CursorType } = await import("./AppContext");
const { commands } = await import("./bindings");
const { cursorMark, handleError, label, studyStep } = await import("./utils");

const black_image = (await import("./assets/black_night.png")).default;
const black_territory_icon = (await import("./assets/black_territory.svg"))
  .default;
const board_image = (await import("./assets/board.jpeg")).default;
const circle_icon = (await import("./assets/circle.svg")).default;
const cross_icon = (await import("./assets/cross.svg")).default;
const delete_mark_icon = (await import("./assets/delete_mark.svg")).default;
const mui_clear = (await import("./assets/mui_clear.svg")).default;
const square_icon = (await import("./assets/square.svg")).default;
const triangle_icon = (await import("./assets/triangle.svg")).default;
const white_image = (await import("./assets/white_anime.png")).default;
const white_territory_icon = (await import("./assets/white_territory.svg"))
  .default;

const Board = () => {
  const mark_icons = {
    Triangle: triangle_icon,
    Circle: circle_icon,
    Cross: cross_icon,
    Square: square_icon,
    BlackTerritory: black_territory_icon,
    WhiteTerritory: white_territory_icon,
  };
  const cursor_icons = {
    Delete: mui_clear,
    DeleteMark: delete_mark_icon,
    Black: black_image,
    White: white_image,
    Triangle: triangle_icon,
    Circle: circle_icon,
    Cross: cross_icon,
    Square: square_icon,
    BlackTerritory: black_territory_icon,
    WhiteTerritory: white_territory_icon,
  };
  const {
    c_phase,
    c_editingPhase,
    c_studyPhase,
    c_data,
    c_setData,
    c_cursor,
    c_setCursor,
    c_nextLabel,
    c_setNextLabel,
    c_window,
    c_setFeedback,
    c_setStudyPhase,
    c_setWindow,
  } = useContext(AppContext);
  const board_svg = useRef<SVGSVGElement>(null);
  const paper = useRef<HTMLDivElement>(null);

  const square_size = 100;
  const margin = 150;
  const partial = 70; // dots for partial board.
  const partial_border = 0; // border from partial edges

  const [dragStart, setDragStart] = useState<[number, number] | null>(null);
  const [dragCurrent, setDragCurrent] = useState<[number, number] | null>(null);
  const [ghosts, setGhosts] = useState<[number, number][]>([]); // [row, column]

  useEffect(() => {
    if (dragCurrent === null) {
      setGhosts([]);
    } else if (dragStart === null) {
      setGhosts([dragCurrent]);
    } else {
      let [r, c] = dragStart;
      let [rr, cc] = dragCurrent;
      if (r > rr) {
        [r, rr] = [rr, r];
      }
      if (c > cc) {
        [c, cc] = [cc, c];
      }
      const newGhosts: [number, number][] = [];
      for (let row = r; row <= rr; row++) {
        for (let col = c; col <= cc; col++) {
          newGhosts.push([row, col]);
        }
      }
      setGhosts((oldGhosts) =>
        JSON.stringify(oldGhosts.toSorted()) ===
        JSON.stringify(newGhosts.toSorted())
          ? oldGhosts
          : newGhosts,
      );
    }
  }, [dragStart, dragCurrent]);

  const [dragging, setDragging] = useState(false);

  const [boardBoxWidth, setBoardBoxWidth] = useState("0px");
  const [boardBoxHeight, setBoardBoxHeight] = useState("0px");
  const [stones, setStones] = useState<[number, number, Color][]>([]); // [row, column, color]
  const [marks, setMarks] = useState<[number, number, Mark][]>([]);

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

  const get_mode = useCallback(() => {
    if (
      !(
        (c_phase === "Editing" || c_studyPhase === "Edit") &&
        c_editingPhase === "Initialize"
      ) &&
      (c_cursor === "Black" || c_cursor === "White")
    ) {
      return "Click";
    }
    if (
      c_cursor === "BlackTerritory" ||
      c_cursor === "WhiteTerritory" ||
      c_cursor === "DeleteMark"
    ) {
      return "DragRectangle";
    }
    return "DragPlace";
  }, [c_cursor, c_phase, c_editingPhase, c_studyPhase]);

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

    const [left, right, top, bottom] = c_window;

    // correction for partial boards
    i += left + (left > 0 ? -partial_border / square_size : 0);
    j += top + (top > 0 ? -partial_border / square_size : 0);

    const si = Math.round(i);
    const sj = Math.round(j);

    if (!(si >= left && si <= right && sj >= top && sj <= bottom)) {
      return null;
    }

    const mode = get_mode();

    if (mode === "Click") {
      if ((i - si) * (i - si) + (j - sj) * (j - sj) > 0.25) {
        return null;
      }
      if (c_data.game.stones[si][sj] !== null) {
        return null;
      }
    } else if (mode === "DragPlace") {
      if (c_cursor === "Delete") {
        //if (c_data.game.stones[si][sj] === null) {
        //  return null;
        //}
      } else if (c_cursor === "Black" || c_cursor === "White") {
        if (c_data.game.stones[si][sj] === c_cursor) {
          return null;
        }
      } else if (c_cursor === "DeleteMark") {
        if (c_data.game.marks[si][sj] === null) {
          return null;
        }
      } else if (c_cursor === "Label") {
        if (label(c_data.game.marks[si][sj]) === c_nextLabel) {
          return null;
        }
      } else {
        if (c_data.game.marks[si][sj] === c_cursor) {
          return null;
        }
      }
    }
    return [si, sj];
  };

  const [viewBox, setViewBox] = useState<[number, number, number, number]>([
    0, 0, 2100, 2100,
  ]);

  const dragEnd = (
    wmode:
      | { mode: "Click"; w: [number, number] }
      | { mode: "DragRectangle"; w: [number, number] }
      | { mode: "DragPlace" },
  ) => {
    if (wmode.mode === "Click") {
      if (c_cursor !== "Black" && c_cursor !== "White") {
        console.log("invalid cursor in click mode");
        return;
      }
      commands
        .play([wmode.w[0], wmode.w[1]], c_cursor)
        .then(() => commands.getData())
        .then((data) => {
          const contextdata = c_data;
          if (
            contextdata !== null &&
            contextdata.game.stones[wmode.w[0]][wmode.w[1]] ===
              data.game.stones[wmode.w[0]][wmode.w[1]]
          ) {
            return;
          }
          c_setData(data);
          if (c_phase === "Study" && c_studyPhase === "Guess") {
            studyStep(
              data,
              c_setData,
              c_setFeedback,
              c_setStudyPhase,
              c_cursor,
            );
          }
        })
        .catch((e) => handleError(e));
    } else if (wmode.mode === "DragPlace") {
      const contextcursor = c_cursor;
      if (
        contextcursor === "Black" ||
        contextcursor === "White" ||
        contextcursor === "Delete"
      ) {
        commands
          .setStones(stones)
          .then(() => commands.getData())
          .then((data) => c_setData(data));
      } else {
        commands
          .setMarks(marks)
          .then(() => commands.getData())
          .then((data) => c_setData(data));
      }
    } else if (wmode.mode === "DragRectangle") {
      //if (dragStart === null) {
      //return;
      //}

      const contextcursor = c_cursor;
      if (!(
        contextcursor === "BlackTerritory" ||
        contextcursor === "WhiteTerritory" ||
        contextcursor === "DeleteMark"
      )) {
        console.log("Invalid cursor in dragRectangle mode");
        return;
      }
      const start = dragStart === null ? [wmode.w[0], wmode.w[1]] : dragStart;
      commands
        .setMarksWindow(contextcursor === "DeleteMark" ? null : contextcursor, [
          start[0],
          wmode.w[0],
          start[1],
          wmode.w[1],
        ])
        .then(() => commands.getData())
        .then((data) => {
          c_setData(data);
          setDragStart(null);
        });
      return;
    }
  };

  const drag = (w: [number, number]) => {
    const contextcursor = c_cursor;
    const mode = get_mode();
    if (mode === "DragPlace") {
      if (contextcursor === "Delete") {
        if (stones.some((stone) => w[0] === stone[0] && w[1] === stone[1])) {
          setStones((oldSet) =>
            oldSet.filter((stone) => w[0] !== stone[0] || w[1] !== stone[1]),
          );
        }
      } else if (contextcursor === "Black" || contextcursor === "White") {
        if (
          !stones.some(
            (stone) =>
              w[0] === stone[0] && w[1] === stone[1] && c_cursor == stone[2],
          )
        ) {
          setStones((oldSet) => {
            if (
              !oldSet.some(
                (stone) =>
                  w[0] === stone[0] &&
                  w[1] === stone[1] &&
                  c_cursor == stone[2],
              )
            ) {
              return [
                ...oldSet.filter(
                  (stone) => w[0] !== stone[0] || w[1] !== stone[1],
                ),
                [w[0], w[1], contextcursor],
              ];
            } else {
              return oldSet;
            }
          });
        }
      } else {
        if (contextcursor === "DeleteMark") {
          console.log("cursor shouldn't be DeleteMark in DragPlace mode");
          return;
        }
        if (
          !marks.some(
            ([i, j, mark]) =>
              i === w[0] &&
              j === w[1] &&
              ((contextcursor === "Label" && label(mark) === c_nextLabel) ||
                mark === contextcursor),
          )
        ) {
          setMarks((oldSet) => {
            if (
              !oldSet.some(
                ([i, j, mark]) =>
                  i === w[0] &&
                  j === w[1] &&
                  ((contextcursor === "Label" && label(mark) === c_nextLabel) ||
                    mark === contextcursor),
              )
            ) {
              return [
                ...oldSet.filter(
                  (stone) => w[0] !== stone[0] || w[1] !== stone[1],
                ),
                [
                  w[0],
                  w[1],
                  contextcursor === "Label"
                    ? { Label: c_nextLabel }
                    : cursorMark(contextcursor),
                ],
              ];
            } else {
              return oldSet;
            }
          });
        }
      }
    }
  };

  // fits board in app. This was easier than pure css.
  useEffect(() => {
    if (paper.current === null) {
      return;
    }

    const [left, right, top, bottom] = c_window;
    console.log("aah!");

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
      console.log("oh noo");
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
    const new_stones: [number, number, Color][] = [];
    const new_marks: [number, number, Mark][] = [];
    const [left, right, top, bottom] = c_window;

    for (let i = left; i <= right; i++) {
      for (let j = top; j <= bottom; j++) {
        const w = c_data.game.stones[i][j];

        if (w !== null) {
          new_stones.push([i, j, w]);
        }
        const mark = c_data.game.marks[i][j];
        if (mark !== null) {
          new_marks.push([i, j, mark]);
        }
      }
    }
    setStones(new_stones);
    setMarks(new_marks);
    setGhosts([]);

    const mode = get_mode();
    if (mode === "Click") {
      c_setCursor(
        c_data.color === "Black" ? CursorType.White : CursorType.Black,
      );
    }
  }, [c_window, c_data, c_setCursor, get_mode]);

  useEffect(() => {
    if (c_data === null || c_data === undefined) {
      return;
    }

    const ch = c_nextLabel.charCodeAt(0);

    if (
      c_nextLabel.length !== 1 ||
      ch < "A".charCodeAt(0) ||
      ch >= "Z".charCodeAt(0)
    ) {
      return;
    }

    // is(n't) there a better place for this?
    let seen_once = false;
    for (const row of c_data.game.marks) {
      for (const mark of row) {
        if (label(mark) === c_nextLabel) {
          if (seen_once) {
            return;
          }
          seen_once = true;
        }
      }
    }
    if (seen_once) {
      c_setNextLabel(String.fromCharCode(ch + 1));
      return;
    }
  }, [c_data, c_nextLabel, c_setNextLabel]);

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

    console.log("BBBB");

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
    console.log(
      hline_start,
      hline_end,
      vline_start,
      vline_end,
      left,
      right,
      top,
      bottom,
    );

    const newBorders: [number, number, string][] = [];
    const letters = "ABCDEFGHJKLMNOPQRST".split("");
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
          //viewBox={`${viewBoxLeft} ${viewBoxTop} ${viewBoxWidth} ${viewBoxHeight}`}
          viewBox={`${viewBox[0]} ${viewBox[1]} ${viewBox[2]} ${viewBox[3]}`}
          style={{
            width: boardBoxWidth,
            height: boardBoxHeight,
            margin: "20px",
          }}
          onMouseDown={(e) => {
            const w = get_coord(e);
            const mode = get_mode();
            if (mode === "DragPlace") {
              setDragging(true);
              if (c_cursor !== "Delete") {
                setDragCurrent(null);
              }
              if (w !== null) {
                drag(w);
              }
            } else if (mode === "DragRectangle") {
              if (w === null) {
                return;
              }
              setDragStart(w);
              setDragCurrent(w);
            }
          }}
          onMouseUp={(e) => {
            const mode = get_mode();
            if (mode === "Click") {
              const w = get_coord(e);
              if (w === null) {
                return;
              }
              dragEnd({ mode: mode, w: w });
            } else if (mode === "DragPlace") {
              setDragging(false);
              dragEnd({ mode: mode });
            } else if (mode === "DragRectangle") {
              const w = get_coord(e);
              if (w === null) {
                return;
              }
              dragEnd({ mode: mode, w: w });
            }
          }}
          onMouseMove={async (e) => {
            const w = get_coord(e);
            if (w === null) {
              setDragCurrent(null);

              return;
            }

            if (!(
              w !== null &&
              dragCurrent !== null &&
              w[0] === dragCurrent[0] &&
              w[1] === dragCurrent[1]
            )) {
              const mode = get_mode();
              setDragCurrent(w);
              if (mode === "DragPlace" && dragging) {
                drag(w);
              }
            }
          }}
          onClick={async (e) => {
            const w = get_coord(e);
            if (w === null) {
              return;
            }
            const mode = get_mode();
            if (mode === "Click") {
              dragEnd({ mode: mode, w: w });
            } else if (mode === "DragRectangle") {
              dragEnd({ mode: mode, w: w });
            } else if (mode === "DragPlace") {
              dragEnd({ mode: mode });
            }
          }}
          onMouseLeave={() => {
            const mode = get_mode();
            if (mode === "DragPlace") {
              setDragging(false);
              dragEnd({ mode: mode });
            } else if (mode === "DragRectangle") {
              setDragStart(null);
            }
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
                    !stones.some(([ii, jj]) => i === ii && j === jj) &&
                    !ghosts.some(
                      ([ii, jj]) =>
                        i === ii &&
                        j === jj &&
                        (c_cursor === "BlackTerritory" ||
                          c_cursor === "WhiteTerritory"),
                    ) &&
                    (ghosts.some(
                      ([ii, jj]) =>
                        i === ii &&
                        j === jj &&
                        c_cursor !== "BlackTerritory" &&
                        c_cursor !== "WhiteTerritory" &&
                        c_cursor !== "Black" &&
                        c_cursor !== "White" &&
                        c_cursor !== "Delete" &&
                        c_cursor !== "DeleteMark",
                    ) ||
                      marks.some(
                        ([ii, jj, type]) =>
                          i === ii &&
                          j === jj &&
                          type !== "BlackTerritory" &&
                          type !== "WhiteTerritory",
                      )),
                )
                .map(([i, j]) => (
                  <circle
                    cx={margin + square_size * i}
                    cy={margin + square_size * j}
                    r={0.4 * square_size}
                    strokeWidth={0}
                    fill="#00000"
                    filter="url(#gaussian-blur)"
                    key={JSON.stringify([i, j])}
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
            href={board_image}
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
                  key={i}
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
                  key={j}
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
                    key={JSON.stringify([i, j])}
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
                  key={JSON.stringify([x, y])}
                >
                  {text}
                </text>
              ))}
            </g>
          </g>
          <g>
            {stones.map(([i, j, w]) => (
              <image
                x={square_size * i + margin - 0.5 * square_size}
                y={square_size * j + margin - 0.5 * square_size}
                width={square_size}
                height={square_size}
                href={w === "Black" ? black_image : white_image}
                key={JSON.stringify([i, j, w])}
              />
            ))}
          </g>
          <g>
            {marks
              .filter(
                ([i, j]) =>
                  c_cursor === "Black" ||
                  c_cursor === "White" ||
                  c_cursor === "Delete" ||
                  c_cursor === "DeleteMark" ||
                  !ghosts.some(([ii, jj]) => i === ii && j === jj),
              )
              .map(([i, j, mark]) =>
                typeof mark !== "string" ? (
                  <text
                    x={margin + square_size * i}
                    y={margin + square_size * j}
                    width={square_size}
                    height={square_size}
                    textAnchor="middle"
                    dominantBaseline="central"
                    key={JSON.stringify([i, j, mark])}
                    style={{
                      fill:
                        stones.some(
                          ([ii, jj, color]) =>
                            ii === i && jj === j && color === "Black",
                        ) ||
                        ghosts.some(
                          ([ii, jj]) =>
                            ii === i && jj === j && c_cursor === "Black",
                        )
                          ? "white"
                          : "black",
                      WebkitUserSelect: "none",
                      font: "bold 40pt sans-serif",
                    }}
                  >
                    {label(mark)}
                  </text>
                ) : (
                  <image
                    x={square_size * i + margin - 0.5 * square_size}
                    y={square_size * j + margin - 0.5 * square_size}
                    width={square_size}
                    height={square_size}
                    href={mark_icons[mark]}
                    filter={
                      (stones.some(
                        ([ii, jj, color]) =>
                          ii === i && jj === j && color === "Black",
                      ) ||
                        ghosts.some(
                          ([ii, jj]) =>
                            ii === i && jj === j && c_cursor === "Black",
                        )) &&
                      !(mark === "BlackTerritory" || mark === "WhiteTerritory")
                        ? "url(#invert-color)"
                        : ""
                    }
                    key={JSON.stringify([i, j, mark, label])}
                  />
                ),
              )}
          </g>
          <g>
            {ghosts.map(([row, col]) => {
              const label_color =
                c_data?.game.stones[row][col] === "Black" ? "white" : "black";
              let filter = label_color === "black" ? "" : "url(#invert-color)";
              let opacity = "0.6";
              if (
                c_cursor === "BlackTerritory" ||
                c_cursor === "WhiteTerritory" ||
                c_cursor === "DeleteMark" ||
                c_cursor === "Delete"
              ) {
                filter = "";
                opacity = "0.5";
              }
              return c_cursor === "Label" ? (
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
                  key={JSON.stringify([row, col, c_cursor])}
                >
                  {c_nextLabel}
                </text>
              ) : (
                <image
                  x={square_size * row + margin - 0.5 * square_size}
                  y={square_size * col + margin - 0.5 * square_size}
                  width={square_size}
                  height={square_size}
                  href={cursor_icons[c_cursor]}
                  filter={filter}
                  opacity={opacity}
                  key={JSON.stringify([row, col, c_cursor])}
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
