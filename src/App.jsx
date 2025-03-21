import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Background,
  Controls,
  applyNodeChanges,
  ReactFlow,
} from "@xyflow/react";
import Xarrow, { useXarrow, Xwrapper } from "react-xarrows";
import { tables } from "./utils/data";
import Sidebar from "./components/Sidebar";
import TableNode from "./components/TableNode";

const nodeTypes = { tableNode: TableNode };

const NODE_WIDTH = 250;
const NODE_HEIGHT = 300;
const PADDING_X = 30;
const PADDING_Y = 30;
const START_X = 0;
const START_Y = 100;

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

const adjustPositionToAvoidOverlap = (node, nodes) => {
  let { x, y } = node.position;
  while (isOverlapping({ ...node, position: { x, y } }, nodes)) {
    x += PADDING_X;
    y += PADDING_Y;
  }
  return { x, y };
};

// const adjustSizeToAvoidOverlap = (node, nodes) => {
//   let width = node.width;
//   let height = node.height;
//   while (
//     isOverlapping(
//       { ...node, width, height },
//       nodes.filter((n) => n.id !== node.id)
//     )
//   ) {
//     width -= 10;
//     height -= 10;
//     return { width, height };
//   }
//   return { width, height };
// };

const App = () => {
  const [nodes, setNodes] = useState([]);
  const updateXarrow = useXarrow();
  const [xarrowConnections, setXarrowConnections] = useState([]);
  const draggedRowRef = useRef(null);
  const lastValidPositions = useRef({});
  const [viewportWidth, setViewportWidth] = useState(window.innerWidth);

  useEffect(() => {
    const handleResize = () => setViewportWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // const handleResizeEnd = (id, width, height) => {
  //   setNodes((nds) =>
  //     nds.map((node) => {
  //       if (node.id === id) {
  //         const newSize = { ...node, width, height };
  //         return !isOverlapping(
  //           newSize,
  //           nds.filter((item) => item.id !== id)
  //         )
  //           ? newSize
  //           : node;
  //         // adjustSizeToAvoidOverlap(
  //         //   { ...node, width, height },
  //         //   nds
  //         // );
  //         // return { ...node, width: newSize.width, height: newSize.height };
  //       }
  //       return node;
  //     })
  //   );
  // };

  const handleResizeEnd = (id, width, height) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          let newNode = { ...node, width, height };
          let adjustedPosition = adjustPositionToAvoidOverlap(newNode, nds);
          return { ...newNode, position: adjustedPosition };
        }
        return node;
      })
    );
  };

  const handleClose = (id) => {
    setNodes((nds) => nds.filter((node) => node.id !== id));
    setXarrowConnections((edges) =>
      edges.filter((edge) => edge.start !== id && edge.end !== id)
    );
  };

  const handleDrop = (event) => {
    event.preventDefault();
    const data = event?.dataTransfer?.getData("application/reactflow");
    if (!data) return;
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

    const source = `row-${draggedRowRef.current.tableId}-${draggedRowRef.current.rowId}`;
    const target = `row-${targetTableId}-${targetRowId}`;

    setXarrowConnections((prev) => [...prev, { start: source, end: target }]);
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
        <Xwrapper>
          <ReactFlow
            nodes={nodes}
            nodeTypes={nodeTypes}
            onNodesChange={(changes) =>
              setNodes((nds) => applyNodeChanges(changes, nds))
            }
            onNodeDragStop={handleNodeDragStop}
            style={{ backgroundColor: "#F7F9FB" }}
            maxZoom={1}
            minZoom={1}
            preventScrolling={true}
            onMoveEnd={updateXarrow}
            // colorMode="dark"
          >
            <Background />
            <Controls showZoom={false} />
            {xarrowConnections.map((conn, index) => (
              <Xarrow
                key={index}
                start={conn.start}
                end={conn.end}
                color="deepskyblue"
                strokeWidth={2}
                showHead={true}
                curveness={0.3}
                monitorDOMchanges={true}
                keepDrawing={true}
              />
            ))}
          </ReactFlow>
        </Xwrapper>
      </div>
    </div>
  );
};

export default App;
