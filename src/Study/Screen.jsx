const { useState, useEffect, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const Board = (await import("../Board")).default;
const Tree = (await import("../Tree")).default;
const CommentBox = (await import("../CommentBox")).default;
const TopBar = (await import("./TopBar")).default;
const Menu = (await import("./Menu")).default;
await import("../App.css");
const AppContext = (await import("../AppContext")).default;
const Box = (await import("@mui/material/Box")).default;
const Paper = (await import("@mui/material/Paper")).default;
const Button = (await import("@mui/material/Button")).default;

export default () => {
  let context = useContext(AppContext);

  useEffect(() => {
    invoke("get_data")
      .then((data) => {
        context.setStudyPhase("Guess");
        context.setData(data);
        context.setCursor(data.color === "Black" ? "White" : "Black");
        context.setExerciseColor(data.color === "Black" ? "White" : "Black");
      })
      .catch((e) => {
        console.log(e);
      });
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box
        sx={{
          height: "100vh",
          flexBasis: "60%",
          minWidth: 0,
          flexDirection: "col",
        }}
      >
        <Box sx={{ height: "80px" }}>
          <TopBar />
        </Box>
        <Box sx={{ height: "calc(100vh - 80px)" }}>
          <Board />
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexBasis: "40%",
          flexDirection: "column  ",
          minWidth: 0,
          maxHeight: "100vh",
          overflow: "hidden",
        }}
      >
        <Box sx={{ flexBasis: "40%", minHeight: 0 }}>
          {context.studyPhase === "Guess" ||
          context.studyPhase === "UnknownGuess" ? (
            <Paper
              sx={{
                maxHeight: "100%",
                height: "100%",
              }}
              elevation={5}
            />
          ) : (
            <Tree />
          )}
        </Box>
        <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
          <Menu />
        </Box>
        <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
          <CommentBox />
        </Box>
      </Box>
    </main>
  );
};
