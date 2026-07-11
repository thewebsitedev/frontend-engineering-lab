'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; height: string }[] = [
  { name: 'classic', height: '[1,8,6,2,5,4,8,3,7]' },
  { name: 'tall ends', height: '[8,1,1,1,8]' },
  { name: 'ascending', height: '[1,2,3,4,5]' },
  { name: 'pair', height: '[1,1]' },
]

function parseHeights(text: string): number[] {
  const m = text.match(/\d+/g)
  return (m ? m.map(Number) : []).slice(0, 11)
}

const CODE = [
  { ln: 1, t: 'function maxArea(height) {' },
  { ln: 2, t: '  let left = 0, right = height.length - 1;' },
  { ln: 3, t: '  let best = 0;' },
  { ln: 4, t: '  while (left < right) {' },
  { ln: 5, t: '    const h = Math.min(height[left], height[right]);' },
  { ln: 6, t: '    const area = h * (right - left);' },
  { ln: 7, t: '    best = Math.max(best, area);' },
  { ln: 8, t: '    if (height[left] < height[right]) left++;' },
  { ln: 9, t: '    else right--;' },
  { ln: 10, t: '  }' },
  { ln: 11, t: '  return best;' },
  { ln: 12, t: '}' },
]

type Frame = {
  kind: string
  line: number
  left: number
  right: number
  h: number | null
  area: number | null
  best: number
  bestL: number
  bestR: number
  moved: 'left' | 'right' | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(height: number[]): Frame[] {
  const n = height.length
  const frames: Frame[] = []
  let left = 0
  let right = n - 1
  let best = 0
  let bestL = 0
  let bestR = 0
  let h: number | null = null
  let area: number | null = null
  let moved: 'left' | 'right' | null = null

  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, title, note, vars, left, right, h, area, best, bestL, bestR, moved })

  if (n < 2) {
    push('done', 11, 'Not enough walls', 'You need at least two walls to hold water. Return 0.', [['best', '0']])
    return frames
  }

  push('init', 2, 'Pointers at both ends', 'Start with the widest possible container: left at the first wall, right at the last.', [['left', '0'], ['right', String(n - 1)]])
  push('init', 3, 'best = 0', 'Track the largest area found so far.', [['best', '0']])

  while (left < right) {
    moved = null
    push('pick', 4, `Walls ${left} & ${right}`, `Consider the container between wall ${left} (h=${height[left]}) and wall ${right} (h=${height[right]}).`, [['left', String(left)], ['right', String(right)]])

    h = Math.min(height[left], height[right])
    push('h', 5, `height = ${h}`, `Water spills over the SHORTER wall, so the usable height is min(${height[left]}, ${height[right]}) = ${h}.`, [['h', String(h)]])

    area = h * (right - left)
    push('area', 6, `area = ${area}`, `area = height × width = ${h} × (${right} − ${left}) = ${area}.`, [['area', String(area)], ['width', String(right - left)]])

    const improved = area > best
    if (improved) {
      best = area
      bestL = left
      bestR = right
    }
    push('best', 7, improved ? `New best: ${best}` : `Best stays ${best}`, `${improved ? `${area} beats the old best → best = ${best}.` : `${area} ≤ ${best}, so best is unchanged.`}`, [['best', String(best)]])

    if (height[left] < height[right]) {
      moved = 'left'
      push('move', 8, `Move left in`, `The left wall (${height[left]}) is shorter. Moving right would only shrink the width AND keep the same low ceiling, so advance left — the only pointer that could find a taller wall.`, [['left', `${left} → ${left + 1}`]])
      left++
    } else {
      moved = 'right'
      push('move', 9, `Move right in`, `The right wall (${height[right]}) is shorter (or equal). Advance right to look for a taller wall.`, [['right', `${right} → ${right - 1}`]])
      right--
    }
    h = null
    area = null
  }

  moved = null
  push('done', 11, `Answer: ${best}`, `The pointers met. The largest container held ${best} units of water.`, [['best', String(best)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'move'
    ? C.signal
    : kind === 'best' || kind === 'done' || kind === 'area'
      ? C.go
      : kind === 'pick' || kind === 'h'
        ? C.trace
        : C.ink

export default function ContainerWithMostWaterViz() {
  const [heightText, setHeightText] = useState(PRESETS[0].height)

  const height = useMemo(() => parseHeights(heightText), [heightText])
  const frames = useMemo(() => buildFrames(height), [height])
  const [i, setI] = useState(0)

  const changeHeight = useCallback((v: string) => {
    setHeightText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 50))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { height: string }) => {
    setHeightText(p.height)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // bar chart layout
  const n = height.length
  const W = 480
  const H = 230
  const pad = 24
  const base = H - 28
  const plotH = base - 16
  const maxH = Math.max(1, ...height)
  const bw = n > 0 ? (W - 2 * pad) / n : 0
  const xCenter = (idx: number) => pad + idx * bw + bw / 2
  const yTop = (val: number) => base - (val / maxH) * plotH

  const waterActive = f.h != null && f.left < f.right

  return (
    <div>
      <style>{`.cw-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .cw-btn:active{transform:translateY(1px)} .cw-btn:disabled{opacity:.35;cursor:not-allowed}
        .cw-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>height =</label>
          <input value={heightText} spellCheck={false} placeholder="[1,8,6,2,5,4,8,3,7]" onChange={(e) => changeHeight(e.target.value)} style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = heightText.replace(/\s/g, '') === p.height.replace(/\s/g, '')
            return (
              <button key={p.name} className="cw-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Each number is a vertical wall. Pick two to hold the most water: area = min(heights) × distance.
        </div>
      </div>

      {/* TOP: bar chart */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          {/* baseline */}
          <line x1={pad} y1={base} x2={W - pad} y2={base} stroke={C.wire} strokeWidth={1} />

          {/* water rectangle */}
          {waterActive && (
            <rect x={xCenter(f.left)} y={yTop(f.h as number)} width={xCenter(f.right) - xCenter(f.left)} height={base - yTop(f.h as number)} fill={C.trace} opacity={0.25} />
          )}

          {/* bars */}
          {height.map((val, idx) => {
            const isPtr = idx === f.left || idx === f.right
            const x = pad + idx * bw + Math.min(6, bw * 0.15)
            const w = bw - 2 * Math.min(6, bw * 0.15)
            return (
              <g key={idx}>
                <rect x={x} y={yTop(val)} width={Math.max(w, 2)} height={base - yTop(val)} fill={isPtr ? C.signal : '#D9D2C2'} stroke={C.ink} strokeWidth={1.2} rx={2} />
                <text x={xCenter(idx)} y={yTop(val) - 4} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="700" fill={C.ink}>{val}</text>
                <text x={xCenter(idx)} y={base + 12} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={C.slate}>{idx}</text>
                {idx === f.left && <text x={xCenter(idx)} y={base + 23} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="700" fill={C.signal}>{f.left === f.right ? 'L R' : 'L'}</text>}
                {idx === f.right && f.right !== f.left && <text x={xCenter(idx)} y={base + 23} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="700" fill={C.signal}>R</text>}
              </g>
            )
          })}
        </svg>

        {/* stats */}
        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
          <Stat label="area" value={f.area ?? '—'} />
          <Stat label="best" value={f.best} accent />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate }}>
            <Swatch color={C.signal} label="pointer wall" />
            <Swatch color={C.trace} label="water" />
          </div>
        </div>
      </div>

      {/* BOTTOM: code+controls | narration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        <div>
          <div style={{ background: C.codebg, borderRadius: 6, padding: '14px 6px 14px 0', overflowX: 'auto' }}>
            {CODE.map((row) => {
              const active = row.ln === f.line && row.t.trim() !== ''
              return (
                <div key={row.ln} style={{ display: 'flex', background: active ? C.codehl : 'transparent', borderLeft: `3px solid ${active ? C.signal : 'transparent'}` }}>
                  <span style={{ width: 26, textAlign: 'right', paddingRight: 8, color: C.codedim, fontFamily: MONO, fontSize: 11, userSelect: 'none', lineHeight: '1.7' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
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
            <button className="cw-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="cw-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="cw-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="cw-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.go, marginTop: 10 }}>return {f.best}</div>}
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

function Stat({ label, value, accent }: { label: string; value: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700, color: accent ? C.go : C.ink }}>{value}</span>
    </span>
  )
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
  return { fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '11px 18px', background: bg, color: fg, border: border ? `1.5px solid ${C.ink}` : 'none', borderRadius: 4 }
}
