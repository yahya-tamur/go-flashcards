const { useEffect, useState, useRef, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const ClearIcon = (await import("@mui/icons-material/Clear")).default;

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const ButtonGroup = (await import("@mui/material/ButtonGroup")).default;
const Icon = (await import("@mui/material/Icon")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Slider = (await import("@mui/material/Slider")).default;
const TextField = (await import("@mui/material/TextField")).default;
const { createSvgIcon } = await import("@mui/material/utils");

await import("./App.css");

const AppContext = (await import("./AppContext")).default;

const black_image = (await import("./assets/black_night.png")).default;
const black_territory_icon = (await import("./assets/black_territory.svg"))
  .default;
const circle_icon = (await import("./assets/circle.svg")).default;
const cross_icon = (await import("./assets/cross.svg")).default;
const delete_mark_icon = (await import("./assets/delete_mark.svg")).default;
const mui_clear = (await import("./assets/mui_clear.svg")).default;
const board_image = (await import("./assets/oak.jpg")).default;
const square_icon = (await import("./assets/square.svg")).default;
const triangle_icon = (await import("./assets/triangle.svg")).default;
const white_image = (await import("./assets/white_anime.png")).default;
const white_territory_icon = (await import("./assets/white_territory.svg"))
  .default;

export default (props) => {
  let context = useContext(AppContext);

  const [comment, setComment] = useState("");
  useEffect(() => {
    if ((context.data?.comment ?? null) !== null) {
      setComment(context.data.comment);
    }
  }, [context.data]);
  const img_size = "20px";
  const update_comment = (comm) => {
    invoke("comment", {
      comment: comm,
    });
    setComment(comm);
  };

  const areaRef = useRef(null);
  const [rows, setRows] = useState(2);

  useEffect(() => {
    if (areaRef.current === null) {
      return;
    }

    const observer = new ResizeObserver(() => {
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
              sx={{ width: "30px", minWidth: "0px", width: "30px" }}
              onClick={(e) => {
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
              sx={{ width: "30px", minWidth: "0px", width: "30px" }}
              onClick={(e) => {
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
              sx={{ width: "30px", minWidth: "0px", width: "30px" }}
              onClick={(e) => {
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
              sx={{ width: "30px", minWidth: "0px", width: "30px" }}
              onClick={(e) => {
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
              onBlur={(e) => {
                invoke("comment", {
                  comment: comment,
                });
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
