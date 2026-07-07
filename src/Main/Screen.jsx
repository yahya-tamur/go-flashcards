const { useEffect, useState, useRef, useContext } = await import("react");
const { invoke } = await import("@tauri-apps/api/core");
const EditConfig = (await import("./EditConfig.jsx")).default;
const Menu = (await import("./Menu.jsx")).default;
await import("../App.css");

const Box = (await import("@mui/material/Box")).default;

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
      <Box sx={{ height: "100vh", flexBasis: "60%", minWidth: 0 }}>
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
          flexBasis: "40%",
          flexDirection: "column",
          minWidth: 0,
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
