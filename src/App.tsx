const { useState } = await import("react");

const CssBaseline = (await import("@mui/material/CssBaseline")).default;
const { ThemeProvider, createTheme } = await import("@mui/material/styles");

import type { PaletteMode } from "@mui/material";
const { StudyPhaseType, EditingPhaseType, CursorType, PhaseType } =
  await import("./AppContext");

import type { Snapshot } from "./bindings";

await import("./App.css");

const AppContext = (await import("./AppContext")).default;

const EditingScreen = (await import("./Editing/Screen")).default;

const MainScreen = (await import("./Main/Screen")).default;

const StudyScreen = (await import("./Study/Screen")).default;

const theme_import = (
  await import("./assets/theme.json", { with: { type: "json" } })
).default;

let theme = createTheme({
  ...theme_import,
  palette: {
    ...theme_import.palette,
    mode: theme_import.palette.mode as PaletteMode,
  },
});

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
  const [phase, setPhase] = useState(PhaseType.Main);
  // Initialize, MakeTree
  const [editingPhase, setEditingPhase] = useState(EditingPhaseType.Initialize);
  // Guess, GuessUnknown View, Edit.
  const [studyPhase, setStudyPhase] = useState(StudyPhaseType.Guess);
  const [feedback, setFeedback] = useState("");
  const [data, setData] = useState<Snapshot | null>(null);
  // you will need to fix any issues that arise from this!:
  //const [exerciseColor, setExerciseColor] = useState("");

  //add back when needed:
  //const [config, setConfig] = useState(null);

  const [nextLabel, setNextLabel] = useState<string>("A");
  const [window, setWindow] = useState<[number, number, number, number]>([
    0, 18, 0, 18,
  ]);

  const [cursor, setCursor] = useState(CursorType.Black);

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
