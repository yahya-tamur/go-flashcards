import type { Dispatch, SetStateAction } from "react";

import type { CursorAction, CursorType, StudyPhaseType } from "./AppContext";
import type { Mark, MarkPaint, RectangleMark, Snapshot } from "./bindings";

const { commands } = await import("./bindings");

// label(Triangle) = label(Square)
//

export const clickMode = (
  c_data: Snapshot | null,
): Extract<CursorAction, { type: "set_mode" }>["mode"] => ({
  type: "click",
  color: c_data?.color === "Black" ? "White" : "Black",
});

export const cursorColor = (cursor: CursorType): "Black" | "White" | null => {
  // works for Click variant
  if (cursor.icon.type === "image") {
    if (cursor.icon.var === "Black" || cursor.icon.var === "White") {
      return cursor.icon.var;
    }
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
