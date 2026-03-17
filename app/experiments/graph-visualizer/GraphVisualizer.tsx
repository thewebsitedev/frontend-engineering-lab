'use client';

import { useState } from "react";

type Position = {
  x: number
  y: number
};

export default function GraphVisualizer() {
  const [selected, setSelected] = useState<number | null>(null);
  
  const graph: Record<number, number[]> = {
    1: [2, 4],
    2: [1, 3],
    3: [2, 4],
    4: [1, 3]
  };

  const positions: Record<number, Position> = {
    1: { x: 100, y: 100 },
    2: { x: 300, y: 100 },
    3: { x: 300, y: 300 },
    4: { x: 100, y: 300 }
  };

  return <svg width="400" height="400">
    {/* Draw edges */}
    {Object.entries(graph).map(([node, neighbors]) => {
      return neighbors.map((neighbor) => {
        const from = positions[Number(node)];
        const to = positions[neighbor];

        return (
          <line key={`${node}-${neighbor}`} x1={from.x} y1={from.y} x2={to.x} y2={to.y} stroke="white" />
        )
      })
    }
    )}
    {/* Draw nodes */}
    {Object.keys(graph).map((node) => {
      const pos = positions[Number(node)];
      const isNeighbor = selected && graph[selected].includes(Number(node));

      return (
        <circle
          key={node}
          cx={pos.x}
          cy={pos.y}
          r={20}
          fill={isNeighbor ? "orange" : "blue"}
          onClick={() => setSelected(Number(node))}
          style={{ cursor: "pointer" }}
        />
      )
    })}
  </svg>;
}