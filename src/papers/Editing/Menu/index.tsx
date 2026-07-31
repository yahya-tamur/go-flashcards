import { usePhaseContext } from "@/AppContext";

import InitializeMenu from "./InitializeMenu";
import MakeTreeMenu from "./MakeTreeMenu";

const Menu = () => {
  const { c_editingPhase } = usePhaseContext();

  return (
    <>
      {c_editingPhase === "Initialize" ? (
        <InitializeMenu />
      ) : (
        <MakeTreeMenu />
      )}{" "}
    </>
  );
};

export default Menu;
