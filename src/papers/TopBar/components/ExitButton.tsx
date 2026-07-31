import Button from "@mui/material/Button";

import { useDispatchContext } from "@/AppContext";
import { commands } from "@/bindings";

const ExitButton = () => {
  const { c_setNextLabel, c_handleError, c_setPhase } = useDispatchContext();

  return (
    <Button
      variant="outlined"
      color="button"
      sx={{ height: "40px" }}
      onClick={async () => {
        commands
          .mainMenu()
          .then(() => {
            c_setPhase("Main");
            c_setNextLabel("A");
          })
          .catch((e) => c_handleError(e));
      }}
    >
      Exit
    </Button>
  );
};

export default ExitButton;
