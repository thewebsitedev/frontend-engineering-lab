'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; s: string }[] = [
  { name: 'abcabcbb', s: 'abcabcbb' },
  { name: 'bbbbb', s: 'bbbbb' },
  { name: 'pwwkew', s: 'pwwkew' },
  { name: 'abba', s: 'abba' },
]

function parseStr(text: string): string[] {
  return [...text].slice(0, 14)
}

const CODE = [
  { ln: 1, t: 'function lengthOfLongestSubstring(s) {' },
  { ln: 2, t: '  const seen = new Map();   // char -> last index' },
  { ln: 3, t: '  let left = 0;' },
  { ln: 4, t: '  let best = 0;' },
  { ln: 5, t: '  for (let right = 0; right < s.length; right++) {' },
  { ln: 6, t: '    const c = s[right];' },
  { ln: 7, t: '    if (seen.has(c) && seen.get(c) >= left) {' },
  { ln: 8, t: '      left = seen.get(c) + 1;' },
  { ln: 9, t: '    }' },
  { ln: 10, t: '    seen.set(c, right);' },
  { ln: 11, t: '    best = Math.max(best, right - left + 1);' },
  { ln: 12, t: '  }' },
  { ln: 13, t: '  return best;' },
  { ln: 14, t: '}' },
]

type Frame = {
  kind: string
  line: number
  left: number
  right: number | null
  seen: [string, number][]
  activeChar: string | null
  dupIdx: number | null
  best: number
  bestL: number
  bestR: number
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(chars: string[]): Frame[] {
  const n = chars.length
  const frames: Frame[] = []
  const seen = new Map<string, number>()
  let left = 0
  let best = 0
  let bestL = 0
  let bestR = -1
  let right: number | null = null
  let activeChar: string | null = null
  let dupIdx: number | null = null

  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({
      kind,
      line,
      title,
      note,
      vars,
      left,
      right,
      seen: Array.from(seen.entries()),
      activeChar,
      dupIdx,
      best,
      bestL,
      bestR,
    })

  if (n === 0) {
    push('done', 13, 'Empty string', 'There are no characters, so the longest substring has length 0.')
    return frames
  }

  push('init', 2, 'Remember last positions', 'seen maps each character to the last index where we saw it. Empty to start.', [['seen', '{}']])
  push('init', 3, 'left = 0', 'left is the start of the current window (a substring with no repeats).', [['left', '0']])
  push('init', 4, 'best = 0', 'best tracks the longest valid window length found so far.', [['best', '0']])

  for (let r = 0; r < n; r++) {
    right = r
    dupIdx = null
    const c = chars[r]
    activeChar = c
    push('char', 6, `right = ${r}, c = '${c}'`, `Extend the window to include s[${r}] = '${c}'.`, [
      ['right', String(r)],
      ['c', `'${c}'`],
    ])

    const prev = seen.has(c) ? seen.get(c)! : -1
    const isDup = seen.has(c) && prev >= left
    push('check', 7, isDup ? `'${c}' repeats inside the window` : `'${c}' is fine`, isDup
      ? `We saw '${c}' at index ${prev}, which is ≥ left (${left}). It is inside the current window, so the window has a repeat.`
      : `Either '${c}' was never seen, or its last position (${prev < 0 ? 'none' : prev}) is left of the window. No repeat — keep the window.`, [
      ['seen[c]', prev < 0 ? '—' : String(prev)],
      ['left', String(left)],
    ])

    if (isDup) {
      dupIdx = prev
      left = prev + 1
      push('jump', 8, `Move left to ${left}`, `Jump left to just past the old '${c}': left = ${prev} + 1 = ${left}. That throws away the earlier '${c}' and any chars before it, removing the repeat.`, [
        ['left', String(left)],
      ])
    }
    dupIdx = null

    seen.set(c, r)
    push('set', 10, `seen['${c}'] = ${r}`, `Record the latest position of '${c}'.`, [['seen', mapStr(seen)]])

    const len = r - left + 1
    const improved = len > best
    if (improved) {
      best = len
      bestL = left
      bestR = r
    }
    push('record', 11, improved ? `New best: ${best}` : `Window length ${len}`, `Current window is s[${left}..${r}], length ${len}. ${improved ? `That beats the old best → best = ${best}.` : `best stays ${best}.`}`, [
      ['window', `[${left}, ${r}]`],
      ['length', String(len)],
      ['best', String(best)],
    ])
  }

  right = null
  activeChar = null
  push('done', 13, `Answer: ${best}`, `No window can be longer. Return best = ${best} (the substring '${chars.slice(bestL, bestR + 1).join('')}').`, [['best', String(best)]])
  return frames
}

const mapStr = (m: Map<string, number>): string =>
  m.size === 0 ? '{}' : '{' + Array.from(m.entries()).map(([k, v]) => `${k}:${v}`).join(', ') + '}'

const kindColor = (kind: string): string =>
  kind === 'jump' ? C.signal : kind === 'record' || kind === 'done' ? C.go : kind === 'char' || kind === 'check' || kind === 'set' ? C.trace : C.ink

export default function LongestSubstringViz() {
  const [sText, setSText] = useState(PRESETS[0].s)

  const chars = useMemo(() => parseStr(sText), [sText])
  const frames = useMemo(() => buildFrames(chars), [chars])
  const [i, setI] = useState(0)

  const changeS = useCallback((v: string) => {
    setSText(v.replace(/\s/g, '').slice(0, 14))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { s: string }) => {
    setSText(p.s)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const inWindow = (idx: number) => f.right != null && idx >= f.left && idx <= f.right

  const cellColors = (idx: number): { bg: string; fg: string; bd: string } => {
    if (idx === f.dupIdx) return { bg: '#E9B7AE', fg: C.ink, bd: C.signal }
    if (f.right === idx) return { bg: C.signal, fg: C.paper, bd: C.signal }
    if (inWindow(idx)) return { bg: C.trace, fg: C.paper, bd: C.trace }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
  }

  return (
    <div>
      <style>{`.ls-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .ls-btn:active{transform:translateY(1px)} .ls-btn:disabled{opacity:.35;cursor:not-allowed}
        .ls-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>s =</label>
          <input
            value={sText}
            spellCheck={false}
            placeholder="abcabcbb"
            onChange={(e) => changeS(e.target.value)}
            style={{ ...inputStyle, minWidth: 200, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = sText === p.s
            return (
              <button
                key={p.name}
                className="ls-btn"
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
          Slide a window [left, right] that never holds a repeated character; track its longest length.
        </div>
      </div>

      {/* TOP: string + window */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        {/* index labels */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {chars.map((_, idx) => (
            <div key={idx} style={{ width: 40, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: C.slate }}>
              {idx}
            </div>
          ))}
        </div>
        {/* char cells */}
        <div style={{ display: 'flex', gap: 6 }}>
          {chars.map((ch, idx) => {
            const cc = cellColors(idx)
            const isBest = idx >= f.bestL && idx <= f.bestR
            return (
              <div
                key={idx}
                style={{
                  width: 40,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 18,
                  borderRadius: 6,
                  background: cc.bg,
                  color: cc.fg,
                  border: `2px solid ${cc.bd}`,
                  borderBottom: isBest ? `4px solid ${C.go}` : `2px solid ${cc.bd}`,
                }}
              >
                {ch}
              </div>
            )
          })}
        </div>
        {/* pointer row */}
        <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
          {chars.map((_, idx) => {
            const isL = idx === f.left && f.right != null
            const isR = idx === f.right
            return (
              <div key={idx} style={{ width: 40, textAlign: 'center', fontFamily: MONO, fontSize: 11, fontWeight: 700, color: isR ? C.signal : isL ? C.trace : 'transparent' }}>
                {isL && isR ? 'L R' : isL ? 'L' : isR ? 'R' : '·'}
              </div>
            )
          })}
        </div>

        {/* seen map + best */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', marginTop: 14 }}>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>seen</span>
            {f.seen.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
            ) : (
              f.seen.map(([k, v]) => {
                const isActive = k === f.activeChar
                return (
                  <span
                    key={k}
                    style={{
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '4px 9px',
                      borderRadius: 4,
                      border: `1.5px solid ${isActive ? C.signal : C.wire}`,
                      background: isActive ? C.signal : C.paper,
                      color: isActive ? C.paper : C.ink,
                    }}
                  >
                    {k} → {v}
                  </span>
                )
              })
            )}
          </div>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              border: `2px solid ${C.go}`,
              background: C.go,
              color: C.paper,
              marginLeft: 'auto',
            }}
          >
            best = {f.best}
          </span>
        </div>

        {/* legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 12 }}>
          <Swatch color={C.trace} label="window" />
          <Swatch color={C.signal} label="right (new char)" />
          <Swatch color="#E9B7AE" label="repeat found" />
          <Swatch color={C.go} label="best window" />
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
            <button className="ls-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="ls-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="ls-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="ls-btn"
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
