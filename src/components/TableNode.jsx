import React from "react";
import { NodeResizeControl } from "@xyflow/react";

const TableNode = ({ data, id, width, height }) => {
  const { handleRowDragStart, handleRowDrop, onResize, onClose } = data;

  return (
    <div
      className="border border-gray-300 bg-white shadow-md rounded-lg flex flex-col"
      style={{
        width: width || 250,
        height: height || 300,
      }}
    >
      {/* Header with Drag Handle & Close Button */}
      <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
        <div className="font-bold flex-1 cursor-move drag-handle">
          {data.name}
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-blue-500 hover:text-blue-700 text-xl"
        >
          ×
        </button>
      </div>

      {/* Table Header (Fixed) */}
      <div className="bg-gray-200 flex border-b border-gray-400 font-semibold">
        <div className="p-2 w-1/2 border-r border-gray-400">Column Name</div>
        <div className="p-2 w-1/2">Data Type</div>
      </div>

      {/* Scrollable Table Rows */}
      <div className="flex-1 overflow-y-auto">
        {data.columns.map((col, rowIndex) => (
          <div
            key={rowIndex}
            draggable
            onDragStart={(e) =>
              handleRowDragStart(e, id, col.column_id, col.column_data_type)
            }
            onDrop={(e) =>
              handleRowDrop(e, id, col.column_id, col.column_data_type)
            }
            onDragOver={(e) => e.preventDefault()}
            className="flex border-b border-gray-300 cursor-pointer hover:bg-gray-100"
          >
            <div className="p-2 w-1/2 border-r border-gray-400">{col.name}</div>
            <div className="p-2 w-1/2">{col.column_data_type}</div>
          </div>
        ))}
      </div>

      {/* Footer with Resize Handle */}
      <div className="bg-gray-200 p-2 border-t flex justify-between items-center relative">
        <div className="text-sm font-light text-black">
          Scroll for more rows
        </div>

        {/* Resize Handle */}
        <NodeResizeControl
          minWidth={250}
          minHeight={300}
          onResize={(event, { width, height }) => onResize(id, width, height)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="#000000"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="absolute right-2 bottom-2 cursor-se-resize"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <polyline points="16 20 20 20 20 16" />
            <line x1="14" y1="14" x2="20" y2="20" />
          </svg>
        </NodeResizeControl>
      </div>
    </div>
  );
};

export default TableNode;
