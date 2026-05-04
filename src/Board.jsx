import { useEffect, useState, useRef } from "react";
import board_image from "./assets/oak.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import mui_clear from "./assets/mui_clear.svg";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import Paper from "@mui/material/Paper";

const Board = (props) => {
  const board_svg = useRef(null);
  const ghostcontainer = useRef(null);
  const gridcontainer = useRef(null);
  const stonecontainer = useRef(null);
  const paper = useRef(null);

  const [ghost, setGhost] = useState(null);

  const get_coord = (e) => {
    if (board_svg.current === null) {
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

    let [left, right] = props.horizontalBound;
    let [top, bottom] = props.verticalBound;

    // correction for partial boards
    i += left + (left > 0 ? -partial / square_size : 0);
    j += top + (top > 0 ? -partial / square_size : 0);

    const si = Math.round(i);
    const sj = Math.round(j);

    if (
      si >= left &&
      si <= right &&
      sj >= top &&
      sj <= bottom &&
      (props.phase === "Initialize" ||
        props.data?.game.stones[si + 1][sj + 1] === null) &&
      (i - si) * (i - si) + (j - sj) * (j - sj) < 0.25
    ) {
      return [si, sj];
    }

    return null;
  };

  const [viewBoxHeight, setViewBoxHeight] = useState(2100);
  const [viewBoxWidth, setViewBoxWidth] = useState(2100);
  const [viewBoxLeft, setViewBoxLeft] = useState(0);
  const [viewBoxTop, setViewBoxTop] = useState(0);

  const square_size = 100;
  const margin = 150;
  const partial = 70; // dots for partial board.

  // draws grid, background image, letters
  useEffect(() => {
    let [left, right] = props.horizontalBound;
    let [top, bottom] = props.verticalBound;

    // Offset viewBox.

    //maybe add bigger margin for edges or letters on every side
    setViewBoxLeft(square_size * left + (left > 0 ? -partial : 0));
    setViewBoxTop(square_size * top + (top > 0 ? -partial : 0));
    setViewBoxWidth(
      2 * margin +
        (right - left) * square_size +
        (left > 0 ? partial : 0) +
        (right < 18 ? partial : 0),
    );
    setViewBoxHeight(
      2 * margin +
        (bottom - top) * square_size +
        (top > 0 ? partial : 0) +
        (bottom < 18 ? partial : 0),
    );

    createSVGElement(
      "image",
      {
        x: 0,
        y: 0,
        width: 2 * margin + 18 * square_size,
        height: 2 * margin + 18 * square_size,
        href: board_image,
        "clip-path": "url(#viewBoxClip)",
      },
      gridcontainer.current,
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

    return () => {
      if (gridcontainer.current) {
        gridcontainer.current.replaceChildren();
      }
    };
  }, [gridcontainer, props.horizontalBound, props.verticalBound]);

  // draws circles
  useEffect(() => {
    if (stonecontainer.current === null || props.data === null) {
      return;
    }
    let [left, right] = props.horizontalBound;
    let [top, bottom] = props.verticalBound;

    for (let i = left; i <= right; i++) {
      for (let j = top; j <= bottom; j++) {
        const w = props.data?.game.stones[i + 1][j + 1];

        if (w === null) {
          continue;
        }
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
    }
    return () => {
      if (stonecontainer.current) {
        stonecontainer.current.replaceChildren();
      }
    };
  }, [props.data, stonecontainer, props.horizontalBound, props.verticalBound]);

  // creates ghost

  useEffect(() => {
    if (ghost === null || ghostcontainer.current === null) {
      return;
    }
    createSVGElement(
      "image",
      {
        x: square_size * ghost[0] + margin - 0.5 * square_size,
        y: square_size * ghost[1] + margin - 0.5 * square_size,
        width: square_size,
        height: square_size,
        href:
          props.colorMode === "Delete"
            ? mui_clear
            : props.color === "Black"
              ? black_image
              : white_image,
        opacity: 0.6,
      },
      ghostcontainer.current,
    );
    return () => {
      if (ghostcontainer) {
        ghostcontainer.current.replaceChildren();
      }
    };
  }, [ghostcontainer, ghost, props.color]);

  let size_ref = useRef([null, null]); // there's a relevant stackexchange for this

  const [boardBoxWidth, setBoardBoxWidth] = useState(0);
  const [boardBoxHeight, setBoardBoxHeight] = useState(0);

  // fits board in app. This was easier than pure css.
  useEffect(() => {
    if (paper.current === null) {
      return;
    }
    const observer = new ResizeObserver(() => {
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
              mouseDown &&
              w !== null &&
              props.phase === "Initialize" &&
              props.data?.game.stones[w[0] + 1][w[1] + 1] !== props.colorMode &&
              props.colorMode !== "BlackWhite"
            ) {
              invoke("set_stone", {
                i: w[0] + 1,
                j: w[1] + 1,
                color: props.colorMode === "Delete" ? undefined : props.color,
              })
                .then(() => invoke("get_data"))
                .then((data) => {
                  props.setData(data);
                  if (props.colorMode === "BlackWhite") {
                    props.setColor(props.color === "Black" ? "White" : "Black");
                  }
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          }}
          onClick={async (e) => {
            const w = get_coord(e);
            console.log(w);
            if (w === null) {
              return;
            }
            if (props.phase === "Initialize") {
              invoke("set_stone", {
                i: w[0] + 1,
                j: w[1] + 1,
                color: props.colorMode === "Delete" ? undefined : props.color,
              })
                .then(() => invoke("get_data"))
                .then((data) => {
                  props.setData(data);
                  if (props.colorMode === "BlackWhite") {
                    props.setColor(props.color === "Black" ? "White" : "Black");
                  }
                })
                .catch((e) => {
                  console.log(e);
                });
            } else {
              // assume initialized for now
              invoke("play", {
                loc: [w[0] + 1, w[1] + 1],
                color: props.color,
              })
                .then(() => invoke("get_data"))
                .then((data) => {
                  props.setData(data);
                  props.setColor(
                    data.tree?.color === "Black" ? "White" : "Black",
                  );
                  setGhost(null);
                })
                .catch((e) => {
                  setGhost(null);
                });
            }
          }}
          onMouseLeave={() => {
            setGhost(null);
            setMouseDown(false);
          }}
        >
          <defs>
            <clipPath id="viewBoxClip">
              <rect
                width={viewBoxWidth}
                height={viewBoxHeight}
                x={viewBoxLeft}
                y={viewBoxTop}
              ></rect>
            </clipPath>
          </defs>

          <g ref={gridcontainer} />
          <g ref={stonecontainer} />
          <g ref={ghostcontainer} />
        </svg>
      }
    </Paper>
  );
};

export default Board;
