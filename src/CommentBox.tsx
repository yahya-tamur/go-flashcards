const { useEffect, useState, useRef, useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const ButtonGroup = (await import("@mui/material/ButtonGroup")).default;
const Paper = (await import("@mui/material/Paper")).default;
const TextField = (await import("@mui/material/TextField")).default;

await import("./App.css");

const AppContext = (await import("./AppContext")).default;
const { commands } = await import("./bindings");

const circle_icon = (await import("./assets/circle.svg")).default;
const cross_icon = (await import("./assets/cross.svg")).default;
const square_icon = (await import("./assets/square.svg")).default;
const triangle_icon = (await import("./assets/triangle.svg")).default;

export default () => {
  let context = useContext(AppContext);

  const [comment, setComment] = useState("");
  useEffect(() => {
    let comment = context.data?.comment ?? null;
    if (comment !== null) {
      setComment(comment);
    }
  }, [context.data]);
  const img_size = "20px";
  const update_comment = (comment: string) => {
    commands.comment(comment);
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
      let heightPerRow = 23;

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
      {context.studyPhase !== "Edit" && context.phase === "Study" ? (
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
                src={triangle_icon}
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
                src={square_icon}
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
                src={circle_icon}
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
                src={cross_icon}
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
