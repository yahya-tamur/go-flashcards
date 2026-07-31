import type { ReactNode } from "react";

import type { Snapshot } from "@/bindings";

import type { EditingPhaseType, PhaseType, StudyPhaseType } from "./types";

import { useState } from "react";

import CssBaseline from "@mui/material/CssBaseline";
import { ThemeProvider } from "@mui/material/styles";

import useAppTheme from "./useAppTheme";
import useCursor from "./useCursor";
import useErrorHandler from "./useErrorHandler";

import {
  CursorContext,
  DataContext,
  DispatchContext,
  ErrorContext,
  ExerciseNumberContext,
  FeedbackContext,
  ImagesContext,
  PhaseContext,
  WindowContext,
} from ".";

type AppContextProviderProps = {
  children: ReactNode;
};

export const AppContextProvider = ({ children }: AppContextProviderProps) => {
  const [c_errorMessage, c_errorWindowOpen, c_handleError, c_closeErrorWindow] =
    useErrorHandler();


  const [initialLoad, setInitialLoad] = useState<boolean>(false);

  const [c_theme, c_images, c_setTheme] = useAppTheme(c_handleError, setInitialLoad);

  const [c_cursor, c_cursorDispatch] = useCursor();

  const [c_phase, c_setPhase] = useState<PhaseType>("Main");
  const [c_editingPhase, c_setEditingPhase] =
    useState<EditingPhaseType>("Initialize");
  const [c_studyPhase, c_setStudyPhase] = useState<StudyPhaseType>("Guess");
  const [c_feedback, c_setFeedback] = useState("");
  const [c_nextLabel, c_setNextLabel] = useState<string>("A");
  const [c_answerMessage, c_setAnswerMessage] = useState("");
  const [c_window, c_setWindow] = useState<[number, number, number, number]>([
    0, 18, 0, 18,
  ]);
  const [c_exerciseNumber, c_setExerciseNumber] = useState<[number, number]>([
    1, 1,
  ]);

  const [c_data, c_setData] = useState<Snapshot | null>(null);


  return (
    <ThemeProvider theme={c_theme}>
      <CssBaseline />
      <WindowContext value={{ c_window }}>
        <ImagesContext value={{ c_images }}>
          <ErrorContext value={{ c_errorMessage, c_errorWindowOpen }}>
            <ExerciseNumberContext value={{ c_exerciseNumber }}>
              <FeedbackContext value={{ c_feedback, c_answerMessage }}>
                <CursorContext value={{ c_cursor, c_nextLabel }}>
                  <DataContext value={{ c_data }}>
                    <PhaseContext
                      value={{ c_phase, c_editingPhase, c_studyPhase }}
                    >
                      <DispatchContext
                        value={{
                          c_setPhase,
                          c_setEditingPhase,
                          c_setStudyPhase,
                          c_setFeedback,
                          c_setData,
                          c_cursorDispatch,
                          c_setNextLabel,
                          c_setWindow,
                          c_setTheme,
                          c_handleError,
                          c_closeErrorWindow,
                          c_setAnswerMessage,
                          c_setExerciseNumber,
                        }}
                      >
                        {initialLoad && children}
                      </DispatchContext>
                    </PhaseContext>
                  </DataContext>
                </CursorContext>
              </FeedbackContext>
            </ExerciseNumberContext>
          </ErrorContext>
        </ImagesContext>
      </WindowContext>
    </ThemeProvider>
  );
};
// ??? is eslint really okay with this?? what to do instead??
