import { useContext} from "react";

import Button from "@mui/material/Button";

import AppContext from "@/AppContext";
import { commands } from "@/bindings";
import {  handleError } from "@/utils";

const ExitButton = () => {
      const {
        c_setErrorMessage,
        c_setErrorWindowOpen,
        c_setNextLabel,
        c_setPhase,
      } = useContext(AppContext);

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
                //c_setConfig(null);
                c_setNextLabel("A");
                })
                .catch((e) =>
                handleError(e, c_setErrorMessage, c_setErrorWindowOpen),
                );
            }}
        >
            Exit
        </Button>

    );
}

export default ExitButton;