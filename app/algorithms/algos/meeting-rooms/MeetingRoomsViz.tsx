'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; intervals: string }[] = [
  { name: 'two rooms', intervals: '[[0,30],[5,10],[15,20]]' },
  { name: 'no overlap', intervals: '[[1,5],[6,10],[11,15]]' },
  { name: 'three rooms', intervals: '[[0,10],[2,6],[5,8]]' },
  { name: 'touching', intervals: '[[1,5],[5,10],[10,15]]' },
]

type Mode = '252' | '253'

function parseIntervals(text: string): [number, number][] {
  const out: [number, number][] = []
  const re = /\[\s*(\d+)\s*,\s*(\d+)\s*\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const a = Number(m[1])
    const b = Number(m[2])
    if (a < b) out.push([a, b])
    if (out.length >= 6) break
  }
  return out
}

const CODE_252 = [
  { ln: 1, t: 'function canAttendMeetings(intervals) {' },
  { ln: 2, t: '  intervals.sort((a, b) => a[0] - b[0]);' },
  { ln: 3, t: '  for (let i = 1; i < intervals.length; i++) {' },
  { ln: 4, t: '    if (intervals[i][0] < intervals[i - 1][1]) {' },
  { ln: 5, t: '      return false;' },
  { ln: 6, t: '    }' },
  { ln: 7, t: '  }' },
  { ln: 8, t: '  return true;' },
  { ln: 9, t: '}' },
]

const CODE_253 = [
  { ln: 1, t: 'function minMeetingRooms(intervals) {' },
  { ln: 2, t: '  intervals.sort((a, b) => a[0] - b[0]);' },
  { ln: 3, t: '  const heap = new MinHeap();   // end times in use' },
  { ln: 4, t: '  for (const [start, end] of intervals) {' },
  { ln: 5, t: '    if (heap.size() > 0 && heap.peek() <= start) {' },
  { ln: 6, t: '      heap.pop();    // earliest meeting ended; reuse room' },
  { ln: 7, t: '    }' },
  { ln: 8, t: '    heap.push(end);' },
  { ln: 9, t: '  }' },
  { ln: 10, t: '  return heap.size();' },
  { ln: 11, t: '}' },
]

type Pt = { s: number; e: number }
type Frame = {
  kind: string
  line: number
  curr: number | null
  compare: number | null
  conflict: [number, number] | null
  ongoing: number[]
  popped: number | null
  heap: number[]
  sweepT: number | null
  result: string | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames252(intervals: [number, number][]): { frames: Frame[]; order: Pt[] } {
  const order: Pt[] = intervals.map(([s, e]) => ({ s, e })).sort((a, b) => a.s - b.s)
  const frames: Frame[] = []
  const base = {
    curr: null as number | null,
    compare: null as number | null,
    conflict: null as [number, number] | null,
    ongoing: [] as number[],
    popped: null as number | null,
    heap: [] as number[],
    sweepT: null as number | null,
    result: null as string | null,
  }
  const push = (kind: string, line: number, title: string, note: string, p: Partial<Frame> = {}) =>
    frames.push({ ...base, kind, line, title, note, vars: p.vars ?? [], ...p })

  if (order.length === 0) {
    push('done', 8, 'No meetings', 'There is nothing scheduled, so you can attend everything. Return true.', { result: 'can attend: true' })
    return { frames, order }
  }

  push('sort', 2, 'Sort by start time', 'Line them up in the order they begin. Then a conflict can only happen between neighbours.', {})

  for (let i = 1; i < order.length; i++) {
    push('check', 4, `Meeting ${i} vs ${i - 1}`, `Does meeting ${i} start (${order[i].s}) before meeting ${i - 1} ends (${order[i - 1].e})?`, {
      curr: i,
      compare: i - 1,
      vars: [['start[i]', String(order[i].s)], ['end[i-1]', String(order[i - 1].e)]],
    })
    if (order[i].s < order[i - 1].e) {
      push('conflict', 5, 'Overlap → return false', `${order[i].s} < ${order[i - 1].e}: meetings ${i - 1} and ${i} overlap, so you cannot attend both. Return false.`, {
        curr: i,
        compare: i - 1,
        conflict: [i - 1, i],
        result: 'can attend: false',
      })
      return { frames, order }
    }
  }

  push('done', 8, 'No overlaps → return true', 'Every meeting starts only after the previous one ends. You can attend all of them.', { result: 'can attend: true' })
  return { frames, order }
}

function buildFrames253(intervals: [number, number][]): { frames: Frame[]; order: Pt[] } {
  const order: Pt[] = intervals.map(([s, e]) => ({ s, e })).sort((a, b) => a.s - b.s)
  const frames: Frame[] = []
  const heapPos: number[] = [] // positions whose meetings are ongoing, kept sorted by end asc
  let popped: number | null = null

  const heapEnds = () => heapPos.map((p) => order[p].e)
  const push = (kind: string, line: number, title: string, note: string, p: Partial<Frame> = {}) =>
    frames.push({
      kind,
      line,
      title,
      note,
      curr: p.curr ?? null,
      compare: null,
      conflict: null,
      ongoing: [...heapPos],
      popped: p.popped ?? null,
      heap: heapEnds(),
      sweepT: p.sweepT ?? null,
      result: p.result ?? null,
      vars: p.vars ?? [],
    })

  if (order.length === 0) {
    push('done', 10, 'No meetings', 'No meetings means no rooms. Return 0.', { result: 'rooms: 0' })
    return { frames, order }
  }

  push('sort', 2, 'Sort by start time', 'Process meetings in the order they begin.', {})
  push('init', 3, 'Empty min-heap', 'The heap holds the END times of meetings currently using a room. Its smallest value is the soonest a room frees up.', { vars: [['heap', '[]']] })

  for (let i = 0; i < order.length; i++) {
    popped = null
    const { s, e } = order[i]
    push('for', 4, `Meeting ${i}: [${s}, ${e}]`, 'Take the next meeting (sorted by start).', { curr: i, sweepT: s, vars: [['start', String(s)], ['end', String(e)]] })

    const canReuse = heapPos.length > 0 && order[heapPos[0]].e <= s
    push('check', 5, canReuse ? 'A room frees up' : heapPos.length === 0 ? 'No rooms in use' : 'Every room is busy', canReuse
      ? `The soonest end time (${order[heapPos[0]].e}) is ≤ this start (${s}). That meeting is over, so its room is free to reuse.`
      : heapPos.length === 0
        ? 'No meetings are ongoing yet, so this one will need a fresh room.'
        : `The soonest end time (${order[heapPos[0]].e}) is after this start (${s}). All rooms are still occupied — we will need another.`, {
      curr: i,
      sweepT: s,
      vars: [['heap.peek()', heapPos.length ? String(order[heapPos[0]].e) : '—'], ['start', String(s)]],
    })

    if (canReuse) {
      popped = heapPos.shift()!
      push('pop', 6, `Pop end ${order[popped].e}`, `Remove ${order[popped].e} from the heap — that room is now free for the current meeting.`, {
        curr: i,
        sweepT: s,
        popped,
        vars: [['popped end', String(order[popped].e)]],
      })
      popped = null
    }

    heapPos.push(i)
    heapPos.sort((a, b) => order[a].e - order[b].e)
    push('push', 8, `Push end ${e}`, `Add this meeting's end time. Rooms in use now: ${heapPos.length}.`, {
      curr: i,
      sweepT: s,
      vars: [['heap', `[${heapEnds().join(', ')}]`], ['rooms in use', String(heapPos.length)]],
    })
  }

  push('done', 10, `Need ${heapPos.length} room${heapPos.length === 1 ? '' : 's'}`, `The heap never shrank below its peak — that peak is the most meetings running at once. Return ${heapPos.length}.`, {
    result: `rooms: ${heapPos.length}`,
  })
  return { frames, order }
}

const kindColor = (kind: string): string =>
  kind === 'conflict' || kind === 'pop'
    ? C.signal
    : kind === 'done' || kind === 'push'
      ? C.go
      : kind === 'check' || kind === 'for' || kind === 'sort'
        ? C.trace
        : C.ink

export default function MeetingRoomsViz() {
  const [intervalsText, setIntervalsText] = useState(PRESETS[0].intervals)
  const [mode, setMode] = useState<Mode>('252')

  const intervals = useMemo(() => parseIntervals(intervalsText), [intervalsText])
  const { frames, order } = useMemo(
    () => (mode === '252' ? buildFrames252(intervals) : buildFrames253(intervals)),
    [intervals, mode],
  )
  const CODE = mode === '252' ? CODE_252 : CODE_253
  const [i, setI] = useState(0)

  const changeIntervals = useCallback((v: string) => {
    setIntervalsText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 70))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { intervals: string }) => {
    setIntervalsText(p.intervals)
    setI(0)
  }, [])
  const changeMode = useCallback((m: Mode) => {
    setMode(m)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // timeline mapping
  const n = order.length
  const W = 480
  const mL = 44
  const mR = 14
  const rowH = 30
  const topPad = 8
  const axisH = 24
  const H = topPad + n * rowH + axisH
  const minT = n ? Math.min(...order.map((o) => o.s)) : 0
  const maxT = n ? Math.max(...order.map((o) => o.e)) : 1
  const spanT = maxT - minT || 1
  const xt = (t: number) => mL + ((t - minT) / spanT) * (W - mL - mR)

  const barStyle = (pos: number): { fill: string; text: string } => {
    if (mode === '252') {
      if (f.conflict && (f.conflict[0] === pos || f.conflict[1] === pos)) return { fill: C.signal, text: C.paper }
      if (f.curr === pos) return { fill: C.signal, text: C.paper }
      if (f.compare === pos) return { fill: C.trace, text: C.paper }
      return { fill: '#E7E1D2', text: C.ink }
    }
    if (f.popped === pos) return { fill: '#E9B7AE', text: C.ink }
    if (f.curr === pos) return { fill: C.signal, text: C.paper }
    if (f.ongoing.includes(pos)) return { fill: C.go, text: C.paper }
    return { fill: '#E7E1D2', text: C.ink }
  }

  return (
    <div>
      <style>{`.mr-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .mr-btn:active{transform:translateY(1px)} .mr-btn:disabled{opacity:.35;cursor:not-allowed}
        .mr-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>intervals =</label>
          <input
            value={intervalsText}
            spellCheck={false}
            placeholder="[[0,30],[5,10],[15,20]]"
            onChange={(e) => changeIntervals(e.target.value)}
            style={{ ...inputStyle, minWidth: 220, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = intervalsText.replace(/\s/g, '') === p.intervals.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="mr-btn"
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
          Each [start, end] is a meeting on a shared time axis. End is exclusive — [5,10] and [10,15] do not clash.
        </div>
      </div>

      {/* Variant toggle */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>problem:</span>
        {(['252', '253'] as Mode[]).map((m) => {
          const active = mode === m
          return (
            <button
              key={m}
              className="mr-btn"
              onClick={() => changeMode(m)}
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 13,
                padding: '6px 14px',
                borderRadius: 4,
                border: `1.5px solid ${active ? C.ink : C.wire}`,
                background: active ? C.ink : C.paper,
                color: active ? C.paper : C.ink,
              }}
            >
              {m === '252' ? 'Can attend all? · 252' : 'Min rooms · 253'}
            </button>
          )
        })}
      </div>

      {/* TOP: timeline */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        {n === 0 ? (
          <div style={{ fontFamily: MONO, fontSize: 13, color: C.slate }}>No valid meetings — add some intervals like [0,30].</div>
        ) : (
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
            {/* sweep line (253) */}
            {f.sweepT != null && (
              <line x1={xt(f.sweepT)} y1={topPad - 2} x2={xt(f.sweepT)} y2={topPad + n * rowH + 2} stroke={C.signal} strokeWidth={1.5} strokeDasharray="4 3" />
            )}
            {/* bars */}
            {order.map((o, pos) => {
              const y = topPad + pos * rowH
              const x1 = xt(o.s)
              const x2 = xt(o.e)
              const bs = barStyle(pos)
              return (
                <g key={pos}>
                  <text x={4} y={y + rowH / 2 + 4} fontFamily={MONO} fontSize="10" fill={C.slate}>
                    M{pos}
                  </text>
                  <rect x={x1} y={y + 3} width={Math.max(x2 - x1, 2)} height={rowH - 8} rx={4} fill={bs.fill} stroke={C.ink} strokeWidth={1.5} />
                  <text x={(x1 + x2) / 2} y={y + rowH / 2 + 3} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="11" fill={bs.text}>
                    {o.s},{o.e}
                  </text>
                </g>
              )
            })}
            {/* axis */}
            <line x1={mL} y1={topPad + n * rowH + 6} x2={W - mR} y2={topPad + n * rowH + 6} stroke={C.wire} strokeWidth={1} />
            <text x={mL} y={topPad + n * rowH + 19} fontFamily={MONO} fontSize="10" fill={C.slate}>
              {minT}
            </text>
            <text x={W - mR} y={topPad + n * rowH + 19} textAnchor="end" fontFamily={MONO} fontSize="10" fill={C.slate}>
              {maxT}
            </text>
          </svg>
        )}

        {/* heap (253) + status */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          {mode === '253' && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>heap (end times)</span>
              {f.heap.length === 0 ? (
                <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
              ) : (
                f.heap.map((end, hi) => (
                  <span
                    key={hi}
                    style={{
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '4px 9px',
                      borderRadius: 4,
                      border: `1.5px solid ${hi === 0 ? C.trace : C.wire}`,
                      background: hi === 0 ? C.trace : C.paper,
                      color: hi === 0 ? C.paper : C.ink,
                    }}
                  >
                    {end}
                  </span>
                ))
              )}
            </div>
          )}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginLeft: mode === '253' ? 'auto' : 0 }}>
            {mode === '252' ? (
              <>
                <Swatch color={C.trace} label="previous" />
                <Swatch color={C.signal} label="current / conflict" />
              </>
            ) : (
              <>
                <Swatch color={C.signal} label="current" />
                <Swatch color={C.go} label="in a room (heap)" />
                <Swatch color="#E9B7AE" label="room freed" />
              </>
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: code+controls | narration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          <div style={{ background: C.codebg, borderRadius: 6, padding: '16px 6px 16px 0', overflowX: 'auto' }}>
            {CODE.map((row) => {
              const active = row.ln === f.line && row.t.trim() !== ''
              return (
                <div
                  key={row.ln}
                  style={{ display: 'flex', background: active ? C.codehl : 'transparent', borderLeft: `3px solid ${active ? C.signal : 'transparent'}` }}
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
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.8', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 11.5, lineHeight: '1.8' }}>◄</span>}
                </div>
              )
            })}

            <div style={{ borderTop: `1px solid ${C.codehl}`, marginTop: 12, paddingTop: 12, paddingLeft: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {f.vars.map(([key, val]) => (
                <span
                  key={key}
                  style={{ fontFamily: MONO, fontSize: 12.5, background: '#000', color: C.codeink, padding: '4px 9px', borderRadius: 4, border: `1px solid ${C.trace}` }}
                >
                  <span style={{ color: C.trace }}>{key}</span>
                  <span style={{ color: C.codedim }}> = </span>
                  <b>{val}</b>
                </span>
              ))}
            </div>
          </div>

          {/* controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <button className="mr-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="mr-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="mr-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="mr-btn"
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
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
            step {Math.min(i, frames.length - 1)} / {frames.length - 1}
          </div>
        </div>

        {/* RIGHT: narration */}
        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && f.result && (
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.go, marginTop: 10 }}>{f.result}</div>
            )}
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
      <span style={{ width: 14, height: 14, borderRadius: 4, background: color, border: `1.5px solid ${C.ink}` }} />
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
