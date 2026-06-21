'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

// Adjacency-list presets in LeetCode 133 format: adjList[i] = neighbours of node (i+1).
const PRESETS: { name: string; adj: string }[] = [
  { name: 'triangle', adj: '[[2,3],[1,3],[1,2]]' },
  { name: 'square', adj: '[[2,4],[1,3],[2,4],[1,3]]' },
  { name: 'pair', adj: '[[2],[1]]' },
  { name: 'single', adj: '[[]]' },
]

function parseAdj(text: string): number[][] {
  const groups = text.match(/\[([^[\]]*)\]/g) || []
  let adj = groups.map((g) => {
    const m = g.match(/\d+/g)
    return m ? m.map(Number) : []
  })
  if (adj.length > 6) adj = adj.slice(0, 6)
  const n = adj.length
  return adj.map((list) => list.filter((x) => x >= 1 && x <= n))
}

const mapStr = (labels: number[]): string =>
  labels.length === 0 ? '{}' : '{' + labels.map((l) => `${l}:${l}'`).join(', ') + '}'

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function cloneGraph(node) {' },
  { ln: 2, t: '  if (!node) return null;' },
  { ln: 3, t: '  const clones = new Map();' },
  { ln: 4, t: '  clones.set(node, new Node(node.val));' },
  { ln: 5, t: '  const queue = [node];' },
  { ln: 6, t: '  while (queue.length) {' },
  { ln: 7, t: '    const curr = queue.shift();' },
  { ln: 8, t: '    for (const nei of curr.neighbors) {' },
  { ln: 9, t: '      if (!clones.has(nei)) {' },
  { ln: 10, t: '        clones.set(nei, new Node(nei.val));' },
  { ln: 11, t: '        queue.push(nei);' },
  { ln: 12, t: '      }' },
  { ln: 13, t: '      clones.get(curr).neighbors.push(clones.get(nei));' },
  { ln: 14, t: '    }' },
  { ln: 15, t: '  }' },
  { ln: 16, t: '  return clones.get(node);' },
  { ln: 17, t: '}' },
]

type Frame = {
  kind: string
  line: number
  cloned: number[]
  cloneEdges: [number, number][]
  queue: number[]
  curr: number | null
  nei: number | null
  done: boolean
  vars: [string, string][]
  title: string
  note: string
}

// Trace every executed line so the walkthrough mirrors the code step by step.
function buildFrames(adj: number[][]): Frame[] {
  const n = adj.length
  const neighbors = (label: number) => (adj[label - 1] || []).filter((x) => x >= 1 && x <= n)

  const frames: Frame[] = []
  const cloned: number[] = []
  const cloneEdges: [number, number][] = []
  const queue: number[] = []
  let curr: number | null = null
  let nei: number | null = null
  let done = false

  const push = (
    kind: string,
    line: number,
    title: string,
    note: string,
    vars: [string, string][] = [],
  ) =>
    frames.push({
      kind,
      line,
      title,
      note,
      vars,
      cloned: [...cloned],
      cloneEdges: cloneEdges.map((e) => [e[0], e[1]] as [number, number]),
      queue: [...queue],
      curr,
      nei,
      done,
    })

  if (n === 0) {
    push('done', 2, 'Empty graph', 'node is null, so there is nothing to clone. Return null.', [['node', 'null']])
    return frames
  }

  push('init', 2, 'Start node exists', 'node is not null, so we have a real graph to copy.', [['node', '1']])
  push(
    'init',
    3,
    'Create the map',
    'clones maps each ORIGINAL node to its NEW copy. It is how we avoid cloning the same node twice and how we reconnect edges.',
    [['clones', '{}']],
  )

  cloned.push(1)
  push(
    'clone',
    4,
    'Clone the start node',
    "Make a copy of node 1 and record it: clones[1] = 1'. (1' means “the copy of 1”.)",
    [['clones', mapStr(cloned)]],
  )

  queue.push(1)
  push('queue', 5, 'Seed the queue', 'Put the start node into the queue so we explore its neighbours next.', [['queue', `[${queue.join(', ')}]`]])

  while (true) {
    curr = null
    nei = null
    if (queue.length === 0) {
      push('loop', 6, 'Queue is empty', 'Every reachable node has been copied and wired up. Stop the loop.', [['queue', '[]']])
      break
    }
    push('loop', 6, 'Queue has nodes', `queue = [${queue.join(', ')}] — there is still a node to process.`, [['queue', `[${queue.join(', ')}]`]])

    curr = queue.shift()!
    push(
      'curr',
      7,
      `Take node ${curr}`,
      `Pop the front of the queue: curr = ${curr}. Now copy each of its edges.`,
      [['curr', String(curr)], ['queue', `[${queue.join(', ')}]`]],
    )

    for (const nb of neighbors(curr)) {
      nei = nb
      push(
        'nei',
        8,
        `Edge ${curr} — ${nb}`,
        `Look at neighbour ${nb} of node ${curr} in the original graph.`,
        [['curr', String(curr)], ['nei', String(nb)]],
      )

      const seen = cloned.includes(nb)
      push(
        'check',
        9,
        seen ? `${nb} already cloned` : `${nb} is new`,
        seen
          ? `clones already has ${nb}, so ${nb}' exists. Skip making a duplicate — just reuse it.`
          : `clones does not have ${nb} yet, so we must create its copy.`,
        [['clones', mapStr(cloned)]],
      )

      if (!seen) {
        cloned.push(nb)
        push(
          'clone',
          10,
          `Clone node ${nb}`,
          `First time we meet ${nb}: create copy ${nb}' and store clones[${nb}] = ${nb}'.`,
          [['clones', mapStr(cloned)]],
        )
        queue.push(nb)
        push('queue', 11, `Queue node ${nb}`, `Add ${nb} to the queue so we copy ITS neighbours later.`, [['queue', `[${queue.join(', ')}]`]])
      }

      cloneEdges.push([curr, nb])
      push(
        'connect',
        13,
        `Wire ${curr}' — ${nb}'`,
        `Add the edge inside the copy: clones[${curr}].neighbors gets clones[${nb}]. The clone now mirrors this edge.`,
        [['curr', String(curr)], ['nei', String(nb)]],
      )
    }
    nei = null
  }

  curr = null
  nei = null
  done = true
  push(
    'done',
    16,
    'Return the copy',
    "Every node and edge has been duplicated. Return clones[1] = 1' — the entry point of the brand-new cloned graph.",
    [['clones', mapStr(cloned)]],
  )
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'curr'
    ? C.signal
    : kind === 'nei'
      ? C.trace
      : kind === 'clone'
        ? C.go
        : kind === 'connect'
          ? C.go
          : kind === 'check'
            ? C.trace
            : kind === 'queue'
              ? C.trace
              : kind === 'done'
                ? C.go
                : C.ink

const uniqEdges = (pairs: [number, number][]): [number, number][] => {
  const seen = new Set<string>()
  const out: [number, number][] = []
  for (const [a, b] of pairs) {
    const k = a < b ? `${a}-${b}` : `${b}-${a}`
    if (!seen.has(k)) {
      seen.add(k)
      out.push([a, b])
    }
  }
  return out
}

const sameEdge = (e: [number, number], a: number, b: number) =>
  (e[0] === a && e[1] === b) || (e[0] === b && e[1] === a)

export default function CloneGraphViz() {
  const [adjText, setAdjText] = useState(PRESETS[0].adj)

  const adj = useMemo(() => parseAdj(adjText), [adjText])
  const n = adj.length
  const frames = useMemo(() => buildFrames(adj), [adj])
  const [i, setI] = useState(0)

  const changeAdj = useCallback((v: string) => {
    setAdjText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 90))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { adj: string }) => {
    setAdjText(p.adj)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // shared circular layout (clone mirrors original positions)
  const W = 250
  const H = 210
  const cx = W / 2
  const cy = H / 2
  const R = n <= 1 ? 0 : 78
  const r = 18
  const pos = (label: number) => {
    if (n === 1) return { x: cx, y: cy }
    const ang = -Math.PI / 2 + ((label - 1) * 2 * Math.PI) / n
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }
  }

  const originalEdges = useMemo(() => {
    const pairs: [number, number][] = []
    for (let label = 1; label <= n; label++) for (const nb of adj[label - 1] || []) pairs.push([label, nb])
    return uniqEdges(pairs)
  }, [adj, n])

  const nodeFill = (label: number): string => {
    if (f.curr === label) return C.signal
    if (f.nei === label) return C.trace
    if (f.cloned.includes(label)) return C.go
    return '#FBF9F3'
  }
  const nodeTextColor = (label: number): string =>
    f.curr === label || f.nei === label || f.cloned.includes(label) ? C.paper : C.ink

  const hot: [number, number] | null = f.curr != null && f.nei != null ? [f.curr, f.nei] : null

  const renderGraph = (nodesToShow: number[], edges: [number, number][], primed: boolean) => (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
      {uniqEdges(edges).map(([a, b], ei) => {
        if (a === b) return null
        const pa = pos(a)
        const pb = pos(b)
        const isHot = hot ? sameEdge([a, b], hot[0], hot[1]) : false
        return (
          <line
            key={`${a}-${b}-${ei}`}
            x1={pa.x}
            y1={pa.y}
            x2={pb.x}
            y2={pb.y}
            stroke={isHot ? C.signal : C.slate}
            strokeWidth={isHot ? 3 : 1.5}
          />
        )
      })}
      {nodesToShow.map((label) => {
        const p = pos(label)
        return (
          <g key={label}>
            <circle cx={p.x} cy={p.y} r={r} fill={nodeFill(label)} stroke={C.ink} strokeWidth={1.5} />
            <text
              x={p.x}
              y={p.y + 5}
              textAnchor="middle"
              fontFamily={MONO}
              fontWeight="700"
              fontSize="14"
              fill={nodeTextColor(label)}
            >
              {primed ? `${label}'` : label}
            </text>
          </g>
        )
      })}
    </svg>
  )

  return (
    <div>
      <style>{`.cg-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .cg-btn:active{transform:translateY(1px)} .cg-btn:disabled{opacity:.35;cursor:not-allowed}
        .cg-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>adjList =</label>
          <input
            value={adjText}
            spellCheck={false}
            placeholder="[[2,3],[1,3],[1,2]]"
            onChange={(e) => changeAdj(e.target.value)}
            style={{ ...inputStyle, minWidth: 220, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = adjText.replace(/\s/g, '') === p.adj.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="cg-btn"
                onClick={() => applyPreset(p)}
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '4px 9px',
                  borderRadius: 4,
                  border: `1.5px solid ${active ? C.signal : C.wire}`,
                  background: active ? C.signal : C.paper,
                  color: active ? C.paper : C.ink,
                }}
              >
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          adjList[i] lists the neighbours of node i+1 (undirected). n is read from the list length.
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* CODE PANEL */}
        <div
          style={{
            background: C.codebg,
            borderRadius: 6,
            padding: '16px 6px 16px 0',
            overflowX: 'auto',
          }}
        >
          {CODE.map((row) => {
            const active = row.ln === f.line && row.t.trim() !== ''
            return (
              <div
                key={row.ln}
                style={{
                  display: 'flex',
                  background: active ? C.codehl : 'transparent',
                  borderLeft: `3px solid ${active ? C.signal : 'transparent'}`,
                }}
              >
                <span
                  style={{
                    width: 28,
                    textAlign: 'right',
                    paddingRight: 9,
                    color: C.codedim,
                    fontFamily: MONO,
                    fontSize: 11.5,
                    userSelect: 'none',
                    lineHeight: '1.8',
                  }}
                >
                  {row.ln}
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 10.5,
                    lineHeight: '1.8',
                    color: C.codeink,
                    whiteSpace: 'pre',
                  }}
                >
                  {row.t || ' '}
                </pre>
                {active && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      paddingRight: 8,
                      color: C.signal,
                      fontFamily: MONO,
                      fontSize: 11.5,
                      lineHeight: '1.8',
                    }}
                  >
                    ◄
                  </span>
                )}
              </div>
            )
          })}

          {/* live variables */}
          <div
            style={{
              borderTop: `1px solid ${C.codehl}`,
              marginTop: 12,
              paddingTop: 12,
              paddingLeft: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {f.vars.map(([key, val]) => (
              <span
                key={key}
                style={{
                  fontFamily: MONO,
                  fontSize: 12.5,
                  background: '#000',
                  color: C.codeink,
                  padding: '4px 9px',
                  borderRadius: 4,
                  border: `1px solid ${C.trace}`,
                }}
              >
                <span style={{ color: C.trace }}>{key}</span>
                <span style={{ color: C.codedim }}> = </span>
                <b>{val}</b>
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: two graphs */}
        <div>
          {[
            { title: 'original (input)', nodes: Array.from({ length: n }, (_, k) => k + 1), edges: originalEdges, primed: false },
            { title: 'clone (being built)', nodes: f.cloned, edges: f.cloneEdges, primed: true },
          ].map((g) => (
            <div key={g.title} style={{ marginBottom: 12 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: C.slate,
                  marginBottom: 4,
                }}
              >
                {g.title}
              </div>
              <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 6 }}>
                {renderGraph(g.nodes, g.edges, g.primed)}
              </div>
            </div>
          ))}

          {/* legend */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              fontFamily: MONO,
              fontSize: 11,
              color: C.slate,
            }}
          >
            <Swatch color={C.signal} label="curr (popped)" />
            <Swatch color={C.trace} label="neighbour" />
            <Swatch color={C.go} label="cloned" />
          </div>
        </div>
      </div>

      {/* queue */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
          color: C.slate,
          margin: '16px 0 6px',
        }}
      >
        queue (nodes still to process)
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 36, alignItems: 'center' }}>
        {f.queue.length === 0 ? (
          <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
        ) : (
          f.queue.map((id, qi) => (
            <span
              key={`${id}-${qi}`}
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 14,
                padding: '6px 11px',
                borderRadius: 4,
                border: `1.5px solid ${qi === 0 ? C.trace : C.wire}`,
                background: qi === 0 ? C.trace : C.paper,
                color: qi === 0 ? C.paper : C.ink,
              }}
            >
              {id}
            </span>
          ))
        )}
      </div>

      {/* narration */}
      <div
        style={{
          borderLeft: `3px solid ${kindColor(f.kind)}`,
          paddingLeft: 12,
          minHeight: 78,
          marginTop: 16,
        }}
      >
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>
          STEP {Math.min(i, frames.length - 1)} / {frames.length - 1} · line {f.line}
        </div>
        <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
        <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
        <button className="cg-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button className="cg-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="cg-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && f.done && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.go }}>
            return clone of node 1
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 3, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="cg-btn"
            onClick={() => setI(idx)}
            aria-label={`step ${idx}`}
            style={{
              height: 6,
              flex: 1,
              border: 'none',
              borderRadius: 3,
              padding: 0,
              background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire,
            }}
          />
        ))}
      </div>
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  fontFamily: MONO,
  fontSize: 14,
  fontWeight: 700,
  padding: '8px 11px',
  border: `1.5px solid ${C.ink}`,
  borderRadius: 6,
  background: '#FBF9F3',
  color: C.ink,
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 14, height: 14, borderRadius: 7, background: color, border: `1.5px solid ${C.ink}` }} />
      {label}
    </span>
  )
}

function btn(bg: string, fg: string, border?: boolean): React.CSSProperties {
  return {
    fontFamily: MONO,
    fontWeight: 700,
    fontSize: 14,
    padding: '11px 18px',
    background: bg,
    color: fg,
    border: border ? `1.5px solid ${C.ink}` : 'none',
    borderRadius: 4,
  }
}
