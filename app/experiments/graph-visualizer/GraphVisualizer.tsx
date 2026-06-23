'use client'

import { useState } from 'react'
import { C, MONO } from '../../algorithms/theme'

type Position = { x: number; y: number }

const graph: Record<number, number[]> = {
  1: [2, 4],
  2: [1, 3],
  3: [2, 4],
  4: [1, 3],
}

const positions: Record<number, Position> = {
  1: { x: 90, y: 80 },
  2: { x: 290, y: 80 },
  3: { x: 290, y: 240 },
  4: { x: 90, y: 240 },
}

export default function GraphVisualizer() {
  const [selected, setSelected] = useState<number | null>(null)

  const neighbors = selected != null ? graph[selected] : []

  return (
    <div>
      <svg viewBox="0 0 380 320" width="100%" style={{ display: 'block', maxWidth: 460, margin: '0 auto' }}>
        {/* edges */}
        {Object.entries(graph).map(([node, nbrs]) =>
          nbrs.map((nbr) => {
            const a = Number(node)
            if (a > nbr) return null // draw each undirected edge once
            const from = positions[a]
            const to = positions[nbr]
            const active = selected === a || selected === nbr
            return (
              <line
                key={`${a}-${nbr}`}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                stroke={active ? C.signal : C.slate}
                strokeWidth={active ? 3 : 1.5}
              />
            )
          }),
        )}
        {/* nodes */}
        {Object.keys(graph).map((node) => {
          const id = Number(node)
          const pos = positions[id]
          const isSelected = selected === id
          const isNeighbor = neighbors.includes(id)
          const fill = isSelected ? C.signal : isNeighbor ? C.trace : '#FBF9F3'
          const textColor = isSelected || isNeighbor ? C.paper : C.ink
          return (
            <g key={id} onClick={() => setSelected(id)} style={{ cursor: 'pointer' }}>
              <circle cx={pos.x} cy={pos.y} r={26} fill={fill} stroke={C.ink} strokeWidth={2} />
              <text x={pos.x} y={pos.y + 6} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="18" fill={textColor}>
                {id}
              </text>
            </g>
          )
        })}
      </svg>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginTop: 14, fontFamily: MONO, fontSize: 12.5 }}>
        <span style={{ color: C.slate }}>
          {selected == null ? 'Click any node to select it.' : `node ${selected} → neighbours [${neighbors.join(', ')}]`}
        </span>
        <div style={{ flex: 1 }} />
        <button
          onClick={() => setSelected(null)}
          style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, padding: '7px 14px', borderRadius: 6, border: `1.5px solid ${C.ink}`, background: C.paper, color: C.ink, cursor: 'pointer' }}
        >
          reset
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 12, fontFamily: MONO, fontSize: 11, color: C.slate }}>
        <Swatch color={C.signal} label="selected" />
        <Swatch color={C.trace} label="neighbour" />
        <Swatch color="#FBF9F3" label="other" border />
      </div>
    </div>
  )
}

function Swatch({ color, label, border }: { color: string; label: string; border?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: color, border: `1.5px solid ${border ? C.wire : C.ink}` }} />
      {label}
    </span>
  )
}
