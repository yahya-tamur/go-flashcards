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

export type Icon =
  | {
      type: "image";
      var: ImageVariant;
    }
  | {
      type: "label";
    };

export type Click = {
  type: "Click";
  ghosts: [number, number][];
  icon: Icon;
};

export type Place = {
  type: "Place";
  ghosts: [number, number][];
  icon: Icon;
  dragging: [number, number][] | null;
  layer:
    | {
        type: "stone";
        value: StonePaint;
      }
    | {
        type: "mark";
        value: MarkPaint;
      };
};
export type Drag = {
  type: "Drag";
  ghosts: [number, number][];
  icon: Icon;
  start: [number, number] | null;
  end: [number, number] | null;
  mark: RectangleMark;
};

export type CursorType = Click | Place | Drag;

export type CursorAction =
  | {
      type: "set_mode";
      mode:
        | {
            type: "click";
            color: "Black" | "White";
          }
        | {
            type: "mark";
            value: MarkPaint | RectangleMark;
          }
        | {
            type: "stone";
            value: StonePaint;
          };
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
  c_cursor: CursorType;
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
