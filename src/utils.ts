import type { Dispatch, SetStateAction } from "react";

import type { CursorType, StudyPhaseType } from "./AppContext";
import type { Mark, Snapshot } from "./bindings";

const { StudyPhaseType: SPT } = await import("./AppContext");
const { commands } = await import("./bindings");

export const label = (mark: Mark | null): string | null =>
  typeof mark === "string" ? null : (mark?.Label ?? null);

export const handleError = async <T>(error: T) => {
  console.log("backend error", error);
};

export const cursorMark = (
  c:
    | CursorType.Cross
    | CursorType.BlackTerritory
    | CursorType.WhiteTerritory
    | CursorType.Circle
    | CursorType.Triangle
    | CursorType.Square,
): Mark => c;

export const studyStep = (
  data: Snapshot,
  c_setData: Dispatch<SetStateAction<Snapshot | null>>,
  c_setFeedback: Dispatch<SetStateAction<string>>,
  c_setStudyPhase: Dispatch<SetStateAction<StudyPhaseType>>,
  c_cursor: CursorType,
) => {
  switch (data.variant) {
    case "Correct":
      commands
        .answer(true)
        .then(() => commands.getData())
        .then((data) => {
          c_setData(data);
          c_setFeedback("Correct");
          c_setStudyPhase(SPT.View);
        });
      break;
    case "Incorrect":
      commands
        .answer(false)
        .then(() => commands.getData())
        .then((data) => {
          c_setData(data);
          c_setFeedback("Incorrect");
          c_setStudyPhase(SPT.View);
        });
      break;
    case "New":
      if (
        c_cursor === (data?.table[0][0]?.color === "White" ? "Black" : "White")
      ) {
        commands
          .answer(false)
          .then(() => commands.getData())
          .then((data) => {
            c_setData(data);
            c_setFeedback("Incorrect");
            c_setStudyPhase(SPT.View);
          });
      } else {
        c_setStudyPhase(SPT.UnknownGuess);
      }

      break;
    default:
      break;
  }
};
