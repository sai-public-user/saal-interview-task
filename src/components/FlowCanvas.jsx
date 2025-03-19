import React, { useState, useCallback } from "react";
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  ReactFlow,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDrag, useDrop } from "react-dnd";

const ItemType = "ROW";

const Row = ({ row, tableId, onDrop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { ...row, tableId },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item) => onDrop(item, row),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div ref={drop} className={`border p-2 ${isOver ? "bg-gray-200" : ""}`}>
      <div ref={drag} className="cursor-pointer bg-white p-1 border">
        {row.name} ({row.dataType})
      </div>
    </div>
  );
};

const TableNode = ({ data }) => {
  const onDrop = (draggedRow, targetRow) => {
    if (draggedRow.tableId === data.id) return; // Prevent self-connection
    if (draggedRow.dataType !== targetRow.dataType) {
      alert("Data types do not match!");
      return;
    }
    data.onConnect(draggedRow, targetRow);
  };

  return (
    <div className="bg-white shadow-lg border w-60 p-2 rounded">
      <div className="bg-gray-300 font-bold text-center py-1 sticky top-0">
        {data.label}
      </div>
      <div>
        {data.rows.map((row) => (
          <Row key={row.id} row={row} tableId={data.id} onDrop={onDrop} />
        ))}
      </div>
      <Handle type="source" position={Position.Right} id="right" />
      <Handle type="target" position={Position.Left} id="left" />
    </div>
  );
};

const nodeTypes = { table: TableNode };

const FlowCanvas = () => {
  const initialNodes = [
    {
      id: "1",
      type: "table",
      position: { x: 100, y: 100 },
      data: {
        label: "Table A",
        rows: [
          { id: "1a", name: "ID", dataType: "number" },
          { id: "1b", name: "Name", dataType: "string" },
        ],
      },
    },
    {
      id: "2",
      type: "table",
      position: { x: 400, y: 100 },
      data: {
        label: "Table B",
        rows: [
          { id: "2a", name: "User ID", dataType: "number" },
          { id: "2b", name: "Username", dataType: "string" },
        ],
      },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = (draggedRow, targetRow) => {
    setEdges((eds) =>
      addEdge(
        {
          id: `${draggedRow.id}-${targetRow.id}`,
          source: draggedRow.id,
          target: targetRow.id,
        },
        eds
      )
    );
  };

  return (
    <ReactFlowProvider>
      <div className="w-full h-screen">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </div>
    </ReactFlowProvider>
  );
};

export default FlowCanvas;
