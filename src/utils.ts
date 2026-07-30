import type { Dispatch, SetStateAction } from "react";

import type {
  Cursor,
  CursorAction,
  EditingPhaseType,
  StudyPhaseType,
} from "@/AppContext";
import type {
  Mark,
  MarkPaint,
  RectangleMark,
  Snapshot,
  ValidationResult,
} from "@/bindings";

import { commands } from "@/bindings";

// label(Triangle) = label(Square)
//

export const configStatusEquals = (
  a: ValidationResult,
  b: ValidationResult,
): boolean => {
  if (a.result === "Valid" || b.result === "Valid") {
    return a.result === b.result;
  }
  if (a.error !== b.error) {
    return false;
  }
  if (a.range === null || b.range === null) {
    return a.range === b.range;
  }
  return a.range[0] === b.range[0] && a.range[1] === b.range[1];
};

export const setClick = (
  c_data: Snapshot | null,
  c_cursorDispatch: Dispatch<CursorAction>,
) => {
  return c_cursorDispatch({
    type: "set_click",
    value: c_data?.color === "Black" ? "White" : "Black",
  });
};

export const cursorColor = (cursor: Cursor): "Black" | "White" | null => {
  if (cursor.tool.value === "Black" || cursor.tool.value === "White") {
    return cursor.tool.value;
  }
  return null;
};

export const wEquals = (
  a: [number, number] | null,
  b: [number, number] | null,
): boolean =>
  a === null || b === null ? a === b : a[0] === b[0] && a[1] === b[1];

export const markEquals = (a: Mark | null, b: Mark | null): boolean => {
  if (a === null || b === null) {
    return a === b;
  } else if (a.type === "Label") {
    return b.type === "Label" && a.label === b.label;
  } else {
    return a.type === b.type;
  }
};

export const markEqualsCursor = (
  a: Mark | null,
  b: MarkPaint | RectangleMark,
  label: string,
): boolean => {
  if (a === null || b === "DeleteMark") {
    return a === null && b === "DeleteMark";
  } else if (b === "Label") {
    return a.type === "Label" && a.label === label;
  } else {
    return a.type === b;
  }
};

export const handleError = async <T>(
  error: T,
  c_setErrorMessage: Dispatch<SetStateAction<string>>,
  c_setErrorWindowOpen: Dispatch<SetStateAction<boolean>>,
) => {
  if (
    error !== null &&
    typeof error === "object" &&
    "message" in error &&
    typeof error.message === "string"
  ) {
    c_setErrorMessage(error.message);
  } else if (typeof error === "string") {
    c_setErrorMessage(error);
  } else {
    c_setErrorMessage("Unknown type of error.");
  }
  c_setErrorWindowOpen(true);
};

export const editNewExercise = (
  data: Snapshot,
  c_cursorDispatch: Dispatch<CursorAction>,
  c_setEditingPhase: Dispatch<SetStateAction<EditingPhaseType>>,
) => {
  if (data.table.length === 1 && data.table[0].length === 1) {
    c_setEditingPhase("Initialize");
    c_cursorDispatch({
      type: "set_paint",
      value: "Black",
    });
  } else {
    c_setEditingPhase("MakeTree");
    setClick(data, c_cursorDispatch);
  }
};

export const studyStep = async (
  data: Snapshot,
  c_setData: Dispatch<SetStateAction<Snapshot | null>>,
  c_setFeedback: Dispatch<SetStateAction<string>>,
  c_setStudyPhase: Dispatch<SetStateAction<StudyPhaseType>>,
  c_setAnswerMessage: Dispatch<SetStateAction<string>>,
) => {
  switch (data.variant) {
    case "Correct":
      return commands
        .answer(true)
        .then((answerMessage) => {
          c_setAnswerMessage(answerMessage);
          return commands.getData();
        })
        .then((data) => {
          c_setData(data);
          c_setFeedback("Correct");
          c_setStudyPhase("View");
        });
    case "Incorrect":
      return commands
        .answer(false)
        .then((answerMessage) => {
          c_setAnswerMessage(answerMessage);
          return commands.getData();
        })
        .then(() => commands.getData())
        .then((data) => {
          c_setData(data);
          c_setFeedback("Incorrect");
          c_setStudyPhase("View");
        });
    case "New":
      if (data?.table[0][0]?.color !== data.color) {
        return commands
          .answer(false)
          .then((answerMessage) => {
            c_setAnswerMessage(answerMessage);
            return commands.getData();
          })
          .then(() => commands.getData())
          .then((data) => {
            c_setData(data);
            c_setFeedback("Incorrect");
            c_setStudyPhase("View");
          });
      } else {
        c_setStudyPhase("UnknownGuess");
        return;
      }
  }
};
