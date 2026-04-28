import { useEffect, useState, useRef } from "react";
import board_image from "./assets/oak.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import "./App.css";

import Button from "@mui/material/Button";
import Paper from "@mui/material/Paper";
import Box from "@mui/material/Box";

const Board = (props) => {
  const board = useRef(null);
  const ghostcontainer = useRef(null);
  const stonecontainer = useRef(null);
  const paper = useRef(null);

  const board_width = 2000;
  const board_margin = 150;
  const square_size = (board_width - 2 * board_margin) / 18;

  const [ghost, setGhost] = useState(null);

  const get_coord = (e) => {
    if (board.current === null) {
      return null;
    }
    // get coord in board in [0, 1]
    const rect = board.current.getBoundingClientRect();
    let i = (e.pageX - (rect.left + window.scrollX)) / rect.width;
    let j = (e.pageY - (rect.top + window.scrollY)) / rect.height;

    // coord in board viewBox
    i = board_width * i;
    j = board_width * j;

    // this value is 0, 0 for points near top left on the grid and 18, 18 bottom right on the grid

    i = (i - board_margin) / square_size;
    j = (j - board_margin) / square_size;

    const si = Math.round(i);
    const sj = Math.round(j);

    if (si < 0 || si > 18 || sj < 0 || sj > 18) {
      return null;
    }

    if (props.data?.game.stones[si + 1][sj + 1] !== null) {
      return null;
    }
    // circle check
    const r = (i - si) * (i - si) + (j - sj) * (j - sj);

    if (r < 0.25) {
      return [si, sj];
    }
    return null;
  };

  useEffect(() => {
    if (stonecontainer.current === null || props.data === null) {
      return;
    }
    for (let i = 0; i < 19; i++) {
      for (let j = 0; j < 19; j++) {
        const w = props.data?.game.stones[i + 1][j + 1];

        if (w === null) {
          continue;
        }
        createSVGElement(
          "image",
          {
            x: square_size * i + board_margin - 0.5 * square_size,
            y: square_size * j + board_margin - 0.5 * square_size,
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
  }, [props.data, stonecontainer]);

  useEffect(() => {
    if (ghost === null || ghostcontainer.current === null) {
      return;
    }
    createSVGElement(
      "image",
      {
        x: square_size * ghost[0] + board_margin - 0.5 * square_size,
        y: square_size * ghost[1] + board_margin - 0.5 * square_size,
        width: square_size,
        height: square_size,
        href: props.color === "Black" ? black_image : white_image,
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

  let size_ref = useRef([null, null]);

  const [boardBoxWidth, setBoardBoxWidth] = useState(0);
  const [boardBoxHeight, setBoardBoxHeight] = useState(0);

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
        let new_board_size = Math.min(...current_size) - 40;
        setBoardBoxHeight(new_board_size);
        setBoardBoxWidth(new_board_size);
        console.log(new_board_size);
      }
    });
    observer.observe(paper.current);
    return () => {
      observer.disconnect();
    };
  }, [paper]);

  return (
    <Paper
      ref={paper}
      sx={{
        height: "100%",
        maxHeight: "100%",
        minHeight: 0,
        width: "100%",
      }}
      elevation={2}
    >
      {
        <svg
          ref={board}
          id="board"
          viewBox={`0 0 ${board_width} ${board_width}`}
          style={{
            width: boardBoxWidth,
            height: boardBoxHeight,
            margin: "20px",
          }}
          onClick={async (e) => {
            const w = get_coord(e);
            if (w === null) {
              return;
            }
            // assume initialized for now
            invoke("play", {
              loc: [w[0] + 1, w[1] + 1],
              color: props.color,
            })
              .then(async (res) => {
                props.setData(await invoke("get_data"));
                props.swapColor();
                setGhost(null);
              })
              .catch((e) => {
                setGhost(null);
              });
          }}
          onMouseMove={(e) => {
            const w = get_coord(e);
            if (w === null && ghost === null) {
              return;
            }
            if (
              w !== null &&
              ghost !== null &&
              w[0] === ghost[0] &&
              w[1] === ghost[1]
            ) {
              return;
            }
            setGhost(w);
          }}
          onMouseLeave={() => {
            setGhost(null);
          }}
        >
          <image
            x={0}
            y={0}
            width={board_width}
            height={board_width}
            href={board_image}
          />

          {Array.from({ length: 19 }).map((_, i) => (
            <line
              key={i}
              x1={square_size * i + board_margin}
              y1={board_margin}
              x2={square_size * i + board_margin}
              y2={board_width - board_margin}
              stroke="black"
              strokeWidth="5"
            />
          ))}
          {Array.from({ length: 19 }).map((_, i) => (
            <line
              key={i}
              y1={square_size * i + board_margin}
              x1={board_margin}
              y2={square_size * i + board_margin}
              x2={board_width - board_margin}
              stroke="black"
              strokeWidth="5"
            />
          ))}
          {Array.from({ length: 9 }).map((_, n) => {
            const i = Math.floor(n / 3);
            const j = n % 3;
            return (
              <circle
                key={n}
                cx={square_size * (6 * i + 3) + board_margin}
                cy={square_size * (6 * j + 3) + board_margin}
                r="12"
                stroke="black"
                strokeWidth="1"
                fill="black"
              />
            );
          })}
          {"ABCDEFGHJKLMNOPQRST".split("").map((c, i) => (
            <text
              y={board_margin - square_size + 10}
              x={square_size * i + board_margin}
              width={square_size}
              height={square_size}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "black",
                WebkitUserSelect: "none",
                font: "bold 35pt sans-serif",
              }}
            >
              {c}
            </text>
          ))}
          {"ABCDEFGHJKLMNOPQRST".split("").map((c, i) => (
            <text
              y={board_width - board_margin + square_size - 10}
              x={square_size * i + board_margin}
              width={square_size}
              height={square_size}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "black",
                WebkitUserSelect: "none",
                font: "bold 35pt sans-serif",
              }}
            >
              {c}
            </text>
          ))}
          {Array.from({ length: 19 }).map((c, i) => (
            <text
              x={board_width - board_margin + square_size - 10}
              y={square_size * i + board_margin}
              width={square_size}
              height={square_size}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "black",
                WebkitUserSelect: "none",
                font: "bold 35pt sans-serif",
              }}
            >
              {19 - i}
            </text>
          ))}
          {Array.from({ length: 19 }).map((c, i) => (
            <text
              x={board_margin - square_size + 10}
              y={square_size * i + board_margin}
              width={square_size}
              height={square_size}
              textAnchor="middle"
              dominantBaseline="central"
              style={{
                fill: "black",
                WebkitUserSelect: "none",
                font: "bold 35pt sans-serif",
              }}
            >
              {19 - i}
            </text>
          ))}
          <g ref={stonecontainer} />
          <g ref={ghostcontainer} />
        </svg>
      }
    </Paper>
  );
};

export default Board;
