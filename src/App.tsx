import type { PaletteMode, ThemeOptions } from "@mui/material";

import type {
  ImageVariant,
  StudyPhaseType,
  EditingPhaseType,
  Cursor,
  PhaseType,
  CursorAction,
  Click,
} from "./AppContext";
import type {
  Color,
  MarkPaint,
  RectangleMark,
  Snapshot,
  StonePaint,
} from "./bindings";

import { wEquals } from "./utils";

const { useState, useReducer } = await import("react");

const CssBaseline = (await import("@mui/material/CssBaseline")).default;
const { ThemeProvider, createTheme } = await import("@mui/material/styles");

await import("./App.css");

await import("./AppContext");
const AppContext = (await import("./AppContext")).default;

const EditingScreen = (await import("./Editing/Screen")).default;

const MainScreen = (await import("./Main/Screen")).default;

const StudyScreen = (await import("./Study/Screen")).default;

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

const defaultClickCursor = (color: Color): Click => ({
  type: "Click",
  ghosts: [],
  paint: {
    value: color,
    layer: "stone",
  },
});

const defaultPaintCursor = (
  value: MarkPaint | RectangleMark | StonePaint,
): Cursor =>
  value === "BlackTerritory" ||
  value === "WhiteTerritory" ||
  value === "DeleteMark"
    ? {
        type: "Drag",
        ghosts: [],
        start: null,
        end: null,
        paint: { value: value, layer: "mark" },
      }
    : value === "Black" || value === "White" || value === "Delete"
      ? {
          type: "Place",
          ghosts: [],
          dragging: null,
          paint: {
            value: value,
            layer: "stone",
          },
        }
      : {
          type: "Place",
          ghosts: [],
          dragging: null,
          paint: {
            value: value,
            layer: "mark",
          },
        };

// 2. Transform the union into an object indexed by that key
type CursorReducerMapType = {
  [A in CursorAction["type"]]: {
    [C in Cursor["type"]]: (
      cursor: Extract<Cursor, { type: C }>,
      action: Extract<CursorAction, { type: A }>,
    ) => Cursor;
  };
};

const cursorMap: CursorReducerMapType = {
  set_click: {
    Click: (cursor, action) =>
      cursor.paint.value === action.value
        ? cursor
        : defaultClickCursor(action.value),
    Place: (_cursor, action) => defaultClickCursor(action.value),
    Drag: (_cursor, action) => defaultClickCursor(action.value),
  },
  set_paint: {
    Click: (_cursor, action) => defaultPaintCursor(action.value),
    Place: (cursor, action) =>
      cursor.paint.value === action.value
        ? cursor
        : defaultPaintCursor(action.value),
    Drag: (cursor, action) =>
      cursor.paint.value === action.value
        ? cursor
        : defaultPaintCursor(action.value),
  },
  down: {
    Click: (cursor) => cursor,
    Place: (cursor, action) => {
      if (
        cursor.dragging !== null &&
        cursor.dragging.length <= 1 &&
        wEquals(cursor.dragging[0] ?? null, action.w)
      ) {
        return cursor;
      } else {
        const cursor_ = structuredClone(cursor);
        cursor_.dragging = action.w === null ? [] : [action.w];
        cursor_.ghosts = [];
        return cursor_;
      }
    },
    Drag: (cursor, action) => {
      if (wEquals(cursor.start, action.w) && wEquals(cursor.end, action.w)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.start = action.w;
      cursor_.end = action.w;
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    },
  },
  move: {
    Click: (cursor, action) => {
      if (wEquals(action.w, cursor.ghosts[0] ?? null)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    },
    Place: (cursor, action) => {
      if (action.w === null) {
        if (cursor.dragging === null && cursor.ghosts.length > 0) {
          const cursor_ = structuredClone(cursor);
          cursor_.ghosts = [];
          return cursor_;
        } else {
          return cursor;
        }
      } else if (cursor.dragging === null) {
        if (wEquals(action.w, cursor.ghosts[0] ?? null)) {
          return cursor;
        } else {
          const cursor_ = structuredClone(cursor);
          cursor_.ghosts = [action.w];
          return cursor_;
        }
      } else {
        if (cursor.dragging.some((w) => wEquals(w, action.w))) {
          return cursor;
        } else {
          return {
            type: "Place",
            paint: structuredClone(cursor.paint),
            ghosts: [],
            dragging: [...cursor.dragging, action.w],
          };
        }
      }
    },
    Drag: (cursor, action) => {
      if (wEquals(action.w, cursor.end)) {
        return cursor;
      }
      if (action.w === null) {
        const cursor_ = structuredClone(cursor);
        cursor_.end = null;
        cursor_.ghosts = [];
        return cursor_;
      }
      if (cursor.start === null) {
        const cursor_ = structuredClone(cursor);
        cursor_.end = action.w;
        cursor_.ghosts = [action.w];
        return cursor_;
      }
      const [r, rr] = [cursor.start[0], action.w[0]].toSorted((a, b) => a - b);
      const [c, cc] = [cursor.start[1], action.w[1]].toSorted((a, b) => a - b);
      const ghosts: [number, number][] = [];
      for (let row = r; row <= rr; row++) {
        for (let col = c; col <= cc; col++) {
          ghosts.push([row, col]);
        }
      }
      const cursor_ = structuredClone(cursor);
      cursor_.end = action.w;
      cursor_.ghosts = ghosts;
      return cursor_;
    },
  },
  up: {
    Click: (cursor) =>
      cursor.ghosts.length === 0
        ? cursor
        : defaultClickCursor(cursor.paint.value),
    Place: (cursor) =>
      cursor.dragging === null && cursor.ghosts.length === 0
        ? cursor
        : defaultPaintCursor(cursor.paint.value),
    Drag: (cursor) =>
      cursor.start === null && cursor.end === null
        ? cursor
        : defaultPaintCursor(cursor.paint.value),
  },
};

const cursorReducer = (cursor: Cursor, action: CursorAction): Cursor =>
  (
    cursorMap[action.type][cursor.type] as (
      cur: Extract<Cursor, { type: (typeof cursor)["type"] }>,
      act: Extract<CursorAction, { type: (typeof action)["type"] }>,
    ) => Cursor
  )(cursor, action);

function App() {
  const [c_phase, c_setPhase] = useState<PhaseType>("Main");
  const [c_editingPhase, c_setEditingPhase] =
    useState<EditingPhaseType>("Initialize");
  const [c_studyPhase, c_setStudyPhase] = useState<StudyPhaseType>("Guess");
  const [c_feedback, c_setFeedback] = useState("");
  const [c_data, c_setData] = useState<Snapshot | null>(null);
  const [c_nextLabel, c_setNextLabel] = useState<string>("A");
  const [c_window, c_setWindow] = useState<[number, number, number, number]>([
    0, 18, 0, 18,
  ]);

  const [c_images, c_setImages] = useState<Record<ImageVariant, string>>(
    () => ({
      Delete: "/mui_clear.svg",
      DeleteMark: "./delete_mark.svg",
      Black: "./black_night.png",
      White: "./white_anime.png",
      Triangle: "./triangle.svg",
      Circle: "./circle.svg",
      Cross: "./cross.svg",
      Square: "./square.svg",
      BlackTerritory: "./black_territory.svg",
      WhiteTerritory: "./white_territory.svg",
      Board: "./board.jpeg",
    }),
  );

  const [c_cursor, c_cursorDispatch] = useReducer(cursorReducer, {
    type: "Place",
    ghosts: [],
    dragging: null,
    paint: { value: "Black", layer: "stone" },
  });

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
          c_cursorDispatch,
          c_nextLabel,
          c_setNextLabel,
          c_window,
          c_setWindow,
          c_images: c_images,
          c_setImages: c_setImages,
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
