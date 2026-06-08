import { useEffect, useState, useRef, useContext } from "react";
import board_image from "../assets/oak.jpg";
import black_image from "../assets/black_night.png";
import white_image from "../assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "../utils";

import "../App.css";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Button from "@mui/material/Button";

import AppContext from "../AppContext";
import Editor from "react-simple-code-editor";

import Prism from "prismjs/components/prism-core";
import "prismjs/components/prism-toml";
import "prismjs/themes/prism.css";

export default (props) => {
  let context = useContext(AppContext);
  const [code, setCode] = useState("");
  const [actualConfig, setActualConfig] = useState("");
  const [error, setError] = useState(undefined);

  useEffect(() => {
    invoke("get_config")
      .then((s) => {
        setCode(s);
        setError(undefined);
        return s;
      })
      .then((s) => invoke("set_config", { config: s }))
      .then(() => setActualConfig(code))
      .catch((err) => {
        if (err !== error) {
          setError(err);
        }
      });
  }, []);

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
          overflow: "scroll",
        }}
        elevation={2}
      >
        <Box sx={{ overflow: "scroll ", maxHeight: "calc(100% - 60px)" }}>
          <Editor
            style={{
              fontFamily: '"Roboto Mono", monospace',
              fontSize: 12,
              overflow: "visible",
            }}
            value={code}
            onValueChange={async (code) => {
              setCode(code);
              console.log(error);
            }}
            highlight={(code) => {
              if (error !== undefined) {
                let [_, left, right] = error;
                let code_ =
                  code.slice(0, left) +
                  "𓀿" +
                  code.slice(left, right) +
                  "𓁀" +
                  code.slice(right);
                let prism_html = String(
                  Prism.highlight(code_, Prism.languages.toml, "toml"),
                );
                prism_html = prism_html
                  .replace("𓀿", `<u style="background: red;">`)
                  .replace("𓁀", "</u>");
                return prism_html;
              } else {
                return Prism.highlight(code, Prism.languages.toml, "toml");
              }
            }}
            padding={10}
          />
        </Box>

        <Box
          sx={{
            width: "100%",
            height: "60px",

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
            }}
          >
            {error !== undefined ? error[0] : ""}
          </Box>
          <Button
            disabled={code === actualConfig && error === undefined}
            variant="contained"
            sx={{ height: "40px", margin: "10px" }}
            onClick={async () => {
              await invoke("set_config", { config: code })
                .then(() => {
                  setError(undefined);
                  setActualConfig(code);
                })
                .then(() => invoke("list_studies"))
                .then((a) => props.setStudies(a))
                .catch((err) => {
                  if (err !== error) {
                    setError(err);
                    props.setStudies([]);
                  }
                });
            }}
          >
            {code === actualConfig && error === undefined ? "Saved." : "Save"}
          </Button>
        </Box>
      </Paper>
    </>
  );
};
