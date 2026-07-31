import { useEffect, useState } from "react";

import Box from "@mui/material/Box";

import { useDispatchContext } from "@/AppContext";

import EditConfig from "./EditConfig.jsx";
import Menu from "./Menu.jsx";

import { commands } from "@/bindings.js";

const Screen = () => {
  const [exercises, setExercises] = useState<string[]>([]);
  const [studies, setStudies] = useState<string[]>([]);
  const [configSignal, setConfigSignal] = useState(0);
  const { c_handleError } = useDispatchContext();

  useEffect(() => {
    commands
      .listExercises()
      .then((a) => {
        setExercises(a);
      })
      .catch((e) => c_handleError(e));
    commands
      .listStudies()
      .then((a) => {
        setStudies(a);
      })
      .catch((e) => c_handleError(e));
  }, [c_handleError]);

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
          width: "max(60%, calc(100% - 200px))",
        }}
      >
        <EditConfig setStudies={setStudies} configSignal={configSignal} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "min(40%, 200px)",
          maxHeight: "100%",
          overflow: "hidden",
        }}
      >
        <Menu
          drawerWidth={"min(40%, 200px)"}
          exercises={exercises}
          setExercises={setExercises}
          studies={studies}
          setConfigSignal={setConfigSignal}
          configSignal={configSignal}
        />
      </Box>
    </main>
  );
};

export default Screen;
