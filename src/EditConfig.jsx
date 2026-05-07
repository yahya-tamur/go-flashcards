import { useEffect, useState, useRef } from "react";
import board_image from "./assets/oak.jpg";
import black_image from "./assets/black_night.png";
import white_image from "./assets/white_anime.png";
import { invoke } from "@tauri-apps/api/core";
import { createSVGElement } from "./utils";

import "./App.css";

import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import Editor from "react-simple-code-editor";

import 'prismjs';
import 'prismjs/plugins/line-numbers/prism-line-numbers';
import 'prismjs/components/prism-toml';
import "prismjs/themes/prism.css";

/*import 'prismjs/components/prism-toml';
import 'prismjs/plugins/line-numbers/prism-line-numbers.js';
import 'prismjs/plugins/line-numbers/prism-line-numbers.css';
import 'prismjs/plugins/line-highlight/prism-line-highlight.js';
import 'prismjs/plugins/line-highlight/prism-line-highlight.css';
*/


//var Prism = import('prismjs/components/prism-core.min');
//require('prismjs/components/prism-javascript.min');
//require('prismjs/plugins/line-numbers/prism-line-numbers.min');

const EditConfig = (props) => {


  const [code, setCode] = useState('');
  const [error, setError] = useState("");

  useEffect(() => {
    invoke("get_config")
      .then((s) => {
        setCode(s);
        setError(undefined);
      })
  }, [])

  return (<>
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
     { <Editor

        value={code}
        onValueChange={async (code) => {
          setCode(code);
          await invoke("set_config", {"config": code})
            .then(setError(undefined))
            .catch((err) => {
              if (err !== error) {
                setError(err);
              }
              console.log(err);

            })
          }}
        highlight={(code) => {
          if (error !== undefined) {
            let [_, left, right] = error;
            let code_ = code.slice(0, left) +  "𓀿" + code.slice(left, right) + "𓁀" + code.slice(right);
            let prism_html = String(Prism.highlight(code_, Prism.languages.toml, 'toml'));
            prism_html = prism_html.replace("𓀿", `<u style="background: red;">`).replace("𓁀", "</u>");
            return prism_html;
          } else {
            return Prism.highlight(code, Prism.languages.toml, 'toml');
          }
          console.log(error);
          
            
          
        }
        }
        padding={10}
        style={{
          fontFamily: '"Roboto Mono", monospace',
          fontSize: 12,
          
        }}
      />}
    <Box>
      {error !== undefined ? error[0] : "Saved!"}
    </Box>

    </Paper>
  </>);
};

export default EditConfig;
