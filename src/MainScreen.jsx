import { useEffect, useState, useRef, useContext } from "react";
import { invoke } from "@tauri-apps/api/core";
import EditConfig from "./EditConfig.jsx";
import MainMenu from "./MainMenu";
import "./App.css";

import Box from "@mui/material/Box";

export default () => {
  const [exercises, setExercises] = useState([]);
  const [studies, setStudies] = useState([]);

  useEffect(() => {
    invoke("list_exercises").then((a) => {
      setExercises(a);
    });
    invoke("list_studies").then((a) => {
      setStudies(a);
    });
  }, []);

  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", flexBasis: "60%", minWidth: 0 }}>
        <EditConfig setStudies={setStudies} />
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
        <MainMenu exercises={exercises} studies={studies} />
      </Box>
    </main>
  );
};
