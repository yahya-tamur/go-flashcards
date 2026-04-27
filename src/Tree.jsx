import { useEffect, useState, useRef } from "react";
import board_image from "./assets/persimmon.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";

import "./App.css";

import Button from "@mui/material/Button";
import Box from "@mui/material/Box";

const Tree = (props) => {
  const svgNS = "http://www.w3.org/2000/svg";
  const treecontainer = useRef(null);
  const [tableWidth, setTableWidth] = useState(400);
  const [tableHeight, setTableHeight] = useState(400);

  useEffect(() => {
    if (treecontainer.current === null || props.tree === null) {
      return;
    }
    props.tree.table.forEach((line, r) => {
      line.forEach((mov, c) => {
        if (mov === null) {
          return;
        }
        const stone = document.createElementNS(svgNS, "image");
        stone.setAttribute("x", 50 * c);
        stone.setAttribute("y", 50 * r);
        stone.setAttribute("width", 30);
        stone.setAttribute("height", 30);
        if (mov.color === "Black") {
          stone.setAttribute("href", black_image);
        } else {
          stone.setAttribute("href", white_image);
        }
        stone.setAttribute("opacity", 1);
        treecontainer.current.appendChild(stone);
        const text = document.createElementNS(svgNS, "text");
        text.setAttribute("x", 50 * c);
        text.setAttribute("y", 50 * r + 50);
        text.setAttribute("width", 50);
        text.setAttribute("height", 50);
        text.style.font = "bold 15px sans-serif";
        text.style.fill = "red";
        text.textContent = mov.loc;
        treecontainer.current.appendChild(text);
      });
    });

    return () => {
      if (treecontainer.current) {
        treecontainer.current.replaceChildren();
      }
    };
  }, [props.tree, treecontainer]);

  // useEffect(() => {
  //     setMsg();
  //}, [props.tree])

  return (
    <Box>
      <svg
        viewBox={`0 0 ${tableWidth} ${tableHeight}`}
        style={{ width: "100%", height: "100%" }}
      >
        <g ref={treecontainer} />
      </svg>
    </Box>
  );
};

export default Tree;
