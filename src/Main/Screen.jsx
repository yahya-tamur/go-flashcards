const { useEffect, useState, useRef, useContext } = await import("react");

const { invoke } = await import("@tauri-apps/api/core");

const Box = (await import("@mui/material/Box")).default;

await import("../App.css");

const EditConfig = (await import("./EditConfig.jsx")).default;
const Menu = (await import("./Menu.jsx")).default;

export default () => {
  const [exercises, setExercises] = useState([]);
  const [studies, setStudies] = useState([]);
  const [configSignal, setConfigSignal] = useState(0);

  useEffect(() => {
    invoke("list_exercises").then((a) => {
      setExercises(a);
    });
    invoke("list_studies").then((a) => {
      setStudies(a);
    });
  }, []);

  const [initialConfig, setInitialConfig] = useState(null);

  useEffect(() => {
    invoke("get_config_str").then((config) => setInitialConfig(config));
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
