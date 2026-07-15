const { useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const Board = (await import("../Board")).default;
const CommentBox = (await import("../CommentBox")).default;
const InitializeMenu = (await import("../InitializeMenu")).default;
const MakeTreeMenu = (await import("../MakeTreeMenu")).default;
const Tree = (await import("../Tree")).default;

const TopBar = (await import("./TopBar")).default;

const Screen = () => {
  // useEffect: load exercise.
  const { c_editingPhase } = useContext(AppContext);

  return (
    <main style={{ display: "flex", flexDirection: "column" }}>
      <Box sx={{ height: "60px" }}>
        <TopBar />
      </Box>
      <Box
        sx={{
          height: "calc(100vh - 60px)",
          display: "flex",
          flexDirection: "row",
        }}
      >
        <Box
          sx={{
            flexBasis: "60%",
            minWidth: "0",
          }}
        >
          <Board />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexBasis: "40%",
            flexDirection: "column",
            minWidth: 0,
            maxHeight: "100vh",
            overflow: "hidden",
          }}
        >
          <Box sx={{ flexBasis: "30%", minHeight: 0 }}>
            <Tree />
          </Box>
          <Box sx={{ flexBasis: "50%", minHeight: 0 }}>
            {c_editingPhase === "Initialize" ? (
              <InitializeMenu />
            ) : (
              <MakeTreeMenu />
            )}
          </Box>
          <Box sx={{ flexBasis: "40%", minHeight: 0 }}>
            <CommentBox />
          </Box>
        </Box>
      </Box>
    </main>
  );
};

export default Screen;
