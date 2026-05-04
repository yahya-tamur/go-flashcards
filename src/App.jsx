import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import Board from "./Board.jsx";
import Tree from "./Tree.jsx";
import InitializeMenu from "./InitializeMenu.jsx";
import MakeTreeMenu from "./MakeTreeMenu.jsx";
import EditCommentBox from "./EditCommentBox";
import "./App.css";

import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import theme_import from "./assets/theme.json" with { type: "json" };

let theme = createTheme(theme_import);

theme = createTheme(theme, {
  components: {
    MuiToggleButton: {
      styleOverrides: {
        root: {
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.main,
          },
          "&.Mui-selected:hover": {
            backgroundColor: theme.palette.primary.main,
          },
        },
      },
    },
  },
});

function App() {
  // Initialize, EditTree, (later), Study, Config
  const [phase, setPhase] = useState("Initialize");
  const [keyPress, setKeyPress] = useState("");
  const [colorMode, setColorMode] = useState("Black");
  const [data, setData] = useState(null);
  const [horizontalBound, setHorizontalBound] = useState([0, 18]);
  const [verticalBound, setVerticalBound] = useState([0, 18]);
  const [color, setColor] = useState("Black");

  const swapColor = () => {
    if (color === "Black") {
      setColor("White");
    } else if (color === "White") {
      setColor("Black");
    } else {
      console.log("Tried to swap invalid color!");
    }
  };

  useEffect(() => {
    const load_board = async () => {
      //invoke("initialize_tree", { stone: "White" })
      invoke("get_data")
        .then((data) => setData(data))
        .catch((e) => {}); // sometimes tries to initialize multiple times
    };
    load_board();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <main style={{ display: "flex", flexDirection: "row" }}>
        <Box sx={{ height: "100vh", flexBasis: "60%", minWidth: 0 }}>
          <Board
            data={data}
            setData={setData}
            color={color}
            setColor={setColor}
            swapColor={swapColor}
            horizontalBound={horizontalBound}
            verticalBound={verticalBound}
            setHorizontalBound={setHorizontalBound}
            setVerticalBound={setVerticalBound}
            phase={phase}
            colorMode={colorMode}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexBasis: "40%",
            flexDirection: "column",
            minWidth: 0,
            maxHeight: "100vh",
            overflow: "hidden",
          }}
        >
          <Box sx={{ flexBasis: "40%", minHeight: 0 }}>
            <Tree data={data} setData={setData} setColor={setColor} />
          </Box>
          <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
            {phase === "Initialize" ? (
              <InitializeMenu
                data={data}
                setData={setData}
                setPhase={setPhase}
                colorMode={colorMode}
                setColorMode={setColorMode}
                setColor={setColor}
                color={color}
                horizontalBound={horizontalBound}
                verticalBound={verticalBound}
                setHorizontalBound={setHorizontalBound}
                setVerticalBound={setVerticalBound}
              />
            ) : phase === "MakeTree" ? (
              <MakeTreeMenu
                data={data}
                setData={setData}
                setColorMode={setColorMode}
                setPhase={setPhase}
              />
            ) : (
              <Box> unknown phase? </Box>
            )}
          </Box>
          <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
            {phase === "MakeTree" ? (
              <EditCommentBox data={data} setData={setData} />
            ) : (
              <Box />
            )}
          </Box>
        </Box>
      </main>
    </ThemeProvider>
  );
}

export default App;
