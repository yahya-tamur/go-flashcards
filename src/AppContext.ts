import type { Dispatch, SetStateAction } from "react";

import type { ThemeOptions } from "@mui/material";

import type {
  MarkPaint,
  RectangleMark,
  Snapshot,
  StonePaint,
} from "./bindings";

const { createContext } = await import("react");

export type PhaseType = "Main" | "Editing" | "Study";

export type EditingPhaseType = "Initialize" | "MakeTree";

export type StudyPhaseType = "Guess" | "UnknownGuess" | "View" | "Edit";

export type ImageVariant =
  | "Board"
  | "Delete"
  | "DeleteMark"
  | "Black"
  | "White"
  | "Triangle"
  | "Circle"
  | "Cross"
  | "Square"
  | "BlackTerritory"
  | "WhiteTerritory";

export type ThemeConfig = {
  themeOptions: ThemeOptions;
  images: Record<ImageVariant, string>;
};

export type ClickTool =
  { value: "Black"; layer: "stone" } | { value: "White"; layer: "stone" };

export type PaintTool =
  | { value: "Triangle"; layer: "mark" }
  | { value: "Cross"; layer: "mark" }
  | { value: "Square"; layer: "mark" }
  | { value: "Circle"; layer: "mark" }
  | { value: "Label"; layer: "mark" }
  | { value: "DeleteMark"; layer: "mark" }
  | { value: "Black"; layer: "stone" }
  | { value: "White"; layer: "stone" }
  | { value: "Delete"; layer: "stone" };

export type RectangleTool =
  | { value: "BlackTerritory"; layer: "mark" }
  | { value: "WhiteTerritory"; layer: "mark" }
  | { value: "DeleteMark"; layer: "mark" };

export type Tool = ClickTool | PaintTool | RectangleTool;

export type ClickCursor = {
  type: "click";
  tool: ClickTool;
  ghosts: [number, number][];
};

export type PaintCursor = {
  type: "paint";
  tool: PaintTool;
  ghosts: [number, number][];
  dragging: [number, number][] | null;
  leftMode: MarkPaint | StonePaint | null;
};
export type RectangleCursor = {
  type: "rectangle";
  tool: RectangleTool;
  ghosts: [number, number][];
  start: [number, number] | null;
  end: [number, number] | null;
  leftMode: RectangleMark | null;
};

export type Cursor = ClickCursor | PaintCursor | RectangleCursor;

export type CursorAction =
  | {
      type: "set_click";
      value: "Black" | "White";
    }
  | {
      type: "set_paint";
      value: MarkPaint | StonePaint;
    }
  | {
      type: "set_rectangle";
      value: RectangleMark;
    }
  | {
      type: "down";
      w: [number, number] | null;
    }
  | {
      type: "rightdown";
      w: [number, number] | null;
    }
  | {
      type: "move";
      w: [number, number] | null;
    }
  | {
      type: "up";
    };

export interface AppContextType {
  c_phase: PhaseType;
  c_setPhase: Dispatch<SetStateAction<PhaseType>>;
  c_editingPhase: EditingPhaseType;
  c_setEditingPhase: Dispatch<SetStateAction<EditingPhaseType>>;
  c_studyPhase: StudyPhaseType;
  c_setStudyPhase: Dispatch<SetStateAction<StudyPhaseType>>;
  c_feedback: string;
  c_setFeedback: Dispatch<SetStateAction<string>>;
  c_data: Snapshot | null;
  c_setData: Dispatch<SetStateAction<Snapshot | null>>;
  c_cursor: Cursor;
  c_cursorDispatch: Dispatch<CursorAction>;
  c_nextLabel: string;
  c_setNextLabel: Dispatch<SetStateAction<string>>;
  c_window: [number, number, number, number];
  c_setWindow: Dispatch<SetStateAction<[number, number, number, number]>>;
  c_images: Record<ImageVariant, string>;
  c_setImages: Dispatch<SetStateAction<Record<ImageVariant, string>>>;
  c_errorMessage: string;
  c_setErrorMessage: Dispatch<SetStateAction<string>>;
  c_errorWindowOpen: boolean;
  c_setErrorWindowOpen: Dispatch<SetStateAction<boolean>>;
  c_answerMessage: string;
  c_setAnswerMessage: Dispatch<SetStateAction<string>>;
  c_exerciseNumber: [number, number];
  c_setExerciseNumber: Dispatch<SetStateAction<[number, number]>>;
  c_loadTheme: (newThemeStr: string) => Promise<void>;
}

// ??? is eslint really okay with this?? what to do instead??
export default createContext<AppContextType>(null as unknown as AppContextType);
