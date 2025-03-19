import React from "react";

const Sidebar = ({ tables, onDragStart }) => {
  return (
    <div className="w-64 bg-gray-100 p-4">
      <h2 className="font-bold mb-4">Tables</h2>
      {tables.map((table) => (
        <div
          key={table.id}
          draggable
          onDragStart={(event) => onDragStart(event, table)}
          className="p-2 mb-2 bg-white shadow-sm rounded cursor-move"
        >
          {table.name}
        </div>
      ))}
    </div>
  );
};

export default Sidebar;
