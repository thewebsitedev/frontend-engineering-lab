'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; s: string; k: string }[] = [
  { name: 'classic', s: 'AABABBA', k: '1' },
  { name: 'k = 2', s: 'ABAB', k: '2' },
  { name: 'all same', s: 'AAAA', k: '0' },
  { name: 'grow', s: 'ABBB', k: '1' },
]

function parseStr(text: string): string[] {
  return [...text.toUpperCase().replace(/[^A-Z]/g, '')].slice(0, 14)
}

const CODE = [
  { ln: 1, t: 'function characterReplacement(s, k) {' },
  { ln: 2, t: '  const count = {};' },
  { ln: 3, t: '  let left = 0, maxFreq = 0, best = 0;' },
  { ln: 4, t: '  for (let right = 0; right < s.length; right++) {' },
  { ln: 5, t: '    const c = s[right];' },
  { ln: 6, t: '    count[c] = (count[c] || 0) + 1;' },
  { ln: 7, t: '    maxFreq = Math.max(maxFreq, count[c]);' },
  { ln: 8, t: '    while ((right - left + 1) - maxFreq > k) {' },
  { ln: 9, t: '      count[s[left]]--;' },
  { ln: 10, t: '      left++;' },
  { ln: 11, t: '    }' },
  { ln: 12, t: '    best = Math.max(best, right - left + 1);' },
  { ln: 13, t: '  }' },
  { ln: 14, t: '  return best;' },
  { ln: 15, t: '}' },
]

type Frame = {
  kind: string
  line: number
  left: number
  right: number
  count: [string, number][]
  maxFreq: number
  best: number
  activeChar: string | null
  shrinkCell: number | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(chars: string[], k: number): Frame[] {
  const n = chars.length
  const frames: Frame[] = []
  const count: Record<string, number> = {}
  let left = 0
  let right = -1
  let maxFreq = 0
  let best = 0
  let activeChar: string | null = null
  let shrinkCell: number | null = null

  const countEntries = (): [string, number][] => Object.entries(count).filter(([, v]) => v > 0).sort((a, b) => a[0].localeCompare(b[0]))
  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, title, note, vars, left, right, count: countEntries(), maxFreq, best, activeChar, shrinkCell })

  if (n === 0) {
    push('done', 14, 'Empty string', 'Nothing to do. Return 0.', [['best', '0']])
    return frames
  }

  push('init', 2, 'count = {}', 'Track how many of each letter are inside the current window.', [['count', '{}']])
  push('init', 3, 'left = 0, maxFreq = 0, best = 0', 'left is the window start; maxFreq is the count of the most common letter in the window; best is the answer.', [])

  for (right = 0; right < n; right++) {
    const c = chars[right]
    activeChar = c
    shrinkCell = null
    push('extend', 5, `right = ${right}, c = '${c}'`, `Grow the window to include s[${right}] = '${c}'.`, [['right', String(right)], ['c', `'${c}'`]])

    count[c] = (count[c] || 0) + 1
    push('count', 6, `count['${c}'] = ${count[c]}`, `Tally '${c}' inside the window.`, [[`count['${c}']`, String(count[c])]])

    const newMax = Math.max(maxFreq, count[c])
    push('max', 7, `maxFreq = ${newMax}`, `${newMax > maxFreq ? `'${c}' is now the most common letter → maxFreq = ${newMax}.` : `maxFreq stays ${maxFreq}.`} maxFreq is how many chars we could keep; the rest we'd replace.`, [['maxFreq', String(newMax)]])
    maxFreq = newMax

    while (right - left + 1 - maxFreq > k) {
      const windowLen = right - left + 1
      push('check', 8, `Need ${windowLen - maxFreq} replacements > k=${k}`, `Window "${chars.slice(left, right + 1).join('')}" has length ${windowLen} and ${maxFreq} of the majority letter, so ${windowLen - maxFreq} chars must be replaced — more than k=${k}. Shrink from the left.`, [['toReplace', String(windowLen - maxFreq)], ['k', String(k)]])
      shrinkCell = left
      count[chars[left]]--
      push('shrink', 9, `count['${chars[left]}']--`, `Remove s[${left}]='${chars[left]}' from the window.`, [[`count['${chars[left]}']`, String(count[chars[left]])]])
      left++
      shrinkCell = null
      push('shrink', 10, `left = ${left}`, 'Advance the window start.', [['left', String(left)]])
    }

    const windowLen = right - left + 1
    const improved = windowLen > best
    if (improved) best = windowLen
    push('best', 12, improved ? `New best: ${best}` : `Best stays ${best}`, `Window "${chars.slice(left, right + 1).join('')}" is valid (≤ k replacements). Length ${windowLen}. ${improved ? `New best = ${best}.` : ''}`, [['window', `[${left}, ${right}]`], ['best', String(best)]])
  }

  right = n - 1
  activeChar = null
  push('done', 14, `Answer: ${best}`, `The longest window we could make uniform with ≤ ${k} replacement${k === 1 ? '' : 's'} has length ${best}.`, [['best', String(best)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'shrink' || kind === 'check'
    ? C.signal
    : kind === 'best' || kind === 'done'
      ? C.go
      : kind === 'extend' || kind === 'count' || kind === 'max'
        ? C.trace
        : C.ink

export default function CharacterReplacementViz() {
  const [sText, setSText] = useState(PRESETS[0].s)
  const [kText, setKText] = useState(PRESETS[0].k)

  const chars = useMemo(() => parseStr(sText), [sText])
  const k = Math.min(Math.max(Number(kText) || 0, 0), 9)
  const frames = useMemo(() => buildFrames(chars, k), [chars, k])
  const [i, setI] = useState(0)

  const changeS = useCallback((v: string) => {
    setSText(v.replace(/[^a-zA-Z]/g, '').slice(0, 14))
    setI(0)
  }, [])
  const changeK = useCallback((v: string) => {
    setKText(v.replace(/[^0-9]/g, '').slice(0, 1))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { s: string; k: string }) => {
    setSText(p.s)
    setKText(p.k)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const inWindow = (idx: number) => f.right >= 0 && idx >= f.left && idx <= f.right
  const cellColors = (idx: number): { bg: string; fg: string; bd: string } => {
    if (idx === f.shrinkCell) return { bg: '#E9B7AE', fg: C.ink, bd: C.signal }
    if (idx === f.right) return { bg: C.signal, fg: C.paper, bd: C.signal }
    if (inWindow(idx)) return { bg: C.trace, fg: C.paper, bd: C.trace }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
  }
  const windowLen = f.right >= 0 ? f.right - f.left + 1 : 0

  return (
    <div>
      <style>{`.cr-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .cr-btn:active{transform:translateY(1px)} .cr-btn:disabled{opacity:.35;cursor:not-allowed}
        .cr-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>s =</label>
          <input value={sText} spellCheck={false} placeholder="AABABBA" onChange={(e) => changeS(e.target.value)} style={{ ...inputStyle, minWidth: 180, flex: 1 }} />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>k =</label>
          <input value={kText} spellCheck={false} onChange={(e) => changeK(e.target.value)} style={{ ...inputStyle, width: 52 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = sText.toUpperCase() === p.s && kText === p.k
            return (
              <button key={p.name} className="cr-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Longest window you can make all-one-letter by replacing at most k characters. Valid when (window length − most common) ≤ k.
        </div>
      </div>

      {/* TOP: string window */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {chars.map((_, idx) => (
            <div key={idx} style={{ width: 38, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: C.slate }}>{idx}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {chars.map((ch, idx) => {
            const cc = cellColors(idx)
            return (
              <div key={idx} style={{ width: 38, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 18, borderRadius: 6, background: cc.bg, color: cc.fg, border: `2px solid ${cc.bd}` }}>{ch}</div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {chars.map((_, idx) => {
            const isL = idx === f.left && f.right >= 0
            const isR = idx === f.right
            return (
              <div key={idx} style={{ width: 38, textAlign: 'center', fontFamily: MONO, fontSize: 11, fontWeight: 700, color: isR ? C.signal : isL ? C.trace : 'transparent' }}>{isL && isR ? 'L R' : isL ? 'L' : isR ? 'R' : '·'}</div>
            )
          })}
        </div>

        {/* counts + stats */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>counts</span>
            {f.count.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>—</span>
            ) : (
              f.count.map(([ch, v]) => {
                const isMax = v === f.maxFreq && f.maxFreq > 0
                return (
                  <span key={ch} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${isMax ? C.go : C.wire}`, background: isMax ? C.go : C.paper, color: isMax ? C.paper : C.ink }}>
                    {ch}:{v}
                  </span>
                )
              })
            )}
          </div>
          <div style={{ flex: 1 }} />
          <Stat label="window" value={windowLen} />
          <Stat label="replace" value={f.right >= 0 ? Math.max(windowLen - f.maxFreq, 0) : 0} />
          <Stat label="best" value={f.best} accent />
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 12 }}>
          <Swatch color={C.trace} label="window" />
          <Swatch color={C.signal} label="right" />
          <Swatch color={C.go} label="most common" />
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
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
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
            <button className="cr-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="cr-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="cr-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="cr-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
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
