'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; n: string; prereqs: string }[] = [
  { name: 'simple', n: '2', prereqs: '[[1,0]]' },
  { name: 'cycle', n: '2', prereqs: '[[1,0],[0,1]]' },
  { name: 'chain', n: '4', prereqs: '[[1,0],[2,1],[3,2]]' },
  { name: 'stuck', n: '4', prereqs: '[[0,1],[1,2],[2,0]]' },
]

function parsePairs(text: string, n: number): [number, number][] {
  const out: [number, number][] = []
  const re = /\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const a = Number(m[1])
    const b = Number(m[2])
    if (a >= 0 && a < n && b >= 0 && b < n) out.push([a, b])
    if (out.length >= 12) break
  }
  return out
}

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function canFinish(numCourses, prerequisites) {' },
  { ln: 2, t: '  const adj = Array.from({length: numCourses}, () => []);' },
  { ln: 3, t: '  const indeg = new Array(numCourses).fill(0);' },
  { ln: 4, t: '  for (const [a, b] of prerequisites) {' },
  { ln: 5, t: '    adj[b].push(a);   // b is a prerequisite of a' },
  { ln: 6, t: '    indeg[a]++;' },
  { ln: 7, t: '  }' },
  { ln: 8, t: '  const queue = [];' },
  { ln: 9, t: '  for (let c = 0; c < numCourses; c++)' },
  { ln: 10, t: '    if (indeg[c] === 0) queue.push(c);' },
  { ln: 11, t: '  let taken = 0;' },
  { ln: 12, t: '  while (queue.length) {' },
  { ln: 13, t: '    const u = queue.shift();' },
  { ln: 14, t: '    taken++;' },
  { ln: 15, t: '    for (const v of adj[u]) {' },
  { ln: 16, t: '      indeg[v]--;' },
  { ln: 17, t: '      if (indeg[v] === 0) queue.push(v);' },
  { ln: 18, t: '    }' },
  { ln: 19, t: '  }' },
  { ln: 20, t: '  return taken === numCourses;' },
  { ln: 21, t: '}' },
]

type Frame = {
  kind: string
  line: number
  indeg: number[]
  builtEdges: [number, number][]
  queueIds: number[]
  done: number[]
  current: number | null
  relaxEdge: [number, number] | null
  taken: number
  canFinish: boolean | null
  vars: [string, string][]
  title: string
  note: string
}

// Trace every executed line so the walkthrough mirrors the code step by step.
function buildFrames(n: number, prereqs: [number, number][]): { frames: Frame[] } {
  const adj: number[][] = Array.from({ length: n }, () => [])
  const indeg = new Array(n).fill(0)
  const builtEdges: [number, number][] = []
  const q: number[] = []
  const done: number[] = []
  let taken = 0
  let cur: number | null = null
  let relax: [number, number] | null = null
  let canFinish: boolean | null = null

  const frames: Frame[] = []
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
      indeg: [...indeg],
      builtEdges: builtEdges.map((e) => [e[0], e[1]] as [number, number]),
      queueIds: [...q],
      done: [...done],
      current: cur,
      relaxEdge: relax ? [relax[0], relax[1]] : null,
      taken,
      canFinish,
    })

  // --- Build the graph (lines 2-7) ---
  push(
    'init',
    2,
    'Set up the bookkeeping',
    'adj[c] will list the courses that depend on c. indeg[c] counts how many prerequisites course c still needs. Everything starts empty / zero.',
    [['numCourses', String(n)]],
  )

  for (const [a, b] of prereqs) {
    relax = null
    push(
      'build',
      4,
      `Read prerequisite [${a}, ${b}]`,
      `[a, b] = [${a}, ${b}] means you must take course ${b} before course ${a}.`,
      [['a', String(a)], ['b', String(b)]],
    )
    adj[b].push(a)
    builtEdges.push([b, a])
    relax = [b, a]
    push(
      'build',
      5,
      `Add edge ${b} → ${a}`,
      `${b} unlocks ${a}, so record ${a} inside adj[${b}].`,
      [['a', String(a)], ['b', String(b)], [`adj[${b}]`, `[${adj[b].join(', ')}]`]],
    )
    indeg[a]++
    relax = null
    push(
      'build',
      6,
      `Course ${a} needs one more prereq`,
      `Course ${a} has another prerequisite, so bump its counter: indeg[${a}] → ${indeg[a]}.`,
      [['a', String(a)], [`indeg[${a}]`, String(indeg[a])]],
    )
  }

  // --- Find the courses that are ready first (lines 8-10) ---
  push('scan', 8, 'Create the queue', 'The queue holds courses that are ready to take right now — the ones with no remaining prerequisites.', [['queue', '[]']])
  for (let c = 0; c < n; c++) {
    push(
      'scan',
      9,
      `Look at course ${c}`,
      `Walk through every course. Is course ${c} ready? Check indeg[${c}].`,
      [['c', String(c)], [`indeg[${c}]`, String(indeg[c])]],
    )
    if (indeg[c] === 0) {
      q.push(c)
      push(
        'scan',
        10,
        `Course ${c} is ready`,
        `indeg[${c}] is 0 — no prerequisites — so add ${c} to the queue.`,
        [['c', String(c)], ['queue', `[${q.join(', ')}]`]],
      )
    } else {
      push(
        'scan',
        10,
        `Course ${c} must wait`,
        `indeg[${c}] = ${indeg[c]} > 0, so course ${c} is not ready. Skip it for now.`,
        [['c', String(c)], [`indeg[${c}]`, String(indeg[c])]],
      )
    }
  }

  push('scan', 11, 'Start the counter', 'taken records how many courses we have managed to schedule. Start it at 0.', [['taken', '0']])

  // --- Process the queue (lines 12-19) ---
  while (true) {
    cur = null
    relax = null
    if (q.length === 0) {
      push('loop', 12, 'Queue is empty', 'No courses are ready anymore, so the loop stops here.', [['queue', '[]'], ['taken', String(taken)]])
      break
    }
    push('loop', 12, 'Queue still has courses', `queue = [${q.join(', ')}] — at least one course is ready, so keep going.`, [['queue', `[${q.join(', ')}]`]])

    const u = q.shift()!
    cur = u
    push(
      'take',
      13,
      `Take course ${u}`,
      `Remove the front of the queue: u = ${u}. We are taking course ${u} now.`,
      [['u', String(u)], ['queue', `[${q.join(', ')}]`]],
    )
    done.push(u)
    taken++
    push(
      'take',
      14,
      `${taken} course${taken === 1 ? '' : 's'} taken`,
      `Course ${u} is scheduled. taken → ${taken}.`,
      [['u', String(u)], ['taken', String(taken)]],
    )

    for (const v of adj[u]) {
      relax = [u, v]
      push(
        'relax',
        15,
        `Follow ${u} → ${v}`,
        `Course ${u} unlocks course ${v}. Visit that neighbour next.`,
        [['u', String(u)], ['v', String(v)]],
      )
      indeg[v]--
      push(
        'relax',
        16,
        `Clear a prereq of ${v}`,
        `${u} is taken, so ${v} needs one fewer prerequisite: indeg[${v}] → ${indeg[v]}.`,
        [['v', String(v)], [`indeg[${v}]`, String(indeg[v])]],
      )
      if (indeg[v] === 0) {
        q.push(v)
        push(
          'relax',
          17,
          `Course ${v} is now ready`,
          `indeg[${v}] hit 0 — all of its prerequisites are done — so add ${v} to the queue.`,
          [['v', String(v)], ['queue', `[${q.join(', ')}]`]],
        )
      } else {
        push(
          'relax',
          17,
          `Course ${v} still waiting`,
          `indeg[${v}] = ${indeg[v]} > 0, so ${v} is not ready yet. Leave it.`,
          [['v', String(v)], [`indeg[${v}]`, String(indeg[v])]],
        )
      }
    }
  }

  // --- Final answer (line 20) ---
  cur = null
  relax = null
  canFinish = taken === n
  push(
    'done',
    20,
    canFinish ? 'Can finish ✓' : 'Cannot finish ✗',
    canFinish
      ? `taken (${taken}) === numCourses (${n}) — every course got scheduled, so there is no cycle. Return true.`
      : `taken (${taken}) ≠ numCourses (${n}). The leftover courses keep waiting on each other in a cycle, so they can never start. Return false.`,
    [['taken', String(taken)], ['numCourses', String(n)]],
  )

  return { frames }
}

const kindColor = (kind: string, canFinish: boolean | null): string =>
  kind === 'take'
    ? C.signal
    : kind === 'relax'
      ? C.trace
      : kind === 'build'
        ? C.go
        : kind === 'scan'
          ? C.trace
          : kind === 'done'
            ? canFinish
              ? C.go
              : C.signal
            : C.ink

export default function CourseScheduleViz() {
  const [nText, setNText] = useState(PRESETS[0].n)
  const [prereqText, setPrereqText] = useState(PRESETS[0].prereqs)

  const n = Math.min(Math.max(Number(nText) || 0, 1), 8)
  const prereqs = useMemo(() => parsePairs(prereqText, n), [prereqText, n])
  const { frames } = useMemo(() => buildFrames(n, prereqs), [n, prereqs])
  const [i, setI] = useState(0)

  const changeN = useCallback((v: string) => {
    setNText(v.replace(/[^0-9]/g, '').slice(0, 1))
    setI(0)
  }, [])
  const changePrereq = useCallback((v: string) => {
    setPrereqText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 80))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { n: string; prereqs: string }) => {
    setNText(p.n)
    setPrereqText(p.prereqs)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // circular layout
  const W = 360
  const H = 300
  const cx = W / 2
  const cy = H / 2
  const R = n <= 1 ? 0 : 110
  const r = 20
  const pos = (idx: number) => {
    if (n === 1) return { x: cx, y: cy }
    const ang = -Math.PI / 2 + (idx * 2 * Math.PI) / n
    return { x: cx + R * Math.cos(ang), y: cy + R * Math.sin(ang) }
  }

  const nodeFill = (idx: number): string => {
    if (f.current === idx) return C.signal
    if (f.done.includes(idx)) return C.go
    if (f.queueIds.includes(idx)) return C.trace
    if (f.kind === 'done' && f.canFinish === false) return '#E9B7AE' // stuck (cycle)
    return '#FBF9F3'
  }
  const nodeText = (idx: number): string =>
    f.current === idx || f.done.includes(idx) || f.queueIds.includes(idx) ? C.paper : C.ink

  return (
    <div>
      <style>{`.cs-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .cs-btn:active{transform:translateY(1px)} .cs-btn:disabled{opacity:.35;cursor:not-allowed}
        .cs-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>numCourses =</label>
          <input
            value={nText}
            spellCheck={false}
            onChange={(e) => changeN(e.target.value)}
            style={{ ...inputStyle, width: 56 }}
          />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>prerequisites =</label>
          <input
            value={prereqText}
            spellCheck={false}
            placeholder="[[1,0]]"
            onChange={(e) => changePrereq(e.target.value)}
            style={{ ...inputStyle, minWidth: 180, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = nText === p.n && prereqText.replace(/\s/g, '') === p.prereqs.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="cs-btn"
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
          [a, b] means “take b before a”. Arrow points prereq → course.
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
                    fontSize: 11,
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
                  fontSize: 13,
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

        {/* RIGHT: graph + queue + narration */}
        <div>
          <div
            style={{
              border: `1.5px solid ${C.wire}`,
              background: '#FBF9F3',
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
              <defs>
                <marker id="cs-arrow" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill={C.slate} />
                </marker>
                <marker id="cs-arrow-hot" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 z" fill={C.signal} />
                </marker>
              </defs>
              {/* edges b -> a, drawn only once they have been built */}
              {f.builtEdges.map(([b, a], ei) => {
                if (a === b) return null
                const pb = pos(b)
                const pa = pos(a)
                const dx = pa.x - pb.x
                const dy = pa.y - pb.y
                const len = Math.hypot(dx, dy) || 1
                const ux = dx / len
                const uy = dy / len
                const x1 = pb.x + ux * r
                const y1 = pb.y + uy * r
                const x2 = pa.x - ux * (r + 4)
                const y2 = pa.y - uy * (r + 4)
                const hot = f.relaxEdge && f.relaxEdge[0] === b && f.relaxEdge[1] === a
                return (
                  <line
                    key={`${b}-${a}-${ei}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={hot ? C.signal : C.slate}
                    strokeWidth={hot ? 2.5 : 1.5}
                    markerEnd={`url(#${hot ? 'cs-arrow-hot' : 'cs-arrow'})`}
                  />
                )
              })}
              {/* nodes */}
              {Array.from({ length: n }, (_, idx) => {
                const p = pos(idx)
                return (
                  <g key={idx}>
                    <circle cx={p.x} cy={p.y} r={r} fill={nodeFill(idx)} stroke={C.ink} strokeWidth={1.5} />
                    <text
                      x={p.x}
                      y={p.y + 5}
                      textAnchor="middle"
                      fontFamily={MONO}
                      fontWeight="700"
                      fontSize="15"
                      fill={nodeText(idx)}
                    >
                      {idx}
                    </text>
                    {/* indegree badge */}
                    <circle cx={p.x + 15} cy={p.y - 15} r={9} fill={C.ink} stroke={C.paper} strokeWidth={1} />
                    <text
                      x={p.x + 15}
                      y={p.y - 11.5}
                      textAnchor="middle"
                      fontFamily={MONO}
                      fontWeight="700"
                      fontSize="10"
                      fill={C.paper}
                    >
                      {f.indeg[idx]}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>

          {/* legend */}
          <div
            style={{
              display: 'flex',
              gap: 10,
              flexWrap: 'wrap',
              marginBottom: 12,
              fontFamily: MONO,
              fontSize: 11,
              color: C.slate,
            }}
          >
            <Swatch color={C.trace} label="ready (indeg 0)" />
            <Swatch color={C.signal} label="taking" />
            <Swatch color={C.go} label="taken" />
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 7,
                  background: C.ink,
                  color: C.paper,
                  fontSize: 9,
                  textAlign: 'center',
                  lineHeight: '14px',
                  fontFamily: MONO,
                }}
              >
                n
              </span>
              indegree
            </span>
          </div>

          {/* queue */}
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
            queue (ready courses)
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 36, marginBottom: 12, alignItems: 'center' }}>
            {f.queueIds.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
            ) : (
              f.queueIds.map((id, qi) => (
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
              borderLeft: `3px solid ${kindColor(f.kind, f.canFinish)}`,
              paddingLeft: 12,
              minHeight: 78,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>
              STEP {Math.min(i, frames.length - 1)} / {frames.length - 1} · line {f.line}
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>
              {f.title}
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
        <button className="cs-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="cs-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="cs-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && f.canFinish !== null && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: f.canFinish ? C.go : C.signal }}>
            return {String(f.canFinish)}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="cs-btn"
            onClick={() => setI(idx)}
            aria-label={`step ${idx}`}
            style={{
              height: 6,
              flex: 1,
              border: 'none',
              borderRadius: 3,
              padding: 0,
              background:
                idx <= Math.min(i, frames.length - 1)
                  ? kindColor(fr.kind, fr.canFinish)
                  : C.wire,
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
      <span style={{ width: 14, height: 14, borderRadius: 3, background: color, border: `1.5px solid ${C.ink}` }} />
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
