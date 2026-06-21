'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const S = '([{}])'
const PAIRS: Record<string, string> = { ')': '(', ']': '[', '}': '{' }

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function isValid(s) {' },
  { ln: 2, t: '  const stack = [];' },
  { ln: 3, t: "  const pairs = { ')':'(', ']':'[', '}':'{' };" },
  { ln: 4, t: '  for (const ch of s) {' },
  { ln: 5, t: '    if (ch in pairs) {' },
  { ln: 6, t: '      if (stack.pop() !== pairs[ch]) return false;' },
  { ln: 7, t: '    } else {' },
  { ln: 8, t: '      stack.push(ch);' },
  { ln: 9, t: '    }' },
  { ln: 10, t: '  }' },
  { ln: 11, t: '  return stack.length === 0;' },
  { ln: 12, t: '}' },
]

type Frame = {
  kind: string
  line: number
  i: number | null
  stack: string[]
  pushed: string | null
  popped: string | null
  valid: boolean | null
  vars: Record<string, string>
  title: string
  note: string
}

function buildFrames(): { frames: Frame[]; valid: boolean } {
  const frames: Frame[] = []
  const stack: string[] = []

  frames.push({
    kind: 'start',
    line: 2,
    i: null,
    stack: [],
    pushed: null,
    popped: null,
    valid: null,
    vars: {},
    title: 'Start',
    note: 'Use a stack. Push every opening bracket; match each closing bracket against the top.',
  })

  let valid: boolean | null = null

  for (let i = 0; i < S.length; i++) {
    const ch = S[i]

    frames.push({
      kind: 'consider',
      line: 4,
      i,
      stack: [...stack],
      pushed: null,
      popped: null,
      valid: null,
      vars: { ch },
      title: `Read '${ch}'`,
      note: ch in PAIRS ? `'${ch}' is a closing bracket.` : `'${ch}' is an opening bracket.`,
    })

    if (ch in PAIRS) {
      const need = PAIRS[ch]
      const top = stack[stack.length - 1]
      if (stack.length && top === need) {
        stack.pop()
        frames.push({
          kind: 'pop',
          line: 6,
          i,
          stack: [...stack],
          pushed: null,
          popped: need,
          valid: null,
          vars: { ch },
          title: `Match — pop '${need}'`,
          note: `The top of the stack is '${need}', which closes '${ch}'. Pop it off.`,
        })
      } else {
        valid = false
        frames.push({
          kind: 'fail',
          line: 6,
          i,
          stack: [...stack],
          pushed: null,
          popped: null,
          valid: false,
          vars: { ch },
          title: 'Mismatch → invalid',
          note: stack.length
            ? `The top is '${top}', but '${ch}' needs '${need}'. The string is invalid.`
            : `The stack is empty, so there is nothing to close '${ch}'. Invalid.`,
        })
        break
      }
    } else {
      stack.push(ch)
      frames.push({
        kind: 'push',
        line: 8,
        i,
        stack: [...stack],
        pushed: ch,
        popped: null,
        valid: null,
        vars: { ch },
        title: `Push '${ch}'`,
        note: `Opening bracket — push it onto the stack and move on.`,
      })
    }
  }

  if (valid !== false) {
    valid = stack.length === 0
    frames.push({
      kind: 'done',
      line: 11,
      i: null,
      stack: [...stack],
      pushed: null,
      popped: null,
      valid,
      vars: {},
      title: valid ? 'Valid ✓' : 'Invalid',
      note: valid
        ? 'Every bracket was matched and the stack is empty → the string is valid.'
        : 'Brackets remain on the stack — some were never closed → invalid.',
    })
  }

  return { frames, valid: valid === true }
}

export default function ValidParenthesesViz() {
  const { frames, valid } = useMemo(() => buildFrames(), [])
  const [i, setI] = useState(0)
  const f = frames[i]
  const atEnd = i === frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const reversed = [...f.stack].reverse() // index 0 = top of stack

  return (
    <div>
      <style>{`.vp-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .vp-btn:active{transform:translateY(1px)} .vp-btn:disabled{opacity:.35;cursor:not-allowed}
        .vp-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Input header */}
      <div style={{ fontFamily: MONO, fontSize: 13, color: C.slate, marginBottom: 14 }}>
        s = &quot;{S}&quot;
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1.05fr) minmax(0,1fr)',
          gap: 18,
          alignItems: 'start',
        }}
      >
        {/* CODE PANEL */}
        <div
          style={{
            background: C.codebg,
            borderRadius: 6,
            padding: '16px 6px 16px 0',
            overflowX: 'auto',
          }}
        >
          {CODE.map((row) => {
            const active = row.ln === f.line && row.t.trim() !== ''
            return (
              <div
                key={row.ln}
                style={{
                  display: 'flex',
                  background: active ? C.codehl : 'transparent',
                  borderLeft: `3px solid ${active ? C.signal : 'transparent'}`,
                }}
              >
                <span
                  style={{
                    width: 34,
                    textAlign: 'right',
                    paddingRight: 12,
                    color: C.codedim,
                    fontFamily: MONO,
                    fontSize: 13,
                    userSelect: 'none',
                    lineHeight: '1.9',
                  }}
                >
                  {row.ln}
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 12.5,
                    lineHeight: '1.9',
                    color: C.codeink,
                    whiteSpace: 'pre',
                  }}
                >
                  {row.t || ' '}
                </pre>
                {active && (
                  <span
                    style={{
                      marginLeft: 'auto',
                      paddingRight: 12,
                      color: C.signal,
                      fontFamily: MONO,
                      fontSize: 13,
                      lineHeight: '1.9',
                    }}
                  >
                    ◄
                  </span>
                )}
              </div>
            )
          })}

          {/* live variables */}
          <div
            style={{
              borderTop: `1px solid ${C.codehl}`,
              marginTop: 12,
              paddingTop: 12,
              paddingLeft: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            {f.vars.ch === undefined ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.codedim }}>no locals yet</span>
            ) : (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  background: '#000',
                  color: C.codeink,
                  padding: '4px 9px',
                  borderRadius: 4,
                  border: `1px solid ${C.trace}`,
                }}
              >
                <span style={{ color: C.trace }}>ch</span>
                <span style={{ color: C.codedim }}> = </span>
                <b>&apos;{f.vars.ch}&apos;</b>
              </span>
            )}
          </div>
        </div>

        {/* RIGHT: string + stack + narration */}
        <div>
          {/* String */}
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: C.slate,
              marginBottom: 6,
            }}
          >
            string
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            {S.split('').map((ch, idx) => {
              const isCurrent = f.i === idx
              const isDone = f.i === null ? true : idx < f.i
              let bg = '#FBF9F3'
              let fg: string = C.ink
              let bd: string = C.wire
              if (isCurrent) {
                bg = f.kind === 'fail' ? C.signal : C.trace
                fg = C.paper
                bd = bg
              } else if (isDone) {
                bd = C.slate
                fg = C.slate
              }
              return (
                <div
                  key={idx}
                  style={{
                    width: 38,
                    textAlign: 'center',
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 18,
                    padding: '9px 0',
                    border: `2px solid ${bd}`,
                    background: bg,
                    color: fg,
                    borderRadius: 6,
                  }}
                >
                  {ch}
                </div>
              )
            })}
          </div>

          {/* Stack */}
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 1,
              textTransform: 'uppercase',
              color: C.slate,
              marginBottom: 6,
            }}
          >
            stack
          </div>
          <div
            style={{
              border: `1.5px solid ${C.wire}`,
              borderRadius: 6,
              background: '#FBF9F3',
              padding: 10,
              marginBottom: 16,
              minHeight: 132,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-start',
              gap: 6,
            }}
          >
            {reversed.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
            ) : (
              reversed.map((ch, ridx) => {
                const isTop = ridx === 0
                const isPushed = isTop && f.kind === 'push'
                let bd: string = C.wire
                let bg: string = C.paper
                let fg: string = C.ink
                if (isPushed) {
                  bg = C.go
                  bd = C.go
                  fg = C.paper
                } else if (isTop) {
                  bd = C.trace
                }
                return (
                  <div
                    key={ridx}
                    style={{ display: 'flex', alignItems: 'center', gap: 8 }}
                  >
                    <div
                      style={{
                        width: 44,
                        textAlign: 'center',
                        fontFamily: MONO,
                        fontWeight: 700,
                        fontSize: 18,
                        padding: '6px 0',
                        border: `2px solid ${bd}`,
                        background: bg,
                        color: fg,
                        borderRadius: 6,
                      }}
                    >
                      {ch}
                    </div>
                    {isTop && (
                      <span style={{ fontFamily: MONO, fontSize: 11, color: C.trace }}>← top</span>
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* narration */}
          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'fail'
                  ? C.signal
                  : f.kind === 'done'
                    ? f.valid
                      ? C.go
                      : C.signal
                    : f.kind === 'pop'
                      ? C.go
                      : f.kind === 'push'
                        ? C.trace
                        : C.ink
              }`,
              paddingLeft: 12,
              minHeight: 70,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>
              STEP {i} / {frames.length - 1} · line {f.line}
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>
              {f.title}
            </div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{f.note}</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 22 }}>
        <button className="vp-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="vp-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="vp-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && (
          <div
            style={{
              fontFamily: MONO,
              fontWeight: 700,
              fontSize: 15,
              color: valid ? C.go : C.signal,
            }}
          >
            return {valid ? 'true' : 'false'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="vp-btn"
            onClick={() => setI(idx)}
            aria-label={`step ${idx}`}
            style={{
              height: 6,
              flex: 1,
              border: 'none',
              borderRadius: 3,
              padding: 0,
              background:
                idx <= i
                  ? fr.kind === 'fail'
                    ? C.signal
                    : fr.kind === 'pop' || fr.kind === 'done'
                      ? C.go
                      : fr.kind === 'push' || fr.kind === 'consider'
                        ? C.trace
                        : C.ink
                  : C.wire,
            }}
          />
        ))}
      </div>
    </div>
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
