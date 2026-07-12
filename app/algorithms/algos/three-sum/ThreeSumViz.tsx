'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; nums: string }[] = [
  { name: 'classic', nums: '[-1,0,1,2,-1,-4]' },
  { name: 'with dups', nums: '[-2,0,1,1,2]' },
  { name: 'all zeros', nums: '[0,0,0,0]' },
  { name: 'none', nums: '[1,2,3]' },
]

function parseNums(text: string): number[] {
  const m = text.match(/-?\d+/g)
  return (m ? m.map(Number) : []).slice(0, 9)
}

const CODE = [
  { ln: 1, t: 'function threeSum(nums) {' },
  { ln: 2, t: '  nums.sort((a, b) => a - b);' },
  { ln: 3, t: '  const res = [];' },
  { ln: 4, t: '  for (let i = 0; i < nums.length - 2; i++) {' },
  { ln: 5, t: '    if (i > 0 && nums[i] === nums[i-1]) continue;' },
  { ln: 6, t: '    let left = i + 1, right = nums.length - 1;' },
  { ln: 7, t: '    while (left < right) {' },
  { ln: 8, t: '      const sum = nums[i] + nums[left] + nums[right];' },
  { ln: 9, t: '      if (sum < 0) left++;' },
  { ln: 10, t: '      else if (sum > 0) right--;' },
  { ln: 11, t: '      else {' },
  { ln: 12, t: '        res.push([nums[i], nums[left], nums[right]]);' },
  { ln: 13, t: '        left++; right--;' },
  { ln: 14, t: '        while (left<right && nums[left]===nums[left-1]) left++;' },
  { ln: 15, t: '        while (left<right && nums[right]===nums[right+1]) right--;' },
  { ln: 16, t: '      }' },
  { ln: 17, t: '    }' },
  { ln: 18, t: '  }' },
  { ln: 19, t: '  return res;' },
  { ln: 20, t: '}' },
]

type Frame = {
  kind: string
  line: number
  i: number
  left: number
  right: number
  sum: number | null
  skipped: number | null
  justFound: number[] | null
  results: number[][]
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(input: number[]): { frames: Frame[]; nums: number[] } {
  const nums = [...input].sort((a, b) => a - b)
  const n = nums.length
  const frames: Frame[] = []
  const results: number[][] = []
  let i = -1
  let left = -1
  let right = -1
  let sum: number | null = null
  let skipped: number | null = null
  let justFound: number[] | null = null

  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, title, note, vars, i, left, right, sum, skipped, justFound, results: results.map((r) => [...r]) })

  push('init', 2, 'Sort the array', `Sorting lets us sweep two pointers instead of a nested search. Sorted: [${nums.join(', ')}].`, [['nums', `[${nums.join(', ')}]`]])
  push('init', 3, 'res = []', 'Collect the unique triplets that sum to 0.', [['res', '[]']])

  if (n < 3) {
    push('done', 19, 'Too few numbers', 'Need at least 3 numbers. Return [].', [['res', '[]']])
    return { frames, nums }
  }

  for (i = 0; i < n - 2; i++) {
    left = -1
    right = -1
    sum = null
    skipped = null
    justFound = null
    push('anchor', 4, `Anchor i = ${i} (${nums[i]})`, `Fix nums[${i}] = ${nums[i]}. Now look for two more numbers after it that make the total 0.`, [['i', String(i)], ['nums[i]', String(nums[i])]])

    if (i > 0 && nums[i] === nums[i - 1]) {
      skipped = i
      push('skip', 5, `Skip duplicate anchor`, `nums[${i}] = ${nums[i]} equals the previous anchor, so it would only reproduce triplets we already found. Skip it.`, [['nums[i-1]', String(nums[i - 1])]])
      skipped = null
      continue
    }

    left = i + 1
    right = n - 1
    push('set', 6, `left = ${left}, right = ${right}`, `Two pointers bracket the rest of the array: left just after the anchor, right at the end.`, [['left', String(left)], ['right', String(right)]])

    while (left < right) {
      sum = nums[i] + nums[left] + nums[right]
      push('sum', 8, `sum = ${sum}`, `nums[${i}] + nums[${left}] + nums[${right}] = ${nums[i]} + ${nums[left]} + ${nums[right]} = ${sum}.`, [['sum', String(sum)]])

      if (sum < 0) {
        push('move', 9, 'sum < 0 → move left in', `The total is too small. Since the array is sorted, the only way to increase it is a bigger left number → left++.`, [['left', `${left} → ${left + 1}`]])
        left++
      } else if (sum > 0) {
        push('move', 10, 'sum > 0 → move right in', `The total is too big. Decrease it with a smaller right number → right--.`, [['right', `${right} → ${right - 1}`]])
        right--
      } else {
        const triplet = [nums[i], nums[left], nums[right]]
        results.push(triplet)
        justFound = triplet
        push('found', 12, `Found: [${triplet.join(', ')}]`, `The three add up to 0 — record the triplet.`, [['res.length', String(results.length)]])
        justFound = null
        push('move', 13, 'Move both pointers in', 'Both pointers step inward to look for another pair.', [['left', `${left} → ${left + 1}`], ['right', `${right} → ${right - 1}`]])
        left++
        right--
        while (left < right && nums[left] === nums[left - 1]) {
          skipped = left
          push('skip', 14, `Skip duplicate left (${nums[left]})`, `nums[${left}] repeats the value we just used — it would give the same triplet. Skip.`, [['left', `${left} → ${left + 1}`]])
          skipped = null
          left++
        }
        while (left < right && nums[right] === nums[right + 1]) {
          skipped = right
          push('skip', 15, `Skip duplicate right (${nums[right]})`, `nums[${right}] repeats the value we just used. Skip.`, [['right', `${right} → ${right - 1}`]])
          skipped = null
          right--
        }
      }
    }
  }

  i = -1
  left = -1
  right = -1
  sum = null
  push('done', 19, `Found ${results.length} triplet${results.length === 1 ? '' : 's'}`, results.length ? `Return ${results.map((r) => `[${r.join(',')}]`).join(', ')}.` : 'No triplet sums to 0. Return [].', [['res.length', String(results.length)]])
  return { frames, nums }
}

const kindColor = (kind: string): string =>
  kind === 'skip'
    ? C.signal
    : kind === 'found' || kind === 'done'
      ? C.go
      : kind === 'move' || kind === 'sum' || kind === 'set'
        ? C.trace
        : C.ink

export default function ThreeSumViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)

  const nums0 = useMemo(() => parseNums(numsText), [numsText])
  const { frames, nums } = useMemo(() => buildFrames(nums0), [nums0])
  const [i, setI] = useState(0)

  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 50))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { nums: string }) => {
    setNumsText(p.nums)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const chipColor = (idx: number): { bg: string; fg: string; bd: string } => {
    if (idx === f.skipped) return { bg: '#E9B7AE', fg: C.ink, bd: C.signal }
    if (idx === f.i) return { bg: C.ink, fg: C.paper, bd: C.ink }
    if (idx === f.left) return { bg: C.trace, fg: C.paper, bd: C.trace }
    if (idx === f.right) return { bg: C.signal, fg: C.paper, bd: C.signal }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
  }

  return (
    <div>
      <style>{`.ts-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .ts-btn:active{transform:translateY(1px)} .ts-btn:disabled{opacity:.35;cursor:not-allowed}
        .ts-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input value={numsText} spellCheck={false} placeholder="[-1,0,1,2,-1,-4]" onChange={(e) => changeNums(e.target.value)} style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText.replace(/\s/g, '') === p.nums.replace(/\s/g, '')
            return (
              <button key={p.name} className="ts-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Find every unique triplet that sums to 0. Sort, then fix an anchor and sweep two pointers.
        </div>
      </div>

      {/* TOP: array + results */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>sorted nums</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 46, alignItems: 'flex-end' }}>
          {nums.map((v, idx) => {
            const cc = chipColor(idx)
            const tag = idx === f.i ? 'i' : idx === f.left ? 'L' : idx === f.right ? 'R' : ''
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                <div style={{ minWidth: 40, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 15, borderRadius: 6, background: cc.bg, color: cc.fg, border: `2px solid ${cc.bd}`, padding: '0 6px' }}>{v}</div>
                <span style={{ fontFamily: MONO, fontSize: 10, fontWeight: 700, color: tag === 'i' ? C.ink : tag === 'L' ? C.trace : tag === 'R' ? C.signal : 'transparent' }}>{tag || '·'}</span>
              </div>
            )
          })}
        </div>

        {/* sum equation */}
        <div style={{ marginTop: 12, fontFamily: MONO, fontSize: 14, minHeight: 24 }}>
          {f.sum != null && f.i >= 0 && f.left >= 0 && f.right >= 0 ? (
            <span>
              <span style={{ color: C.ink, fontWeight: 700 }}>{nums[f.i]}</span> + <span style={{ color: C.trace, fontWeight: 700 }}>{nums[f.left]}</span> + <span style={{ color: C.signal, fontWeight: 700 }}>{nums[f.right]}</span> ={' '}
              <span style={{ fontWeight: 700, color: f.sum === 0 ? C.go : C.slate }}>{f.sum}</span>
              <span style={{ color: C.slate }}> {f.sum === 0 ? '(= 0 ✓)' : f.sum < 0 ? '(< 0)' : '(> 0)'}</span>
            </span>
          ) : (
            <span style={{ color: C.slate }}>—</span>
          )}
        </div>

        {/* results */}
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, margin: '12px 0 6px' }}>triplets found</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 34, alignItems: 'center' }}>
          {f.results.length === 0 ? (
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(none yet)</span>
          ) : (
            f.results.map((r, ri) => {
              const isNew = f.justFound && r.join(',') === f.justFound.join(',') && ri === f.results.length - 1
              return (
                <span key={ri} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, padding: '5px 10px', borderRadius: 4, border: `1.5px solid ${C.go}`, background: isNew ? C.go : '#DDE8DC', color: isNew ? C.paper : C.ink }}>
                  [{r.join(', ')}]
                </span>
              )
            })
          )}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 14 }}>
          <Swatch color={C.ink} label="anchor i" />
          <Swatch color={C.trace} label="left" />
          <Swatch color={C.signal} label="right" />
          <Swatch color="#E9B7AE" label="skipped dup" />
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
            <button className="ts-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="ts-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="ts-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="ts-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
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
  return { fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '11px 18px', background: bg, color: fg, border: border ? `1.5px solid ${C.ink}` : 'none', borderRadius: 4 }
}
