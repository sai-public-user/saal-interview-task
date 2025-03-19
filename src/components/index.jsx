import React from "react";
import {
  Handle,
  Position,
  getBezierPath,
  EdgeLabelRenderer,
  BaseEdge,
} from "@xyflow/react";

export const GhostNode = () => {
  return (
    <div style={{ width: 5, height: 5 }}>
      <Handle
        type="target"
        position={Position.Top}
        isConnectable={false}
        style={{ background: "black" }}
      />
    </div>
  );
};

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  return (
    <>
      <BaseEdge id={id} path={edgePath} />
      <EdgeLabelRenderer>
        <div
          style={{
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
          }}
          className="edge-label-renderer__custom-edge nodrag nopan"
        >
          {data.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};
