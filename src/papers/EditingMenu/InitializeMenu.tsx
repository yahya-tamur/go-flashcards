import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

import StartButton from "./components/StartButton";

import BoardSlider from "./components/BoardSlider";
import LabelInput from "./components/LabelInput";
import PlaceMarkGroup from "./components/PlaceMarkGroup";
import PlaceStoneGroup from "./components/PlaceStoneGroup";
import RectLabelGroup from "./components/RectLabelGroup";

const InitializeMenu = () => {
  return (
    <Paper
      sx={{
        height: "100%",
        maxHeight: "100%",
        minHeight: 0,
        width: "100%",
        maxWidth: "100%",
        display: "flex",
        flexDirection: "column",
        overflow: "scroll",
        justifyContent: "start",
        gap: "20px",
        userSelect: "none",
        WebkitUserSelect: "none",
      }}
      draggable="false"
      elevation={7}
    >
      <Box
        sx={{
          flex: "0 1 auto",
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          flexDirection: "row",
          paddingTop: "10px",
          marginBottom: "-10px",
        }}
      >
        <BoardSlider side={"row"} force={true} />
        <BoardSlider side={"column"} force={true} />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
          alignItems: "center",
        }}
      >
        <PlaceMarkGroup default="place" />
        <LabelInput />
      </Box>
      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <PlaceStoneGroup default="place" />
        <RectLabelGroup default="place" />
      </Box>

      <Box
        sx={{
          width: "100%",
          maxWidth: "100%",
          display: "flex",
          justifyContent: "space-around",
        }}
      >
        <StartButton />
      </Box>
    </Paper>
  );
};

export default InitializeMenu;
