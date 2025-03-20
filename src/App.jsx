import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlow,
} from "@xyflow/react";
import { tables } from "./utils/data";
import Sidebar from "./components/Sidebar";
import TableNode from "./components/TableNode";
import { CustomEdge } from "./components";

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { custom: CustomEdge };

const NODE_WIDTH = 250;
const NODE_HEIGHT = 300;
const PADDING_X = 30;
const PADDING_Y = 30;
const START_X = 0;
const START_Y = 100;

/**
 * Determines if a node overlaps with any existing node.
 */
const isOverlapping = (newNode, nodes) => {
  return nodes.some(
    (node) =>
      node.id !== newNode.id &&
      newNode.position.x < node.position.x + (node.width || NODE_WIDTH) &&
      newNode.position.x + (newNode.width || NODE_WIDTH) > node.position.x &&
      newNode.position.y < node.position.y + (node.height || NODE_HEIGHT) &&
      newNode.position.y + (newNode.height || NODE_HEIGHT) > node.position.y
  );
};

/**
 * Finds the next available position for a node to prevent overlap.
 */
const getNextAvailablePosition = (nodes, viewportWidth) => {
  let x = START_X;
  let y = START_Y;
  const rowMaxWidth = viewportWidth - NODE_WIDTH - PADDING_X - 100;

  let occupiedPositions = nodes.map((node) => ({
    x: node.position.x,
    y: node.position.y,
    width: node.width || NODE_WIDTH,
    height: node.height || NODE_HEIGHT,
  }));

  while (true) {
    const overlapping = occupiedPositions.some(
      (pos) =>
        x < pos.x + pos.width &&
        x + NODE_WIDTH > pos.x &&
        y < pos.y + pos.height &&
        y + NODE_HEIGHT > pos.y
    );

    if (!overlapping) {
      break;
    }

    x += NODE_WIDTH + PADDING_X;

    if (x > rowMaxWidth) {
      x = START_X;
      y += NODE_HEIGHT + PADDING_Y;
    }
  }

  return { x, y };
};

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const draggedRowRef = useRef(null);
  const lastValidPositions = useRef({});
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleResizeEnd = (id, width, height) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              width: width || node.width,
              height: height || node.height,
              position: { ...node.position },
            }
          : node
      )
    );
  };

  const handleClose = (id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    );
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const table = JSON.parse(
      event.dataTransfer.getData("application/reactflow")
    );

    if (nodes.some((node) => node.data.id === table.id)) {
      alert("Table already exists!");
      return;
    }

    const newPosition = getNextAvailablePosition(nodes, viewportWidth);

    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: "tableNode",
      position: newPosition,
      dragHandle: ".drag-handle",
      deletable: true,
      width: NODE_WIDTH,
      height: NODE_HEIGHT,
      data: {
        ...table,

        onResize: handleResizeEnd,
        onClose: handleClose,
        handleRowDragStart,
        handleRowDrop,
      },
    };

    setNodes([...nodes, newNode]);
  };

  const handleRowDragStart = (event, tableId, rowId, dataType) => {
    draggedRowRef.current = { tableId, rowId, dataType };
  };

  const handleRowDrop = (event, targetTableId, targetRowId, targetDataType) => {
    event.preventDefault();
    if (!draggedRowRef.current) return;

    if (draggedRowRef.current.tableId === targetTableId) {
      alert("Rows in the same table cannot be connected!");
      return;
    }

    if (draggedRowRef.current.dataType !== targetDataType) {
      alert("Row data type mismatch!");
      return;
    }

    const source = `${draggedRowRef.current.tableId}-${draggedRowRef.current.rowId}`;
    const target = `${targetTableId}-${targetRowId}`;

    const newEdge = {
      id: `edge-${source}-${target}`,
      source,
      target,
    };

    setEdges((prevEdges) => [...prevEdges, newEdge]);
    draggedRowRef.current = null;
  };

  const handleNodeDragStop = useCallback(
    (event, node) => {
      let newPosition = node.position;
      let updatedNodes = nodes.map((n) =>
        n.id === node.id ? { ...n, position: newPosition } : n
      );

      if (isOverlapping(node, nodes)) {
        newPosition = getNextAvailablePosition(nodes, viewportWidth);
        updatedNodes = nodes.map((n) =>
          n.id === node.id ? { ...n, position: newPosition } : n
        );
      }

      setNodes(updatedNodes);
      lastValidPositions.current[node.id] = newPosition;
    },
    [nodes, viewportWidth]
  );

  return (
    <div className="flex h-screen">
      <Sidebar
        tables={tables}
        onDragStart={(event, table) => {
          event.dataTransfer.setData(
            "application/reactflow",
            JSON.stringify(table)
          );
          event.dataTransfer.effectAllowed = "move";
        }}
      />
      <div
        className="flex-grow"
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          onNodesChange={(changes) =>
            setNodes((nds) => applyNodeChanges(changes, nds))
          }
          onEdgesChange={(changes) =>
            setEdges((eds) => applyEdgeChanges(changes, eds))
          }
          onConnect={(connection) =>
            setEdges((eds) => addEdge(connection, eds))
          }
          onNodeDragStop={handleNodeDragStop}
          style={{ backgroundColor: "#F7F9FB" }}
          maxZoom={1}
          minZoom={1}
          colorMode="dark"
        >
          <Background />
          <Controls showZoom={false} />
        </ReactFlow>
      </div>
    </div>
  );
};

export default App;
