import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import { usePhaseContext } from "@/AppContext";

import Board from "@/papers/Board";
import CommentBox from "@/papers/CommentBox";
import Tree from "@/papers/Tree";

import Menu from "./Menu";
import TopBar from "./TopBar";

const Screen = () => {
  const { c_studyPhase } = usePhaseContext();

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
        <Box sx={{ flexBasis: "25%", minHeight: 0 }}>
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
        <Box sx={{ flexBasis: "50%", minHeight: 0 }}>
          <Menu />
        </Box>
        <Box sx={{ flexBasis: "25%", minHeight: 0 }}>
          <CommentBox />
        </Box>
      </Box>
    </main>
  );
};

export default Screen;
