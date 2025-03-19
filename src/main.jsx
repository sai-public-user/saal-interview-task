import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import "@xyflow/react/dist/style.css";
import { ReactFlowProvider } from "@xyflow/react";
import FlowCanvas from "./components/FlowCanvas.jsx";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ReactFlowProvider>
      <App />
      {/* <DndProvider backend={HTML5Backend}>
        <FlowCanvas />
      </DndProvider> */}
    </ReactFlowProvider>
  </StrictMode>
);
