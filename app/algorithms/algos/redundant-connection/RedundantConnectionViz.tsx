'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const EDGES = [
  [1, 2],
  [1, 3],
  [3, 4],
  [2, 4],
]
const NODES = [1, 2, 3, 4]

// Source lines. `ln` is the displayed line number we highlight against.
const CODE = [
  { ln: 1, t: 'def find(x):' },
  { ln: 2, t: '    while parent[x] != x:' },
  { ln: 3, t: '        x = parent[x]' },
  { ln: 4, t: '    return x' },
  { ln: 5, t: '' },
  { ln: 6, t: 'for u, v in edges:' },
  { ln: 7, t: '    ru, rv = find(u), find(v)' },
  { ln: 8, t: '    if ru == rv:' },
  { ln: 9, t: '        return [u, v]   # redundant' },
  { ln: 10, t: '    parent[ru] = rv      # union' },
]

type FindState = { which: string; x: number; path: number[] }
type Frame = {
  kind: string
  line: number
  edge: number[] | null
  edgeIndex?: number
  accepted: number[][]
  vars: Record<string, string | number>
  find: FindState | null
  parent: Record<number, number>
  title: string
  note: string
  roots?: number[]
  cycle?: number[]
  returns?: number
  findEnds?: { u: number; v: number }
}

type SubFrame = {
  line: number
  vars: Record<string, string | number>
  find: FindState
  note: string
  returns?: number
}

// Build a fine-grained list of frames. Each frame knows the active line and a
// snapshot of all live variables at that instant.
function buildFrames(): { frames: Frame[]; answer: number[] | null } {
  const parent: Record<number, number> = {}
  NODES.forEach((n) => (parent[n] = n))
  const frames: Frame[] = []
  const push = (fr: Omit<Frame, 'parent'>) => frames.push({ ...fr, parent: { ...parent } })

  // trace find as multiple frames so the while-loop is visible
  const findTrace = (label: string, x0: number) => {
    const sub: SubFrame[] = []
    let x = x0
    const path = [x]
    // entering find
    sub.push({
      line: 1,
      vars: { [label]: `find(${x0})`, x },
      find: { which: label, x, path: [...path] },
      note: `Call find(${x0}). Start x = ${x0}.`,
    })
    while (parent[x] !== x) {
      sub.push({
        line: 2,
        vars: { x },
        find: { which: label, x, path: [...path] },
        note: `parent[${x}] = ${parent[x]} ≠ ${x} → loop body runs.`,
      })
      x = parent[x]
      path.push(x)
      sub.push({
        line: 3,
        vars: { x },
        find: { which: label, x, path: [...path] },
        note: `Climb: x = parent → ${x}.`,
      })
    }
    sub.push({
      line: 2,
      vars: { x },
      find: { which: label, x, path: [...path] },
      note: `parent[${x}] = ${x} → x is a root. Exit loop.`,
    })
    sub.push({
      line: 4,
      vars: { x },
      find: { which: label, x, path: [...path] },
      note: `return ${x}.`,
      returns: x,
    })
    return { sub, root: x, path }
  }

  push({
    kind: 'start',
    line: 6,
    edge: null,
    accepted: [],
    vars: {},
    find: null,
    title: 'Start',
    note: 'parent[x] = x for all nodes. Loop over edges left to right.',
  })

  const accepted: number[][] = []
  let answer: number[] | null = null

  for (let i = 0; i < EDGES.length; i++) {
    const [u, v] = EDGES[i]
    push({
      kind: 'edge',
      line: 6,
      edge: [u, v],
      edgeIndex: i,
      accepted: [...accepted],
      vars: { u, v },
      find: null,
      title: `Take edge [${u}, ${v}]`,
      note: `u = ${u}, v = ${v}. Now compute both roots.`,
    })

    // find(u)
    const fu = findTrace('ru', u)
    fu.sub.forEach((s) =>
      push({
        kind: 'find',
        line: s.line,
        edge: [u, v],
        edgeIndex: i,
        accepted: [...accepted],
        vars: { u, v, ...s.vars },
        find: s.find,
        findEnds: { u, v },
        title: `find(${u})`,
        note: s.note,
      }),
    )

    // find(v)
    const fv = findTrace('rv', v)
    fv.sub.forEach((s) =>
      push({
        kind: 'find',
        line: s.line,
        edge: [u, v],
        edgeIndex: i,
        accepted: [...accepted],
        vars: { u, v, ru: fu.root, ...s.vars },
        find: s.find,
        findEnds: { u, v },
        title: `find(${v})`,
        note: s.note,
      }),
    )

    // line 7 resolved
    push({
      kind: 'roots',
      line: 7,
      edge: [u, v],
      edgeIndex: i,
      accepted: [...accepted],
      vars: { u, v, ru: fu.root, rv: fv.root },
      find: null,
      roots: [fu.root, fv.root],
      title: 'Roots resolved',
      note: `ru = ${fu.root}, rv = ${fv.root}.`,
    })

    // line 8 compare
    const equal = fu.root === fv.root
    push({
      kind: 'compare',
      line: 8,
      edge: [u, v],
      edgeIndex: i,
      accepted: [...accepted],
      vars: { u, v, ru: fu.root, rv: fv.root },
      find: null,
      roots: [fu.root, fv.root],
      title: `Compare ru == rv`,
      note: `${fu.root} == ${fv.root} → ${equal ? 'True' : 'False'}.`,
    })

    if (equal) {
      answer = [u, v]
      push({
        kind: 'redundant',
        line: 9,
        edge: [u, v],
        edgeIndex: i,
        accepted: [...accepted],
        vars: { u, v, ru: fu.root, rv: fv.root },
        find: null,
        roots: [fu.root, fv.root],
        cycle: [u, v],
        title: `Redundant: return [${u}, ${v}]`,
        note: `Same root → ${u} and ${v} already connected. This edge closes a cycle. Return it.`,
      })
      break
    } else {
      parent[fu.root] = fv.root
      accepted.push([u, v])
      push({
        kind: 'union',
        line: 10,
        edge: [u, v],
        edgeIndex: i,
        accepted: [...accepted],
        vars: { u, v, ru: fu.root, rv: fv.root },
        find: null,
        roots: [fv.root],
        title: `Union: parent[${fu.root}] = ${fv.root}`,
        note: `Different roots → no cycle. Link the trees and accept the edge.`,
      })
    }
  }

  return { frames, answer }
}

export default function RedundantConnectionViz() {
  const { frames, answer } = useMemo(() => buildFrames(), [])
  const [i, setI] = useState(0)
  const f = frames[i]
  const atEnd = i === frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const POS: Record<number, { x: number; y: number }> = {
    1: { x: 110, y: 70 },
    2: { x: 310, y: 70 },
    3: { x: 110, y: 250 },
    4: { x: 310, y: 250 },
  }
  const onPath = (n: number) => f.find?.path?.includes(n)
  const cursorNode = f.find?.x

  const drawnEdges = useMemo(() => {
    const list: { u: number; v: number; state: string }[] = []
    f.accepted.forEach(([u, v]) => list.push({ u, v, state: 'tree' }))
    if (f.edge) {
      const [u, v] = f.edge
      const already = f.accepted.some(([a, b]) => a === u && b === v)
      if (!already) list.push({ u, v, state: f.kind === 'redundant' ? 'redundant' : 'testing' })
    }
    return list
  }, [f])

  // variable chips in a stable order
  const varOrder = ['u', 'v', 'x', 'ru', 'rv']
  const varColor: Record<string, string> = {
    u: C.ink,
    v: C.ink,
    x: C.trace,
    ru: C.go,
    rv: C.go,
  }

  return (
    <div>
      <style>{`.rc-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .rc-btn:active{transform:translateY(1px)} .rc-btn:disabled{opacity:.35;cursor:not-allowed}
        .rc-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Edge queue */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 14,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>edges:</span>
        {EDGES.map((e, idx) => {
          const accepted = f.accepted.some(([a, b]) => a === e[0] && b === e[1])
          const isRedundant = f.kind === 'redundant' && f.edgeIndex === idx
          const current = f.edgeIndex === idx && !accepted && !isRedundant
          let bg: string = C.paper
          let fg: string = C.ink
          let bd: string = C.wire
          if (accepted) {
            bg = C.go
            fg = C.paper
            bd = C.go
          }
          if (isRedundant) {
            bg = C.signal
            fg = C.paper
            bd = C.signal
          } else if (current) {
            bg = C.ink
            fg = C.paper
            bd = C.ink
          }
          return (
            <div
              key={idx}
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 14,
                padding: '6px 10px',
                border: `2px solid ${bd}`,
                background: bg,
                color: fg,
                borderRadius: 4,
              }}
            >
              [{e[0]},{e[1]}]
            </div>
          )
        })}
      </div>

      {/* Main grid: code | (graph + state) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)',
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
                    width: 34,
                    textAlign: 'right',
                    paddingRight: 12,
                    color: C.codedim,
                    fontFamily: MONO,
                    fontSize: 13,
                    userSelect: 'none',
                    lineHeight: '1.9',
                  }}
                >
                  {row.ln}
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 13.5,
                    lineHeight: '1.9',
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
                      paddingRight: 12,
                      color: C.signal,
                      fontFamily: MONO,
                      fontSize: 13,
                      lineHeight: '1.9',
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
            {varOrder
              .filter((k) => f.vars[k] !== undefined)
              .map((k) => (
                <span
                  key={k}
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    background: '#000',
                    color: C.codeink,
                    padding: '4px 9px',
                    borderRadius: 4,
                    border: `1px solid ${varColor[k]}`,
                  }}
                >
                  <span style={{ color: varColor[k] === C.ink ? C.codedim : varColor[k] }}>{k}</span>
                  <span style={{ color: C.codedim }}> = </span>
                  <b>{String(f.vars[k])}</b>
                </span>
              ))}
            {varOrder.filter((k) => f.vars[k] !== undefined).length === 0 && (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.codedim }}>no locals yet</span>
            )}
          </div>
        </div>

        {/* RIGHT: graph + parent + narration */}
        <div>
          <div
            style={{
              border: `1.5px solid ${C.wire}`,
              background: '#FBF9F3',
              borderRadius: 4,
              marginBottom: 14,
            }}
          >
            <svg viewBox="0 0 420 320" width="100%" style={{ display: 'block' }}>
              {drawnEdges.map(({ u, v, state }) => {
                const stroke =
                  state === 'redundant' ? C.signal : state === 'testing' ? C.ink : C.go
                const dash = state === 'testing' ? '6 5' : '2 0'
                const w = state === 'tree' ? 3 : state === 'redundant' ? 4 : 2.5
                return (
                  <line
                    key={`${u}-${v}`}
                    x1={POS[u].x}
                    y1={POS[u].y}
                    x2={POS[v].x}
                    y2={POS[v].y}
                    stroke={stroke}
                    strokeWidth={w}
                    strokeDasharray={dash}
                    strokeLinecap="round"
                  />
                )
              })}
              {NODES.map((n) => {
                const isRootFocus = f.roots?.includes(n)
                const path = onPath(n)
                const isCursor = cursorNode === n
                let fill = '#FBF9F3'
                let txt: string = C.ink
                let ring: string | null = null
                if (f.kind === 'redundant' && f.edge?.includes(n)) {
                  fill = C.signal
                  txt = C.paper
                } else if (isCursor) {
                  fill = C.trace
                  txt = C.paper
                } else if (path) {
                  fill = '#8FB0C4'
                  txt = C.ink
                } else if (f.kind === 'union' && f.edge?.includes(n)) {
                  fill = C.go
                  txt = C.paper
                }
                if (isRootFocus && !path) ring = f.kind === 'redundant' ? C.signal : C.ink
                return (
                  <g key={n}>
                    {ring && (
                      <circle
                        cx={POS[n].x}
                        cy={POS[n].y}
                        r={29}
                        fill="none"
                        stroke={ring}
                        strokeWidth={1.5}
                        strokeDasharray="3 3"
                        opacity={0.6}
                      />
                    )}
                    {isCursor && (
                      <circle
                        cx={POS[n].x}
                        cy={POS[n].y}
                        r={30}
                        fill="none"
                        stroke={C.trace}
                        strokeWidth={2}
                      />
                    )}
                    <circle
                      cx={POS[n].x}
                      cy={POS[n].y}
                      r={24}
                      fill={fill}
                      stroke={C.ink}
                      strokeWidth={1.5}
                    />
                    <text
                      x={POS[n].x}
                      y={POS[n].y + 6}
                      textAnchor="middle"
                      fontFamily={MONO}
                      fontWeight="700"
                      fontSize="18"
                      fill={txt}
                    >
                      {n}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: C.slate,
              marginBottom: 6,
            }}
          >
            parent
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
            {NODES.map((n) => {
              const changed = i > 0 && frames[i - 1].parent[n] !== f.parent[n]
              return (
                <div
                  key={n}
                  style={{
                    flex: 1,
                    textAlign: 'center',
                    fontFamily: MONO,
                    border: `1.5px solid ${changed ? C.signal : C.wire}`,
                    borderRadius: 4,
                    overflow: 'hidden',
                  }}
                >
                  <div style={{ fontSize: 10, color: C.slate, background: '#FBF9F3', padding: '2px 0' }}>
                    {n}
                  </div>
                  <div
                    style={{
                      fontSize: 18,
                      fontWeight: 700,
                      padding: '5px 0',
                      color: changed ? C.signal : C.ink,
                    }}
                  >
                    {f.parent[n]}
                  </div>
                </div>
              )
            })}
          </div>

          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'redundant'
                  ? C.signal
                  : f.kind === 'union'
                    ? C.go
                    : f.kind === 'find'
                      ? C.trace
                      : C.ink
              }`,
              paddingLeft: 12,
              minHeight: 70,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>
              STEP {i} / {frames.length - 1} · line {f.line}
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>
              {f.title}
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{f.note}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
        <button className="rc-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="rc-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="rc-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && answer && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.signal }}>
            return [{answer[0]}, {answer[1]}]
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="rc-btn"
            onClick={() => setI(idx)}
            aria-label={`step ${idx}`}
            style={{
              height: 6,
              flex: 1,
              border: 'none',
              borderRadius: 3,
              padding: 0,
              background:
                idx <= i
                  ? fr.kind === 'redundant'
                    ? C.signal
                    : fr.kind === 'union'
                      ? C.go
                      : fr.kind === 'find'
                        ? C.trace
                        : C.ink
                  : C.wire,
            }}
          />
        ))}
      </div>
    </div>
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
