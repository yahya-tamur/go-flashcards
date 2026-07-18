const { useEffect, useState, useRef, useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const ButtonGroup = (await import("@mui/material/ButtonGroup")).default;
const Paper = (await import("@mui/material/Paper")).default;
const TextField = (await import("@mui/material/TextField")).default;

await import("./App.css");

const AppContext = (await import("./AppContext")).default;
const { commands } = await import("./bindings");
const { handleError } = await import("./utils");

const CommentBox = () => {
  const {
    c_phase,
    c_studyPhase,
    c_data,
    c_images,
    c_setErrorMessage,
    c_setErrorWindowOpen,
  } = useContext(AppContext);

  const [comment, setComment] = useState("");
  useEffect(() => {
    const comment = c_data?.comment ?? null;
    if (comment !== null) {
      setComment(comment);
    }
  }, [c_data]);
  const img_size = "20px";
  const update_comment = (comment: string) => {
    commands
      .comment(comment)
      .catch((e) => handleError(e, c_setErrorMessage, c_setErrorWindowOpen));
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

      setRows(Math.max(1, Math.floor(textAreaHeight / heightPerRow)));
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
      }}
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
              rows={rows} // do with inputref later
              sx={{
                height: "calc(100% - 10px)",
                margin: "5px",
                width: "calc(100% - 10px)",
              }}
              slotProps={{
                input: { sx: { height: "100%", alignItems: "start" } },
              }}
            />
          </Box>
        </Box>
      )}
    </Paper>
  );
};

export default CommentBox;
