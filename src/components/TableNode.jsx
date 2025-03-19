import React from "react";
import { Handle, Position, NodeResizeControl } from "@xyflow/react";

const TableNode = ({ data, id }) => {
  const {
    handleRowDragStart: onRowDragStart,
    handleRowDrop: onRowDrop,
    isHighlighted,
  } = data;
  console.log("isHight ==> ", isHighlighted);
  return (
    <div
      className={`border border-gray-300 bg-white shadow-md rounded-lg overflow-hidden flex flex-col transform transition-transform duration-500 ease-in-out ${
        isHighlighted ? "scale-125" : "scale-100"
      }`}
      style={{ width: data.width || 250, height: data.height || 300 }}
    >
      <div className="bg-gray-100 p-2 border-b flex justify-between items-center">
        {/* Drag Handle */}
        <div className="font-bold flex flex-1 drag-handle cursor-move">
          {data.name}
        </div>
        <button
          onClick={data.onClose}
          className="text-blue-400 hover:text-blue-700 size-8 text-xl"
        >
          ×
        </button>
      </div>

      {/* Table with Borders */}
      <div className="overflow-auto w-full h-full scrollbar-hide">
        <table className="table-auto w-full border border-gray-400 border-collapse">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-400 p-2 text-left">
                Column Name
              </th>
              <th className="border border-gray-400 p-2 text-left">
                Data Type
              </th>
            </tr>
          </thead>
          <tbody>
            {data.columns.map((col, rowIndex) => (
              <tr
                key={rowIndex}
                draggable
                onDragStart={(e) =>
                  onRowDragStart(e, id, col.column_id, col.column_data_type)
                }
                onDrop={(e) =>
                  onRowDrop(e, id, col.column_id, col.column_data_type)
                }
                onDragOver={(e) => e.preventDefault()}
                className="cursor-pointer hover:bg-gray-100"
              >
                <td className="border border-gray-400 p-2">{col.name}</td>
                <td className="border border-gray-400 p-2">
                  {col.column_data_type}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Table Footer */}
      <div className="bg-gray-200 p-2 border-t flex justify-between items-center">
        <div className="text-sm font-light text-black">
          Scroll for more rows
        </div>
        {/* Node Resizer */}
        <NodeResizeControl
          minWidth={250}
          minHeight={300}
          onResize={(event, { width, height }) =>
            data.onResize(id, width, height)
          }
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
            style={{ position: "absolute", right: 5, bottom: 5 }}
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <polyline points="16 20 20 20 20 16" />
            <line x1="14" y1="14" x2="20" y2="20" />
            <polyline points="8 4 4 4 4 8" />
            <line x1="4" y1="4" x2="10" y2="10" />
          </svg>
        </NodeResizeControl>
      </div>
    </div>
  );
};

export default TableNode;
