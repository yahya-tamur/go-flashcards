import type { PaletteMode, Theme, ThemeOptions } from "@mui/material";

import type {
  ClickCursor,
  Cursor,
  CursorAction,
  EditingPhaseType,
  ImageVariant,
  PaintCursor,
  PhaseType,
  RectangleCursor,
  StudyPhaseType,
  ThemeConfig,
} from "@/AppContext";
import type {
  Color,
  MarkPaint,
  RectangleMark,
  Snapshot,
  StonePaint,
} from "@/bindings";

import { useCallback, useEffect, useReducer, useRef, useState } from "react";

import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import mime from "mime";

import AppContext from "@/AppContext";
import { commands } from "@/bindings";
import { handleError, wEquals } from "@/utils";

import EditingScreen from "@/Editing/Screen";

import MainScreen from "@/Main/Screen";

import StudyScreen from "@/Study/Screen";

const theme_from_import = (theme_import: ThemeOptions): Theme => {
  const theme = createTheme({
    ...theme_import,
    palette: {
      ...theme_import.palette,
      mode: (theme_import.palette?.mode ?? "dark") as PaletteMode,
    },
  });

  return createTheme(theme, {
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
};

const defaultClickCursor = (color: Color): ClickCursor => ({
  ghosts: [],
  type: "click",
  tool: {
    value: color,
    layer: "stone",
  },
});

const defaultPaintCursor = (value: MarkPaint | StonePaint): PaintCursor =>
  value === "Black" || value === "White" || value === "Delete"
    ? {
        type: "paint",
        ghosts: [],
        dragging: null,
        tool: {
          value: value,
          layer: "stone",
        },
        leftMode: null,
      }
    : {
        type: "paint",
        ghosts: [],
        dragging: null,
        tool: {
          value: value,
          layer: "mark",
        },
        leftMode: null,
      };

const defaultRectangleCursor = (value: RectangleMark): RectangleCursor => ({
  type: "rectangle",
  tool: {
    value: value,
    layer: "mark",
  },
  ghosts: [],
  start: null,
  end: null,
  leftMode: null,
});

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
    click: (cursor, action) =>
      cursor.tool.value === action.value
        ? cursor
        : defaultClickCursor(action.value),
    paint: (_cursor, action) => defaultClickCursor(action.value),
    rectangle: (_cursor, action) => defaultClickCursor(action.value),
  },
  set_paint: {
    click: (_cursor, action) => defaultPaintCursor(action.value),
    paint: (cursor, action) =>
      cursor.tool.value === action.value
        ? cursor
        : defaultPaintCursor(action.value),
    rectangle: (_cursor, action) => defaultPaintCursor(action.value),
  },
  set_rectangle: {
    click: (_cursor, action) => defaultRectangleCursor(action.value),
    paint: (_cursor, action) => defaultRectangleCursor(action.value),
    rectangle: (cursor, action) =>
      cursor.tool.value === action.value
        ? cursor
        : defaultRectangleCursor(action.value),
  },
  down: {
    click: (cursor) => cursor,
    paint: (cursor, action) => {
      if (
        cursor.dragging !== null &&
        cursor.dragging.length <= 1 &&
        wEquals(cursor.dragging[0] ?? null, action.w)
      ) {
        return cursor;
      } else {
        const cursor_ = structuredClone(cursor);
        cursor_.dragging = action.w === null ? [] : [action.w];
        if (
          cursor.tool.value === "Delete" ||
          cursor.tool.value === "DeleteMark"
        ) {
          cursor_.ghosts = action.w === null ? [] : [action.w];
        } else {
          cursor_.ghosts = [];
        }
        return cursor_;
      }
    },
    rectangle: (cursor, action) => {
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
  rightdown: {
    click: (cursor) => cursor,
    paint: (cursor, action) => {
      if (
        cursor.leftMode !== null &&
        cursor.dragging !== null &&
        cursor.dragging.length <= 1 &&
        wEquals(cursor.dragging[0] ?? null, action.w)
      ) {
        return cursor;
      } else {
        const cursor_ = defaultPaintCursor(
          cursor.tool.value === "Black" ||
            cursor.tool.value === "White" ||
            cursor.tool.value === "Delete"
            ? "Delete"
            : "DeleteMark",
        );
        if (cursor.leftMode === null) {
          cursor_.leftMode = cursor.tool.value;
        }
        cursor_.dragging = action.w === null ? [] : [action.w];
        cursor_.ghosts = action.w === null ? [] : [action.w];
        return cursor_;
      }
    },
    rectangle: (cursor, action) => {
      if (
        cursor.leftMode !== null &&
        wEquals(cursor.start, action.w) &&
        wEquals(cursor.end, action.w)
      ) {
        return cursor;
      }
      const cursor_ = defaultRectangleCursor("DeleteMark");
      if (cursor.leftMode === null) {
        cursor_.leftMode = cursor.tool.value;
      }
      cursor_.start = action.w;
      cursor_.end = action.w;
      cursor_.ghosts = action.w === null ? [] : [action.w];

      return cursor_;
    },
  },
  move: {
    click: (cursor, action) => {
      if (wEquals(action.w, cursor.ghosts[0] ?? null)) {
        return cursor;
      }
      const cursor_ = structuredClone(cursor);
      cursor_.ghosts = action.w === null ? [] : [action.w];
      return cursor_;
    },
    paint: (cursor, action) => {
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
            type: "paint",
            tool: structuredClone(cursor.tool),
            ghosts:
              action.w === null ||
              (cursor.tool.value !== "Delete" &&
                cursor.tool.value !== "DeleteMark")
                ? []
                : [action.w],
            dragging: [...cursor.dragging, action.w],
            leftMode: cursor.leftMode,
          };
        }
      }
    },
    rectangle: (cursor, action) => {
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
    click: (cursor) =>
      cursor.ghosts.length === 0
        ? cursor
        : defaultClickCursor(cursor.tool.value),
    paint: (cursor) => {
      if (cursor.leftMode !== null) {
        return defaultPaintCursor(cursor.leftMode);
      }
      if (cursor.dragging === null && cursor.ghosts.length === 0) {
        return cursor;
      }
      return defaultPaintCursor(cursor.tool.value);
    },
    rectangle: (cursor) => {
      if (cursor.leftMode !== null) {
        return defaultRectangleCursor(cursor.leftMode);
      }
      if (cursor.start === null && cursor.end === null) {
        return cursor;
      }
      return defaultRectangleCursor(cursor.tool.value);
    },
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
  const [c_errorMessage, c_setErrorMessage] = useState<string>("");
  const [c_errorWindowOpen, c_setErrorWindowOpen] = useState(false);
  const [c_answerMessage, c_setAnswerMessage] = useState("");
  const [c_window, c_setWindow] = useState<[number, number, number, number]>([
    0, 18, 0, 18,
  ]);
  const [c_exerciseNumber, c_setExerciseNumber] = useState<[number, number]>([
    1, 1,
  ]);

  const [c_themeStr, c_setThemeStr] = useState<string>(
    () => "none_" + Math.random().toString(36).substring(2),
  );
  const [c_theme, c_setTheme] = useState<Theme>(() => createTheme());
  const [c_images, c_setImages] = useState<Record<ImageVariant, string>>(
    () => ({
      Delete: "doesn't exist!",
      DeleteMark: "doesn't exist!",
      Black: "doesn't exist!",
      White: "doesn't exist!",
      Triangle: "doesn't exist!",
      Circle: "doesn't exist!",
      Cross: "doesn't exist!",
      Square: "doesn't exist!",
      BlackTerritory: "doesn't exist!",
      WhiteTerritory: "doesn't exist!",
      Board: "doesn't exist!",
    }),
  );

  const assetRef = useRef(new Map());

  const getAsset = async (asset: string): Promise<string> => {
    if (assetRef.current.has(asset)) {
      return assetRef.current.get(asset);
    }
    try {
      const binary = await commands.getAsset(asset);
      const type = mime.getType(asset) ?? "application/octet-stream";
      console.log(type);
      const blob = new Blob([binary], { type });
      const url = URL.createObjectURL(blob);
      assetRef.current.set(asset, url);
      return url;
    } catch (e) {
      console.log(e);
      handleError(e, c_setErrorMessage, c_setErrorWindowOpen);
      return `not found.`;
    }
  };

  const c_loadTheme = useCallback(
    async (newThemeStr: string) => {
      if (newThemeStr === c_themeStr) {
        return;
      }
      try {
        console.log(newThemeStr);
        const theme_binary = await commands.getAsset(newThemeStr);
        console.log(theme_binary.byteLength, theme_binary);
        const theme_config: ThemeConfig = JSON.parse(
          await new Blob([theme_binary], { type: "application/json" }).text(),
        );

        const theme = theme_from_import(theme_config.themeOptions);
        const images = {
          Delete: await getAsset(theme_config.images.Delete),
          DeleteMark: await getAsset(theme_config.images.DeleteMark),
          Black: await getAsset(theme_config.images.Black),
          White: await getAsset(theme_config.images.White),
          Triangle: await getAsset(theme_config.images.Triangle),
          Circle: await getAsset(theme_config.images.Circle),
          Cross: await getAsset(theme_config.images.Cross),
          Square: await getAsset(theme_config.images.Square),
          BlackTerritory: await getAsset(theme_config.images.BlackTerritory),
          WhiteTerritory: await getAsset(theme_config.images.WhiteTerritory),
          Board: await getAsset(theme_config.images.Board),
        };
        console.log(images);
        c_setThemeStr(newThemeStr);
        c_setTheme(theme);
        c_setImages(images);
      } catch (e) {
        handleError(e, c_setErrorMessage, c_setErrorWindowOpen);
      }
    },
    [c_themeStr],
  );

  useEffect(() => {
    commands
      .getConfig()
      .then((config) => {
        c_loadTheme(config.theme);
      })
      .catch((e) => handleError(e, c_setErrorMessage, c_setErrorWindowOpen));
  }, [c_loadTheme]);


  const [c_cursor, c_cursorDispatch] = useReducer(
    cursorReducer,
    "Black",
    defaultPaintCursor,
  );

  return (
    <ThemeProvider theme={c_theme}>
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
          c_exerciseNumber,
          c_setExerciseNumber,
          c_feedback,
          c_setFeedback,
          c_cursor,
          c_cursorDispatch,
          c_nextLabel,
          c_setNextLabel,
          c_window,
          c_setWindow,
          c_images,
          c_setImages,
          c_errorMessage,
          c_setErrorMessage,
          c_errorWindowOpen,
          c_setErrorWindowOpen,
          c_answerMessage,
          c_setAnswerMessage,
          c_loadTheme,
        }}
      >
        {c_phase === "Main" ? (
          <MainScreen />
        ) : c_phase === "Editing" ? (
          <EditingScreen />
        ) : (
          <StudyScreen />
        )}
        <Dialog
          open={c_errorWindowOpen}
          fullWidth
          maxWidth="xs"
          onClose={() => c_setErrorWindowOpen(false)}
        >
          <DialogContent>
            <DialogContentText>{c_errorMessage}</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              onClick={() => {
                c_setErrorWindowOpen(false);
                c_setErrorMessage("");
              }}
            >
              Ok
            </Button>
          </DialogActions>
        </Dialog>
      </AppContext>
    </ThemeProvider>
  );
}

export default App;
