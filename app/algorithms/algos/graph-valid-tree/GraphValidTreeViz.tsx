'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; n: string; edges: string }[] = [
  { name: 'valid', n: '5', edges: '[[0,1],[0,2],[0,3],[1,4]]' },
  { name: 'has cycle', n: '5', edges: '[[0,1],[1,2],[2,3],[1,3],[1,4]]' },
  { name: 'disconnected', n: '4', edges: '[[0,1],[2,3]]' },
  { name: 'path', n: '4', edges: '[[0,1],[1,2],[2,3]]' },
]

const COMP = ['#3B6E8C', '#4E7A51', '#8A6E3B', '#6E3B8C', '#3B8C86', '#8C5A3B', '#5A3B8C', '#3B5A8C']

function parsePairs(text: string, n: number): [number, number][] {
  const out: [number, number][] = []
  const re = /\[\s*(\d+)\s*,\s*(\d+)\s*\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const a = Number(m[1])
    const b = Number(m[2])
    if (a >= 0 && a < n && b >= 0 && b < n && a !== b) out.push([a, b])
    if (out.length >= 12) break
  }
  return out
}

const CODE = [
  { ln: 1, t: 'function validTree(n, edges) {' },
  { ln: 2, t: '  if (edges.length !== n - 1) return false;' },
  { ln: 3, t: '  const parent = [...Array(n).keys()];' },
  { ln: 4, t: '  const find = (x) => {' },
  { ln: 5, t: '    while (parent[x] !== x) x = parent[x];' },
  { ln: 6, t: '    return x;' },
  { ln: 7, t: '  };' },
  { ln: 8, t: '  for (const [u, v] of edges) {' },
  { ln: 9, t: '    const ru = find(u), rv = find(v);' },
  { ln: 10, t: '    if (ru === rv) return false;   // cycle' },
  { ln: 11, t: '    parent[ru] = rv;               // union' },
  { ln: 12, t: '  }' },
  { ln: 13, t: '  return true;' },
  { ln: 14, t: '}' },
]

type Frame = {
  kind: string
  line: number
  parent: number[]
  edgeIndex: number
  checking: [number, number] | null
  treeEdges: number[]
  ru: number | null
  rv: number | null
  cycle: boolean
  result: boolean | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(n: number, edges: [number, number][]): Frame[] {
  const frames: Frame[] = []
  const parent = Array.from({ length: n }, (_, i) => i)
  const treeEdges: number[] = []
  let ru: number | null = null
  let rv: number | null = null
  let cycle = false

  const push = (kind: string, line: number, edgeIndex: number, checking: [number, number] | null, result: boolean | null, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, parent: [...parent], edgeIndex, checking, treeEdges: [...treeEdges], ru, rv, cycle, result, title, note, vars })

  push('count', 2, -1, null, null, `Edge count: ${edges.length} vs n−1 = ${n - 1}`, edges.length !== n - 1 ? `A tree on ${n} nodes has exactly ${n - 1} edges, but this graph has ${edges.length}. ${edges.length < n - 1 ? 'Too few → it can’t be connected.' : 'Too many → it must contain a cycle.'} Return false.` : `Exactly ${n - 1} edges — the right amount for a tree. Now check there are no cycles.`, [['edges', String(edges.length)], ['n-1', String(n - 1)]])

  if (edges.length !== n - 1) {
    push('done', 2, -1, null, false, 'Not a valid tree ✗', 'Wrong number of edges. Return false.', [['result', 'false']])
    return frames
  }

  push('init', 3, -1, null, null, 'Each node is its own group', 'Union–Find starts with every node in its own component. Joining two nodes that are already in the same component means a cycle.', [['parent', `[${parent.join(', ')}]`]])

  const find = (x: number) => {
    while (parent[x] !== x) x = parent[x]
    return x
  }

  for (let e = 0; e < edges.length; e++) {
    const [u, v] = edges[e]
    ru = null
    rv = null
    push('edge', 8, e, [u, v], null, `Edge ${u} — ${v}`, `Try to connect ${u} and ${v}.`, [['u', String(u)], ['v', String(v)]])

    ru = find(u)
    rv = find(v)
    push('find', 9, e, [u, v], null, `roots: ${u}→${ru}, ${v}→${rv}`, `Find the group leader of each: ${u} belongs to group ${ru}, ${v} to group ${rv}.`, [['ru', String(ru)], ['rv', String(rv)]])

    if (ru === rv) {
      cycle = true
      push('cycle', 10, e, [u, v], false, `Cycle! ${u} and ${v} already connected`, `${u} and ${v} are already in the same group, so this edge closes a loop. A tree has no cycles → return false.`, [['ru', String(ru)], ['rv', String(rv)]])
      push('done', 10, e, [u, v], false, 'Not a valid tree ✗', 'A cycle was found. Return false.', [['result', 'false']])
      return frames
    }

    parent[ru] = rv
    treeEdges.push(e)
    push('union', 11, e, [u, v], null, `Union groups ${ru} and ${rv}`, `Different groups — safe to connect. Merge them (parent[${ru}] = ${rv}).`, [['parent', `[${parent.join(', ')}]`]])
    ru = null
    rv = null
  }

  push('done', 13, -1, null, true, 'Valid tree ✓', `All ${n - 1} edges joined separate groups without a cycle, so the graph is fully connected and acyclic — a tree. Return true.`, [['result', 'true']])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'cycle'
    ? C.signal
    : kind === 'union' || kind === 'done'
      ? C.go
      : kind === 'edge' || kind === 'find'
        ? C.trace
        : C.ink

export default function GraphValidTreeViz() {
  const [nText, setNText] = useState(PRESETS[0].n)
  const [edgesText, setEdgesText] = useState(PRESETS[0].edges)

  const n = Math.min(Math.max(Number(nText) || 0, 1), 8)
  const edges = useMemo(() => parsePairs(edgesText, n), [edgesText, n])
  const frames = useMemo(() => buildFrames(n, edges), [n, edges])
  const [i, setI] = useState(0)

  const changeN = useCallback((v: string) => {
    setNText(v.replace(/[^0-9]/g, '').slice(0, 1))
    setI(0)
  }, [])
  const changeEdges = useCallback((v: string) => {
    setEdgesText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 90))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { n: string; edges: string }) => {
    setNText(p.n)
    setEdgesText(p.edges)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // component root for coloring
  const rootOf = (x: number) => {
    let c = x
    while (f.parent[c] !== c) c = f.parent[c]
    return c
  }

  // circular layout
  const W = 320
  const H = 280
  const cx = W / 2
  const cy = H / 2
  const R = n <= 1 ? 0 : 100
  const r = 19
  const pos = (idx: number) => {
    if (n === 1) return { x: cx, y: cy }
    const ang = -Math.PI / 2 + (idx * 2 * Math.PI) / n
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }
  }

  const nodeFill = (idx: number): string => {
    if (f.checking && (f.checking[0] === idx || f.checking[1] === idx)) return f.cycle ? C.signal : C.trace
    return COMP[rootOf(idx) % COMP.length]
  }

  return (
    <div>
      <style>{`.gt-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .gt-btn:active{transform:translateY(1px)} .gt-btn:disabled{opacity:.35;cursor:not-allowed}
        .gt-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>n =</label>
          <input value={nText} spellCheck={false} onChange={(e) => changeN(e.target.value)} style={{ ...inputStyle, width: 52 }} />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>edges =</label>
          <input value={edgesText} spellCheck={false} placeholder="[[0,1],[0,2]]" onChange={(e) => changeEdges(e.target.value)} style={{ ...inputStyle, minWidth: 200, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = nText === p.n && edgesText.replace(/\s/g, '') === p.edges.replace(/\s/g, '')
            return (
              <button key={p.name} className="gt-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          A graph is a valid tree iff it has exactly n−1 edges AND no cycles (which then forces it to be connected).
        </div>
      </div>

      {/* TOP: graph */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14 }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxWidth: 420, margin: '0 auto' }}>
          {edges.map(([u, v], e) => {
            const isTree = f.treeEdges.includes(e)
            const isChecking = f.checking && f.checking[0] === u && f.checking[1] === v && f.edgeIndex === e
            const pu = pos(u)
            const pv = pos(v)
            return <line key={e} x1={pu.x} y1={pu.y} x2={pv.x} y2={pv.y} stroke={isChecking ? (f.cycle ? C.signal : C.trace) : isTree ? C.ink : C.wire} strokeWidth={isChecking ? 3 : isTree ? 2 : 1.5} strokeDasharray={isChecking && f.cycle ? '5 4' : '0'} />
          })}
          {Array.from({ length: n }, (_, idx) => {
            const p = pos(idx)
            return (
              <g key={idx}>
                <circle cx={p.x} cy={p.y} r={r} fill={nodeFill(idx)} stroke={C.ink} strokeWidth={1.5} />
                <text x={p.x} y={p.y + 5} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="15" fill={C.paper}>{idx}</text>
              </g>
            )
          })}
        </svg>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 6, justifyContent: 'center' }}>
          <Swatch color={C.trace} label="connecting" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ display: 'inline-flex' }}>
              <span style={{ width: 12, height: 12, borderRadius: 6, background: COMP[0], border: `1.5px solid ${C.ink}` }} />
              <span style={{ width: 12, height: 12, borderRadius: 6, background: COMP[1], border: `1.5px solid ${C.ink}`, marginLeft: -3 }} />
            </span>
            components
          </span>
          <Swatch color={C.signal} label="cycle edge" />
        </div>
      </div>

      {/* BOTTOM */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <div>
          <div style={{ background: C.codebg, borderRadius: 6, padding: '14px 6px 14px 0', overflowX: 'auto' }}>
            {CODE.map((row) => {
              const active = row.ln === f.line && row.t.trim() !== ''
              return (
                <div key={row.ln} style={{ display: 'flex', background: active ? C.codehl : 'transparent', borderLeft: `3px solid ${active ? C.signal : 'transparent'}` }}>
                  <span style={{ width: 26, textAlign: 'right', paddingRight: 8, color: C.codedim, fontFamily: MONO, fontSize: 11, userSelect: 'none', lineHeight: '1.7' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 11, lineHeight: '1.7' }}>◄</span>}
                </div>
              )
            })}
            <div style={{ borderTop: `1px solid ${C.codehl}`, marginTop: 10, paddingTop: 10, paddingLeft: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {f.vars.map(([key, val]) => (
                <span key={key} style={{ fontFamily: MONO, fontSize: 12.5, background: '#000', color: C.codeink, padding: '4px 9px', borderRadius: 4, border: `1px solid ${C.trace}` }}>
                  <span style={{ color: C.trace }}>{key}</span>
                  <span style={{ color: C.codedim }}> = </span>
                  <b>{val}</b>
                </span>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <button className="gt-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="gt-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="gt-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="gt-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && f.result != null && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: f.result ? C.go : C.signal, marginTop: 10 }}>return {String(f.result)}</div>}
          </div>
        </div>
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
  return { fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '11px 18px', background: bg, color: fg, border: border ? `1.5px solid ${C.ink}` : 'none', borderRadius: 4 }
}
