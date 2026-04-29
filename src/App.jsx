import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import Board from "./Board.jsx";
import Tree from "./Tree.jsx";
import Menu from "./Menu.jsx";
import "./App.css";

import Box from "@mui/material/Box";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";

const theme = createTheme({
  palette: {
    primary: {
      light: "#757ce8",
      main: "#3f50b5",
      dark: "#002884",
      contrastText: "#fff",
    },
    secondary: {
      light: "#ff7961",
      main: "#f44336",
      dark: "#ba000d",
      contrastText: "#000",
    },
    mode: "dark",
  },
});

function App() {
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
      invoke("initialize_tree", { stone: "Black" })
        .then(() => invoke("get_data"))
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
            swapColor={swapColor}
            horizontalBound={horizontalBound}
            verticalBound={verticalBound}
            setHorizontalBound={setHorizontalBound}
            setVerticalBound={setVerticalBound}
          />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexBasis: "40%",
            flexDirection: "column",
            minWidth: 0,
            overflow: "hidden",
          }}
        >
          <Box sx={{ flexBasis: "40%", minHeight: 0 }}>
            <Tree data={data} setData={setData} setColor={setColor} />
          </Box>
          <Box sx={{ flexBasis: "60%", minHeight: 0 }}>
            {
              <Menu
                data={data}
                setData={setData}
                setColor={setColor}
                horizontalBound={horizontalBound}
                verticalBound={verticalBound}
                setHorizontalBound={setHorizontalBound}
                setVerticalBound={setVerticalBound}
              />
            }
          </Box>
        </Box>
      </main>
    </ThemeProvider>
  );
}

export default App;
