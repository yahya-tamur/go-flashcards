import type { Dispatch } from "react";

import { useCallback, useState } from "react";

const useErrorHandler = (): [
  string,
  boolean,
  Dispatch<unknown>,
  Dispatch<void>,
] => {
  const [message, setMessage] = useState<string>("");
  const [windowOpen, setWindowOpen] = useState(false);

  const handleError = useCallback(
    (error: unknown) => {
      if (
        error !== null &&
        typeof error === "object" &&
        "message" in error &&
        typeof error.message === "string"
      ) {
        setMessage(error.message);
      } else if (typeof error === "string") {
        setMessage(error);
      } else {
        setMessage("Unknown type of error.");
      }
      setWindowOpen(true);
    },
    [setMessage, setWindowOpen],
  );

  const closeErrorWindow = useCallback(() => {
    setWindowOpen(false);
    setMessage("");
  }, [setMessage, setWindowOpen]);

  return [message, windowOpen, handleError, closeErrorWindow];
};

export default useErrorHandler;
