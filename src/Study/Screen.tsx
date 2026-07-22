const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;
const Paper = (await import("@mui/material/Paper")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const Board = (await import("../Board")).default;
const CommentBox = (await import("../CommentBox")).default;
const Tree = (await import("../Tree")).default;

const Menu = (await import("./Menu")).default;
const TopBar = (await import("./TopBar")).default;

const Screen = () => {
  const { c_studyPhase } = useContext(AppContext);

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "row",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <Box
        sx={{
          height:
            "calc((100vh - env(safe-area-inset-top)) - env(safe-area-inset-bottom))",
          flexBasis: "60%",
          minWidth: 0,
          flexDirection: "col",
        }}
      >
        <Box sx={{ height: "80px" }}>
          <TopBar />
        </Box>
        <Box sx={{ height: "calc(100% - 80px)" }}>
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
