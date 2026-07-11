const { useEffect, useState } = await import("react");

const Box = (await import("@mui/material/Box")).default;

await import("../App.css");

const { commands } = await import("../bindings.js");

const EditConfig = (await import("./EditConfig.jsx")).default;
const Menu = (await import("./Menu.jsx")).default;

const Screen = () => {
  const [exercises, setExercises] = useState<string[]>([]);
  const [studies, setStudies] = useState<string[]>([]);
  const [configSignal, setConfigSignal] = useState(0);

  useEffect(() => {
    commands.listExercises().then((a) => {
      setExercises(a);
    });
    commands.listStudies().then((a) => {
      setStudies(a);
    });
  }, []);

  const [initialConfig, setInitialConfig] = useState<string | null>(null);

  useEffect(() => {
    commands.getConfigStr().then((config) => setInitialConfig(config));
  });

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", width: "max(60%, calc(100% - 200px))" }}>
        {initialConfig === null ? (
          <Box />
        ) : (
          <EditConfig
            initialConfig={initialConfig}
            setStudies={setStudies}
            configSignal={configSignal}
          />
        )}
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
