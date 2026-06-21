import { useEffect, useState, useRef, useContext } from "react";
import board_image from "../assets/oak.jpg";
import black_image from "../assets/black_night.png";
import white_image from "../assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "../utils";

import { Decoration, EditorView } from "@codemirror/view";
import { StateField, StateEffect } from "@codemirror/state";
import { toml } from "@codemirror/legacy-modes/mode/toml";
import { StreamLanguage } from "@codemirror/language";

import { vscodeDark as editorTheme } from "@uiw/codemirror-theme-vscode";

import CodeMirror from "@uiw/react-codemirror";

import "../App.css";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import AppContext from "../AppContext";
import { border } from "@mui/system";

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
        console.log(err, code);
        if (left == right) {
          left = Math.max(0, left - 2);
          right = Math.min(code.length, right + 2);
        }
        if (left < right) {
          console.log("highlighting", left, right);
          editorRef.current?.view?.dispatch({
            effects: addHighlight.of({ from: left, to: right }),
          });
        }
        setCode(code);
        setError(err);
      }
    });
  }, [props.configSignal]);

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
                  console.log(err, code);
                  if (left == right) {
                    left = Math.max(0, left - 2);
                    right = Math.min(code.length, right + 2);
                  }
                  if (left < right) {
                    console.log("highlighting", left, right);
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
