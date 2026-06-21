'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; text: string }[] = [
  { name: 'classic', text: '[[1,3],[2,6],[8,10],[15,18]]' },
  { name: 'touching', text: '[[1,4],[4,5]]' },
  { name: 'nested', text: '[[1,10],[2,3],[5,8]]' },
  { name: 'no overlap', text: '[[1,2],[4,5],[7,9]]' },
]

type Iv = [number, number]

function parseIntervals(text: string): Iv[] {
  const out: Iv[] = []
  const re = /\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const a = Number(m[1])
    const b = Number(m[2])
    out.push(a <= b ? [a, b] : [b, a])
    if (out.length >= 10) break
  }
  return out
}

const fmt = (iv: Iv) => `[${iv[0]}, ${iv[1]}]`

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function merge(intervals) {' },
  { ln: 2, t: '  intervals.sort((a, b) => a[0] - b[0]);' },
  { ln: 3, t: '  const res = [];' },
  { ln: 4, t: '  let cur = intervals[0];' },
  { ln: 5, t: '  for (let i = 1; i < intervals.length; i++) {' },
  { ln: 6, t: '    const next = intervals[i];' },
  { ln: 7, t: '    if (next[0] <= cur[1])        // overlap' },
  { ln: 8, t: '      cur[1] = Math.max(cur[1], next[1]);' },
  { ln: 9, t: '    else {                        // gap' },
  { ln: 10, t: '      res.push(cur);' },
  { ln: 11, t: '      cur = next;' },
  { ln: 12, t: '    }' },
  { ln: 13, t: '  }' },
  { ln: 14, t: '  res.push(cur);' },
  { ln: 15, t: '  return res;' },
  { ln: 16, t: '}' },
]

type Frame = {
  kind: string
  line: number
  candidateIdx: number | null
  currentIdxs: number[]
  doneIdxs: number[]
  current: Iv | null
  result: Iv[]
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(intervals: Iv[]): { frames: Frame[]; sorted: Iv[]; result: Iv[] } {
  const sorted = [...intervals].sort((a, b) => a[0] - b[0])
  const frames: Frame[] = []
  const result: Iv[] = []
  const snap = () => result.map((r) => [...r] as Iv)

  if (sorted.length === 0) {
    frames.push({
      kind: 'done',
      line: 15,
      candidateIdx: null,
      currentIdxs: [],
      doneIdxs: [],
      current: null,
      result: [],
      vars: [],
      title: 'Empty',
      note: 'No intervals to merge.',
    })
    return { frames, sorted, result }
  }

  frames.push({
    kind: 'start',
    line: 1,
    candidateIdx: null,
    currentIdxs: [],
    doneIdxs: [],
    current: null,
    result: [],
    vars: [],
    title: 'Start',
    note: 'Plan: sort the intervals by their start value, then sweep left → right, growing one running interval and saving it whenever a gap appears.',
  })
  frames.push({
    kind: 'sorted',
    line: 2,
    candidateIdx: null,
    currentIdxs: [],
    doneIdxs: [],
    current: null,
    result: [],
    vars: [],
    title: 'Sort by start',
    note: `Sorting by start makes any overlapping intervals sit next to each other, so we only ever compare with one running interval. Sorted: ${sorted.map(fmt).join(', ')}.`,
  })

  let current: Iv = [...sorted[0]]
  let currentIdxs = [0]
  let doneIdxs: number[] = []

  frames.push({
    kind: 'init',
    line: 4,
    candidateIdx: null,
    currentIdxs: [...currentIdxs],
    doneIdxs: [],
    current: [...current],
    result: snap(),
    vars: [['cur', fmt(current)]],
    title: `cur = ${fmt(current)}`,
    note: 'Take the first interval as our running "cur". We will try to stretch it over any intervals that overlap it.',
  })

  for (let i = 1; i < sorted.length; i++) {
    const next = sorted[i]
    frames.push({
      kind: 'compare',
      line: 7,
      candidateIdx: i,
      currentIdxs: [...currentIdxs],
      doneIdxs: [...doneIdxs],
      current: [...current],
      result: snap(),
      vars: [
        ['cur', fmt(current)],
        ['next', fmt(next)],
        ['i', String(i)],
      ],
      title: `Compare ${fmt(next)}`,
      note: `Do they overlap? Two intervals overlap when next.start ≤ cur.end → is ${next[0]} ≤ ${current[1]}?`,
    })

    if (next[0] <= current[1]) {
      const before = current[1]
      current = [current[0], Math.max(current[1], next[1])]
      currentIdxs = [...currentIdxs, i]
      let mnote = `Yes — ${next[0]} ≤ ${before}, so they overlap. Stretch cur's end to the larger end: max(${before}, ${next[1]}) = ${current[1]}.`
      if (next[1] <= before) mnote += ` (${fmt(next)} sits fully inside cur, so the end stays ${before}.)`
      frames.push({
        kind: 'merge',
        line: 8,
        candidateIdx: i,
        currentIdxs: [...currentIdxs],
        doneIdxs: [...doneIdxs],
        current: [...current],
        result: snap(),
        vars: [
          ['cur', fmt(current)],
          ['next', fmt(next)],
        ],
        title: 'Overlap → extend cur',
        note: mnote,
      })
    } else {
      frames.push({
        kind: 'flush',
        line: 10,
        candidateIdx: i,
        currentIdxs: [...currentIdxs],
        doneIdxs: [...doneIdxs],
        current: [...current],
        result: snap(),
        vars: [
          ['cur', fmt(current)],
          ['next', fmt(next)],
        ],
        title: `Gap → save ${fmt(current)}`,
        note: `No — ${next[0]} > ${current[1]}, there's a gap. cur can't grow any further, so save it to the result.`,
      })
      result.push([...current])
      doneIdxs = [...doneIdxs, ...currentIdxs]
      current = [...next]
      currentIdxs = [i]
      frames.push({
        kind: 'newcur',
        line: 11,
        candidateIdx: null,
        currentIdxs: [...currentIdxs],
        doneIdxs: [...doneIdxs],
        current: [...current],
        result: snap(),
        vars: [['cur', fmt(current)]],
        title: `cur = ${fmt(current)}`,
        note: `${fmt(current)} becomes the new running interval, and we continue.`,
      })
    }
  }

  frames.push({
    kind: 'flushLast',
    line: 14,
    candidateIdx: null,
    currentIdxs: [...currentIdxs],
    doneIdxs: [...doneIdxs],
    current: [...current],
    result: snap(),
    vars: [['cur', fmt(current)]],
    title: `Save last ${fmt(current)}`,
    note: `No intervals left — push the final cur ${fmt(current)} to the result.`,
  })
  result.push([...current])
  doneIdxs = [...doneIdxs, ...currentIdxs]

  frames.push({
    kind: 'done',
    line: 15,
    candidateIdx: null,
    currentIdxs: [],
    doneIdxs: [...doneIdxs],
    current: null,
    result: snap(),
    vars: [],
    title: `Merged into ${result.length}`,
    note: `Done — the merged intervals are ${result.map(fmt).join(', ')}.`,
  })

  return { frames, sorted, result }
}

export default function MergeIntervalsViz() {
  const [input, setInput] = useState(PRESETS[0].text)
  const intervals = useMemo(() => parseIntervals(input), [input])
  const { frames, sorted } = useMemo(() => buildFrames(intervals), [intervals])
  const [i, setI] = useState(0)

  const changeInput = useCallback((v: string) => {
    setInput(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 80))
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // timeline domain
  const n = sorted.length
  const minV = n ? Math.min(...sorted.map((iv) => iv[0])) : 0
  const maxV = n ? Math.max(...sorted.map((iv) => iv[1])) : 1
  const span = maxV - minV || 1
  const PAD = 30
  const W = 460
  const innerW = W - PAD * 2
  const xOf = (v: number) => PAD + ((v - minV) / span) * innerW
  const ROWH = 24
  const TOP = 20
  const barH = 13
  const inputH = TOP + n * ROWH
  const laneY = inputH + 24
  const H = laneY + 44

  const statusColor = (k: number): string => {
    if (k === f.candidateIdx) return C.trace
    if (f.currentIdxs.includes(k)) return C.signal
    if (f.doneIdxs.includes(k)) return C.go
    return '#FBF9F3'
  }
  const statusText = (k: number): string =>
    k === f.candidateIdx || f.currentIdxs.includes(k) || f.doneIdxs.includes(k) ? C.paper : C.ink

  return (
    <div>
      <style>{`.mi-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .mi-btn:active{transform:translateY(1px)} .mi-btn:disabled{opacity:.35;cursor:not-allowed}
        .mi-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>intervals =</label>
          <input
            value={input}
            spellCheck={false}
            placeholder="[[1,3],[2,6],[8,10]]"
            onChange={(e) => changeInput(e.target.value)}
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              padding: '8px 11px',
              border: `1.5px solid ${C.ink}`,
              borderRadius: 6,
              background: '#FBF9F3',
              color: C.ink,
              minWidth: 240,
              flex: 1,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = input.replace(/\s/g, '') === p.text.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="mi-btn"
                onClick={() => changeInput(p.text)}
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
                    width: 30,
                    textAlign: 'right',
                    paddingRight: 10,
                    color: C.codedim,
                    fontFamily: MONO,
                    fontSize: 12,
                    userSelect: 'none',
                    lineHeight: '1.85',
                  }}
                >
                  {row.ln}
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 11.5,
                    lineHeight: '1.85',
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
                      fontSize: 12,
                      lineHeight: '1.85',
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
              minHeight: 20,
            }}
          >
            {f.vars.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.codedim }}>—</span>
            ) : (
              f.vars.map(([key, val]) => (
                <span
                  key={key}
                  style={{
                    fontFamily: MONO,
                    fontSize: 13,
                    background: '#000',
                    color: C.codeink,
                    padding: '4px 9px',
                    borderRadius: 4,
                    border: `1px solid ${key === 'cur' ? C.signal : key === 'next' ? C.trace : C.codedim}`,
                  }}
                >
                  <span style={{ color: key === 'cur' ? C.signal : key === 'next' ? C.trace : C.codedim }}>
                    {key}
                  </span>
                  <span style={{ color: C.codedim }}> = </span>
                  <b>{val}</b>
                </span>
              ))
            )}
          </div>
        </div>

        {/* RIGHT: timeline + legend + narration */}
        <div>
          <div
            style={{
              border: `1.5px solid ${C.wire}`,
              background: '#FBF9F3',
              borderRadius: 6,
              marginBottom: 12,
            }}
          >
            {n === 0 ? (
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.slate, padding: 24, textAlign: 'center' }}>
                no intervals
              </div>
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
                {/* input rows (sorted) */}
                {sorted.map((iv, k) => {
                  const y = TOP + k * ROWH
                  const x1 = xOf(iv[0])
                  const x2 = xOf(iv[1])
                  return (
                    <g key={k}>
                      <rect
                        x={x1}
                        y={y}
                        width={Math.max(x2 - x1, 3)}
                        height={barH}
                        rx={3}
                        fill={statusColor(k)}
                        stroke={C.ink}
                        strokeWidth={1}
                      />
                      <text
                        x={x1 + 3}
                        y={y + barH - 3}
                        fontFamily={MONO}
                        fontSize="9"
                        fontWeight="700"
                        fill={statusText(k)}
                      >
                        {iv[0]},{iv[1]}
                      </text>
                    </g>
                  )
                })}

                {/* divider */}
                <line
                  x1={PAD}
                  y1={inputH + 8}
                  x2={W - PAD}
                  y2={inputH + 8}
                  stroke={C.wire}
                  strokeWidth={1}
                  strokeDasharray="3 3"
                />
                <text x={PAD} y={inputH + 20} fontFamily={MONO} fontSize="9" fill={C.slate}>
                  MERGED
                </text>

                {/* merged lane: result + current */}
                {f.result.map((iv, k) => {
                  const x1 = xOf(iv[0])
                  const x2 = xOf(iv[1])
                  return (
                    <g key={`r${k}`}>
                      <rect
                        x={x1}
                        y={laneY}
                        width={Math.max(x2 - x1, 3)}
                        height={barH}
                        rx={3}
                        fill={C.go}
                        stroke={C.ink}
                        strokeWidth={1}
                      />
                      <text x={x1 + 3} y={laneY + barH - 3} fontFamily={MONO} fontSize="9" fontWeight="700" fill={C.paper}>
                        {iv[0]},{iv[1]}
                      </text>
                    </g>
                  )
                })}
                {f.current && f.kind !== 'done' && (
                  <g>
                    <rect
                      x={xOf(f.current[0])}
                      y={laneY}
                      width={Math.max(xOf(f.current[1]) - xOf(f.current[0]), 3)}
                      height={barH}
                      rx={3}
                      fill={C.signal}
                      stroke={C.ink}
                      strokeWidth={1}
                      strokeDasharray="4 2"
                    />
                    <text
                      x={xOf(f.current[0]) + 3}
                      y={laneY + barH - 3}
                      fontFamily={MONO}
                      fontSize="9"
                      fontWeight="700"
                      fill={C.paper}
                    >
                      {f.current[0]},{f.current[1]}
                    </text>
                  </g>
                )}

                {/* axis min/max */}
                <text x={xOf(minV)} y={H - 6} fontFamily={MONO} fontSize="10" fill={C.slate} textAnchor="middle">
                  {minV}
                </text>
                <text x={xOf(maxV)} y={H - 6} fontFamily={MONO} fontSize="10" fill={C.slate} textAnchor="middle">
                  {maxV}
                </text>
              </svg>
            )}
          </div>

          {/* legend */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 14,
              fontFamily: MONO,
              fontSize: 11,
              color: C.slate,
            }}
          >
            <Swatch color={C.signal} label="cur (running)" />
            <Swatch color={C.trace} label="next (comparing)" />
            <Swatch color={C.go} label="saved / merged" />
            <Swatch color="#FBF9F3" label="pending" />
          </div>

          {/* narration */}
          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'merge'
                  ? C.signal
                  : f.kind === 'flush' || f.kind === 'flushLast' || f.kind === 'done'
                    ? C.go
                    : f.kind === 'compare'
                      ? C.trace
                      : C.ink
              }`,
              paddingLeft: 12,
              minHeight: 80,
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
        <button className="mi-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="mi-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="mi-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.go }}>
            {f.result.map(fmt).join(' ')}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="mi-btn"
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
                  ? fr.kind === 'merge'
                    ? C.signal
                    : fr.kind === 'flush' || fr.kind === 'flushLast' || fr.kind === 'done'
                      ? C.go
                      : fr.kind === 'compare'
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
