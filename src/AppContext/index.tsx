import type {
  CursorValue,
  DataValue,
  DispatchValue,
  ErrorValue,
  ExerciseNumberValue,
  FeedbackValue,
  ImagesValue,
  PhaseValue,
  WindowValue,
} from "./types";

import { createContext, useContext } from "react";

export const WindowContext = createContext<WindowValue>(
  null as unknown as WindowValue,
);
export const ImagesContext = createContext<ImagesValue>(
  null as unknown as ImagesValue,
);
export const ErrorContext = createContext<ErrorValue>(
  null as unknown as ErrorValue,
);
export const ExerciseNumberContext = createContext<ExerciseNumberValue>(
  null as unknown as ExerciseNumberValue,
);
export const FeedbackContext = createContext<FeedbackValue>(
  null as unknown as FeedbackValue,
);
export const CursorContext = createContext<CursorValue>(
  null as unknown as CursorValue,
);
export const DataContext = createContext<DataValue>(
  null as unknown as DataValue,
);
export const PhaseContext = createContext<PhaseValue>(
  null as unknown as PhaseValue,
);
export const DispatchContext = createContext<DispatchValue>(
  null as unknown as DispatchValue,
);

export const useWindowContext = () => useContext(WindowContext);
export const useImagesContext = () => useContext(ImagesContext);
export const useErrorContext = () => useContext(ErrorContext);
export const useExerciseNumberContext = () => useContext(ExerciseNumberContext);
export const useFeedbackContext = () => useContext(FeedbackContext);
export const useCursorContext = () => useContext(CursorContext);
export const useDataContext = () => useContext(DataContext);
export const usePhaseContext = () => useContext(PhaseContext);
export const useDispatchContext = () => useContext(DispatchContext);
