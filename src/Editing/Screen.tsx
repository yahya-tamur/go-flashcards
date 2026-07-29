const EditingMenu = (await import("@/papers/Editing/Menu")).default;

const Box = (await import("@mui/material/Box")).default;

await import("../App.css");

const Board = (await import("../Board")).default;
const CommentBox = (await import("../CommentBox")).default;
const Tree = (await import("../Tree")).default;

const TopBar = (await import("./TopBar")).default;

const Screen = () => {
  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        paddingTop: "env(safe-area-inset-top)",
        paddingBottom: "env(safe-area-inset-bottom)",
        paddingLeft: "env(safe-area-inset-left)",
        paddingRight: "env(safe-area-inset-right)",
      }}
    >
      <Box sx={{ height: "60px" }}>
        <TopBar />
      </Box>
      <Box
        sx={{
          height:
            "calc(((100vh - 60px) - env(safe-area-inset-top)) - env(safe-area-inset-bottom))",
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
          <Box sx={{ flexBasis: "23%", minHeight: 0 }}>
            <Tree />
          </Box>
          <Box sx={{ flexBasis: "50%", minHeight: 0 }}>
            <EditingMenu />
          </Box>
          <Box sx={{ flexBasis: "27%", minHeight: 0 }}>
            <CommentBox />
          </Box>
        </Box>
      </Box>
    </main>
  );
};

export default Screen;
