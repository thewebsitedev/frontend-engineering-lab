'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; nums: string }[] = [
  { name: 'classic', nums: '[10,9,2,5,3,7,101,18]' },
  { name: 'increasing', nums: '[1,2,3,4]' },
  { name: 'decreasing', nums: '[5,4,3,2,1]' },
  { name: 'all equal', nums: '[7,7,7,7]' },
]

function parseNums(text: string): number[] {
  const m = text.match(/-?\d+/g)
  return (m ? m.map(Number) : []).slice(0, 8)
}

const CODE = [
  { ln: 1, t: 'function lengthOfLIS(nums) {' },
  { ln: 2, t: '  const n = nums.length;' },
  { ln: 3, t: '  const dp = new Array(n).fill(1);' },
  { ln: 4, t: '  let best = 1;' },
  { ln: 5, t: '  for (let i = 1; i < n; i++) {' },
  { ln: 6, t: '    for (let j = 0; j < i; j++) {' },
  { ln: 7, t: '      if (nums[j] < nums[i]) {' },
  { ln: 8, t: '        dp[i] = Math.max(dp[i], dp[j] + 1);' },
  { ln: 9, t: '      }' },
  { ln: 10, t: '    }' },
  { ln: 11, t: '    best = Math.max(best, dp[i]);' },
  { ln: 12, t: '  }' },
  { ln: 13, t: '  return best;' },
  { ln: 14, t: '}' },
]

type Frame = {
  kind: string
  line: number
  dp: number[]
  i: number | null
  j: number | null
  best: number
  updated: boolean
  result: number | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(nums: number[]): Frame[] {
  const n = nums.length
  const frames: Frame[] = []
  const dp = new Array(n).fill(1)
  let best = n > 0 ? 1 : 0
  let updated = false
  const CAP = 500

  const push = (kind: string, line: number, iCur: number | null, jCur: number | null, result: number | null, title: string, note: string, vars: [string, string][] = []) => {
    if (frames.length >= CAP) return
    frames.push({ kind, line, dp: [...dp], i: iCur, j: jCur, best, updated, result, title, note, vars })
  }

  if (n === 0) {
    push('done', 13, null, null, 0, 'Empty array', 'No elements, so the longest increasing subsequence has length 0.', [['best', '0']])
    return frames
  }

  push('init', 3, null, null, null, 'dp[i] = LIS ending at i', 'dp[i] is the length of the longest increasing subsequence that ENDS at index i. Every element alone is a subsequence of length 1, so start all at 1.', [['dp', `[${dp.join(', ')}]`]])
  push('init', 4, null, null, null, 'best = 1', 'Track the longest dp value seen.', [['best', '1']])

  for (let i = 1; i < n; i++) {
    push('i', 5, i, null, null, `Extend to nums[${i}] = ${nums[i]}`, `Look at every earlier element to see which ones ${nums[i]} can be appended to.`, [['i', String(i)], ['nums[i]', String(nums[i])]])
    for (let j = 0; j < i; j++) {
      const smaller = nums[j] < nums[i]
      const cand = dp[j] + 1
      updated = smaller && cand > dp[i]
      push('cmp', 7, i, j, null, smaller ? `${nums[j]} < ${nums[i]} ✓` : `${nums[j]} ≥ ${nums[i]} ✗`, smaller
        ? `${nums[j]} is smaller, so the subsequence ending at ${j} (length ${dp[j]}) can be extended by ${nums[i]} → candidate ${cand}. ${updated ? `That beats dp[${i}] = ${dp[i]} → update.` : `Not better than dp[${i}] = ${dp[i]}.`}`
        : `${nums[j]} is not smaller than ${nums[i]}, so ${nums[i]} can’t extend that subsequence. Skip.`, [['nums[j]', String(nums[j])], ['dp[j]+1', String(cand)]])
      if (updated) {
        dp[i] = cand
        push('set', 8, i, j, null, `dp[${i}] = ${dp[i]}`, `The best subsequence ending at ${i} now has length ${dp[i]}.`, [['dp[i]', String(dp[i])]])
        updated = false
      }
    }
    const improved = dp[i] > best
    if (improved) best = dp[i]
    push('best', 11, i, null, null, improved ? `New best: ${best}` : `Best stays ${best}`, `dp[${i}] = ${dp[i]}. ${improved ? `That is the longest so far → best = ${best}.` : `best remains ${best}.`}`, [['best', String(best)]])
  }

  push('done', 13, null, null, best, `Answer: ${best}`, `The longest increasing subsequence has length ${best}.`, [['best', String(best)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'set' || kind === 'best' || kind === 'done'
    ? C.go
    : kind === 'cmp' || kind === 'i'
      ? C.trace
      : C.ink

export default function LongestIncreasingViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)

  const nums = useMemo(() => parseNums(numsText), [numsText])
  const frames = useMemo(() => buildFrames(nums), [nums])
  const [i, setI] = useState(0)

  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 44))
    setI(0)
  }, [])
  const applyPreset = useCallback((nums: string) => {
    setNumsText(nums)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const colorsFor = (idx: number): { bg: string; fg: string; bd: string } => {
    if (idx === f.i) return { bg: C.signal, fg: C.paper, bd: C.signal }
    if (idx === f.j) return { bg: C.trace, fg: C.paper, bd: C.trace }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
  }

  const cell = (value: React.ReactNode, colors: { bg: string; fg: string; bd: string }) => (
    <div style={{ minWidth: 44, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 15, borderRadius: 6, background: colors.bg, color: colors.fg, border: `2px solid ${colors.bd}`, padding: '0 5px' }}>{value}</div>
  )

  return (
    <div>
      <style>{`.li-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .li-btn:active{transform:translateY(1px)} .li-btn:disabled{opacity:.35;cursor:not-allowed}
        .li-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input value={numsText} spellCheck={false} placeholder="[10,9,2,5,3,7,101,18]" onChange={(e) => changeNums(e.target.value)} style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText.replace(/\s/g, '') === p.nums.replace(/\s/g, '')
            return (
              <button key={p.name} className="li-btn" onClick={() => applyPreset(p.nums)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Longest strictly increasing subsequence (elements need not be adjacent). dp[i] = best subsequence ending at i.
        </div>
      </div>

      {/* TOP: nums + dp */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 50 }}>
          {nums.map((_, idx) => (
            <div key={idx} style={{ minWidth: 44, textAlign: 'center', fontFamily: MONO, fontSize: 10, fontWeight: 700, color: idx === f.i ? C.signal : idx === f.j ? C.trace : C.slate }}>
              {idx === f.i ? 'i' : idx === f.j ? 'j' : idx}
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <div style={{ width: 42, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>nums</div>
          {nums.map((v, idx) => cell(v, colorsFor(idx)))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 42, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>dp</div>
          {f.dp.map((v, idx) => cell(v, idx === f.i ? { bg: C.go, fg: C.paper, bd: C.go } : { bg: '#DDE8DC', fg: C.ink, bd: C.go }))}
        </div>

        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 6, border: `2px solid ${C.go}`, background: C.go, color: C.paper }}>best = {f.best}</span>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate }}>
            <Swatch color={C.signal} label="i (extending)" />
            <Swatch color={C.trace} label="j (candidate tail)" />
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
            <button className="li-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="li-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="li-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="li-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && f.result != null && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.go, marginTop: 10 }}>return {f.result}</div>}
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
