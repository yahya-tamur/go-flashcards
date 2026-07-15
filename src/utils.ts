import type { Dispatch, SetStateAction } from "react";

import type {
  CursorAction,
  Cursor,
  EditingPhaseType,
  StudyPhaseType,
} from "./AppContext";
import type { Mark, MarkPaint, RectangleMark, Snapshot } from "./bindings";

const { commands } = await import("./bindings");

// label(Triangle) = label(Square)
//

export const setClick = (
  c_data: Snapshot | null,
  c_cursorDispatch: Dispatch<CursorAction>,
) => {
  console.log(c_data, c_data?.color);
  return c_cursorDispatch({
    type: "set_click",
    value: c_data?.color === "Black" ? "White" : "Black",
  });
};

export const cursorColor = (cursor: Cursor): "Black" | "White" | null => {
  if (cursor.paint.value === "Black" || cursor.paint.value === "White") {
    return cursor.paint.value;
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

export const handleError = async <T>(error: T) => {
  console.log("backend error", error);
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

export const studyStep = (
  data: Snapshot,
  c_setData: Dispatch<SetStateAction<Snapshot | null>>,
  c_setFeedback: Dispatch<SetStateAction<string>>,
  c_setStudyPhase: Dispatch<SetStateAction<StudyPhaseType>>,
) => {
  switch (data.variant) {
    case "Correct":
      commands
        .answer(true)
        .then(() => commands.getData())
        .then((data) => {
          c_setData(data);
          c_setFeedback("Correct");
          c_setStudyPhase("View");
        });
      break;
    case "Incorrect":
      commands
        .answer(false)
        .then(() => commands.getData())
        .then((data) => {
          c_setData(data);
          c_setFeedback("Incorrect");
          c_setStudyPhase("View");
        });
      break;
    case "New":
      if (data?.table[0][0]?.color === data.color) {
        commands
          .answer(false)
          .then(() => commands.getData())
          .then((data) => {
            c_setData(data);
            c_setFeedback("Incorrect");
            c_setStudyPhase("View");
          });
      } else {
        c_setStudyPhase("UnknownGuess");
      }

      break;
    default:
      break;
  }
};
