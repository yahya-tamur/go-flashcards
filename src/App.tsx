import type { PaletteMode, ThemeOptions } from "@mui/material";

import type {
  ImageVariant,
  StudyPhaseType,
  EditingPhaseType,
  CursorType,
  PhaseType,
  CursorAction,
} from "./AppContext";
import type { Snapshot } from "./bindings";

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

const setMode = (
  cursor: CursorType,
  action: Extract<CursorAction, { type: "set_mode" }>,
): CursorType => {
  if (
    (action.mode.type === "click" && cursor.type === "Click") ||
    (action.mode.type === "mark" &&
      ((cursor.type === "Place" &&
        cursor.layer.type === "mark" &&
        cursor.layer.value === action.mode.value) ||
        (cursor.type === "Drag" && cursor.mark === action.mode.value))) ||
    (action.mode.type === "stone" &&
      cursor.type === "Place" &&
      cursor.layer.type === "stone" &&
      action.mode.value === cursor.layer.value)
  ) {
    return cursor;
  }
  switch (action.mode.type) {
    case "click": {
      return {
        type: "Click",
        ghosts: [],
        icon: {
          type: "image",
          var: action.mode.color,
        },
      };
    }
    case "stone": {
      return {
        type: "Place",
        ghosts: [],
        icon: {
          type: "image",
          var: action.mode.value,
        },
        dragging: null,
        layer: {
          type: "stone",
          value: action.mode.value,
        },
      };
    }
    case "mark": {
      if (
        action.mode.value === "DeleteMark" ||
        action.mode.value === "BlackTerritory" ||
        action.mode.value === "WhiteTerritory"
      ) {
        return {
          type: "Drag",
          ghosts: [],
          icon: {
            type: "image",
            var: action.mode.value,
          },
          start: null,
          end: null,
          mark: action.mode.value,
        };
      } else {
        return {
          type: "Place",
          ghosts: [],
          icon:
            action.mode.value === "Label"
              ? { type: "label" }
              : { type: "image", var: action.mode.value },
          dragging: null,
          layer: {
            type: "mark",
            value: action.mode.value,
          },
        };
      }
    }
  }
};

const down = (
  cursor: CursorType,
  action: Extract<CursorAction, { type: "down" }>,
): CursorType => {
  switch (cursor.type) {
    case "Click": {
      return cursor;
    }
    case "Place": {
      if (
        cursor.dragging !== null &&
        cursor.dragging.length <= 1 &&
        wEquals(cursor.dragging[0] ?? null, action.w)
      ) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.dragging = action.w === null ? [] : [action.w];
      cursor_.ghosts = [];
      return cursor_;
    }
    case "Drag": {
      if (wEquals(cursor.start, action.w) && wEquals(cursor.end, action.w)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.start = action.w;
      cursor_.end = action.w;
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    }
  }
};

const move = (
  cursor: CursorType,
  action: Extract<CursorAction, { type: "move" }>,
): CursorType => {
  switch (cursor.type) {
    case "Click": {
      if (wEquals(action.w, cursor.ghosts[0] ?? null)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    }
    case "Place": {
      if (cursor.dragging || wEquals(action.w, cursor.ghosts[0] ?? null)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      if (
        action.w !== null &&
        cursor.ghosts.some((w) => wEquals(w, action.w))
      ) {
        cursor_.ghosts.push(action.w);
      }
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    }
    case "Drag": {
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
      const [r, rr] = [cursor.start[0], action.w[0]].toSorted();
      const [c, cc] = [cursor.start[1], action.w[1]].toSorted();
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
    }
  }
};

const up = (
  cursor: CursorType /*, _action: Extract<CursorAction, {type: "up"}>*/,
): CursorType => {
  switch (cursor.type) {
    case "Click": {
      if (cursor.ghosts.length === 0) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.ghosts = [];
      return cursor_;
    }
    case "Place": {
      if (!cursor.dragging) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.dragging = [];
      return cursor_;
    }
    case "Drag": {
      if (wEquals(cursor.start, null)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.start = null;
      cursor_.ghosts = cursor.end === null ? [] : [cursor.end];
      return cursor_;
    }
  }
};

const cursorReducer = (
  cursor: CursorType,
  action: CursorAction,
): CursorType => {
  switch (action.type) {
    case "set_mode": {
      return setMode(cursor, action);
    }
    case "down": {
      return down(cursor, action);
    }
    case "move": {
      return move(cursor, action);
    }
    case "up": {
      return up(cursor);
    }
  }
};

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
    icon: {
      type: "image",
      var: "Black",
    },
    dragging: null,
    layer: { type: "stone", value: "Black" },
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
