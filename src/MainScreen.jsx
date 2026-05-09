import EditConfig from "./EditConfig.jsx";
import MainMenu from "./MainMenu";
import "./App.css";

import Box from "@mui/material/Box";

export default () => {
  return (
    <main style={{ display: "flex", flexDirection: "row" }}>
      <Box sx={{ height: "100vh", flexBasis: "60%", minWidth: 0 }}>
        <EditConfig />
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
        <MainMenu />
      </Box>
    </main>
  );
};
