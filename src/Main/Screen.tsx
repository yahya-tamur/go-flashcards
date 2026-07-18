const { useEffect, useState, useContext } = await import("react");

const Box = (await import("@mui/material/Box")).default;

await import("../App.css");

const AppContext = (await import("../AppContext")).default;
const { commands } = await import("../bindings.js");
const { handleError } = await import("../utils.js");

const EditConfig = (await import("./EditConfig.jsx")).default;
const Menu = (await import("./Menu.jsx")).default;

const Screen = () => {
  const [exercises, setExercises] = useState<string[]>([]);
  const [studies, setStudies] = useState<string[]>([]);
  const [configSignal, setConfigSignal] = useState(0);
  const { c_setErrorMessage, c_setErrorWindowOpen } = useContext(AppContext);

  useEffect(() => {
    commands
      .listExercises()
      .then((a) => {
        setExercises(a);
      })
      .catch((e) => handleError(e, c_setErrorMessage, c_setErrorWindowOpen));
    commands
      .listStudies()
      .then((a) => {
        setStudies(a);
      })
      .catch((e) => handleError(e, c_setErrorMessage, c_setErrorWindowOpen));
  }, [c_setErrorMessage, c_setErrorWindowOpen]);

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", width: "max(60%, calc(100% - 200px))" }}>
        <EditConfig setStudies={setStudies} configSignal={configSignal} />
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "min(40%, 200px)",
          maxHeight: "100vh",
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
