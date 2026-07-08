const { useEffect, useState, useRef, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const ClearIcon = (await import("@mui/icons-material/Clear")).default;

const Box = (await import("@mui/material/Box")).default;
const Button = (await import("@mui/material/Button")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Slider = (await import("@mui/material/Slider")).default;
const TextField = (await import("@mui/material/TextField")).default;

await import("./App.css");

const AppContext = (await import("./AppContext")).default;
const { createSVGElement } = await import("./utils");

export default (props) => {
  let context = useContext(AppContext);
  const [comment, setComment] = useState("");
  useEffect(() => {
    if ((context.data?.comment ?? null) !== null) {
      setComment(context.data.comment);
    }
  }, [context.data]);
  return (
    <Paper
      sx={{
        height: "100%",
        minHeight: 0,
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        justifyContent: "space-around",
      }}
      elevation={10}
    >
      {context.studyPhase !== "Edit" && context.phase === "Study" ? (
        <Box sx={{ height: "100%", margin: "10px", whiteSpace: "pre-wrap" }}>
          {comment}
        </Box>
      ) : (
        <TextField
          placeholder="Comment"
          multiline
          variant="standard"
          value={comment}
          onChange={(e) => {
            setComment(e.target.value);
          }}
          onBlur={(e) => {
            invoke("comment", {
              comment: comment,
            })
              .then(() => invoke("get_data"))
              .then((data) => {
                context.setData(data);
              });
          }}
          sx={{
            display: "flex",
            flexGrow: 1,

            "& .MuiInputBase-root": { padding: "10pt" },
          }}
          slotProps={{ input: { sx: { height: "100%", alignItems: "start" } } }}
        />
      )}
    </Paper>
  );
};
