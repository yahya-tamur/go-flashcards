const { createContext } = await import("react");

import type { Dispatch, SetStateAction } from "react";
import type { Snapshot } from "./bindings";

export enum PhaseType {
  Main = "Main",
  Editing = "Editing",
  Study = "Study",
}

export enum EditingPhaseType {
  Initialize = "Initialize",
  MakeTree = "MakeTree",
}

export enum StudyPhaseType {
  Guess = "Guess",
  UnknownGuess = "UnknownGuess",
  View = "View",
  Edit = "Edit",
}

export enum CursorType {
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
  phase: PhaseType;
  setPhase: Dispatch<SetStateAction<PhaseType>>;
  editingPhase: EditingPhaseType;
  setEditingPhase: Dispatch<SetStateAction<EditingPhaseType>>;
  studyPhase: StudyPhaseType;
  setStudyPhase: Dispatch<SetStateAction<StudyPhaseType>>;
  feedback: string;
  setFeedback: Dispatch<SetStateAction<string>>;
  data: Snapshot | null;
  setData: Dispatch<SetStateAction<Snapshot | null>>;
  cursor: CursorType;
  setCursor: Dispatch<SetStateAction<CursorType>>;
  nextLabel: string;
  setNextLabel: Dispatch<SetStateAction<string>>;
  window: [number, number, number, number];
  setWindow: Dispatch<SetStateAction<[number, number, number, number]>>;
}

// ??? is eslint really okay with this?? what to do instead??
export default createContext<AppContextType>(null as unknown as AppContextType);
