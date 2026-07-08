const React = (await import("react")).default;
const ReactDOM = (await import("react-dom/client")).default;
const App = (await import("./App")).default;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
