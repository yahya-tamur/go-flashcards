const { StudyPhaseType } = await import("./AppContext");

import type { AppContextType, CursorType } from "./AppContext";
const { commands } = await import("./bindings");
import type { Mark, Snapshot } from "./bindings";

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

export const studyStep = (data: Snapshot, context: AppContextType) => {
  switch (data.variant) {
    case "Correct":
      commands
        .answer(true)
        .then(() => commands.getData())
        .then((data) => {
          context.setData(data);
          context.setFeedback("Correct");
          context.setStudyPhase(StudyPhaseType.View);
        });
      break;
    case "Incorrect":
      commands
        .answer(false)
        .then(() => commands.getData())
        .then((data) => {
          context.setData(data);
          context.setFeedback("Incorrect");
          context.setStudyPhase(StudyPhaseType.View);
        });
      break;
    case "New":
      if (
        context.cursor ===
        (context.data?.table[0][0]?.color === "White" ? "Black" : "White")
      ) {
        commands
          .answer(false)
          .then(() => commands.getData())
          .then(() => {
            context.setData(data);
            context.setFeedback("Incorrect");
            context.setStudyPhase(StudyPhaseType.View);
          });
      } else {
        context.setStudyPhase(StudyPhaseType.UnknownGuess);
      }

      break;
    default:
      break;
  }
};
