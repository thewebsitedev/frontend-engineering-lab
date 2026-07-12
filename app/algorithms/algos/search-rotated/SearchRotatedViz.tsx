'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; nums: string; target: string }[] = [
  { name: 'find 0', nums: '[4,5,6,7,0,1,2]', target: '0' },
  { name: 'miss 3', nums: '[4,5,6,7,0,1,2]', target: '3' },
  { name: 'no rotation', nums: '[1,2,3,4,5,6]', target: '5' },
  { name: 'find 6', nums: '[6,7,8,1,2,3,4,5]', target: '6' },
]

function parseNums(text: string): number[] {
  const m = text.match(/-?\d+/g)
  return (m ? m.map(Number) : []).slice(0, 12)
}

const CODE = [
  { ln: 1, t: 'function search(nums, target) {' },
  { ln: 2, t: '  let lo = 0, hi = nums.length - 1;' },
  { ln: 3, t: '  while (lo <= hi) {' },
  { ln: 4, t: '    const mid = (lo + hi) >> 1;' },
  { ln: 5, t: '    if (nums[mid] === target) return mid;' },
  { ln: 6, t: '    if (nums[lo] <= nums[mid]) {          // left sorted' },
  { ln: 7, t: '      if (nums[lo] <= target && target < nums[mid]) hi = mid - 1;' },
  { ln: 8, t: '      else lo = mid + 1;' },
  { ln: 9, t: '    } else {                              // right sorted' },
  { ln: 10, t: '      if (nums[mid] < target && target <= nums[hi]) lo = mid + 1;' },
  { ln: 11, t: '      else hi = mid - 1;' },
  { ln: 12, t: '    }' },
  { ln: 13, t: '  }' },
  { ln: 14, t: '  return -1;' },
  { ln: 15, t: '}' },
]

type Frame = {
  kind: string
  line: number
  lo: number
  hi: number
  mid: number | null
  sortedHalf: 'left' | 'right' | null
  found: number | null
  result: number | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(nums: number[], target: number): Frame[] {
  const frames: Frame[] = []
  let lo = 0
  let hi = nums.length - 1
  let mid: number | null = null
  let sortedHalf: 'left' | 'right' | null = null

  const push = (kind: string, line: number, result: number | null, title: string, note: string, vars: [string, string][] = [], found: number | null = null) =>
    frames.push({ kind, line, lo, hi, mid, sortedHalf, found, result, title, note, vars })

  if (nums.length === 0) {
    push('done', 14, -1, 'Empty array', 'Nothing to search. Return −1.', [['result', '-1']])
    return frames
  }

  push('init', 2, null, `Search window [0, ${hi}]`, `Binary search still works on a rotated array — one half is always properly sorted. Look for target = ${target}.`, [['lo', '0'], ['hi', String(hi)], ['target', String(target)]])

  while (lo <= hi) {
    mid = (lo + hi) >> 1
    sortedHalf = null
    push('mid', 4, null, `mid = ${mid} (nums[mid] = ${nums[mid]})`, `Check the middle of the current window.`, [['mid', String(mid)], ['nums[mid]', String(nums[mid])]])

    if (nums[mid] === target) {
      push('found', 5, mid, `Found ${target} at index ${mid}!`, `nums[${mid}] equals the target. Return ${mid}.`, [['return', String(mid)]], mid)
      return frames
    }

    if (nums[lo] <= nums[mid]) {
      sortedHalf = 'left'
      push('half', 6, null, 'Left half is sorted', `nums[lo]=${nums[lo]} ≤ nums[mid]=${nums[mid]}, so [lo..mid] is in order. We can test the target against that clean range.`, [['nums[lo]', String(nums[lo])], ['nums[mid]', String(nums[mid])]])
      if (nums[lo] <= target && target < nums[mid]) {
        push('move', 7, null, `Target is in the left half`, `${nums[lo]} ≤ ${target} < ${nums[mid]}, so discard the right side → hi = ${mid - 1}.`, [['hi', `${hi} → ${mid - 1}`]])
        hi = mid - 1
      } else {
        push('move', 8, null, `Target is not in the left half`, `${target} is outside [${nums[lo]}, ${nums[mid]}), so it must be on the right → lo = ${mid + 1}.`, [['lo', `${lo} → ${mid + 1}`]])
        lo = mid + 1
      }
    } else {
      sortedHalf = 'right'
      push('half', 9, null, 'Right half is sorted', `nums[lo]=${nums[lo]} > nums[mid]=${nums[mid]}, so the rotation is on the left; [mid..hi] is in order.`, [['nums[mid]', String(nums[mid])], ['nums[hi]', String(nums[hi])]])
      if (nums[mid] < target && target <= nums[hi]) {
        push('move', 10, null, `Target is in the right half`, `${nums[mid]} < ${target} ≤ ${nums[hi]}, so discard the left side → lo = ${mid + 1}.`, [['lo', `${lo} → ${mid + 1}`]])
        lo = mid + 1
      } else {
        push('move', 11, null, `Target is not in the right half`, `${target} is outside (${nums[mid]}, ${nums[hi]}], so it must be on the left → hi = ${mid - 1}.`, [['hi', `${hi} → ${mid - 1}`]])
        hi = mid - 1
      }
    }
    mid = null
  }

  mid = null
  sortedHalf = null
  push('done', 14, -1, `${target} not found`, `The window is empty (lo > hi). The target isn’t here. Return −1.`, [['result', '-1']])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'found'
    ? C.go
    : kind === 'move' || kind === 'half'
      ? C.trace
      : kind === 'done'
        ? C.signal
        : kind === 'mid'
          ? C.signal
          : C.ink

export default function SearchRotatedViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)
  const [targetText, setTargetText] = useState(PRESETS[0].target)

  const nums = useMemo(() => parseNums(numsText), [numsText])
  const target = Number(targetText) || 0
  const frames = useMemo(() => buildFrames(nums, target), [nums, target])
  const [i, setI] = useState(0)

  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 60))
    setI(0)
  }, [])
  const changeTarget = useCallback((v: string) => {
    setTargetText(v.replace(/[^0-9-]/g, '').slice(0, 4))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { nums: string; target: string }) => {
    setNumsText(p.nums)
    setTargetText(p.target)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const inRange = (idx: number) => idx >= f.lo && idx <= f.hi
  const inSorted = (idx: number) => {
    if (f.sortedHalf === 'left' && f.mid != null) return idx >= f.lo && idx <= f.mid
    if (f.sortedHalf === 'right' && f.mid != null) return idx >= f.mid && idx <= f.hi
    return false
  }
  const cellColors = (idx: number): { bg: string; fg: string; bd: string } => {
    if (idx === f.found) return { bg: C.go, fg: C.paper, bd: C.go }
    if (idx === f.mid) return { bg: C.signal, fg: C.paper, bd: C.signal }
    if (!inRange(idx)) return { bg: '#EFEBDF', fg: C.slate, bd: C.wire }
    if (inSorted(idx)) return { bg: '#DDE8DC', fg: C.ink, bd: C.go }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
  }

  return (
    <div>
      <style>{`.sr-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .sr-btn:active{transform:translateY(1px)} .sr-btn:disabled{opacity:.35;cursor:not-allowed}
        .sr-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input value={numsText} spellCheck={false} placeholder="[4,5,6,7,0,1,2]" onChange={(e) => changeNums(e.target.value)} style={{ ...inputStyle, minWidth: 200, flex: 1 }} />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>target =</label>
          <input value={targetText} spellCheck={false} onChange={(e) => changeTarget(e.target.value)} style={{ ...inputStyle, width: 62 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText.replace(/\s/g, '') === p.nums.replace(/\s/g, '') && targetText === p.target
            return (
              <button key={p.name} className="sr-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          A sorted array rotated at some pivot. Each step, one half of [lo, hi] is still sorted — use it to decide which half to keep.
        </div>
      </div>

      {/* TOP: array */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {nums.map((_, idx) => (
            <div key={idx} style={{ width: 38, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: C.slate }}>{idx}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {nums.map((v, idx) => {
            const cc = cellColors(idx)
            return (
              <div key={idx} style={{ width: 38, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 15, borderRadius: 6, background: cc.bg, color: cc.fg, border: `2px solid ${cc.bd}` }}>{v}</div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {nums.map((_, idx) => {
            const labels = [idx === f.lo && 'lo', idx === f.mid && 'mid', idx === f.hi && 'hi'].filter(Boolean)
            return (
              <div key={idx} style={{ width: 38, textAlign: 'center', fontFamily: MONO, fontSize: 10, fontWeight: 700, color: idx === f.mid ? C.signal : C.trace }}>{labels.length ? labels.join('/') : '·'}</div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 12 }}>
          <Stat label="target" value={target} />
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate }}>
            <Swatch color={C.signal} label="mid" />
            <Swatch color="#DDE8DC" label="sorted half" bd={C.go} />
            <Swatch color="#EFEBDF" label="discarded" bd={C.wire} />
            <Swatch color={C.go} label="found" />
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
                  <span style={{ width: 26, textAlign: 'right', paddingRight: 8, color: C.codedim, fontFamily: MONO, fontSize: 10.5, userSelect: 'none', lineHeight: '1.65' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 9.5, lineHeight: '1.65', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.65' }}>◄</span>}
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
            <button className="sr-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="sr-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="sr-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="sr-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && f.result != null && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: f.result >= 0 ? C.go : C.signal, marginTop: 10 }}>return {f.result}</div>}
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

function Stat({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column' }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700 }}>{value}</span>
    </span>
  )
}

function Swatch({ color, label, bd }: { color: string; label: string; bd?: string }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 14, height: 14, borderRadius: 4, background: color, border: `1.5px solid ${bd ?? C.ink}` }} />
      {label}
    </span>
  )
}

function btn(bg: string, fg: string, border?: boolean): React.CSSProperties {
  return { fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '11px 18px', background: bg, color: fg, border: border ? `1.5px solid ${C.ink}` : 'none', borderRadius: 4 }
}
