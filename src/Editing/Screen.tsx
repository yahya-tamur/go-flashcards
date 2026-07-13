import { clickMode } from "../utils";
import type { EditingPhaseType } from "../AppContext";

const { useEffect, useContext, useEffectEvent } = await import("react");

const Box = (await import("@mui/material/Box")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const Board = (await import("../Board")).default;
const CommentBox = (await import("../CommentBox")).default;
const InitializeMenu = (await import("../InitializeMenu")).default;
const MakeTreeMenu = (await import("../MakeTreeMenu")).default;
const Tree = (await import("../Tree")).default;
const { commands } = await import("../bindings");

const TopBar = (await import("./TopBar")).default;

const Screen = () => {
  // useEffect: load exercise.
  const {
    c_data,
    c_setData,
    c_setEditingPhase,
    c_cursorDispatch,
    c_editingPhase,
  } = useContext(AppContext);

  const setInitialCursor = useEffectEvent(
    (c_editingPhase: EditingPhaseType) => {
      if (c_editingPhase === "Initialize") {
        c_cursorDispatch({
          type: "set_mode",
          mode: {
            type: "stone",
            value: "Black",
          },
        });
      } else {
        c_cursorDispatch({
          type: "set_mode",
          mode: clickMode(c_data),
        });
      }
    },
  );

  useEffect(() => {
    setInitialCursor(c_editingPhase);
  }, [c_editingPhase]);

  useEffect(() => {
    commands
      .getData()
      .then((data) => {
        if (data.table.length === 1 && data.table[0].length === 1) {
          c_setEditingPhase("Initialize");
        } else {
          c_setEditingPhase("MakeTree");
        }
        c_setData(data);
      })
      .catch((e) => {
        console.log(e);
      });
  }, [c_setData, c_setEditingPhase]);
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
