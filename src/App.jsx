const { useState, useEffect } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const Box = (await import("@mui/material/Box")).default;
const CssBaseline = (await import("@mui/material/CssBaseline")).default;
const { ThemeProvider, createTheme } = await import("@mui/material/styles");

await import("./App.css");

const AppContext = (await import("./AppContext")).default;

const EditingScreen = (await import("./Editing/Screen")).default;

const MainScreen = (await import("./Main/Screen")).default;

const StudyScreen = (await import("./Study/Screen")).default;

const theme_import = (
  await import("./assets/theme.json", { with: { type: "json" } })
).default;

let theme = createTheme(theme_import);

theme = createTheme(theme, {
  components: {
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          backgroundColor: theme.palette.toggle.light,
          /*"&:hover": "none",
          "&.Mui-selected": {
            backgroundColor: theme.palette.primary.dark,
          },
          "&.Mui-selected:hover": {
            backgroundColor: theme.palette.primary.dark,
          },*/
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
  const [feedback, setFeedback] = useState("");
  const [data, setData] = useState(null);
  const [exerciseColor, setExerciseColor] = useState("");
  const [config, setConfig] = useState(null);
  const [nextLabel, setNextLabel] = useState("A");
  const [window, setWindow] = useState([0, 18, 0, 18]);

  const [cursor, setCursor] = useState("Black");

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
          data,
          setData,
          feedback,
          setFeedback,
          exerciseColor,
          setExerciseColor,
          config,
          setConfig,
          cursor,
          setCursor,
          nextLabel,
          setNextLabel,
          window,
          setWindow,
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
