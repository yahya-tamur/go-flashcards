import type { Dispatch, SetStateAction } from "react";

import type { Snapshot } from "./bindings";

const { createContext } = await import("react");

export const enum PhaseType {
  Main = "Main",
  Editing = "Editing",
  Study = "Study",
}

export const enum EditingPhaseType {
  Initialize = "Initialize",
  MakeTree = "MakeTree",
}

export const enum StudyPhaseType {
  Guess = "Guess",
  UnknownGuess = "UnknownGuess",
  View = "View",
  Edit = "Edit",
}

export const enum CursorType {
  Delete = "Delete",
  DeleteMark = "DeleteMark",
  Black = "Black",
  White = "White",
  Triangle = "Triangle",
  Circle = "Circle",
  Cross = "Cross",
  Square = "Square",
  BlackTerritory = "BlackTerritory",
  WhiteTerritory = "WhiteTerritory",
  Label = "Label",
}

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
  c_setCursor: Dispatch<SetStateAction<CursorType>>;
  c_nextLabel: string;
  c_setNextLabel: Dispatch<SetStateAction<string>>;
  c_window: [number, number, number, number];
  c_setWindow: Dispatch<SetStateAction<[number, number, number, number]>>;
}

// ??? is eslint really okay with this?? what to do instead??
export default createContext<AppContextType>(null as unknown as AppContextType);
