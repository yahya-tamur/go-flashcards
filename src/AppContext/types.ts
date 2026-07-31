import type { Dispatch, SetStateAction } from "react";

import type { ThemeOptions } from "@mui/material";

import type { Snapshot } from "@/bindings";

import type { Cursor, CursorAction } from "./useCursor";

export type PhaseType = "Main" | "Editing" | "Study";

export type EditingPhaseType = "Initialize" | "MakeTree";

export type StudyPhaseType = "Guess" | "UnknownGuess" | "View" | "Edit";

export const APP_IMAGES = [
  "Board",
  "Delete",
  "DeleteMark",
  "Black",
  "White",
  "Triangle",
  "Circle",
  "Cross",
  "Square",
  "BlackTerritory",
  "WhiteTerritory",
] as const;

export type AppImage = (typeof APP_IMAGES)[number];

export type ThemeConfig = {
  themeOptions: ThemeOptions;
  images: Record<AppImage, string>;
};

export type WindowValue = {
  c_window: [number, number, number, number];
};

export type ImagesValue = {
  c_images: Record<AppImage, string>;
};

export type ErrorValue = {
  c_errorMessage: string;
  c_errorWindowOpen: boolean;
};

export type ExerciseNumberValue = {
  c_exerciseNumber: [number, number];
};

// why two different things??
export type FeedbackValue = {
  c_feedback: string;
  c_answerMessage: string;
};

export type CursorValue = {
  c_cursor: Cursor;
  c_nextLabel: string;
};

export type DataValue = {
  c_data: Snapshot | null;
};

export type PhaseValue = {
  c_phase: PhaseType;
  c_editingPhase: EditingPhaseType;
  c_studyPhase: StudyPhaseType;
};

export type DispatchValue = {
  c_setPhase: Dispatch<SetStateAction<PhaseType>>;
  c_setEditingPhase: Dispatch<SetStateAction<EditingPhaseType>>;
  c_setStudyPhase: Dispatch<SetStateAction<StudyPhaseType>>;
  c_setFeedback: Dispatch<SetStateAction<string>>;
  c_setData: Dispatch<SetStateAction<Snapshot | null>>;
  c_cursorDispatch: Dispatch<CursorAction>;
  c_setNextLabel: Dispatch<SetStateAction<string>>;
  c_setWindow: Dispatch<SetStateAction<[number, number, number, number]>>;
  c_setTheme: Dispatch<string>;
  c_handleError: Dispatch<unknown>;
  c_closeErrorWindow: Dispatch<void>;
  c_setAnswerMessage: Dispatch<SetStateAction<string>>;
  c_setExerciseNumber: Dispatch<SetStateAction<[number, number]>>;
};

export type * from "./useCursor";
