import { useEffect, useRef, useState } from "react";

import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import ButtonGroup from "@mui/material/ButtonGroup";
import Paper from "@mui/material/Paper";
import TextField from "@mui/material/TextField";

import {
  useDataContext,
  useDispatchContext,
  useImagesContext,
  usePhaseContext,
} from "@/AppContext";
import { commands } from "@/bindings";

const CommentBox = () => {
  const { c_phase, c_studyPhase } = usePhaseContext();
  const { c_data } = useDataContext();
  const { c_images } = useImagesContext();
  const { c_handleError } = useDispatchContext();

  const [comment, setComment] = useState("");

  const data_comment = useRef("");

  useEffect(() => {
    const new_data_comment = c_data?.comment ?? "";
    if (data_comment.current !== new_data_comment) {
      data_comment.current = new_data_comment;
      setComment(new_data_comment);
    }
  }, [c_data]);

  const img_size = "20px";
  const update_comment = (comment: string) => {
    commands.comment(comment).catch((e) => c_handleError(e));
    setComment(comment);
  };

  const areaRef = useRef<HTMLDivElement>(null);
  const [rows, setRows] = useState(2);

  useEffect(() => {
    if (areaRef.current === null) {
      return;
    }

    const observer = new ResizeObserver(() => {
      if (areaRef.current === null) {
        return;
      }
      let textAreaHeight = areaRef.current.offsetHeight - 33;
      // just in case
      textAreaHeight -= 1;
      const heightPerRow = 23;
      setRows(Math.max(2, Math.floor(textAreaHeight / heightPerRow)));
    });

    observer.observe(areaRef.current);

    return () => {
      observer.disconnect();
    };
  }, [areaRef]);
  return (
    <Paper
      sx={{
        height: "100%",
        display: "flex",
        overflow: "scroll",
        flexDirection: "column",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      draggable="false"
      elevation={20}
    >
      {c_studyPhase !== "Edit" && c_phase === "Study" ? (
        <Box sx={{ height: "100%", margin: "10px", whiteSpace: "pre-wrap" }}>
          {comment}
        </Box>
      ) : (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            height: "100%",
            minHeight: "100px",
          }}
        >
          <ButtonGroup
            sx={{ height: "30px", margin: "5px", marginBottom: "0pt" }}
          >
            <Button
              sx={{ width: "30px", minWidth: "0px" }}
              onClick={() => {
                update_comment(comment + "△");
              }}
            >
              <img
                src={c_images["Triangle"]}
                style={{
                  height: img_size,
                  width: img_size,
                  filter: "invert()",
                }}
              />
            </Button>
            <Button
              sx={{ width: "30px", minWidth: "0px" }}
              onClick={() => {
                update_comment(comment + "□");
              }}
            >
              <img
                src={c_images["Square"]}
                style={{
                  height: img_size,
                  width: img_size,
                  filter: "invert()",
                }}
              />
            </Button>
            <Button
              sx={{ width: "30px", minWidth: "0px" }}
              onClick={() => {
                update_comment(comment + "○");
              }}
            >
              <img
                src={c_images["Circle"]}
                style={{
                  height: img_size,
                  width: img_size,
                  filter: "invert()",
                }}
              />
            </Button>
            <Button
              sx={{ width: "30px", minWidth: "0px" }}
              onClick={() => {
                update_comment(comment + "×");
              }}
            >
              <img
                src={c_images["Cross"]}
                style={{
                  height: img_size,
                  width: img_size,
                  filter: "invert()",
                }}
              />
            </Button>
          </ButtonGroup>

          <Box sx={{ height: "100%" }}>
            <TextField
              placeholder="Comment"
              ref={areaRef}
              variant="outlined"
              value={comment}
              onChange={(e) => {
                setComment(e.target.value);
              }}
              onBlur={() => {
                commands.comment(comment);
              }}
              multiline
              minRows={rows} // do with inputref later
              maxRows={rows} // do with inputref later
              sx={{
                height: "calc(100% - 10px)",
                margin: "5px",
                width: "calc(100% - 10px)",
              }}
              slotProps={{
                input: {
                  sx: {
                    height: "100%",
                    alignItems: "start",
                    overflowY: "auto",
                    fieldSizing: "content",
                  },
                },
              }}
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CommentBox;
