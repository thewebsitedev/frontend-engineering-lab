'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; s: string; dict: string }[] = [
  { name: 'leetcode', s: 'leetcode', dict: 'leet,code' },
  { name: 'reuse word', s: 'applepenapple', dict: 'apple,pen' },
  { name: 'cannot', s: 'catsandog', dict: 'cats,dog,sand,and,cat' },
  { name: 'cars', s: 'cars', dict: 'car,ca,rs' },
]

const CODE = [
  { ln: 1, t: 'function wordBreak(s, wordDict) {' },
  { ln: 2, t: '  const words = new Set(wordDict);' },
  { ln: 3, t: '  const dp = Array(s.length + 1).fill(false);' },
  { ln: 4, t: '  dp[0] = true;' },
  { ln: 5, t: '  for (let i = 1; i <= s.length; i++) {' },
  { ln: 6, t: '    for (let j = 0; j < i; j++) {' },
  { ln: 7, t: '      if (dp[j] && words.has(s.slice(j, i))) {' },
  { ln: 8, t: '        dp[i] = true;' },
  { ln: 9, t: '        break;' },
  { ln: 10, t: '      }' },
  { ln: 11, t: '    }' },
  { ln: 12, t: '  }' },
  { ln: 13, t: '  return dp[s.length];' },
  { ln: 14, t: '}' },
]

type Frame = {
  kind: string
  line: number
  dp: boolean[]
  i: number | null
  j: number | null
  slice: string
  hit: boolean
  matchWord: string | null
  result: boolean | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(s: string, dict: string[]): Frame[] {
  const n = s.length
  const words = new Set(dict)
  const frames: Frame[] = []
  const dp = new Array(n + 1).fill(false)
  const CAP = 500

  const push = (kind: string, line: number, iCur: number | null, jCur: number | null, slice: string, hit: boolean, matchWord: string | null, result: boolean | null, title: string, note: string, vars: [string, string][] = []) => {
    if (frames.length >= CAP) return
    frames.push({ kind, line, dp: [...dp], i: iCur, j: jCur, slice, hit, matchWord, result, title, note, vars })
  }

  if (n === 0) {
    push('done', 13, null, null, '', false, null, true, 'Empty string', 'An empty string is trivially breakable. Return true.', [['result', 'true']])
    return frames
  }

  push('init', 3, null, null, '', false, null, null, 'dp[i] = can s[0..i) be broken?', 'dp[i] is true when the first i characters split cleanly into dictionary words.', [])
  dp[0] = true
  push('base', 4, 0, null, '', false, null, null, 'dp[0] = true', 'The empty prefix needs no words, so dp[0] = true — the seed everything else builds on.', [['dp[0]', 'true']])

  for (let i = 1; i <= n; i++) {
    push('i', 5, i, null, '', false, null, null, `Can we reach position ${i}?`, `Try to end a dictionary word exactly at position ${i} (i.e. fill dp[${i}]).`, [['i', String(i)]])
    let done = false
    for (let j = 0; j < i; j++) {
      const slice = s.slice(j, i)
      const hit = dp[j] && words.has(slice)
      push('try', 7, i, j, slice, hit, hit ? slice : null, null, hit ? `"${slice}" works!` : `"${slice}" — no`, `dp[${j}] = ${dp[j]}, and is "${slice}" in the dictionary? ${words.has(slice) ? 'yes' : 'no'}. ${hit ? `Both hold → the prefix up to ${j} breaks AND "${slice}" is a word, so dp[${i}] = true.` : 'Not a valid split here; try the next start.'}`, [['s.slice(j,i)', `"${slice}"`], ['dp[j]', String(dp[j])]])
      if (hit) {
        dp[i] = true
        push('set', 8, i, j, slice, true, slice, null, `dp[${i}] = true`, `Mark position ${i} reachable and stop scanning earlier starts (break).`, [['dp[i]', 'true']])
        done = true
        break
      }
    }
    if (!done) {
      push('fail', 6, i, null, '', false, null, null, `dp[${i}] stays false`, `No split ending at ${i} works, so dp[${i}] remains false.`, [['dp[i]', 'false']])
    }
  }

  const result = dp[n]
  push('done', 13, n, null, '', false, null, result, result ? 'Breakable ✓' : 'Not breakable ✗', `dp[${n}] = ${result}. ${result ? 'The whole string splits into dictionary words.' : 'Some part of the string can’t be formed from the dictionary.'} Return ${result}.`, [['result', String(result)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'fail'
    ? C.signal
    : kind === 'set' || kind === 'base' || kind === 'done'
      ? C.go
      : kind === 'try' || kind === 'i'
        ? C.trace
        : C.ink

export default function WordBreakViz() {
  const [sText, setSText] = useState(PRESETS[0].s)
  const [dictText, setDictText] = useState(PRESETS[0].dict)

  const s = useMemo(() => sText.toLowerCase().replace(/[^a-z]/g, '').slice(0, 13), [sText])
  const dict = useMemo(
    () => dictText.toLowerCase().split(',').map((w) => w.replace(/[^a-z]/g, '')).filter(Boolean).slice(0, 8),
    [dictText],
  )
  const frames = useMemo(() => buildFrames(s, dict), [s, dict])
  const [i, setI] = useState(0)

  const changeS = useCallback((v: string) => {
    setSText(v.replace(/[^a-zA-Z]/g, '').slice(0, 13))
    setI(0)
  }, [])
  const changeDict = useCallback((v: string) => {
    setDictText(v.replace(/[^a-zA-Z,]/g, '').slice(0, 40))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { s: string; dict: string }) => {
    setSText(p.s)
    setDictText(p.dict)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const inSlice = (idx: number) => f.i != null && f.j != null && idx >= f.j && idx < f.i
  const result = frames[frames.length - 1]?.result

  return (
    <div>
      <style>{`.wb-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .wb-btn:active{transform:translateY(1px)} .wb-btn:disabled{opacity:.35;cursor:not-allowed}
        .wb-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>s =</label>
          <input value={sText} spellCheck={false} placeholder="leetcode" onChange={(e) => changeS(e.target.value)} style={{ ...inputStyle, minWidth: 140, flex: 1 }} />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>dict =</label>
          <input value={dictText} spellCheck={false} placeholder="leet,code" onChange={(e) => changeDict(e.target.value)} style={{ ...inputStyle, minWidth: 140, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = sText.toLowerCase() === p.s && dictText.replace(/\s/g, '') === p.dict
            return (
              <button key={p.name} className="wb-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Can s be split into a sequence of dictionary words? dp[i] means the first i letters break cleanly.
        </div>
      </div>

      {/* TOP */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        {/* dict */}
        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 14 }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>dict</span>
          {dict.map((w) => {
            const active = w === f.matchWord
            return (
              <span key={w} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.go : C.wire}`, background: active ? C.go : C.paper, color: active ? C.paper : C.ink }}>{w}</span>
            )
          })}
        </div>

        {/* string */}
        <div style={{ display: 'flex', gap: 4 }}>
          {[...s].map((ch, idx) => {
            const sliced = inSlice(idx)
            return (
              <div key={idx} style={{ width: 34, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 17, borderRadius: 6, background: sliced ? (f.hit ? C.go : C.trace) : '#FBF9F3', color: sliced ? C.paper : C.ink, border: `2px solid ${sliced ? (f.hit ? C.go : C.trace) : C.wire}` }}>{ch}</div>
            )
          })}
        </div>

        {/* dp row (n+1 boundaries) */}
        <div style={{ display: 'flex', gap: 4, marginTop: 10, alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginRight: 4 }}>dp</span>
          {f.dp.map((v, idx) => {
            const active = idx === f.i || idx === f.j
            return (
              <div key={idx} style={{ width: 34, marginLeft: idx === 0 ? 0 : -4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{ width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 12, borderRadius: 11, background: v ? C.go : '#FBF9F3', color: v ? C.paper : C.slate, border: `1.5px solid ${active ? C.signal : v ? C.go : C.wire}` }}>{v ? 'T' : 'F'}</div>
                <span style={{ fontFamily: MONO, fontSize: 9, color: idx === f.i ? C.signal : idx === f.j ? C.trace : C.slate }}>{idx === f.i ? 'i' : idx === f.j ? 'j' : idx}</span>
              </div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 12 }}>
          <Swatch color={C.trace} label="s.slice(j, i)" />
          <Swatch color={C.go} label="matched word / true" />
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
                  <span style={{ width: 26, textAlign: 'right', paddingRight: 8, color: C.codedim, fontFamily: MONO, fontSize: 10.5, userSelect: 'none', lineHeight: '1.7' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 9.5, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.7' }}>◄</span>}
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
            <button className="wb-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="wb-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="wb-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="wb-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && result != null && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: result ? C.go : C.signal, marginTop: 10 }}>return {String(result)}</div>}
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
