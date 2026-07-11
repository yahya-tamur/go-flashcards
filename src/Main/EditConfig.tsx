import type { Dispatch, SetStateAction } from "react";

import type { ReactCodeMirrorRef } from "@uiw/react-codemirror";

const { useEffect, useState, useRef } = await import("react");

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

const { commands } = await import("../bindings");

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
  initialConfig: string;
  setStudies: Dispatch<SetStateAction<string[]>>;
  configSignal: number;
}

const EditConfig = (props: EditConfigProps) => {
  //let context = useContext(AppContext);
  const [code, setCode] = useState(props.initialConfig);
  const [lastSaved, setLastSaved] = useState(props.initialConfig);
  const [error, setError] = useState<[string, number, number] | null>(null);
  const editorRef = useRef<ReactCodeMirrorRef>(null);

  useEffect(() => {
    commands.setConfigStr(props.initialConfig).then((errobj) => {
      if (errobj === null) {
        return;
      }
      setError((error) => {
        if (
          (error === null && errobj === null) ||
          (error !== null &&
            errobj !== null &&
            error[0] == errobj[0] &&
            error[1] == errobj[1] &&
            error[2] === errobj[2])
        ) {
          return error;
        }
        let [, left, right] = errobj;
        if (left == right) {
          left = left - 2; // out of bounds seems to be ok
          right = right + 2;
        }
        if (left < right) {
          editorRef.current?.view?.dispatch({
            effects: addHighlight.of({ from: left, to: right }),
          });
        }
        return errobj;
      });
    });
  }, [props.configSignal, props.initialConfig, setError]);

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
          {
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
          }
        </Paper>

        <Box
          sx={{
            width: "100%",
            minHeight: "70px",
            maxHeight: "70px",

            maxWidth: "100%",
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-around",
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
            {error !== null ? error[0] : ""}
          </Box>
          <Button
            disabled={code === lastSaved}
            variant="contained"
            sx={{ height: "40px", margin: "15px" }}
            onClick={async () => {
              await commands.setConfigStr(code).then((errobj) => {
                if (errobj === null) {
                  setError(null);
                  setLastSaved(code);
                  editorRef.current?.view?.dispatch({
                    effects: removeHighlight.of(null),
                  });
                  commands
                    .listStudies()
                    .then((studies) => props.setStudies(studies));
                } else {
                  let [, left, right] = errobj;
                  if (left == right) {
                    left = Math.max(0, left - 2);
                    right = Math.min(code.length, right + 2);
                  }
                  if (left < right) {
                    editorRef.current?.view?.dispatch({
                      effects: addHighlight.of({ from: left, to: right }),
                    });
                  }
                  setLastSaved(code);

                  setError(errobj);
                  props.setStudies([]);
                }
              });
            }}
          >
            {code === lastSaved && error === undefined ? "Saved." : "Save"}
          </Button>
        </Box>
      </Paper>
    </>
  );
};

export default EditConfig;
