const { useEffect, useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Paper = (await import("@mui/material/Paper")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { StudyPhaseType } = await import("../AppContext");
const Board = (await import("../Board")).default;
const CommentBox = (await import("../CommentBox")).default;
const Tree = (await import("../Tree")).default;
const { commands } = await import("../bindings");

const Menu = (await import("./Menu")).default;
const TopBar = (await import("./TopBar")).default;

const Screen = () => {
  const { c_studyPhase, c_setStudyPhase, c_setData } = useContext(AppContext);
  useEffect(() => {
    commands
      .getData()
      .then((data) => {
        c_setStudyPhase(StudyPhaseType.Guess);
        c_setData(data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [c_setData, c_setStudyPhase]);

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
          {c_studyPhase === "Guess" || c_studyPhase === "UnknownGuess" ? (
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

export default Screen;
