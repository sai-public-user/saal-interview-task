import React, { useState, useCallback } from "react";
import {
  addEdge,
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  Handle,
  Position,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useDrag, useDrop } from "react-dnd";

const ItemType = "ROW";

const RowNode = ({ id, data, onDrop }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemType,
    item: { id, ...data },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const [{ isOver }, drop] = useDrop({
    accept: ItemType,
    drop: (item) => onDrop(item, { id, ...data }),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  });

  return (
    <div
      ref={drop}
      className={`p-1 bg-white border rounded shadow-sm ${
        isOver ? "bg-gray-200" : ""
      }`}
    >
      <div
        ref={drag}
        className="cursor-pointer text-sm font-bold flex items-center"
      >
        {data.name} ({data.dataType})
        <Handle type="source" position={Position.Right} id={id} />
        <Handle type="target" position={Position.Left} id={id} />
      </div>
    </div>
  );
};

const TableNode = ({ data, onDrop }) => {
  return (
    <div className="bg-white shadow-lg border w-60 p-2 rounded">
      <div className="bg-gray-300 font-bold text-center py-1 flex justify-between items-center cursor-move">
        <span>{data.label}</span>
      </div>
      <div className="flex flex-col gap-1">
        {data.rows.map((row) => (
          <RowNode key={row.id} id={row.id} data={row} onDrop={onDrop} />
        ))}
      </div>
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
          { id: "1a", name: "UserID", dataType: "number" },
          { id: "1b", name: "Email", dataType: "string" },
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
          { id: "2a", name: "OrderID", dataType: "number" },
          { id: "2b", name: "Product", dataType: "string" },
        ],
      },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const onConnect = (draggedRow, targetRow) => {
    if (draggedRow.dataType !== targetRow.dataType) {
      alert("Data types do not match!");
      return;
    }
    setEdges((prevEdges) => [
      ...prevEdges,
      {
        id: `${draggedRow.id}-${targetRow.id}`,
        source: draggedRow.id,
        target: targetRow.id,
      },
    ]);
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
