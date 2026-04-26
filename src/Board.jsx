import { useEffect, useState, useRef } from "react";
import board_image from "./assets/persimmon.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Board = (props) => {
  const svgNS = "http://www.w3.org/2000/svg";

  const board = useRef(null);
  const ghostcontainer = useRef(null);
  const stonecontainer = useRef(null);

  const board_width = 2000;
  const board_margin = 100;
  const square_size = (board_width - 2 * board_margin) / 18;

  const [ghost, setGhost] = useState(null);

  const get_coord = (i, j) => {
    if (board.current === null) {
      return null;
    }
    // get coord in board in [0, 1]
    const rect = board.current.getBoundingClientRect();
    i = (i - (rect.left + window.scrollX)) / rect.width;
    j = (j - (rect.top + window.scrollY)) / rect.height;

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

    if (props.game?.stones[si + 1][sj + 1] !== null) {
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
    if (stonecontainer.current === null || props.game === null) {
      return;
    }
    for (let i = 0; i < 19; i++) {
      for (let j = 0; j < 19; j++) {
        const w = props.game?.stones[i + 1][j + 1];
        if (w === null) {
          continue;
        }
        const stone = document.createElementNS(svgNS, "image");
        stone.setAttribute(
          "x",
          square_size * i + board_margin - 0.5 * square_size,
        );
        stone.setAttribute(
          "y",
          square_size * j + board_margin - 0.5 * square_size,
        );
        stone.setAttribute("width", square_size);
        stone.setAttribute("height", square_size);
        if (w === "Black") {
          stone.setAttribute("href", black_image);
        } else if (w === "White") {
          stone.setAttribute("href", white_image);
        } else {
          console.log("Unknown stone property ", w);
          continue;
        }
        stone.setAttribute("opacity", 1);
        stonecontainer.current.appendChild(stone);
      }
    }
    return () => {
      if (stonecontainer.current) {
        stonecontainer.current.replaceChildren();
      }
    };
  }, [props.game, stonecontainer]);

  useEffect(() => {
    if (ghost === null || ghostcontainer.current === null) {
      return;
    }

    const ghost_svg = document.createElementNS(svgNS, "image");
    ghost_svg.setAttribute(
      "x",
      square_size * ghost[0] + board_margin - 0.5 * square_size,
    );
    ghost_svg.setAttribute(
      "y",
      square_size * ghost[1] + board_margin - 0.5 * square_size,
    );
    ghost_svg.setAttribute("width", square_size);
    ghost_svg.setAttribute("height", square_size);
    if (props.color === "Black") {
      ghost_svg.setAttribute("href", black_image);
    } else if (props.color === "White") {
      ghost_svg.setAttribute("href", white_image);
    } else {
      console.log("Unknown stone property ", w);
      return;
    }
    ghost_svg.setAttribute("opacity", 0.6);
    ghostcontainer.current.appendChild(ghost_svg);
    return () => {
      if (ghostcontainer) {
        ghostcontainer.current.replaceChildren();
      }
    };
  }, [ghostcontainer, ghost, props.color]);

  return (
    <Box
      sx={{
        margin: "10px",
        backgroundImage: `url(${board_image})`,
        width: "calc(100% - 20px)",
        height: "auto",
        minHeight: 0,
        aspectRatio: "1 / 1",
      }}
    >
      {
        <svg
          ref={board}
          id="board"
          viewBox={`0 0 ${board_width} ${board_width}`}
          style={{ width: "100%", height: "100%" }}
          onClick={async (e) => {
            const w = get_coord(e.pageX, e.pageY);
            if (w === null) {
              return;
            }
            invoke("play", { i: w[0] + 1, j: w[1] + 1, color: props.color })
              .then((game_) => {
                props.setGame(game_);
                props.swapColor();
                setGhost(null);
              })
              .catch((e) => {
                setGhost(null);
              });
          }}
          onMouseMove={(e) => {
            const w = get_coord(e.pageX, e.pageY);
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
          <g ref={stonecontainer} />
          <g ref={ghostcontainer} />
        </svg>
      }
    </Box>
  );
};

export default Board;
