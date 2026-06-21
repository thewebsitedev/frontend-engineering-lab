'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; points: string; k: string }[] = [
  { name: 'classic', points: '[[1,3],[-2,2]]', k: '1' },
  { name: 'pick 2', points: '[[3,3],[5,-1],[-2,4]]', k: '2' },
  { name: 'spread', points: '[[0,1],[1,0],[2,2],[-3,1],[4,-2]]', k: '3' },
  { name: 'cluster', points: '[[1,1],[2,2],[3,3],[0,5],[-1,-1],[5,1]]', k: '2' },
]

type Mode = 'sort' | 'heap'

function parsePoints(text: string): [number, number][] {
  const out: [number, number][] = []
  const re = /\[\s*(-?\d+)\s*,\s*(-?\d+)\s*\]/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    out.push([Number(m[1]), Number(m[2])])
    if (out.length >= 8) break
  }
  return out
}

const CODE_SORT = [
  { ln: 1, t: 'function kClosest(points, k) {' },
  { ln: 2, t: '  const withDist = points.map(([x, y]) => [x*x + y*y, x, y]);' },
  { ln: 3, t: '  withDist.sort((a, b) => a[0] - b[0]);' },
  { ln: 4, t: '  const result = [];' },
  { ln: 5, t: '  for (let i = 0; i < k; i++) {' },
  { ln: 6, t: '    result.push([withDist[i][1], withDist[i][2]]);' },
  { ln: 7, t: '  }' },
  { ln: 8, t: '  return result;' },
  { ln: 9, t: '}' },
]

const CODE_HEAP = [
  { ln: 1, t: 'function kClosest(points, k) {' },
  { ln: 2, t: '  const heap = new MaxHeap();   // ordered by distance' },
  { ln: 3, t: '  for (const [x, y] of points) {' },
  { ln: 4, t: '    const d = x*x + y*y;' },
  { ln: 5, t: '    heap.push([d, x, y]);' },
  { ln: 6, t: '    if (heap.size() > k) {' },
  { ln: 7, t: '      heap.pop();   // drop the farthest' },
  { ln: 8, t: '    }' },
  { ln: 9, t: '  }' },
  { ln: 10, t: '  return heap.toArray().map(([d, x, y]) => [x, y]);' },
  { ln: 11, t: '}' },
]

type Tag = 'curr' | 'kept' | 'result' | 'pop' | 'dim'
type Row = { idx: number; x: number; y: number; d: number; tag: Tag }
type Frame = {
  kind: string
  line: number
  curr: number | null
  popped: number | null
  kept: number[]
  rows: Row[]
  vars: [string, string][]
  title: string
  note: string
}

// ---- SORT trace ----
function buildFramesSort(points: [number, number][], k: number): Frame[] {
  const frames: Frame[] = []
  const withDist = points.map(([x, y], idx) => ({ idx, x, y, d: x * x + y * y }))

  const push = (kind: string, line: number, title: string, note: string, p: Partial<Frame> = {}) =>
    frames.push({
      kind,
      line,
      curr: p.curr ?? null,
      popped: null,
      kept: p.kept ?? [],
      rows: p.rows ?? [],
      vars: p.vars ?? [],
      title,
      note,
    })

  if (points.length === 0) {
    push('done', 8, 'No points', 'There is nothing to sort. Return an empty list.')
    return frames
  }

  push('init', 2, 'Measure every point', 'For each point compute its squared distance d = x² + y². We compare d directly — taking the square root would not change the order.', {
    rows: withDist.map((w) => ({ ...w, tag: 'dim' as Tag })),
  })

  for (let i = 0; i < withDist.length; i++) {
    const w = withDist[i]
    push('measure', 2, `Point #${w.idx}: (${w.x}, ${w.y})`, `d = ${w.x}² + ${w.y}² = ${w.d}.`, {
      curr: w.idx,
      rows: withDist.map((r, j) => ({ ...r, tag: (j === i ? 'curr' : 'dim') as Tag })),
      vars: [['point', `(${w.x}, ${w.y})`], ['d', String(w.d)]],
    })
  }

  const sorted = [...withDist].sort((a, b) => a.d - b.d)
  push('sort', 3, 'Sort by distance', 'Order all points by d ascending, so the closest ones come first.', {
    rows: sorted.map((w) => ({ ...w, tag: 'dim' as Tag })),
    vars: [['order', sorted.map((w) => w.d).join(' ≤ ')]],
  })

  push('init', 4, 'Prepare the result', 'Make an empty list to collect the k closest points.', {
    rows: sorted.map((w) => ({ ...w, tag: 'dim' as Tag })),
    vars: [['result', '[]']],
  })

  const result: number[] = []
  for (let i = 0; i < k && i < sorted.length; i++) {
    const w = sorted[i]
    result.push(w.idx)
    push('take', 6, `Take #${i + 1}: (${w.x}, ${w.y})`, `It is one of the ${k} smallest distances, so add it to the result.`, {
      curr: w.idx,
      kept: [...result],
      rows: sorted.map((r, pos) => ({ ...r, tag: (pos === i ? 'curr' : pos < i ? 'result' : 'dim') as Tag })),
      vars: [['i', String(i)], ['result size', String(result.length)]],
    })
  }

  push('done', 8, 'Return the k closest', `The first ${k} point${k === 1 ? '' : 's'} after sorting ${k === 1 ? 'is' : 'are'} the answer.`, {
    kept: [...result],
    rows: sorted.map((r, pos) => ({ ...r, tag: (pos < k ? 'result' : 'dim') as Tag })),
  })
  return frames
}

// ---- HEAP trace (max-heap of size k, keyed by distance) ----
function buildFramesHeap(points: [number, number][], k: number): Frame[] {
  const frames: Frame[] = []
  type H = { idx: number; x: number; y: number; d: number }
  const heap: H[] = [] // displayed sorted by d descending → farthest (the one we pop) on top

  const heapRows = (currIdx: number | null, popIdx: number | null): Row[] =>
    heap.map((h) => ({
      ...h,
      tag: (h.idx === popIdx ? 'pop' : h.idx === currIdx ? 'curr' : 'kept') as Tag,
    }))

  const push = (kind: string, line: number, title: string, note: string, p: Partial<Frame> = {}) =>
    frames.push({
      kind,
      line,
      curr: p.curr ?? null,
      popped: p.popped ?? null,
      kept: heap.map((h) => h.idx),
      rows: p.rows ?? heapRows(p.curr ?? null, p.popped ?? null),
      vars: p.vars ?? [],
      title,
      note,
    })

  if (points.length === 0) {
    push('done', 10, 'No points', 'The heap stays empty. Return an empty list.')
    return frames
  }

  push('init', 2, 'A max-heap of size k', `Keep at most ${k} point${k === 1 ? '' : 's'}. The heap's MAX (the farthest) sits on top, so dropping it is cheap — O(log k).`, {
    vars: [['k', String(k)]],
  })

  for (let i = 0; i < points.length; i++) {
    const [x, y] = points[i]
    push('for', 3, `Point #${i}: (${x}, ${y})`, 'Consider the next point from the input.', {
      curr: i,
      vars: [['point', `(${x}, ${y})`]],
    })

    const d = x * x + y * y
    push('dist', 4, `Distance d = ${d}`, `Squared distance d = ${x}² + ${y}² = ${d}.`, {
      curr: i,
      vars: [['d', String(d)]],
    })

    heap.push({ idx: i, x, y, d })
    heap.sort((a, b) => b.d - a.d)
    push('push', 5, `Push (${x}, ${y}) onto the heap`, `The heap now holds ${heap.length} point${heap.length === 1 ? '' : 's'}.`, {
      curr: i,
      rows: heapRows(i, null),
      vars: [['heap size', String(heap.length)]],
    })

    if (heap.length > k) {
      push('check', 6, `Size ${heap.length} > k = ${k}`, 'Too many points — the farthest one cannot be in the answer, so drop it.', {
        curr: i,
        rows: heapRows(i, null),
        vars: [['heap size', String(heap.length)], ['k', String(k)]],
      })
      const far = heap[0] // max on top
      push('pop', 7, `Pop the farthest: #${far.idx} (${far.x}, ${far.y})`, `Remove the max-distance point (d = ${far.d}). The ${k} closest so far remain.`, {
        curr: i,
        popped: far.idx,
        rows: heapRows(i, far.idx),
        vars: [['popped d', String(far.d)]],
      })
      heap.shift()
    } else {
      push('check', 6, `Size ${heap.length} ≤ k = ${k}`, 'Still room (≤ k), so keep every point for now.', {
        curr: i,
        rows: heapRows(i, null),
        vars: [['heap size', String(heap.length)], ['k', String(k)]],
      })
    }
  }

  push('done', 10, 'Return what remains', `The ${heap.length} point${heap.length === 1 ? '' : 's'} left in the heap ${heap.length === 1 ? 'is' : 'are'} the k closest.`, {
    rows: heap.map((h) => ({ ...h, tag: 'result' as Tag })),
  })
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'pop'
    ? C.signal
    : kind === 'take' || kind === 'push' || kind === 'done'
      ? C.go
      : kind === 'measure' || kind === 'for' || kind === 'dist' || kind === 'sort' || kind === 'check'
        ? C.trace
        : C.ink

export default function KClosestPointsViz() {
  const [pointsText, setPointsText] = useState(PRESETS[0].points)
  const [kText, setKText] = useState(PRESETS[0].k)
  const [mode, setMode] = useState<Mode>('sort')

  const points = useMemo(() => parsePoints(pointsText), [pointsText])
  const k = Math.min(Math.max(Number(kText) || 1, 1), Math.max(points.length, 1))
  const frames = useMemo(
    () => (mode === 'sort' ? buildFramesSort(points, k) : buildFramesHeap(points, k)),
    [points, k, mode],
  )
  const CODE = mode === 'sort' ? CODE_SORT : CODE_HEAP
  const [i, setI] = useState(0)

  const changePoints = useCallback((v: string) => {
    setPointsText(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 90))
    setI(0)
  }, [])
  const changeK = useCallback((v: string) => {
    setKText(v.replace(/[^0-9]/g, '').slice(0, 1))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { points: string; k: string }) => {
    setPointsText(p.points)
    setKText(p.k)
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

  // scatter mapping (includes origin, padded)
  const Wp = 280
  const Hp = 260
  const mgn = 26
  const xs = [0, ...points.map((p) => p[0])]
  const ys = [0, ...points.map((p) => p[1])]
  let minX = Math.min(...xs) - 1
  let maxX = Math.max(...xs) + 1
  let minY = Math.min(...ys) - 1
  let maxY = Math.max(...ys) + 1
  if (minX === maxX) { minX -= 1; maxX += 1 }
  if (minY === maxY) { minY -= 1; maxY += 1 }
  const spanX = maxX - minX
  const spanY = maxY - minY
  const sx = (x: number) => mgn + ((x - minX) / spanX) * (Wp - 2 * mgn)
  const sy = (y: number) => Hp - mgn - ((y - minY) / spanY) * (Hp - 2 * mgn)
  const ox = sx(0)
  const oy = sy(0)

  const dotFill = (idx: number): string =>
    idx === f.popped ? C.signal : idx === f.curr ? C.trace : f.kept.includes(idx) ? C.go : '#FBF9F3'
  const dotText = (idx: number): string =>
    idx === f.popped || idx === f.curr || f.kept.includes(idx) ? C.paper : C.ink

  const rowStyle = (tag: Tag): React.CSSProperties => {
    const map: Record<Tag, { bg: string; bd: string; fg: string }> = {
      curr: { bg: C.trace, bd: C.trace, fg: C.paper },
      kept: { bg: '#DDE8DC', bd: C.go, fg: C.ink },
      result: { bg: C.go, bd: C.go, fg: C.paper },
      pop: { bg: '#E9B7AE', bd: C.signal, fg: C.ink },
      dim: { bg: C.paper, bd: C.wire, fg: C.ink },
    }
    const s = map[tag]
    return {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 8,
      fontFamily: MONO,
      fontSize: 12.5,
      fontWeight: 700,
      padding: '6px 10px',
      borderRadius: 4,
      background: s.bg,
      border: `1.5px solid ${s.bd}`,
      color: s.fg,
      textDecoration: tag === 'pop' ? 'line-through' : 'none',
    }
  }

  const panelLabel = mode === 'sort' ? 'points · squared distance' : 'heap (farthest on top)'

  return (
    <div>
      <style>{`.kc-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .kc-btn:active{transform:translateY(1px)} .kc-btn:disabled{opacity:.35;cursor:not-allowed}
        .kc-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>points =</label>
          <input
            value={pointsText}
            spellCheck={false}
            placeholder="[[1,3],[-2,2]]"
            onChange={(e) => changePoints(e.target.value)}
            style={{ ...inputStyle, minWidth: 200, flex: 1 }}
          />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>k =</label>
          <input value={kText} spellCheck={false} onChange={(e) => changeK(e.target.value)} style={{ ...inputStyle, width: 52 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = pointsText.replace(/\s/g, '') === p.points.replace(/\s/g, '') && kText === p.k
            return (
              <button
                key={p.name}
                className="kc-btn"
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
          Distance to the origin (0,0). We compare squared distance d = x² + y² (no square root needed).
        </div>
      </div>

      {/* Approach toggle */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>approach:</span>
        {(['sort', 'heap'] as Mode[]).map((m) => {
          const active = mode === m
          return (
            <button
              key={m}
              className="kc-btn"
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
              {m === 'sort' ? 'Sort · O(n log n)' : 'Heap · O(n log k)'}
            </button>
          )
        })}
      </div>

      {/* TOP: scatter + data panel */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, marginBottom: 12, alignItems: 'start' }}>
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 4 }}>
            plane
          </div>
          <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 6 }}>
            <svg viewBox={`0 0 ${Wp} ${Hp}`} width="100%" style={{ display: 'block' }}>
              {/* axes */}
              <line x1={mgn / 2} y1={oy} x2={Wp - mgn / 2} y2={oy} stroke={C.wire} strokeWidth={1} />
              <line x1={ox} y1={mgn / 2} x2={ox} y2={Hp - mgn / 2} stroke={C.wire} strokeWidth={1} />
              {/* distance lines from origin */}
              {points.map(([x, y], idx) => {
                const show = idx === f.curr || f.kept.includes(idx) || idx === f.popped
                if (!show) return null
                const hot = idx === f.curr || idx === f.popped
                return (
                  <line
                    key={`l-${idx}`}
                    x1={ox}
                    y1={oy}
                    x2={sx(x)}
                    y2={sy(y)}
                    stroke={idx === f.popped ? C.signal : idx === f.curr ? C.trace : C.go}
                    strokeWidth={hot ? 2 : 1.2}
                    strokeDasharray={hot ? '0' : '3 3'}
                    opacity={0.8}
                  />
                )
              })}
              {/* origin */}
              <circle cx={ox} cy={oy} r={4} fill={C.ink} />
              <text x={ox + 7} y={oy + 14} fontFamily={MONO} fontSize="10" fill={C.slate}>
                0,0
              </text>
              {/* points */}
              {points.map(([x, y], idx) => (
                <g key={idx}>
                  <circle cx={sx(x)} cy={sy(y)} r={13} fill={dotFill(idx)} stroke={C.ink} strokeWidth={1.5} />
                  <text x={sx(x)} y={sy(y) + 4} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="12" fill={dotText(idx)}>
                    {idx}
                  </text>
                </g>
              ))}
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
            <Swatch color={C.trace} label="current" />
            <Swatch color={C.go} label="kept (closest)" />
            {mode === 'heap' && <Swatch color={C.signal} label="removed (farthest)" />}
          </div>
        </div>

        {/* data panel */}
        <div>
          <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 4 }}>
            {panelLabel}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minHeight: 120 }}>
            {f.rows.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
            ) : (
              f.rows.map((row) => (
                <div key={row.idx} style={rowStyle(row.tag)}>
                  <span>
                    #{row.idx} ({row.x}, {row.y})
                  </span>
                  <span>d = {row.d}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* BOTTOM: code+controls (left) | narration (right) */}
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
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10, lineHeight: '1.8', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
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
            <button className="kc-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="kc-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="kc-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="kc-btn"
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
            {atEnd && (
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.go, marginTop: 10 }}>
                answer:{' '}
                {f.rows.filter((r) => r.tag === 'result').length > 0
                  ? f.rows.filter((r) => r.tag === 'result').map((r) => `(${r.x},${r.y})`).join('  ')
                  : f.kept.map((idx) => `(${points[idx][0]},${points[idx][1]})`).join('  ')}
              </div>
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
