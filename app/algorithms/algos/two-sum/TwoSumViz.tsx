'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { nums: string; target: string }[] = [
  { nums: '3, 2, 4', target: '6' },
  { nums: '2, 7, 11, 15', target: '9' },
  { nums: '3, 3', target: '6' },
  { nums: '1, 2, 3, 4', target: '8' },
]

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function twoSum(nums, target) {' },
  { ln: 2, t: '  const seen = new Map();' },
  { ln: 3, t: '  for (let i = 0; i < nums.length; i++) {' },
  { ln: 4, t: '    const need = target - nums[i];' },
  { ln: 5, t: '    if (seen.has(need))' },
  { ln: 6, t: '      return [seen.get(need), i];' },
  { ln: 7, t: '    seen.set(nums[i], i);' },
  { ln: 8, t: '  }' },
  { ln: 9, t: '}' },
]

type Entry = { key: number; val: number }
type Frame = {
  kind: string
  line: number
  i: number | null
  need: number | null
  seen: Entry[]
  checkKey: number | null
  foundIndex: number | null
  stored: number | null
  answer: number[] | null
  vars: Record<string, string | number>
  title: string
  note: string
}

function buildFrames(
  nums: number[],
  target: number,
): { frames: Frame[]; answer: number[] | null } {
  const frames: Frame[] = []
  const seenMap: Record<number, number> = {}
  const seen: Entry[] = []
  let answer: number[] | null = null

  frames.push({
    kind: 'start',
    line: 2,
    i: null,
    need: null,
    seen: [],
    checkKey: null,
    foundIndex: null,
    stored: null,
    answer: null,
    vars: {},
    title: 'Start',
    note: 'Create an empty map of value → index. We walk the array once.',
  })

  for (let i = 0; i < nums.length; i++) {
    const val = nums[i]

    frames.push({
      kind: 'consider',
      line: 3,
      i,
      need: null,
      seen: [...seen],
      checkKey: null,
      foundIndex: null,
      stored: null,
      answer: null,
      vars: { i, 'nums[i]': val },
      title: `Index ${i}`,
      note: `Look at index ${i} — the value is ${val}.`,
    })

    const need = target - val
    frames.push({
      kind: 'compute',
      line: 4,
      i,
      need,
      seen: [...seen],
      checkKey: null,
      foundIndex: null,
      stored: null,
      answer: null,
      vars: { i, 'nums[i]': val, need },
      title: 'Compute the partner',
      note: `need = target − nums[i] = ${target} − ${val} = ${need}. Have we seen a ${need} already?`,
    })

    if (need in seenMap) {
      const j = seenMap[need]
      answer = [j, i]
      frames.push({
        kind: 'found',
        line: 6,
        i,
        need,
        seen: [...seen],
        checkKey: need,
        foundIndex: j,
        stored: null,
        answer: [j, i],
        vars: { i, 'nums[i]': val, need },
        title: `Match: return [${j}, ${i}]`,
        note: `${need} is in the map at index ${j}. nums[${j}] + nums[${i}] = ${need} + ${val} = ${target}. Done.`,
      })
      break
    }

    frames.push({
      kind: 'miss',
      line: 5,
      i,
      need,
      seen: [...seen],
      checkKey: need,
      foundIndex: null,
      stored: null,
      answer: null,
      vars: { i, 'nums[i]': val, need },
      title: 'Not seen yet',
      note: `${need} is not in the map. Remember the current value for later.`,
    })

    seenMap[val] = i
    seen.push({ key: val, val: i })
    frames.push({
      kind: 'store',
      line: 7,
      i,
      need,
      seen: [...seen],
      checkKey: null,
      foundIndex: null,
      stored: i,
      answer: null,
      vars: { i, 'nums[i]': val, need },
      title: `Store ${val} → ${i}`,
      note: `Save ${val} → ${i} so a future element can find it in O(1).`,
    })
  }

  if (answer === null) {
    frames.push({
      kind: 'none',
      line: 9,
      i: null,
      need: null,
      seen: [...seen],
      checkKey: null,
      foundIndex: null,
      stored: null,
      answer: null,
      vars: {},
      title: 'No pair found',
      note: 'Reached the end of the array without finding two values that sum to the target.',
    })
  }

  return { frames, answer }
}

export default function TwoSumViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)
  const [targetText, setTargetText] = useState(PRESETS[0].target)

  const nums = useMemo(
    () =>
      numsText
        .split(',')
        .map((t) => Number(t.trim()))
        .filter((n) => Number.isFinite(n))
        .slice(0, 12),
    [numsText],
  )
  const target = useMemo(() => {
    const t = Number(targetText.trim())
    return Number.isFinite(t) ? t : 0
  }, [targetText])

  const { frames, answer } = useMemo(() => buildFrames(nums, target), [nums, target])
  const [i, setI] = useState(0)

  // Any input change is a new problem — apply it and rewind.
  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s-]/g, ''))
    setI(0)
  }, [])
  const changeTarget = useCallback((v: string) => {
    setTargetText(v.replace(/[^0-9-]/g, ''))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { nums: string; target: string }) => {
    setNumsText(p.nums)
    setTargetText(p.target)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const varOrder = ['i', 'nums[i]', 'need']
  const varColor: Record<string, string> = {
    i: C.trace,
    'nums[i]': C.ink,
    need: C.signal,
  }

  return (
    <div>
      <style>{`.ts-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .ts-btn:active{transform:translateY(1px)} .ts-btn:disabled{opacity:.35;cursor:not-allowed}
        .ts-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input
            value={numsText}
            spellCheck={false}
            placeholder="3, 2, 4"
            onChange={(e) => changeNums(e.target.value)}
            style={inputStyle(200)}
          />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>target =</label>
          <input
            value={targetText}
            spellCheck={false}
            placeholder="6"
            onChange={(e) => changeTarget(e.target.value)}
            style={inputStyle(70)}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText === p.nums && targetText === p.target
            return (
              <button
                key={`${p.nums}|${p.target}`}
                className="ts-btn"
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
                [{p.nums}] → {p.target}
              </button>
            )
          })}
        </div>
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
                    fontSize: 13.5,
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
                    <span style={{ color: varColor[k] === C.ink ? C.codedim : varColor[k] }}>{k}</span>
                    <span style={{ color: C.codedim }}> = </span>
                    <b>{String(f.vars[k])}</b>
                  </span>
                ))
            )}
          </div>
        </div>

        {/* RIGHT: array + need + map + narration */}
        <div>
          {/* Array */}
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
            array
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {nums.length === 0 && (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
            )}
            {nums.map((n, idx) => {
              const inAnswer = f.answer?.includes(idx)
              const isCurrent = f.i === idx && !inAnswer
              const isPartner = f.foundIndex === idx && !inAnswer
              const isStored = f.seen.some((e) => e.val === idx) && !isCurrent && !inAnswer && !isPartner

              let bg = '#FBF9F3'
              let fg: string = C.ink
              let bd: string = C.wire
              if (inAnswer) {
                bg = C.signal
                fg = C.paper
                bd = C.signal
              } else if (isCurrent) {
                bg = C.trace
                fg = C.paper
                bd = C.trace
              } else if (isPartner) {
                bg = C.go
                fg = C.paper
                bd = C.go
              } else if (isStored) {
                bd = C.slate
              }
              return (
                <div key={idx} style={{ flex: 1, textAlign: 'center' }}>
                  <div
                    style={{
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 20,
                      padding: '12px 0',
                      border: `2px solid ${bd}`,
                      background: bg,
                      color: fg,
                      borderRadius: 6,
                    }}
                  >
                    {n}
                  </div>
                  <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 4 }}>
                    {idx}
                  </div>
                </div>
              )
            })}
          </div>

          {/* need badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 14,
              minHeight: 30,
            }}
          >
            {f.need !== null && (
              <span
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  fontWeight: 700,
                  padding: '5px 11px',
                  borderRadius: 4,
                  background: f.kind === 'found' ? C.go : C.paper,
                  color: f.kind === 'found' ? C.paper : C.signal,
                  border: `1.5px solid ${f.kind === 'found' ? C.go : C.signal}`,
                }}
              >
                need = {f.need}
              </span>
            )}
            {f.kind === 'miss' && (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>not in map →</span>
            )}
            {f.kind === 'found' && (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.go }}>found in map ✓</span>
            )}
          </div>

          {/* hash map */}
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
            seen (value → index)
          </div>
          <div
            style={{
              border: `1.5px solid ${C.wire}`,
              borderRadius: 6,
              background: '#FBF9F3',
              padding: 8,
              marginBottom: 16,
              minHeight: 44,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 6,
            }}
          >
            {f.seen.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate, padding: 4 }}>
                (empty)
              </span>
            ) : (
              f.seen.map((e) => {
                const isMatch = f.checkKey === e.key && f.kind === 'found'
                const isJustStored = f.kind === 'store' && f.stored === e.val
                let bd: string = C.wire
                let bg: string = C.paper
                if (isMatch) {
                  bg = C.go
                  bd = C.go
                } else if (isJustStored) {
                  bd = C.signal
                }
                return (
                  <span
                    key={e.key}
                    style={{
                      fontFamily: MONO,
                      fontSize: 13,
                      fontWeight: 700,
                      padding: '5px 10px',
                      borderRadius: 4,
                      border: `1.5px solid ${bd}`,
                      background: bg,
                      color: isMatch ? C.paper : C.ink,
                    }}
                  >
                    {e.key} → {e.val}
                  </span>
                )
              })
            )}
          </div>

          {/* narration */}
          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'found'
                  ? C.go
                  : f.kind === 'compute'
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
        <button className="ts-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="ts-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="ts-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && answer && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.signal }}>
            return [{answer[0]}, {answer[1]}]
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="ts-btn"
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
                  ? fr.kind === 'found'
                    ? C.go
                    : fr.kind === 'compute'
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

function inputStyle(minWidth: number): React.CSSProperties {
  return {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: 700,
    padding: '8px 11px',
    border: `1.5px solid ${C.ink}`,
    borderRadius: 6,
    background: '#FBF9F3',
    color: C.ink,
    minWidth,
  }
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
