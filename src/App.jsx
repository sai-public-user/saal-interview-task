import React, { useState, useRef, useCallback } from "react";
import {
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlow,
} from "@xyflow/react";
import dagre from "dagre"; // Import Dagre for auto-layout
import { tables } from "./utils/data";
import Sidebar from "./components/Sidebar";
import TableNode from "./components/TableNode";
import { CustomEdge } from "./components";

const nodeTypes = { tableNode: TableNode };
const edgeTypes = { custom: CustomEdge };

// Dagre Layout Configuration
const getLayoutedElements = (nodes, edges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  dagreGraph.setGraph({
    rankdir: "TB",
    nodesep: 30,
    ranksep: 120,
    x: 100,
    y: 100,
  });

  nodes.forEach((node) =>
    dagreGraph.setNode(node.id, { width: 250, height: 300 })
  );
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));

  dagre.layout(dagreGraph);

  return nodes.map((node) => {
    const { x, y } = dagreGraph.node(node.id);
    return { ...node, position: { x, y } };
  });
};

// Check for node overlap
const checkOverlap = (newNode, nodes) => {
  return nodes.some((node) => {
    if (node.id === newNode.id) return false;
    return (
      newNode.position.x < node.position.x + (node.width || 250) &&
      newNode.position.x + (newNode.width || 250) > node.position.x &&
      newNode.position.y < node.position.y + (node.height || 300) &&
      newNode.position.y + (newNode.height || 300) > node.position.y
    );
  });
};

// Adjust position if overlapping
const adjustPosition = (newNode, nodes) => {
  let { x, y } = newNode.position;
  let attempts = 0;
  const step = 50;

  while (
    checkOverlap({ ...newNode, position: { x, y } }, nodes) &&
    attempts < 10
  ) {
    x += step;
    y += step;
    attempts++;
  }

  return { x, y };
};

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const lastValidPositions = useRef({});

  const handleResizeEnd = (id, width, height) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              width,
              height,
            }
          : node
      )
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

    let newNode = {
      id: `node-${nodes.length + 1}`,
      type: "tableNode",
      position: { x: 0, y: 0 }, // Will be adjusted later
      width: 250,
      height: 300,
      data: { ...table, onResize: handleResizeEnd },
    };

    // Apply Dagre Layout
    const updatedNodes = getLayoutedElements([...nodes, newNode], edges);
    setNodes(updatedNodes);
  };

  const handleNodeDragStop = useCallback(
    (event, node) => {
      const adjustedPosition = adjustPosition(node, nodes);
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: adjustedPosition } : n
        )
      );
      lastValidPositions.current[node.id] = adjustedPosition;
    },
    [nodes]
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
        >
          <Background />
          <Controls />
        </ReactFlow>
      </div>
    </div>
  );
};

export default App;
