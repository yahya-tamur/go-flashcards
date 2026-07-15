import type { Dispatch, SetStateAction } from "react";

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

export type ClickPaint =
  { value: "Black"; layer: "stone" } | { value: "White"; layer: "stone" };

export type RectPaint =
  | { value: "BlackTerritory"; layer: "mark" }
  | { value: "WhiteTerritory"; layer: "mark" }
  | { value: "DeleteMark"; layer: "mark" };

export type OtherPaint =
  | { value: "Triangle"; layer: "mark" }
  | { value: "Cross"; layer: "mark" }
  | { value: "Square"; layer: "mark" }
  | { value: "Circle"; layer: "mark" }
  | { value: "Delete"; layer: "stone" }
  | { value: "Label"; layer: "mark" };

export type Holding = ClickPaint | RectPaint | OtherPaint;

export type Click = {
  type: "Click";
  ghosts: [number, number][];
  paint: ClickPaint;
};

export type Place = {
  type: "Place";
  ghosts: [number, number][];
  dragging: [number, number][] | null;
  paint: ClickPaint | OtherPaint;
};
export type Drag = {
  type: "Drag";
  ghosts: [number, number][];
  paint: RectPaint;
  start: [number, number] | null;
  end: [number, number] | null;
};

export type Cursor = Click | Place | Drag;

export type CursorAction =
  | {
      type: "set_click";
      value: "Black" | "White";
    }
  | {
      type: "set_paint";
      value: MarkPaint | RectangleMark | StonePaint;
    }
  | {
      type: "down";
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
}

// ??? is eslint really okay with this?? what to do instead??
export default createContext<AppContextType>(null as unknown as AppContextType);
