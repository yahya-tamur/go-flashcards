import type { PaletteMode, ThemeOptions } from "@mui/material";

import type { Snapshot } from "./bindings";

const { useState } = await import("react");

const CssBaseline = (await import("@mui/material/CssBaseline")).default;
const { ThemeProvider, createTheme } = await import("@mui/material/styles");

await import("./App.css");

await import("./AppContext");
const AppContext = (await import("./AppContext")).default;
const { StudyPhaseType, EditingPhaseType, CursorType, PhaseType } =
  await import("./AppContext");

const EditingScreen = (await import("./Editing/Screen")).default;

const MainScreen = (await import("./Main/Screen")).default;

const StudyScreen = (await import("./Study/Screen")).default;

console.log(`${import.meta.env.BASE_URL}assets/theme.json`);
const theme_import: ThemeOptions = await (await fetch(`/theme.json`)).json();

let theme = createTheme({
  ...theme_import,
  palette: {
    ...theme_import.palette,
    mode: (theme_import.palette?.mode ?? "dark") as PaletteMode,
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
  const [c_phase, c_setPhase] = useState(PhaseType.Main);
  const [c_editingPhase, c_setEditingPhase] = useState(
    EditingPhaseType.Initialize,
  );
  const [c_studyPhase, c_setStudyPhase] = useState(StudyPhaseType.Guess);
  const [c_feedback, c_setFeedback] = useState("");
  const [c_data, c_setData] = useState<Snapshot | null>(null);
  const [c_nextLabel, c_setNextLabel] = useState<string>("A");
  const [c_window, c_setWindow] = useState<[number, number, number, number]>([
    0, 18, 0, 18,
  ]);

  const [c_cursor, c_setCursor] = useState(CursorType.Black);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppContext
        value={{
          c_phase,
          c_setPhase,
          c_editingPhase,
          c_setEditingPhase,
          c_studyPhase,
          c_setStudyPhase,
          c_data,
          c_setData,
          c_feedback,
          c_setFeedback,
          c_cursor,
          c_setCursor,
          c_nextLabel,
          c_setNextLabel,
          c_window,
          c_setWindow,
        }}
      >
        {c_phase === "Main" ? (
          <MainScreen />
        ) : c_phase === "Editing" ? (
          <EditingScreen />
        ) : (
          <StudyScreen />
        )}
      </AppContext>
    </ThemeProvider>
  );
}

export default App;
