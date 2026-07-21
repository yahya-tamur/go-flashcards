import type { Dispatch, SetStateAction } from "react";

import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

import type { ValidationResult } from "../bindings";

const { useEffect, useState, useRef, useContext } = await import("react");

const { StreamLanguage } = await import("@codemirror/language");
const { StateField, StateEffect } = await import("@codemirror/state");
const { Decoration, EditorView } = await import("@codemirror/view");

const { toml } = await import("@codemirror/legacy-modes/mode/toml");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;

const editorTheme = (await import("@uiw/codemirror-theme-vscode")).vscodeDark;
const CodeMirror = (await import("@uiw/react-codemirror")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { commands } = await import("../bindings");
const { configStatusEquals, handleError } = await import("../utils");

interface HighlightPayload {
  from: number;
  to: number;
}

const addHighlight = StateEffect.define<HighlightPayload>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

const removeHighlight = StateEffect.define();

const highlightField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);
    // Apply new effects
    for (const e of tr.effects) {
      if (e.is(addHighlight)) {
        decorations = Decoration.none;
        decorations = decorations.update({
          add: [highlightMark.range(e.value.from, e.value.to)],
        });
      } else if (e.is(removeHighlight)) {
        decorations = Decoration.none;
      }
    }
    return decorations;
  },
  provide: (f) => {
    return EditorView.decorations.from(f);
  },
});

const highlightMark = Decoration.mark({ class: "cm-highlight" });

const scrollStyle = EditorView.theme({
  ".cm-scroller": {
    overflow: "visible",
  },
  ".cm-highlight": {
    borderBottom: "3px solid red",
    backgroundColor: "#5d6e4dff",
  },
  ".cm-content": { minHeight: "calc(100vh - 90px)" },
});

interface EditConfigProps {
  setStudies: Dispatch<SetStateAction<string[]>>;
  configSignal: number;
}

const EditConfig = ({ setStudies, configSignal }: EditConfigProps) => {
  const { c_setErrorMessage, c_setErrorWindowOpen } = useContext(AppContext);
  const [code, setCode] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [configStatus, setConfigStatus] = useState<ValidationResult>({
    result: "Valid",
  });
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    console.log(code);
  }, [code]);

  useEffect(() => {
    if (configStatus.result === "Valid") {
      editorRef.current?.view?.dispatch({
        effects: removeHighlight.of(null),
      });
      commands
        .listStudies()
        .then((studies) => setStudies(studies))
        .catch((e) => handleError(e, c_setErrorMessage, c_setErrorWindowOpen));
    } else {
      setStudies([]);
      if (configStatus.range !== null) {
        let [left, right] = configStatus.range;
        if (left == right) {
          left = left - 2; // out of bounds seems to be ok
          right = right + 2;
        }
        if (left < right) {
          editorRef.current?.view?.dispatch({
            effects: addHighlight.of({ from: left, to: right }),
          });
        }
      }
    }
  }, [configStatus, setStudies, c_setErrorMessage, c_setErrorWindowOpen]);

  useEffect(() => {
    commands
      .getConfigStr()
      .then((config) => {
        setCode(config);
        setLastSaved(config);
        return commands.setConfigStr(config);
      })
      .then((newConfigStatus) => {
        setConfigStatus((oldConfigStatus) =>
          configStatusEquals(oldConfigStatus, newConfigStatus)
            ? oldConfigStatus
            : newConfigStatus,
        );
      })
      .catch((e) => handleError(e, c_setErrorMessage, c_setErrorWindowOpen));
  }, [configSignal, setConfigStatus, c_setErrorMessage, c_setErrorWindowOpen]);

  return (
    <>
      <Paper
        sx={{
          height: "100%",
          maxHeight: "100%",
          minHeight: 0,
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "column",
          padding: "20px",
          paddingBottom: 0,
        }}
        elevation={10}
      >
        <Paper
          sx={{
            overflow: "scroll",
            height: "calc(100vh - 90px)",
            display: "flex",
            flexDirection: "column",
          }}
          elevation={2}
        >
          {code !== null && (
            <CodeMirror
              className="editor"
              value={code}
              ref={editorRef}
              theme={editorTheme}
              extensions={[
                StreamLanguage.define(toml),
                highlightField,
                scrollStyle,
                EditorView.lineWrapping,
              ]}
              onChange={(e) => {
                setCode(e);
              }}
            />
          )}
        </Paper>

        <Box
          sx={{
            width: "100%",
            minHeight: "70px",
            maxHeight: "70px",

            maxWidth: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            paddingRight: "20px",
            paddingLeft: "20px",
          }}
        >
          <Box
            sx={{
              width: "70%",
              maxWidth: "70%",
              overflowWrap: "break-word",
              overflow: "scroll",
              maxHeight: "100%",
              marginTop: "10px",
            }}
          >
            {configStatus.result === "Invalid" ? configStatus.error : ""}
          </Box>
          <Button
            disabled={code === lastSaved}
            variant="contained"
            sx={{ height: "40px", margin: "15px", marginRight: "0px" }}
            onClick={() => {
              if (code === null) {
                return;
              }
              commands
                .setConfigStr(code)
                .then((newConfigStatus) => {
                  setLastSaved(code);
                  setConfigStatus((oldConfigStatus) =>
                    configStatusEquals(oldConfigStatus, newConfigStatus)
                      ? oldConfigStatus
                      : newConfigStatus,
                  );
                })
                .catch((e) =>
                  handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                );
            }}
          >
            {code === lastSaved && configStatus.result === "Valid"
              ? "Saved."
              : "Save"}
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default EditConfig;
