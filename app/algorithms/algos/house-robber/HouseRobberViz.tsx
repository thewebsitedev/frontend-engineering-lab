'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; nums: string }[] = [
  { name: 'classic', nums: '[1,2,3,1]' },
  { name: 'bigger', nums: '[2,7,9,3,1]' },
  { name: 'ascending', nums: '[1,2,3,4,5]' },
  { name: 'single', nums: '[5]' },
]

function parseNums(text: string): number[] {
  const m = text.match(/\d+/g)
  return (m ? m.map(Number) : []).slice(0, 8)
}

const CODE = [
  { ln: 1, t: 'function rob(nums) {' },
  { ln: 2, t: '  const n = nums.length;' },
  { ln: 3, t: '  if (n === 0) return 0;' },
  { ln: 4, t: '  const dp = new Array(n).fill(0);' },
  { ln: 5, t: '  dp[0] = nums[0];' },
  { ln: 6, t: '  for (let i = 1; i < n; i++) {' },
  { ln: 7, t: '    const rob  = (i >= 2 ? dp[i-2] : 0) + nums[i];' },
  { ln: 8, t: '    const skip = dp[i-1];' },
  { ln: 9, t: '    dp[i] = Math.max(rob, skip);' },
  { ln: 10, t: '  }' },
  { ln: 11, t: '  return dp[n-1];' },
  { ln: 12, t: '}' },
]

type Frame = {
  kind: string
  line: number
  dp: (number | null)[]
  i: number | null
  robOpt: number | null
  skipOpt: number | null
  chose: 'rob' | 'skip' | null
  result: number | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(nums: number[]): Frame[] {
  const n = nums.length
  const frames: Frame[] = []
  const dp: (number | null)[] = new Array(n).fill(null)
  let robOpt: number | null = null
  let skipOpt: number | null = null
  let chose: 'rob' | 'skip' | null = null

  const push = (kind: string, line: number, iCur: number | null, result: number | null, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, dp: [...dp], i: iCur, robOpt, skipOpt, chose, result, title, note, vars })

  if (n === 0) {
    push('done', 3, null, 0, 'No houses', 'Nothing to rob. Return 0.', [['result', '0']])
    return frames
  }

  push('init', 4, null, null, 'dp[i] = best loot through house i', 'dp[i] is the most money robbable from houses 0..i without triggering two adjacent alarms.', [])
  dp[0] = nums[0]
  push('base', 5, 0, null, `dp[0] = ${nums[0]}`, `With only the first house, the best you can do is rob it: dp[0] = ${nums[0]}.`, [['dp[0]', String(nums[0])]])

  for (let i = 1; i < n; i++) {
    robOpt = (i >= 2 ? dp[i - 2]! : 0) + nums[i]
    push('rob', 7, i, null, `Rob house ${i}: ${robOpt}`, `If you rob house ${i} (value ${nums[i]}) you must skip ${i - 1}, so add it to dp[${i - 2}] ${i >= 2 ? `= ${dp[i - 2]}` : '(nothing before)'} → ${robOpt}.`, [['rob', String(robOpt)]])
    skipOpt = dp[i - 1]!
    push('skip', 8, i, null, `Skip house ${i}: ${skipOpt}`, `If you skip house ${i}, you keep the best through ${i - 1}: dp[${i - 1}] = ${skipOpt}.`, [['skip', String(skipOpt)]])
    chose = robOpt >= skipOpt ? 'rob' : 'skip'
    dp[i] = Math.max(robOpt, skipOpt)
    push('choose', 9, i, null, `dp[${i}] = ${dp[i]}`, `Take the better option: ${chose === 'rob' ? `robbing (${robOpt}) wins` : `skipping (${skipOpt}) wins`} → dp[${i}] = ${dp[i]}.`, [['dp[i]', String(dp[i])]])
    robOpt = null
    skipOpt = null
    chose = null
  }

  push('done', 11, null, dp[n - 1], `Answer: ${dp[n - 1]}`, `dp[${n - 1}] holds the best over all houses. Return ${dp[n - 1]}.`, [['result', String(dp[n - 1])]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'choose' || kind === 'done' || kind === 'base'
    ? C.go
    : kind === 'rob'
      ? C.trace
      : kind === 'skip'
        ? C.signal
        : C.ink

export default function HouseRobberViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)

  const nums = useMemo(() => parseNums(numsText), [numsText])
  const frames = useMemo(() => buildFrames(nums), [nums])
  const [i, setI] = useState(0)

  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 40))
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

  const cell = (value: React.ReactNode, colors: { bg: string; fg: string; bd: string }) => (
    <div style={{ minWidth: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 16, borderRadius: 6, background: colors.bg, color: colors.fg, border: `2px solid ${colors.bd}`, padding: '0 6px' }}>{value}</div>
  )

  return (
    <div>
      <style>{`.hr-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .hr-btn:active{transform:translateY(1px)} .hr-btn:disabled{opacity:.35;cursor:not-allowed}
        .hr-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input value={numsText} spellCheck={false} placeholder="[1,2,3,1]" onChange={(e) => changeNums(e.target.value)} style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText.replace(/\s/g, '') === p.nums.replace(/\s/g, '')
            return (
              <button key={p.name} className="hr-btn" onClick={() => applyPreset(p.nums)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Rob houses for the most money, but never two adjacent ones. dp[i] = best loot considering houses up to i.
        </div>
      </div>

      {/* TOP: houses + dp */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 52 }}>
          {nums.map((_, idx) => (
            <div key={idx} style={{ minWidth: 44, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: C.slate }}>house {idx}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <div style={{ width: 44, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>nums</div>
          {nums.map((v, idx) => cell(v, idx === f.i ? { bg: C.ink, fg: C.paper, bd: C.ink } : { bg: '#FBF9F3', fg: C.ink, bd: C.wire }))}
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div style={{ width: 44, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>dp</div>
          {f.dp.map((v, idx) => {
            const isCur = idx === f.i
            const filled = v !== null
            return cell(filled ? v : '·', isCur ? { bg: C.signal, fg: C.paper, bd: C.signal } : filled ? { bg: C.go, fg: C.paper, bd: C.go } : { bg: '#FBF9F3', fg: C.slate, bd: C.wire })
          })}
        </div>

        {/* options */}
        {(f.robOpt != null || f.skipOpt != null) && (
          <div style={{ display: 'flex', gap: 14, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 6, border: `2px solid ${C.trace}`, background: f.chose === 'rob' ? C.trace : C.paper, color: f.chose === 'rob' ? C.paper : C.trace }}>rob = {f.robOpt ?? '—'}</span>
            <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 6, border: `2px solid ${C.signal}`, background: f.chose === 'skip' ? C.signal : C.paper, color: f.chose === 'skip' ? C.paper : C.signal }}>skip = {f.skipOpt ?? '—'}</span>
          </div>
        )}
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
            <button className="hr-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="hr-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="hr-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="hr-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
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

function btn(bg: string, fg: string, border?: boolean): React.CSSProperties {
  return { fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '11px 18px', background: bg, color: fg, border: border ? `1.5px solid ${C.ink}` : 'none', borderRadius: 4 }
}
