import { useContext } from "react";

import AppContext from "@/AppContext";

import InitializeMenu from "./InitializeMenu";
import MakeTreeMenu from "./MakeTreeMenu";

const Menu = () => {
  const { c_editingPhase } = useContext(AppContext);

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
