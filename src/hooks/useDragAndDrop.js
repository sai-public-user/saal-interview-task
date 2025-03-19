import { useState } from "react";

const useDragAndDrop = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);

  const onDragStart = (event, table) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(table));
    event.dataTransfer.effectAllowed = "move";
  };

  const onDrop = (event) => {
    event.preventDefault();
    const table = JSON.parse(
      event.dataTransfer.getData("application/reactflow")
    );

    // Check if the table already exists
    const existingNode = nodes.find((node) => node.data.id === table.id);
    if (existingNode) {
      // Highlight the existing node (optional)
      return;
    }

    // Calculate position to prevent overlapping
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: "tableNode",
      position: { x: event.clientX, y: event.clientY },
      data: {
        ...table,
        onClose: () => handleCloseTable(`node-${nodes.length + 1}`),
      },
    };

    setNodes((nds) => nds.concat(newNode));
  };

  const onDragOver = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  };

  const handleCloseTable = (id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  return { nodes, edges, onDragStart, onDrop, onDragOver, setNodes, setEdges };
};

export default useDragAndDrop;
