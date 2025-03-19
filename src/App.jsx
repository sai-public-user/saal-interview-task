import React, { useState, useRef, useCallback } from "react";
import {
  Background,
  Controls,
  addEdge,
  applyNodeChanges,
  applyEdgeChanges,
  ReactFlow,
  useReactFlow,
} from "@xyflow/react";
import { tables } from "./utils/data";
import Sidebar from "./components/Sidebar";
import TableNode from "./components/TableNode";
import { CustomEdge } from "./components";

// Define custom node types
const nodeTypes = {
  tableNode: TableNode,
};

const edgeTypes = {
  custom: CustomEdge,
};

const App = () => {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [selectedEdge, setSelectedEdge] = useState(null);
  const [draggedRow, setDraggedRow] = useState(null);
  const lastValidPositions = useRef({});
  const lastValidSizes = useRef({});
  const { screenToFlowPosition } = useReactFlow();

  const checkOverlap = (node1, node2) => {
    return (
      node1.position.x < node2.position.x + (node2.width || 250) &&
      node1.position.x + (node1.width || 250) > node2.position.x &&
      node1.position.y < node2.position.y + (node2.height || 300) &&
      node1.position.y + (node1.height || 300) > node2.position.y
    );
  };

  const revertNodeIfOverlapping = (updatedNode) => {
    const overlappingNode = nodes.find(
      (node) => node.id !== updatedNode.id && checkOverlap(updatedNode, node)
    );

    if (overlappingNode) {
      setNodes((nds) =>
        nds.map((node) =>
          node.id === updatedNode.id
            ? {
                ...node,
                position:
                  lastValidPositions.current[updatedNode.id] || node.position,
                data: {
                  ...node.data,
                  ...(lastValidSizes.current[updatedNode.id] || {}),
                },
              }
            : node
        )
      );
    } else {
      lastValidPositions.current[updatedNode.id] = updatedNode.position;
      lastValidSizes.current[updatedNode.id] = {
        width: updatedNode.data.width,
        height: updatedNode.data.width,
      };
    }
  };

  const handleNodeDragStop = useCallback((event, node) => {
    revertNodeIfOverlapping(node);
  }, []);

  const handleResizeEnd = (id, width, height) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === id
          ? {
              ...node,
              data: {
                ...node.data,
                width,
                height,
              },
            }
          : node
      )
    );
  };

  const handleDragStart = (event, table) => {
    event.dataTransfer.setData("application/reactflow", JSON.stringify(table));
    event.dataTransfer.effectAllowed = "move";
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const table = JSON.parse(
      event.dataTransfer.getData("application/reactflow")
    );

    // Check if the table already exists
    const existingNode = nodes.findIndex((node) => node.data.id === table.id);
    if (existingNode !== -1) {
      alert("Table already exists!");
      return;
    }

    // Calculate position to prevent overlapping
    const newNodePosition = calculateNodePosition(
      nodes,
      event.clientX,
      event.clientY
    );

    // Add new table node
    const newNode = {
      id: `node-${nodes.length + 1}`,
      type: "tableNode",
      position: newNodePosition,
      dragHandle: ".drag-handle",
      data: {
        ...table,
        onClose: () => handleCloseTable(`node-${nodes.length + 1}`),
        onResize: (id, width, height) => handleResizeEnd(id, width, height),
        handleRowDrop,
        handleRowDragStart,
      },
    };

    setNodes((nds) => [...nds, newNode]);
  };

  const calculateNodePosition = (nodes, clientX, clientY) => {
    const padding = 50; // Minimum distance between nodes
    let newX = clientX;
    let newY = clientY;

    // Check for overlaps with existing nodes
    let overlap = true;
    while (overlap) {
      overlap = false;
      for (const node of nodes) {
        if (
          Math.abs(newX - node.position.x) < padding &&
          Math.abs(newY - node.position.y) < padding
        ) {
          overlap = true;
          newX += padding; // Move the new node to the right
          newY += padding; // Move the new node down
          break;
        }
      }
    }

    return screenToFlowPosition({ x: newX, y: newY });
  };

  const handleRowDragStart = (e, tableId, columnId, dataType) => {
    e.dataTransfer.setData(
      "application/reactflow-row",
      JSON.stringify({ tableId, columnId, dataType })
    );
    setDraggedRow({ tableId, columnId, dataType });
  };

  const handleRowDrop = (e, targetTableId, targetColumnId, targetDataType) => {
    e.preventDefault();
    e.stopPropagation();

    if (!draggedRow) return;

    // Validate data types
    if (draggedRow.dataType !== targetDataType) {
      alert("Data types do not match!");
      return;
    }

    // Create a connection
    const newEdge = {
      id: `edge-${edges.length + 1}`,
      source: draggedRow.tableId,
      sourceHandle: `${draggedRow.tableId}-${draggedRow.columnId}-left`,
      target: targetTableId,
      targetHandle: `${targetTableId}-${targetColumnId}-right`,
      type: "custom",
    };

    setEdges((eds) => addEdge(newEdge, eds));
    setDraggedRow(null);
  };

  const handleConnect = (connection) => {
    const sourceNode = nodes.find((node) => node.id === connection.source);
    const targetNode = nodes.find((node) => node.id === connection.target);

    const sourceColumn = sourceNode.data.columns.find(
      (col) => col.column_id === connection.sourceHandle.split("-")[1]
    );
    const targetColumn = targetNode.data.columns.find(
      (col) => col.column_id === connection.targetHandle.split("-")[1]
    );

    if (sourceColumn.column_data_type === targetColumn.column_data_type) {
      const newEdge = {
        ...connection,
        id: `edge-${edges.length + 1}`,
        label: (
          <div className="flex items-center gap-1">
            <span className="text-sm">=</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
        ),
      };
      setEdges((eds) => addEdge(newEdge, eds));
    } else {
      alert("Data types do not match!");
    }
  };

  const handleCloseTable = (id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== id && edge.target !== id)
    );
    delete lastValidPositions.current[id];
    delete lastValidSizes.current[id];
  };

  const handleEdgeClick = (event, edge) => {
    setSelectedEdge(edge.id);
  };

  const handleDeleteEdge = () => {
    if (selectedEdge) {
      setEdges((eds) => eds.filter((edge) => edge.id !== selectedEdge));
      setSelectedEdge(null);
    }
  };

  return (
    <div className="flex h-screen">
      <Sidebar tables={tables} onDragStart={handleDragStart} />
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
          onConnect={handleConnect}
          onEdgeClick={handleEdgeClick}
          onNodeDragStop={handleNodeDragStop}
          style={{ backgroundColor: "#F7F9FB" }}
          minZoom={1}
          maxZoom={1}
        >
          <Background />
          <Controls showZoom={false} />
        </ReactFlow>

        {/* Delete Button */}
        {selectedEdge && (
          <div className="absolute top-4 right-4">
            <button
              onClick={handleDeleteEdge}
              className="bg-red-500 text-white px-4 py-2 rounded-lg shadow-md hover:bg-red-600"
            >
              Delete Connection
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
