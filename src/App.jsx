import { useState, useEffect } from "react";

import { invoke } from "@tauri-apps/api/core";

import "./App.css";

import AppContext from "./AppContext";
import MainScreen from "./Main/Screen";
import EditingScreen from "./Editing/Screen";
import StudyScreen from "./Study/Screen";

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
  // Guess, GuessUnknown View, Edit.
  const [studyPhase, setStudyPhase] = useState("Guess");
  const [colorMode, setColorMode] = useState("Black");
  const [feedback, setFeedback] = useState("");
  const [data, setData] = useState(null);
  const [color, setColor] = useState("Black");
  const [exerciseColor, setExerciseColor] = useState("");


  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContext
        value={{
          phase,
          setPhase,
          editingPhase,
          setEditingPhase,
          studyPhase,
          setStudyPhase,
          colorMode,
          setColorMode,
          data,
          setData,
          color,
          setColor,
          feedback,
          setFeedback,
          exerciseColor,
          setExerciseColor,
        }}
      >
        {phase === "Main" ? (
          <MainScreen />
        ) : phase === "Editing" ? (
          <EditingScreen />
        ) : (
          <StudyScreen />
        )}
      </AppContext>
    </ThemeProvider>
  );
}

export default App;
