import { useEffect, useState, useRef, useContext } from "react";
import board_image from "./assets/persimmon.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import "./App.css";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import { useTheme } from "@mui/material/styles";

import AppContext from "./AppContext";

export default (props) => {
  let context = useContext(AppContext);
  const svgNS = "http://www.w3.org/2000/svg";
  const treecontainer = useRef(null);
  const treeBox = useRef(null);
  const [tableWidth, setTableWidth] = useState(100);
  const [tableHeight, setTableHeight] = useState(100);

  const theme = useTheme();
  const square_size = 35;
  const hl_radius = 25;
  const variant_square_diff = 3;
  const gap_size = 50;
  const margin = 20;

  useEffect(() => {
    const handle_key = (e) => {
      if (/INPUT|TEXTAREA|SELECT/.test(event.target.tagName)) {
        return;
      }
      if (context.data === undefined || context.data === null) {
        return;
      }
      let [r, c] = [context.data.row, context.data.col];
      if (e.key === "ArrowRight") {
        c += 1;
      } else if (e.key === "ArrowUp") {
        r -= 1;
        while (
          r > 0 &&
          (context.data.table[r][c] === null ||
            context.data.table[r][c] === undefined)
        ) {
          r -= 1;
        }
      } else if (e.key === "ArrowDown") {
        r += 1;
        while (
          r < context.data.table.length - 1 &&
          (context.data.table[r][c] === null ||
            context.data.table[r][c] === undefined)
        ) {
          r += 1;
        }
      } else if (e.key === "ArrowLeft") {
        c -= 1;
        while (r > 0 && context.data.table[r][c] === null) {
          r -= 1;
        }
      }
      if (
        context.data.table[r] !== undefined &&
        context.data.table[r][c] !== null &&
        context.data.table[r][c] !== undefined
      ) {
        invoke("jump", { r: r, c: c })
          .then(() => invoke("get_data"))
          .then((data) => {
            context.setData(data);
            context.setColor(data.color === "Black" ? "White" : "Black");
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

  const get_coord = (e) => {
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

  useEffect(() => {
    if (
      treecontainer.current === null ||
      context.data === null ||
      context.data === undefined
    ) {
      return;
    }

    let table = context.data.table;
    let num_columns = table.reduce((m, a) => (a.length > m ? a.length : m), 1);
    let num_rows = table.length;
    setTableWidth(2 * margin + gap_size * (num_columns - 1) + square_size);
    setTableHeight(2 * margin + gap_size * (num_rows - 1) + square_size);

    createSVGElement(
      "circle",
      {
        cx: margin + square_size / 2,
        cy: margin + square_size / 2,
        r: 3,
        stroke: "none",
        strokeWidth: "0",
        fill: "grey",
      },
      treecontainer.current,
    );

    let draw_line = (r1, c1, r2, c2) => {
      createSVGElement(
        "line",
        {
          x1: margin + gap_size * c1 + square_size / 2,
          y1: margin + gap_size * r1 + square_size / 2,
          x2: margin + gap_size * c2 + square_size / 2,
          y2: margin + gap_size * r2 + square_size / 2,
          stroke: "grey",
          "stroke-width": 2,
        },
        treecontainer.current,
      );
    };
    // horizontal lines
    table.forEach((line, r) => {
      for (let c = 0; c < line.length - 1; c++) {
        if (line[c] !== null && line[c + 1] !== null) {
          draw_line(r, c, r, c + 1);
        }
      }
    });
    if (table[0].length > 1) {
      draw_line(0, 0, 0, 1);
    }
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
      createSVGElement(
        "path",
        {
          d: `M ${x2},${y2} C ${x2},${y2} ${x1 - square_size},${y1 - square_size} ${x1},${y1}`,
          stroke: "grey",
          "stroke-width": 2,
          fill: "none",
        },
        treecontainer.current,
      );
      // draw_line(r, c, r_, c_);
    }

    table.forEach((line, r) => {
      line.forEach((mov, c) => {
        if (mov === null) {
          return;
        }
        createSVGElement(
          "rect",
          {
            x:
              margin +
              gap_size * c -
              (gap_size - square_size) / 2 +
              variant_square_diff,
            y:
              margin +
              gap_size * r -
              (gap_size - square_size) / 2 +
              variant_square_diff,
            width: gap_size - variant_square_diff * 2,
            height: gap_size - variant_square_diff * 2,
            stroke: "none",
            strokeWidth: "0",
            fill:
              mov.variant === "Correct"
                ? theme.palette.success.dark
                : mov.variant === "Incorrect"
                  ? theme.palette.error.dark
                  : "none",
          },
          treecontainer.current,
        );
      });
    });

    createSVGElement(
      "circle",
      {
        cx: margin + gap_size * context.data.col + square_size / 2,
        cy: margin + gap_size * context.data.row + square_size / 2,
        r: hl_radius,
        stroke: "black",
        "stroke-width": 2,
        fill: theme.palette.primary.main,
        opacity: 0.8,
      },
      treecontainer.current,
    );
    table.forEach((line, r) => {
      line.forEach((mov, c) => {
        if (mov === null || (r === 0 && c === 0)) {
          return;
        }
        createSVGElement(
          "image",
          {
            x: margin + gap_size * c,
            y: margin + gap_size * r,
            width: square_size,
            height: square_size,
            href: mov.color === "Black" ? black_image : white_image,
          },
          treecontainer.current,
        );
        let text = createSVGElement(
          "text",
          {
            x: margin + gap_size * c + square_size / 2,
            y: margin + gap_size * r + square_size / 2,
            width: square_size,
            height: square_size,
            "text-anchor": "middle",
            "dominant-baseline": "central",
          },
          treecontainer.current,
        );
        if (mov.color == "Black") {
          text.style.fill = "white";
        } else {
          text.style.fill = "black";
        }

        text.style.webkitUserSelect = "none";
        text.style.font = "bold 14px sans-serif";
        let [i, j] = mov.loc;
        text.textContent = `${"@ABCDEFGHJKLMNOPQRST"[i]}${20 - j}`;
      });
    });

    return () => {
      if (treecontainer.current) {
        treecontainer.current.replaceChildren();
      }
    };
  }, [context.data, treecontainer]);

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
              invoke("jump", { r: r, c: c })
                .then(() => invoke("get_data"))
                .then((data) => {
                  context.setData(data);
                  context.setColor(data.color === "Black" ? "White" : "Black");
                })
                .catch((e) => {
                  console.log(e);
                });
            }
          }}
        >
          <g ref={treecontainer} />
        </svg>
      }
    </Paper>
  );
};
