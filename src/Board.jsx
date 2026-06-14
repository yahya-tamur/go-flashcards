import { useEffect, useState, useRef, useContext } from "react";
import board_image from "./assets/oak.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import mui_clear from "./assets/mui_clear.svg";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import triangle_icon from "./assets/triangle.svg";
import square_icon from "./assets/square.svg";
import circle_icon from "./assets/circle.svg";
import cross_icon from "./assets/cross.svg";
import delete_mark_icon from "./assets/delete_mark.svg";

import AppContext from "./AppContext";

import Paper from "@mui/material/Paper";

export default (props) => {
  const mark_icons = {
    Triangle: triangle_icon,
    Circle: circle_icon,
    Cross: cross_icon,
    Square: square_icon,
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
  };
  const context = useContext(AppContext);
  const board_svg = useRef(null);
  const ghostcontainer = useRef(null);
  const gridcontainer = useRef(null);
  const stonecontainer = useRef(null);
  const labelmask = useRef(null);
  const paper = useRef(null);

  const [ghost, setGhost] = useState(null);

  const square_size = 100;
  const margin = 150;
  const partial = 70; // dots for partial board.
  const partial_border = 0; // border from partial edges

  const get_coord = (e) => {
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
    i = viewBoxWidth * i;
    j = viewBoxHeight * j;

    // if board is 19 x 19, this labels the top left square (0, 0),
    // and linearly increases by 1 per square_size .

    i = (i - margin) / square_size;
    j = (j - margin) / square_size;

    let [left, right, top, bottom] = context.data.window;

    // correction for partial boards
    i += left + (left > 0 ? -partial_border / square_size : 0);
    j += top + (top > 0 ? -partial_border / square_size : 0);

    const si = Math.round(i);
    const sj = Math.round(j);

    if (
      !(
        si >= left &&
        si <= right &&
        sj >= top &&
        sj <= bottom &&
        (i - si) * (i - si) + (j - sj) * (j - sj) < 0.25
      )
    ) {
      return null;
    }
    if (
      context.cursor === "Black" ||
      context.cursor === "White" ||
      context.cursor === "Delete"
    ) {
      if (
        (context.phase === "Editing" || context.studyPhase === "Edit") &&
        context.editingPhase === "Initialize"
      ) {
        if (context.data.game.stones[si][sj] === context.cursor) {
          return null;
        }
      } else {
        if (context.data.game.stones[si][sj] !== null) {
          return null;
        }
      }
    } else {
      if (
        context.data.game.marks[si][sj] === context.cursor ||
        (context.cursor === "Label" &&
          context.data.game.marks[si][sj]?.Label === context.nextLabel)
      ) {
        return null;
      }
    }
    return [si, sj];
  };

  const [viewBoxHeight, setViewBoxHeight] = useState(2100);
  const [viewBoxWidth, setViewBoxWidth] = useState(2100);
  const [viewBoxLeft, setViewBoxLeft] = useState(0);
  const [viewBoxTop, setViewBoxTop] = useState(0);

  const click = (w) => {
    if (
      context.cursor === "Black" ||
      context.cursor === "White" ||
      context.cursor === "Delete"
    ) {
      if (
        (context.phase === "Editing" || context.studyPhase === "Edit") &&
        context.editingPhase === "Initialize"
      ) {
        invoke("place_stone", {
          i: w[0],
          j: w[1],
          color: { Black: "Black", White: "White" }[context.cursor],
        })
          .then(() => invoke("get_data"))
          .then((data) => {
            context.setData(data);
          })
          .catch((e) => {
            console.log(e);
          });
      } else {
        invoke("play", {
          loc: [w[0], w[1]],
          color: context.cursor,
        })
          .then(() => invoke("get_data"))
          .then((data) => {
            context.setData(data);
            context.setCursor(data.color === "Black" ? "White" : "Black");
            if (context.phase === "Study" && context.studyPhase === "Guess") {
              switch (data.variant) {
                case "Correct":
                  invoke("answer", { correct: true })
                    .then(() => invoke("get_data"))
                    .then((data) => {
                      context.setData(data);
                      context.setFeedback("Correct");
                      context.setStudyPhase("View");
                    });
                  break;
                case "Incorrect":
                  invoke("answer", { correct: false })
                    .then(() => invoke("get_data"))
                    .then((data) => {
                      context.setData(data);
                      context.setFeedback("Incorrect");
                      context.setStudyPhase("View");
                    });
                  break;
                case "New":
                  if (context.cursor === context.exerciseColor) {
                    invoke("answer", { correct: false })
                      .then(() => invoke("get_data"))
                      .then((data) => {
                        context.setData(data);
                        context.setFeedback("Incorrect");
                        context.setStudyPhase("View");
                      });
                  } else {
                    context.setStudyPhase("UnknownGuess");
                  }

                  break;
                default:
                  break;
              }
            }
            setGhost(null);
          })
          .catch((e) => {
            console.log(e);
            setGhost(null);
          });
      }
    } else {
      invoke("set_mark", {
        i: w[0],
        j: w[1],
        mark:
          context.cursor === "DeleteMark"
            ? undefined
            : context.cursor === "Label"
              ? { Label: context.nextLabel }
              : context.cursor,
      })
        .then(() => invoke("get_data"))
        .then((data) => {
          context.setData(data);
        })
        .catch((e) => {
          console.log(e);
        });
    }
  };

  useEffect(() => {
    let return_val = () => {
      if (labelmask.current) {
        labelmask.current.replaceChildren();
      }
    };

    if (
      labelmask.current === null ||
      context.data === null ||
      context.data === undefined
    ) {
      return return_val;
    }
    let [left, right, top, bottom] = context.data?.window ?? [0, 18, 0, 18];

    createSVGElement(
      "rect",
      {
        x: viewBoxLeft,
        y: viewBoxTop,
        width: viewBoxWidth,
        height: viewBoxHeight,
        fill: "white",
      },
      labelmask.current,
    );

    for (let i = left; i <= right; i++) {
      for (let j = top; j <= bottom; j++) {
        if (
          (context.data.game.marks[i][j] !== null ||
            (!(
              context.cursor === "Black" ||
              context.cursor === "White" ||
              context.cursor === "Delete"
            ) &&
              i === ghost?.[0] &&
              j === ghost?.[1])) &&
          context.data.game.stones[i][j] === null
        ) {
          createSVGElement(
            "circle",
            {
              cx: margin + square_size * i,
              cy: margin + square_size * j,
              r: 0.4 * square_size,
              strokeWidth: 0,
              fill: "#000000",
              filter: "url(#gaussian-blur)",
            },
            labelmask.current,
          );
        }
      }
    }
  }, [labelmask, context.data, context.cursor, ghost]);

  useEffect(() => {
    let return_val = () => {
      if (gridcontainer.current) {
        gridcontainer.current.replaceChildren();
      }
    };

    if (
      labelmask.current === null ||
      context.data === null ||
      context.data === undefined
    ) {
      return return_val;
    }
    let [left, right, top, bottom] = context.data?.window ?? [0, 18, 0, 18];

    // Offset viewBox.

    //maybe add bigger margin for edges or letters on every side
    setViewBoxLeft(square_size * left + (left > 0 ? -partial_border : 0));
    setViewBoxTop(square_size * top + (top > 0 ? -partial_border : 0));
    setViewBoxWidth(
      2 * margin +
        (right - left) * square_size +
        (left > 0 ? partial_border : 0) +
        (right < 18 ? partial_border : 0),
    );
    setViewBoxHeight(
      2 * margin +
        (bottom - top) * square_size +
        (top > 0 ? partial_border : 0) +
        (bottom < 18 ? partial_border : 0),
    );

    let stroke_width = 5;

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

    for (let i = left; i <= right; i++) {
      createSVGElement(
        "line",
        {
          x1: margin + square_size * i,
          y1: vline_start,
          x2: margin + square_size * i,
          y2: vline_end,
          stroke: "black",
          "stroke-width": "5",
        },
        gridcontainer.current,
      );
    }

    for (let j = top; j <= bottom; j++) {
      createSVGElement(
        "line",
        {
          x1: hline_start,
          y1: margin + square_size * j,
          x2: hline_end,
          y2: margin + square_size * j,
          stroke: "black",
          "stroke-width": "5",
        },
        gridcontainer.current,
      );
    }

    for (let i = 3; i < 18; i += 6) {
      for (let j = 3; j < 18; j += 6) {
        if (top <= j && j <= bottom && left <= i && i <= right) {
          createSVGElement(
            "circle",
            {
              cx: margin + square_size * i,
              cy: margin + square_size * j,
              r: 12,
              fill: "black",
            },
            gridcontainer.current,
          );
        }
      }
    }
    let letters = "ABCDEFGHJKLMNOPQRST".split("");
    if (left == 0) {
      for (let j = top; j <= bottom; j++) {
        let text = createSVGElement(
          "text",
          {
            x: hline_start - 70,
            y: margin + square_size * j,
            width: square_size,
            height: square_size,
            "text-anchor": "middle",
            "dominant-baseline": "central",
          },
          gridcontainer.current,
        );
        text.style.fill = "black";
        text.style.webkitUserSelect = "none";
        text.style.font = "bold 40pt sans-serif";
        text.textContent = 19 - j;
      }
    }
    if (right == 18) {
      for (let j = top; j <= bottom; j++) {
        let text = createSVGElement(
          "text",
          {
            x: hline_end + 70,
            y: margin + square_size * j,
            width: square_size,
            height: square_size,
            "text-anchor": "middle",
            "dominant-baseline": "central",
          },
          gridcontainer.current,
        );
        text.style.fill = "black";
        text.style.webkitUserSelect = "none";
        text.style.font = "bold 40pt sans-serif";
        text.textContent = 19 - j;
      }
    }
    if (top == 0) {
      for (let i = left; i <= right; i++) {
        let text = createSVGElement(
          "text",
          {
            x: margin + square_size * i,
            y: vline_start - 70,
            width: square_size,
            height: square_size,
            "text-anchor": "middle",
            "dominant-baseline": "central",
          },
          gridcontainer.current,
        );
        text.style.fill = "black";
        text.style.webkitUserSelect = "none";
        text.style.font = "bold 40pt sans-serif";
        text.textContent = letters[i];
      }
    }
    if (bottom == 18) {
      for (let i = left; i <= right; i++) {
        let text = createSVGElement(
          "text",
          {
            x: margin + square_size * i,
            y: vline_end + 70,
            width: square_size,
            height: square_size,
            "text-anchor": "middle",
            "dominant-baseline": "central",
          },
          gridcontainer.current,
        );
        text.style.fill = "black";
        text.style.webkitUserSelect = "none";
        text.style.font = "bold 40pt sans-serif";
        text.textContent = letters[i];
      }
    }

    return return_val;
  }, [gridcontainer, context.data]);

  // draws circles
  useEffect(() => {
    let return_val = () => {
      if (stonecontainer.current) {
        stonecontainer.current.replaceChildren();
      }
    };

    if (
      stonecontainer.current === null ||
      context.data === null ||
      context.data === undefined
    ) {
      return return_val;
    }
    let [left, right, top, bottom] = context.data.window;

    for (let i = left; i <= right; i++) {
      for (let j = top; j <= bottom; j++) {
        const w = context.data.game.stones[i][j];

        if (w !== null) {
          createSVGElement(
            "image",
            {
              x: square_size * i + margin - 0.5 * square_size,
              y: square_size * j + margin - 0.5 * square_size,
              width: square_size,
              height: square_size,
              href: w === "Black" ? black_image : white_image,
            },
            stonecontainer.current,
          );
        }
        let label_color = w === "Black" ? "white" : "black";

        if (context.data.game.marks[i][j] !== null) {
          if (context.data.game.marks[i][j].Label !== undefined) {
            let text = createSVGElement(
              "text",
              {
                x: margin + square_size * i,
                y: margin + square_size * j,
                width: square_size,
                height: square_size,
                "text-anchor": "middle",
                "dominant-baseline": "central",
              },
              stonecontainer.current,
            );
            text.style.fill = label_color;
            text.style.webkitUserSelect = "none";
            text.style.font = "bold 40pt sans-serif";
            text.textContent = context.data.game.marks[i][j].Label;
          } else {
            let image = createSVGElement(
              "image",
              {
                x: square_size * i + margin - 0.5 * square_size,
                y: square_size * j + margin - 0.5 * square_size,
                width: square_size,
                height: square_size,
                href: mark_icons[context.data.game.marks[i][j]],
                filter: label_color === "black" ? "" : "url(#invert-color)",
              },
              stonecontainer.current,
            );
          }
        }
      }
    }

    return return_val;
  }, [context.data, stonecontainer]);

  // creates ghost

  useEffect(() => {
    if (ghost === null || ghostcontainer.current === null) {
      return;
    }
    let label_color =
      context.data.game.stones[ghost[0]][ghost[1]] === "Black"
        ? "white"
        : "black";
    if (context.cursor !== "Label") {
      createSVGElement(
        "image",
        {
          x: square_size * ghost[0] + margin - 0.5 * square_size,
          y: square_size * ghost[1] + margin - 0.5 * square_size,
          width: square_size,
          height: square_size,
          href: cursor_icons[context.cursor],
          filter: label_color === "black" ? "" : "url(#invert-color)",
        },
        ghostcontainer.current,
      );
    } else {
      let text = createSVGElement(
        "text",
        {
          x: margin + square_size * ghost[0],
          y: margin + square_size * ghost[1],
          width: square_size,
          height: square_size,
          "text-anchor": "middle",
          "dominant-baseline": "central",
        },
        ghostcontainer.current,
      );
      text.style.fill = label_color;
      text.style.webkitUserSelect = "none";
      text.style.font = "bold 40pt sans-serif";
      text.textContent = context.nextLabel;
    }

    return () => {
      if (ghostcontainer?.current) {
        ghostcontainer.current.replaceChildren();
      }
    };
  }, [ghostcontainer, ghost, context.cursor, context.nextLabel]);

  let size_ref = useRef([null, null]); // there's a relevant stackexchange for this

  const [boardBoxWidth, setBoardBoxWidth] = useState(0);
  const [boardBoxHeight, setBoardBoxHeight] = useState(0);

  // fits board in app. This was easier than pure css.
  useEffect(() => {
    if (paper.current === null) {
      return;
    }
    const observer = new ResizeObserver(() => {
      if (paper.current === null) {
        return;
      }
      const current_size = [
        paper.current.offsetWidth,
        paper.current.offsetHeight,
      ];
      if (current_size !== size_ref) {
        size_ref = current_size;
        let [width, height] = current_size;

        let ratio = Math.min(
          (height - 2 * 20) / viewBoxHeight,
          (width - 2 * 20) / viewBoxWidth,
        );
        let new_board_size = Math.min(...current_size) - 40;
        setBoardBoxHeight(`${viewBoxHeight * ratio}px`);
        setBoardBoxWidth(`${viewBoxWidth * ratio}px`);
      }
    });
    observer.observe(paper.current);
    return () => {
      observer.disconnect();
    };
  }, [paper, viewBoxHeight, viewBoxWidth]);

  const [mouseDown, setMouseDown] = useState(false);

  // is(n't) there a better place for this?

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

    let seen_once = false;
    for (const row of context.data.game.marks) {
      for (const mark of row) {
        if (mark?.Label === context.nextLabel) {
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
          viewBox={`${viewBoxLeft} ${viewBoxTop} ${viewBoxWidth} ${viewBoxHeight}`}
          style={{
            width: boardBoxWidth,
            height: boardBoxHeight,
            margin: "20px",
          }}
          onMouseDown={() => {
            setMouseDown(true);
          }}
          onMouseUp={() => {
            setMouseDown(false);
          }}
          onMouseMove={async (e) => {
            const w = get_coord(e);
            if (w === null && ghost === null) {
              return;
            }
            if (
              !(
                w !== null &&
                ghost !== null &&
                w[0] === ghost[0] &&
                w[1] === ghost[1]
              )
            ) {
              setGhost(w);
            }

            if (
              context.data !== undefined &&
              context.data !== null &&
              mouseDown &&
              w !== null &&
              (((context.phase === "Editing" ||
                context.studyPhase === "Edit") &&
                context.editingPhase === "Initialize") ||
                !(
                  context.cursor === "Black" ||
                  context.cursor === "White" ||
                  context.cursor === "Delete"
                ))
            ) {
              click(w);
            }
          }}
          onClick={async (e) => {
            const w = get_coord(e);
            if (w === null) {
              return;
            }
            click(w);
          }}
          onMouseLeave={() => {
            setGhost(null);
            setMouseDown(false);
          }}
        >
          <defs>
            <mask
              id="labelMask"
              maskUnits="objectBoundingBox"
              ref={labelmask}
            ></mask>
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
          <g
            ref={gridcontainer}
            mask="url(#labelMask)"
            filter="url(#flatten-alpha)"
          />
          <g ref={stonecontainer} />
          <g ref={ghostcontainer} opacity="0.6" />
        </svg>
      }
    </Paper>
  );
};
