const { useEffect, useState, useRef, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const { StreamLanguage } = await import("@codemirror/language");
const { StateField, StateEffect } = await import("@codemirror/state");
const { Decoration, EditorView } = await import("@codemirror/view");

const { toml } = await import("@codemirror/legacy-modes/mode/toml");

const { border } = await import("@mui/system");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;

const editorTheme = (await import("@uiw/codemirror-theme-vscode")).vscodeDark;
const CodeMirror = (await import("@uiw/react-codemirror")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { createSVGElement } = await import("../utils");

const black_image = (await import("../assets/black_night.png")).default;
const board_image = (await import("../assets/oak.jpg")).default;
const white_image = (await import("../assets/white_anime.png")).default;

const addHighlight = StateEffect.define({
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
    for (let e of tr.effects) {
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

export default (props) => {
  let context = useContext(AppContext);
  const [code, setCode] = useState(props.initialConfig);
  const [lastSaved, setLastSaved] = useState(props.initialConfig);
  const [error, setError] = useState(undefined);
  const editorRef = useRef(undefined);

  useEffect(() => {
    invoke("set_config_str", { config: props.initialConfig }).catch((err) => {
      if (err !== error) {
        let [_, left, right] = err;
        if (left == right) {
          left = Math.max(0, left - 2);
          right = Math.min(code.length, right + 2);
        }
        if (left < right) {
          editorRef.current?.view?.dispatch({
            effects: addHighlight.of({ from: left, to: right }),
          });
        }
        setCode(code);
        setError(err);
      }
    });
  }, [props.configSignal]);

  useEffect(() => {
    if (editorRef === null) {
      return;
    }
    window.addHighlight = (left, right) => {
      editorRef.current?.view?.dispatch({
        effects: addHighlight.of({ from: left, to: right }),
      });
    };
    window.removeHighlight = () => {
      editorRef.current?.view?.dispatch({
        effects: removeHighlight.of(),
      });
    };
    return () => {
      delete window.addHighlight;
      delete window.removeHighlight;
    };
  }, [editorRef]);

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
            {error !== undefined ? error[0] : ""}
          </Box>
          <Button
            disabled={code === lastSaved}
            variant="contained"
            sx={{ height: "40px", margin: "15px" }}
            onClick={async () => {
              await invoke("set_config_str", { config: code })
                .then(() => {
                  setError(undefined);
                  setLastSaved(code);
                  editorRef.current?.view?.dispatch({
                    effects: removeHighlight.of(),
                  });
                  invoke("list_studies", { config: code }).then((studies) =>
                    props.setStudies(studies),
                  );
                })
                .catch((err) => {
                  let [_, left, right] = err;
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

                  setError(err);
                  props.setStudies([]);
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
