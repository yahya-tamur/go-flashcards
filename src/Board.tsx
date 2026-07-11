const { CursorType } = await import("./AppContext");

import type { Color, Mark } from "./bindings";
const { commands } = await import("./bindings");
const { cursorMark, handleError, label, studyStep } = await import("./utils");

const { useEffect, useState, useRef, useContext } = await import("react");

const Paper = (await import("@mui/material/Paper")).default;

const AppContext = (await import("./AppContext")).default;

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

export default () => {
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
  const context = useContext(AppContext);
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
      let newGhosts: [number, number][] = [];
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
    let contextdata = context.data;
    if (contextdata === null) {
      return;
    }
    if (
      contextdata !== null &&
      !context.window.every((val, index) => contextdata.window[index] === val)
    ) {
      context.setWindow(contextdata.window);
    }
  }, [context.data]);

  const get_mode = () => {
    if (
      !(
        (context.phase === "Editing" || context.studyPhase === "Edit") &&
        context.editingPhase === "Initialize"
      ) &&
      (context.cursor === "Black" || context.cursor === "White")
    ) {
      return "Click";
    }
    if (
      context.cursor === "BlackTerritory" ||
      context.cursor === "WhiteTerritory" ||
      context.cursor === "DeleteMark"
    ) {
      return "DragRectangle";
    }
    return "DragPlace";
  };

  const get_coord = (
    e: React.MouseEvent<SVGSVGElement>,
  ): [number, number] | null => {
    if (
      board_svg.current === null ||
      context.data === null ||
      context.data === undefined
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

    let [left, right, top, bottom] = context.window;

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
      if (context.data.game.stones[si][sj] !== null) {
        return null;
      }
    } else if (mode === "DragPlace") {
      if (context.cursor === "Delete") {
        //if (context.data.game.stones[si][sj] === null) {
        //  return null;
        //}
      } else if (context.cursor === "Black" || context.cursor === "White") {
        if (context.data.game.stones[si][sj] === context.cursor) {
          return null;
        }
      } else if (context.cursor === "DeleteMark") {
        if (context.data.game.marks[si][sj] === null) {
          return null;
        }
      } else if (context.cursor === "Label") {
        if (label(context.data.game.marks[si][sj]) === context.nextLabel) {
          return null;
        }
      } else {
        if (context.data.game.marks[si][sj] === context.cursor) {
          return null;
        }
      }
    } else if (mode === "DragRectangle") {
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
      if (context.cursor !== "Black" && context.cursor !== "White") {
        console.log("invalid cursor in click mode");
        return;
      }
      commands
        .play([wmode.w[0], wmode.w[1]], context.cursor)
        .then(() => commands.getData())
        .then((data) => {
          let contextdata = context.data;
          if (
            contextdata !== null &&
            contextdata.game.stones[wmode.w[0]][wmode.w[1]] ===
              data.game.stones[wmode.w[0]][wmode.w[1]]
          ) {
            return;
          }
          context.setData(data);
          if (context.phase === "Study" && context.studyPhase === "Guess") {
            studyStep(data, context);
          }
        })
        .catch((e) => handleError(e));
    } else if (wmode.mode === "DragPlace") {
      let contextcursor = context.cursor;
      if (
        contextcursor === "Black" ||
        contextcursor === "White" ||
        contextcursor === "Delete"
      ) {
        commands
          .setStones(stones)
          .then(() => commands.getData())
          .then((data) => context.setData(data));
      } else {
        commands
          .setMarks(marks)
          .then(() => commands.getData())
          .then((data) => context.setData(data));
      }
    } else if (wmode.mode === "DragRectangle") {
      //if (dragStart === null) {
      //return;
      //}

      let contextcursor = context.cursor;
      if (!(
        contextcursor === "BlackTerritory" ||
        contextcursor === "WhiteTerritory" ||
        contextcursor === "DeleteMark"
      )) {
        console.log("Invalid cursor in dragRectangle mode");
        return;
      }
      let start = dragStart === null ? [wmode.w[0], wmode.w[1]] : dragStart;
      commands
        .setMarksWindow(contextcursor === "DeleteMark" ? null : contextcursor, [
          start[0],
          wmode.w[0],
          start[1],
          wmode.w[1],
        ])
        .then(() => commands.getData())
        .then((data) => {
          context.setData(data);
          setDragStart(null);
        });
      return;
    }
  };

  const drag = (w: [number, number]) => {
    let contextcursor = context.cursor;
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
              w[0] === stone[0] &&
              w[1] === stone[1] &&
              context.cursor == stone[2],
          )
        ) {
          setStones((oldSet) => {
            if (
              !oldSet.some(
                (stone) =>
                  w[0] === stone[0] &&
                  w[1] === stone[1] &&
                  context.cursor == stone[2],
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
        contextcursor;
        if (contextcursor === "DeleteMark") {
          console.log("cursor shouldn't be DeleteMark in DragPlace mode");
          return;
        }
        if (
          !marks.some(
            ([i, j, mark]) =>
              i === w[0] &&
              j === w[1] &&
              ((contextcursor === "Label" &&
                label(mark) === context.nextLabel) ||
                mark === contextcursor),
          )
        ) {
          setMarks((oldSet) => {
            if (
              !oldSet.some(
                ([i, j, mark]) =>
                  i === w[0] &&
                  j === w[1] &&
                  ((contextcursor === "Label" &&
                    label(mark) === context.nextLabel) ||
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
                    ? { Label: context.nextLabel }
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

    let [left, right, top, bottom] = context.window;
    console.log("aah!");

    // Offset viewBox.

    //maybe add bigger margin for edges or letters on every side
    let vbleft = square_size * left + (left > 0 ? -partial_border : 0);
    let vbtop = square_size * top + (top > 0 ? -partial_border : 0);
    let vbwidth =
      2 * margin +
      (right - left) * square_size +
      (left > 0 ? partial_border : 0) +
      (right < 18 ? partial_border : 0);
    let vbheight =
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
      let [width, height] = current_size;

      let ratio = Math.min(
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
  }, [paper, context.window]);

  useEffect(() => {
    if (context.data === null) {
      return;
    }
    let new_stones: [number, number, Color][] = [];
    let new_marks: [number, number, Mark][] = [];
    let [left, right, top, bottom] = context.window;

    for (let i = left; i <= right; i++) {
      for (let j = top; j <= bottom; j++) {
        const w = context.data.game.stones[i][j];

        if (w !== null) {
          new_stones.push([i, j, w]);
        }
        let mark = context.data.game.marks[i][j];
        if (mark !== null) {
          new_marks.push([i, j, mark]);
        }
      }
    }
    setStones(new_stones);
    setMarks(new_marks);
    setGhosts([]);

    let mode = get_mode();
    if (mode === "Click") {
      context.setCursor(
        context.data.color === "Black" ? CursorType.White : CursorType.Black,
      );
    }
  }, [context.window, context.data]);

  useEffect(() => {
    if (context.data === null || context.data === undefined) {
      return;
    }

    let ch = context.nextLabel.charCodeAt(0);

    if (
      context.nextLabel.length !== 1 ||
      ch < "A".charCodeAt(0) ||
      ch >= "Z".charCodeAt(0)
    ) {
      return;
    }

    // is(n't) there a better place for this?
    let seen_once = false;
    for (const row of context.data.game.marks) {
      for (const mark of row) {
        if (label(mark) === context.nextLabel) {
          if (seen_once) {
            return;
          }
          seen_once = true;
        }
      }
    }
    if (seen_once) {
      context.setNextLabel(String.fromCharCode(ch + 1));
      return;
    }
  }, [context.data]);

  //maybe just always do 0..19?
  const [rows, setRows] = useState<number[]>([]);
  const [cols, setCols] = useState<number[]>([]);
  const [lines, setLines] = useState<number[]>([]);
  const [borders, setBorders] = useState<[number, number, string][]>([]);

  useEffect(() => {
    let [left, right, top, bottom] = context.window;

    let newRows: number[] = [];
    for (let i = left; i <= right; i++) {
      newRows.push(i);
    }
    setRows(newRows);

    let newCols: number[] = [];
    for (let j = top; j <= bottom; j++) {
      newCols.push(j);
    }
    setCols(newCols);

    console.log("BBBB");

    let stroke_width = 0; // but it's 1??
    let hline_start =
      margin +
      square_size * left +
      (left > 0 ? -partial : 0) -
      stroke_width / 2;
    let hline_end =
      margin +
      square_size * right +
      (right < 18 ? partial : 0) +
      stroke_width / 2;
    let vline_start = margin + square_size * top + (top > 0 ? -partial : 0);
    let vline_end = margin + square_size * bottom + (bottom < 18 ? partial : 0);
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

    let newBorders: [number, number, string][] = [];
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
  }, [context.window]);

  let letters = "ABCDEFGHJKLMNOPQRST".split("");

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
              if (context.cursor !== "Delete") {
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
              let w = get_coord(e);
              if (w === null) {
                return;
              }
              dragEnd({ mode: mode, w: w });
            } else if (mode === "DragPlace") {
              setDragging(false);
              dragEnd({ mode: mode });
            } else if (mode === "DragRectangle") {
              let w = get_coord(e);
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
                        (context.cursor === "BlackTerritory" ||
                          context.cursor === "WhiteTerritory"),
                    ) &&
                    (ghosts.some(
                      ([ii, jj]) =>
                        i === ii &&
                        j === jj &&
                        context.cursor !== "BlackTerritory" &&
                        context.cursor !== "WhiteTerritory" &&
                        context.cursor !== "Black" &&
                        context.cursor !== "White" &&
                        context.cursor !== "Delete" &&
                        context.cursor !== "DeleteMark",
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
                  let [left, right, top, bottom] = context.window;
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
                  context.cursor === "Black" ||
                  context.cursor === "White" ||
                  context.cursor === "Delete" ||
                  context.cursor === "DeleteMark" ||
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
                            ii === i && jj === j && context.cursor === "Black",
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
                            ii === i && jj === j && context.cursor === "Black",
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
              let label_color =
                context.data?.game.stones[row][col] === "Black"
                  ? "white"
                  : "black";
              let filter = label_color === "black" ? "" : "url(#invert-color)";
              let opacity = "0.6";
              if (
                context.cursor === "BlackTerritory" ||
                context.cursor === "WhiteTerritory" ||
                context.cursor === "DeleteMark" ||
                context.cursor === "Delete"
              ) {
                filter = "";
                opacity = "0.5";
              }
              return context.cursor === "Label" ? (
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
                  key={JSON.stringify([row, col, context.cursor])}
                >
                  {context.nextLabel}
                </text>
              ) : (
                <image
                  x={square_size * row + margin - 0.5 * square_size}
                  y={square_size * col + margin - 0.5 * square_size}
                  width={square_size}
                  height={square_size}
                  href={cursor_icons[context.cursor]}
                  filter={filter}
                  opacity={opacity}
                  key={JSON.stringify([row, col, context.cursor])}
                />
              );
            })}
          </g>
        </svg>
      }
    </Paper>
  );
};
