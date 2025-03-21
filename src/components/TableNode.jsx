import React from "react";
import { NodeResizeControl } from "@xyflow/react";
import { useXarrow } from "react-xarrows";

const TableNode = ({ data, id, width, height }) => {
  const { handleRowDragStart, handleRowDrop, onResize, onClose } = data;
  const updateXarrow = useXarrow();

  return (
    <div
      className="border border-blue-300 bg-white shadow-md rounded-lg flex flex-col"
      style={{
        width: width || 250,
        height: height || 300,
      }}
    >
      <div className="bg-white-100 p-2 border-b flex justify-between items-center">
        <div className="font-bold flex-1 cursor-move drag-handle">
          {data.name}
        </div>
        <button
          onClick={() => onClose(id)}
          className="text-blue-400 hover:text-blue-600 text-xl"
        >
          ×
        </button>
      </div>

      <div className="bg-blue-200 flex border-b border-blue-400 font-semibold">
        <div className="p-2 w-1/2 border-r border-blue-400">Column Name</div>
        <div className="p-2 w-1/2">Data Type</div>
      </div>

      <div
        className="flex-1 nowheel overflow-auto relative z-10"
        onScroll={updateXarrow}
      >
        {data.columns.map((col, rowIndex) => (
          <div
            key={rowIndex}
            id={`row-${id}-${col.column_id}`}
            draggable
            onDragStart={(e) =>
              handleRowDragStart(e, id, col.column_id, col.column_data_type)
            }
            onDrop={(e) =>
              handleRowDrop(e, id, col.column_id, col.column_data_type)
            }
            onDragOver={(e) => e.preventDefault()}
            className="flex border-b border-blue-300 cursor-pointer hover:bg-blue-100 sticky top-[-40px] z-0 bottom-[-40px]"
          >
            <div className="p-2 w-1/2 border-r border-blue-400">{col.name}</div>
            <div className="p-2 w-1/2">{col.column_data_type}</div>
          </div>
        ))}
      </div>

      <div className="bg-blue-100 p-2 border-t flex justify-between items-center relative">
        <div className="text-xs font-bold text-black-50">
          Scroll for more rows
        </div>

        <NodeResizeControl
          minWidth={250}
          minHeight={300}
          onResize={(event, { width, height }) => {
            onResize(id, width, height);
            updateXarrow();
          }}
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
