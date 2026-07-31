import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";

import {
  useDispatchContext,
  useErrorContext,
  usePhaseContext,
} from "@/AppContext";

import EditingScreen from "@/Editing/Screen";

import MainScreen from "@/Main/Screen";

import StudyScreen from "@/Study/Screen";

function App() {
  const { c_phase } = usePhaseContext();
  const { c_errorMessage, c_errorWindowOpen } = useErrorContext();

  const { c_closeErrorWindow } = useDispatchContext();

  return (
    <>
      {c_phase === "Main" ? (
        <MainScreen />
      ) : c_phase === "Editing" ? (
        <EditingScreen />
      ) : (
        <StudyScreen />
      )}
      <Dialog
        open={c_errorWindowOpen}
        fullWidth
        maxWidth="xs"
        onClose={() => {
          c_closeErrorWindow();
        }}
      >
        <DialogContent>
          <DialogContentText>{c_errorMessage}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            onClick={() => {
              c_closeErrorWindow();
            }}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}

export default App;
