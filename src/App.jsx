import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import "./App.css";

import AppContext from "./AppContext";
import MainScreen from "./MainScreen";
import EditingScreen from "./EditingScreen";

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
    MuiFormLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: theme.palette.primary.contrastText,
          },
        },
      },
    },
  },
});

function App() {
  // (Editing:) ,
  // Main = config / select exercise or flashcard screen
  // Config (Select Exercise / Flashcard)
  // Main, Editing, Study.
  const [phase, setPhase] = useState("Main");
  // Initialize, MakeTree
  const [editingPhase, setEditingPhase] = useState("Initialize");
  const [colorMode, setColorMode] = useState("Black");
  const [data, setData] = useState(null);
  const [color, setColor] = useState("Black");

  const [exerciseFile, setExerciseFile] = useState("");

  //still necessary?
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
      invoke("edit_new")
        .then(() => invoke("start_setup"))
        .then(() => invoke("get_data"))
        .then((data) => setData(data))
        .catch((e) => {}); // sometimes tries to initialize multiple times
    };
    load_board();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContext
        value={{
          phase,
          setPhase,
          editingPhase,
          setEditingPhase,
          colorMode,
          setColorMode,
          data,
          setData,
          color,
          setColor,
          exerciseFile,
          setExerciseFile,
        }}
      >
        {phase === "Main" ? <MainScreen /> : <EditingScreen />}
      </AppContext>
    </ThemeProvider>
  );
}

export default App;
