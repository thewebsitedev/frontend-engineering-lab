'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const STRS = ['eat', 'tea', 'tan', 'ate', 'nat', 'bat']

const sortKey = (w: string) => w.split('').sort().join('')

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function groupAnagrams(strs) {' },
  { ln: 2, t: '  const groups = new Map();' },
  { ln: 3, t: '  for (const word of strs) {' },
  { ln: 4, t: "    const key = word.split('').sort().join('');" },
  { ln: 5, t: '    if (!groups.has(key)) groups.set(key, []);' },
  { ln: 6, t: '    groups.get(key).push(word);' },
  { ln: 7, t: '  }' },
  { ln: 8, t: '  return [...groups.values()];' },
  { ln: 9, t: '}' },
]

type Group = { key: string; words: string[] }
type Frame = {
  kind: string
  line: number
  i: number | null
  key: string | null
  groups: Group[]
  activeKey: string | null
  justAdded: string | null
  vars: Record<string, string | number>
  title: string
  note: string
}

function snapshot(order: string[], map: Record<string, string[]>): Group[] {
  return order.map((k) => ({ key: k, words: [...map[k]] }))
}

function buildFrames(): { frames: Frame[]; groupCount: number } {
  const frames: Frame[] = []
  const map: Record<string, string[]> = {}
  const order: string[] = []

  frames.push({
    kind: 'start',
    line: 2,
    i: null,
    key: null,
    groups: [],
    activeKey: null,
    justAdded: null,
    vars: {},
    title: 'Start',
    note: 'Create an empty map: a sorted-letter key → the list of words that share it.',
  })

  for (let i = 0; i < STRS.length; i++) {
    const word = STRS[i]

    frames.push({
      kind: 'consider',
      line: 3,
      i,
      key: null,
      groups: snapshot(order, map),
      activeKey: null,
      justAdded: null,
      vars: { word },
      title: `Take "${word}"`,
      note: `Process the next word: "${word}".`,
    })

    const key = sortKey(word)
    frames.push({
      kind: 'key',
      line: 4,
      i,
      key,
      groups: snapshot(order, map),
      activeKey: null,
      justAdded: null,
      vars: { word, key },
      title: 'Sort the letters',
      note: `Sort the characters of "${word}" → "${key}". Every anagram of "${word}" produces this same key.`,
    })

    const isNew = !(key in map)
    if (isNew) {
      map[key] = []
      order.push(key)
      frames.push({
        kind: 'create',
        line: 5,
        i,
        key,
        groups: snapshot(order, map),
        activeKey: key,
        justAdded: null,
        vars: { word, key },
        title: `New bucket "${key}"`,
        note: `No group exists for "${key}" yet — create an empty one.`,
      })
    }

    map[key].push(word)
    frames.push({
      kind: 'append',
      line: 6,
      i,
      key,
      groups: snapshot(order, map),
      activeKey: key,
      justAdded: word,
      vars: { word, key },
      title: `Add to "${key}"`,
      note: isNew
        ? `Drop "${word}" into the new "${key}" group.`
        : `"${key}" already has a group — append "${word}" to it.`,
    })
  }

  return { frames, groupCount: order.length }
}

export default function GroupAnagramsViz() {
  const { frames, groupCount } = useMemo(() => buildFrames(), [])
  const [i, setI] = useState(0)
  const f = frames[i]
  const atEnd = i === frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // words already filed into some group
  const placed = useMemo(() => {
    const set = new Set<string>()
    f.groups.forEach((g) => g.words.forEach((w) => set.add(w)))
    return set
  }, [f])

  const varOrder = ['word', 'key']
  const varColor: Record<string, string> = { word: C.trace, key: C.signal }

  return (
    <div>
      <style>{`.ga-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .ga-btn:active{transform:translateY(1px)} .ga-btn:disabled{opacity:.35;cursor:not-allowed}
        .ga-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Input header */}
      <div
        style={{
          fontFamily: MONO,
          fontSize: 13,
          color: C.slate,
          marginBottom: 14,
        }}
      >
        strs = [{STRS.map((s) => `"${s}"`).join(', ')}]
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
                    fontSize: 13,
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
            {varOrder.filter((k) => f.vars[k] !== undefined).length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.codedim }}>no locals yet</span>
            ) : (
              varOrder
                .filter((k) => f.vars[k] !== undefined)
                .map((k) => (
                  <span
                    key={k}
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      background: '#000',
                      color: C.codeink,
                      padding: '4px 9px',
                      borderRadius: 4,
                      border: `1px solid ${varColor[k]}`,
                    }}
                  >
                    <span style={{ color: varColor[k] }}>{k}</span>
                    <span style={{ color: C.codedim }}> = </span>
                    <b>&quot;{String(f.vars[k])}&quot;</b>
                  </span>
                ))
            )}
          </div>
        </div>

        {/* RIGHT: words + key + groups + narration */}
        <div>
          {/* Words */}
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
            words
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {STRS.map((w, idx) => {
              const isCurrent = f.i === idx
              const isPlaced = placed.has(w) && !isCurrent
              let bg = '#FBF9F3'
              let fg: string = C.ink
              let bd: string = C.wire
              if (isCurrent) {
                bg = C.trace
                fg = C.paper
                bd = C.trace
              } else if (isPlaced) {
                bd = C.slate
                fg = C.slate
              }
              return (
                <span
                  key={idx}
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '6px 10px',
                    borderRadius: 4,
                    border: `2px solid ${bd}`,
                    background: bg,
                    color: fg,
                    textDecoration: isPlaced ? 'line-through' : 'none',
                  }}
                >
                  {w}
                </span>
              )
            })}
          </div>

          {/* key badge */}
          <div style={{ minHeight: 30, marginBottom: 14 }}>
            {f.key !== null && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '5px 11px',
                  borderRadius: 4,
                  background: C.paper,
                  color: C.signal,
                  border: `1.5px solid ${C.signal}`,
                }}
              >
                key = &quot;{f.key}&quot;
              </span>
            )}
          </div>

          {/* groups */}
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
            groups (key → words)
          </div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
              marginBottom: 16,
              minHeight: 44,
            }}
          >
            {f.groups.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
            ) : (
              f.groups.map((g) => {
                const isActive = f.activeKey === g.key
                const isCreate = isActive && f.kind === 'create'
                const accent = isCreate ? C.signal : isActive ? C.go : C.wire
                return (
                  <div
                    key={g.key}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      border: `1.5px solid ${accent}`,
                      background: '#FBF9F3',
                      borderRadius: 6,
                      padding: '8px 10px',
                      flexWrap: 'wrap',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontWeight: 700,
                        fontSize: 12,
                        color: C.paper,
                        background: accent === C.wire ? C.slate : accent,
                        padding: '3px 8px',
                        borderRadius: 4,
                      }}
                    >
                      {g.key}
                    </span>
                    <span style={{ color: C.slate, fontFamily: MONO, fontSize: 12 }}>→</span>
                    {g.words.map((w) => {
                      const justAdded = f.justAdded === w && isActive
                      return (
                        <span
                          key={w}
                          style={{
                            fontFamily: MONO,
                            fontWeight: 700,
                            fontSize: 13,
                            padding: '4px 9px',
                            borderRadius: 4,
                            border: `1.5px solid ${justAdded ? C.go : C.wire}`,
                            background: justAdded ? C.go : C.paper,
                            color: justAdded ? C.paper : C.ink,
                          }}
                        >
                          {w}
                        </span>
                      )
                    })}
                    {g.words.length === 0 && (
                      <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>empty</span>
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
                f.kind === 'append'
                  ? C.go
                  : f.kind === 'create'
                    ? C.signal
                    : f.kind === 'key'
                      ? C.signal
                      : f.kind === 'consider'
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
        <button className="ga-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="ga-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="ga-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.signal }}>
            {groupCount} groups
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="ga-btn"
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
                  ? fr.kind === 'append'
                    ? C.go
                    : fr.kind === 'create' || fr.kind === 'key'
                      ? C.signal
                      : fr.kind === 'consider'
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
