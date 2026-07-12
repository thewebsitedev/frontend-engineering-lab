'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; height: string }[] = [
  { name: 'classic', height: '[0,1,0,2,1,0,1,3,2,1,2,1]' },
  { name: 'valley', height: '[4,2,0,3,2,5]' },
  { name: 'pit', height: '[3,0,3]' },
  { name: 'no water', height: '[5,4,3,2,1]' },
]

function parseHeights(text: string): number[] {
  const m = text.match(/\d+/g)
  return (m ? m.map(Number) : []).slice(0, 12)
}

const CODE = [
  { ln: 1, t: 'function trap(height) {' },
  { ln: 2, t: '  let left = 0, right = height.length - 1;' },
  { ln: 3, t: '  let leftMax = 0, rightMax = 0;' },
  { ln: 4, t: '  let water = 0;' },
  { ln: 5, t: '  while (left < right) {' },
  { ln: 6, t: '    if (height[left] < height[right]) {' },
  { ln: 7, t: '      leftMax = Math.max(leftMax, height[left]);' },
  { ln: 8, t: '      water += leftMax - height[left];' },
  { ln: 9, t: '      left++;' },
  { ln: 10, t: '    } else {' },
  { ln: 11, t: '      rightMax = Math.max(rightMax, height[right]);' },
  { ln: 12, t: '      water += rightMax - height[right];' },
  { ln: 13, t: '      right--;' },
  { ln: 14, t: '    }' },
  { ln: 15, t: '  }' },
  { ln: 16, t: '  return water;' },
  { ln: 17, t: '}' },
]

type Frame = {
  kind: string
  line: number
  left: number
  right: number
  leftMax: number
  rightMax: number
  water: number
  filled: number[]
  side: 'left' | 'right' | null
  added: number | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(height: number[]): Frame[] {
  const n = height.length
  const frames: Frame[] = []
  let left = 0
  let right = n - 1
  let leftMax = 0
  let rightMax = 0
  let water = 0
  const filled = new Array(n).fill(0)
  let side: 'left' | 'right' | null = null
  let added: number | null = null

  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, title, note, vars, left, right, leftMax, rightMax, water, filled: [...filled], side, added })

  if (n < 3) {
    push('done', 16, 'No room for water', 'Fewer than 3 bars can’t trap anything. Return 0.', [['water', '0']])
    return frames
  }

  push('init', 2, 'Pointers at both ends', 'Walk inward from both sides.', [['left', '0'], ['right', String(n - 1)]])
  push('init', 3, 'leftMax = rightMax = 0', 'Track the tallest wall seen so far from each side — that is the ceiling that holds water.', [['leftMax', '0'], ['rightMax', '0']])
  push('init', 4, 'water = 0', 'Total trapped water.', [['water', '0']])

  while (left < right) {
    side = null
    added = null
    push('compare', 6, `Compare ${height[left]} vs ${height[right]}`, `Whichever side is SHORTER limits the water, so we can safely resolve that column now. height[left]=${height[left]}, height[right]=${height[right]}.`, [['left', String(left)], ['right', String(right)]])

    if (height[left] < height[right]) {
      side = 'left'
      const newMax = Math.max(leftMax, height[left])
      push('max', 7, `leftMax = ${newMax}`, `${newMax > leftMax ? `A new tallest left wall: leftMax = ${newMax}.` : `Still leftMax = ${leftMax} (current bar ${height[left]} is not taller).`}`, [['leftMax', String(newMax)]])
      leftMax = newMax
      added = leftMax - height[left]
      water += added
      filled[left] = added
      push('fill', 8, added > 0 ? `Trap ${added} here` : 'No water here', `Water above column ${left} = leftMax − height = ${leftMax} − ${height[left]} = ${added}. water = ${water}.`, [['+water', String(added)], ['water', String(water)]])
      push('move', 9, 'left++', 'The left column is settled; step inward.', [['left', `${left} → ${left + 1}`]])
      left++
    } else {
      side = 'right'
      const newMax = Math.max(rightMax, height[right])
      push('max', 11, `rightMax = ${newMax}`, `${newMax > rightMax ? `A new tallest right wall: rightMax = ${newMax}.` : `Still rightMax = ${rightMax}.`}`, [['rightMax', String(newMax)]])
      rightMax = newMax
      added = rightMax - height[right]
      water += added
      filled[right] = added
      push('fill', 12, added > 0 ? `Trap ${added} here` : 'No water here', `Water above column ${right} = rightMax − height = ${rightMax} − ${height[right]} = ${added}. water = ${water}.`, [['+water', String(added)], ['water', String(water)]])
      push('move', 13, 'right--', 'The right column is settled; step inward.', [['right', `${right} → ${right - 1}`]])
      right--
    }
  }

  side = null
  added = null
  push('done', 16, `Answer: ${water}`, `The pointers met. Total trapped water = ${water}.`, [['water', String(water)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'move'
    ? C.signal
    : kind === 'fill' || kind === 'done'
      ? C.go
      : kind === 'compare' || kind === 'max'
        ? C.trace
        : C.ink

export default function TrappingRainWaterViz() {
  const [heightText, setHeightText] = useState(PRESETS[0].height)

  const height = useMemo(() => parseHeights(heightText), [heightText])
  const frames = useMemo(() => buildFrames(height), [height])
  const [i, setI] = useState(0)

  const changeHeight = useCallback((v: string) => {
    setHeightText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 60))
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

  const n = height.length
  const W = 480
  const H = 230
  const pad = 24
  const base = H - 26
  const plotH = base - 16
  const maxH = Math.max(1, ...height)
  const bw = n > 0 ? (W - 2 * pad) / n : 0
  const xLeft = (idx: number) => pad + idx * bw + Math.min(5, bw * 0.12)
  const barW = Math.max(bw - 2 * Math.min(5, bw * 0.12), 2)
  const xCenter = (idx: number) => pad + idx * bw + bw / 2
  const yTop = (val: number) => base - (val / maxH) * plotH

  return (
    <div>
      <style>{`.tr-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .tr-btn:active{transform:translateY(1px)} .tr-btn:disabled{opacity:.35;cursor:not-allowed}
        .tr-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>height =</label>
          <input value={heightText} spellCheck={false} placeholder="[0,1,0,2,1,0,1,3,2,1,2,1]" onChange={(e) => changeHeight(e.target.value)} style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = heightText.replace(/\s/g, '') === p.height.replace(/\s/g, '')
            return (
              <button key={p.name} className="tr-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Water above each bar is capped by the shorter of the tallest walls to its left and right.
        </div>
      </div>

      {/* TOP: bar chart with water */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
          <line x1={pad} y1={base} x2={W - pad} y2={base} stroke={C.wire} strokeWidth={1} />

          {/* water columns */}
          {f.filled.map((w, idx) =>
            w > 0 ? (
              <rect key={`w${idx}`} x={xLeft(idx)} y={yTop(height[idx] + w)} width={barW} height={yTop(height[idx]) - yTop(height[idx] + w)} fill={C.trace} opacity={0.45} />
            ) : null,
          )}

          {/* bars */}
          {height.map((val, idx) => {
            const isPtr = idx === f.left || idx === f.right
            return (
              <g key={idx}>
                <rect x={xLeft(idx)} y={yTop(val)} width={barW} height={base - yTop(val)} fill={isPtr ? C.signal : '#C9B79A'} stroke={C.ink} strokeWidth={1.2} rx={1.5} />
                <text x={xCenter(idx)} y={base + 12} textAnchor="middle" fontFamily={MONO} fontSize="9" fill={C.slate}>{idx}</text>
                {idx === f.left && f.left < f.right && <text x={xCenter(idx)} y={base + 22} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="700" fill={C.signal}>L</text>}
                {idx === f.right && f.left < f.right && <text x={xCenter(idx)} y={base + 22} textAnchor="middle" fontFamily={MONO} fontSize="10" fontWeight="700" fill={C.signal}>R</text>}
              </g>
            )
          })}

          {/* leftMax / rightMax lines */}
          {f.left < f.right && f.leftMax > 0 && (
            <line x1={pad} y1={yTop(f.leftMax)} x2={xCenter(f.left)} y2={yTop(f.leftMax)} stroke={C.go} strokeWidth={1.5} strokeDasharray="4 3" />
          )}
          {f.left < f.right && f.rightMax > 0 && (
            <line x1={xCenter(f.right)} y1={yTop(f.rightMax)} x2={W - pad} y2={yTop(f.rightMax)} stroke={C.trace} strokeWidth={1.5} strokeDasharray="4 3" />
          )}
        </svg>

        <div style={{ display: 'flex', gap: 18, flexWrap: 'wrap', alignItems: 'center', marginTop: 8 }}>
          <Stat label="leftMax" value={f.leftMax} />
          <Stat label="rightMax" value={f.rightMax} />
          <Stat label="water" value={f.water} accent />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate }}>
            <Swatch color={C.signal} label="pointer" />
            <Swatch color={C.trace} label="water" />
          </div>
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
            <button className="tr-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="tr-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="tr-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="tr-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.go, marginTop: 10 }}>return {f.water}</div>}
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
