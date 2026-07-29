const { useContext } = await import("react");

const AppContext = (await import("@/AppContext")).default;

const InitializeMenu = (await import("./InitializeMenu")).default;
const MakeTreeMenu = (await import("./MakeTreeMenu")).default;

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
