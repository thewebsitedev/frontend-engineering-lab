'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { nums: string; k: string }[] = [
  { nums: '1, 1, 1, 2, 2, 3', k: '2' },
  { nums: '4, 4, 6, 6, 6, 2, 2, 2, 2', k: '2' },
  { nums: '1, 2, 3, 4', k: '2' },
  { nums: '7', k: '1' },
]

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function topKFrequent(nums, k) {' },
  { ln: 2, t: '  const count = new Map();' },
  { ln: 3, t: '  for (const n of nums) count.set(n, (count.get(n) || 0) + 1);' },
  { ln: 4, t: '  const buckets = Array.from({length: nums.length+1}, () => []);' },
  { ln: 5, t: '  for (const [n, c] of count) buckets[c].push(n);' },
  { ln: 6, t: '  const res = [];' },
  { ln: 7, t: '  for (let c = buckets.length-1; c > 0 && res.length < k; c--)' },
  { ln: 8, t: '    for (const n of buckets[c]) {' },
  { ln: 9, t: '      res.push(n);' },
  { ln: 10, t: '      if (res.length === k) return res;' },
  { ln: 11, t: '    }' },
  { ln: 12, t: '  return res;' },
  { ln: 13, t: '}' },
]

type Frame = {
  kind: string
  line: number
  numIdx: number | null
  count: [number, number][]
  activeVal: number | null
  buckets: number[][]
  scanFreq: number | null
  result: number[]
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(nums: number[], k: number): { frames: Frame[]; result: number[] } {
  const frames: Frame[] = []
  const count = new Map<number, number>()
  const entries = () => Array.from(count.entries()) as [number, number][]
  const B = nums.length
  const buckets: number[][] = Array.from({ length: B + 1 }, () => [])
  const snapB = () => buckets.map((b) => [...b])

  frames.push({
    kind: 'start',
    line: 2,
    numIdx: null,
    count: [],
    activeVal: null,
    buckets: [],
    scanFreq: null,
    result: [],
    vars: [['k', String(k)]],
    title: 'Start',
    note: `Goal: the ${k} most frequent value${k === 1 ? '' : 's'}. Step 1 — count how often each value appears.`,
  })

  for (let idx = 0; idx < nums.length; idx++) {
    const n = nums[idx]
    count.set(n, (count.get(n) || 0) + 1)
    frames.push({
      kind: 'count',
      line: 3,
      numIdx: idx,
      count: entries(),
      activeVal: n,
      buckets: [],
      scanFreq: null,
      result: [],
      vars: [
        ['k', String(k)],
        ['n', String(n)],
        ['count', String(count.get(n))],
      ],
      title: `Count ${n}`,
      note: `Saw ${n}; its count is now ${count.get(n)}.`,
    })
  }

  frames.push({
    kind: 'bucketStart',
    line: 4,
    numIdx: null,
    count: entries(),
    activeVal: null,
    buckets: snapB(),
    scanFreq: null,
    result: [],
    vars: [['k', String(k)]],
    title: 'Build buckets',
    note: 'Step 2 — group values by frequency. A value with count c goes in bucket c.',
  })

  for (const [val, c] of count) {
    buckets[c].push(val)
    frames.push({
      kind: 'bucketPlace',
      line: 5,
      numIdx: null,
      count: entries(),
      activeVal: val,
      buckets: snapB(),
      scanFreq: c,
      result: [],
      vars: [
        ['k', String(k)],
        ['n', String(val)],
        ['c', String(c)],
      ],
      title: `Place ${val}`,
      note: `${val} appears ${c}×, so it goes in bucket ${c}.`,
    })
  }

  const res: number[] = []
  let done = false
  for (let c = B; c > 0 && !done; c--) {
    if (buckets[c].length === 0) continue
    frames.push({
      kind: 'scan',
      line: 7,
      numIdx: null,
      count: entries(),
      activeVal: null,
      buckets: snapB(),
      scanFreq: c,
      result: [...res],
      vars: [
        ['k', String(k)],
        ['res', String(res.length)],
      ],
      title: `Scan bucket ${c}`,
      note: `Step 3 — bucket ${c} holds the highest frequency not yet taken.`,
    })
    for (const n of buckets[c]) {
      res.push(n)
      const full = res.length === k
      frames.push({
        kind: 'collect',
        line: 9,
        numIdx: null,
        count: entries(),
        activeVal: n,
        buckets: snapB(),
        scanFreq: c,
        result: [...res],
        vars: [
          ['k', String(k)],
          ['res', String(res.length)],
        ],
        title: `Take ${n}`,
        note: `Add ${n} to the result (${res.length}/${k}).`,
      })
      if (full) {
        done = true
        break
      }
    }
  }

  frames.push({
    kind: 'done',
    line: done ? 10 : 12,
    numIdx: null,
    count: entries(),
    activeVal: null,
    buckets: snapB(),
    scanFreq: null,
    result: [...res],
    vars: [['k', String(k)]],
    title: `Result: [${res.join(', ')}]`,
    note: `The ${k} most frequent value${k === 1 ? '' : 's'}: [${res.join(', ')}].`,
  })

  return { frames, result: res }
}

export default function TopKFrequentViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)
  const [kText, setKText] = useState(PRESETS[0].k)

  const nums = useMemo(
    () =>
      numsText
        .split(',')
        .map((t) => Number(t.trim()))
        .filter((n) => Number.isFinite(n))
        .slice(0, 14),
    [numsText],
  )
  const distinct = useMemo(() => new Set(nums).size, [nums])
  const k = Math.min(Math.max(Number(kText) || 1, 1), Math.max(distinct, 1))

  const maxFreq = useMemo(() => {
    const m = new Map<number, number>()
    nums.forEach((n) => m.set(n, (m.get(n) || 0) + 1))
    return Math.max(0, ...Array.from(m.values()))
  }, [nums])

  const { frames } = useMemo(() => buildFrames(nums, k), [nums, k])
  const [i, setI] = useState(0)

  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s-]/g, ''))
    setI(0)
  }, [])
  const changeK = useCallback((v: string) => {
    setKText(v)
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { nums: string; k: string }) => {
    setNumsText(p.nums)
    setKText(p.k)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const selectStyle: React.CSSProperties = {
    fontFamily: MONO,
    fontSize: 14,
    fontWeight: 700,
    padding: '7px 9px',
    border: `1.5px solid ${C.ink}`,
    borderRadius: 6,
    background: '#FBF9F3',
    color: C.ink,
  }

  return (
    <div>
      <style>{`.tk-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .tk-btn:active{transform:translateY(1px)} .tk-btn:disabled{opacity:.35;cursor:not-allowed}
        .tk-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input
            value={numsText}
            spellCheck={false}
            placeholder="1, 1, 1, 2, 2, 3"
            onChange={(e) => changeNums(e.target.value)}
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              padding: '8px 11px',
              border: `1.5px solid ${C.ink}`,
              borderRadius: 6,
              background: '#FBF9F3',
              color: C.ink,
              minWidth: 200,
              flex: 1,
            }}
          />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>k =</label>
          <select value={String(k)} onChange={(e) => changeK(e.target.value)} style={selectStyle}>
            {Array.from({ length: Math.max(distinct, 1) }, (_, idx) => idx + 1).map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText === p.nums && kText === p.k
            return (
              <button
                key={`${p.nums}|${p.k}`}
                className="tk-btn"
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
                [{p.nums}] k={p.k}
              </button>
            )
          })}
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
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
                    width: 30,
                    textAlign: 'right',
                    paddingRight: 10,
                    color: C.codedim,
                    fontFamily: MONO,
                    fontSize: 12,
                    userSelect: 'none',
                    lineHeight: '1.85',
                  }}
                >
                  {row.ln}
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 11,
                    lineHeight: '1.85',
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
                      paddingRight: 8,
                      color: C.signal,
                      fontFamily: MONO,
                      fontSize: 12,
                      lineHeight: '1.85',
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
            {f.vars.map(([key, val]) => (
              <span
                key={key}
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  background: '#000',
                  color: C.codeink,
                  padding: '4px 9px',
                  borderRadius: 4,
                  border: `1px solid ${key === 'k' ? C.signal : C.trace}`,
                }}
              >
                <span style={{ color: key === 'k' ? C.signal : C.trace }}>{key}</span>
                <span style={{ color: C.codedim }}> = </span>
                <b>{val}</b>
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: nums + count + buckets + result + narration */}
        <div>
          {/* nums */}
          <Label>nums</Label>
          <div style={{ display: 'flex', gap: 5, marginBottom: 14, flexWrap: 'wrap' }}>
            {nums.length === 0 && <Empty />}
            {nums.map((n, idx) => {
              const cur = f.numIdx === idx
              return (
                <div
                  key={idx}
                  style={{
                    minWidth: 32,
                    textAlign: 'center',
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 16,
                    padding: '7px 8px',
                    borderRadius: 5,
                    border: `2px solid ${cur ? C.trace : C.wire}`,
                    background: cur ? C.trace : '#FBF9F3',
                    color: cur ? C.paper : C.ink,
                  }}
                >
                  {n}
                </div>
              )
            })}
          </div>

          {/* count map */}
          <Label>count (value → frequency)</Label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap', minHeight: 30 }}>
            {f.count.length === 0 ? (
              <Empty />
            ) : (
              f.count.map(([val, c]) => {
                const hot = f.activeVal === val && (f.kind === 'count' || f.kind === 'bucketPlace')
                return (
                  <span
                    key={val}
                    style={{
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 13,
                      padding: '5px 9px',
                      borderRadius: 4,
                      border: `1.5px solid ${hot ? C.signal : C.wire}`,
                      background: hot ? C.signal : C.paper,
                      color: hot ? C.paper : C.ink,
                    }}
                  >
                    {val}:{c}
                  </span>
                )
              })
            )}
          </div>

          {/* buckets */}
          <Label>buckets (by frequency, high → low)</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 14 }}>
            {maxFreq === 0 ? (
              <Empty />
            ) : (
              Array.from({ length: maxFreq }, (_, idx) => maxFreq - idx).map((c) => {
                const cells = f.buckets[c] ?? []
                const activeRow = f.scanFreq === c
                return (
                  <div
                    key={c}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      border: `1.5px solid ${activeRow ? C.signal : C.wire}`,
                      borderRadius: 6,
                      padding: '5px 8px',
                      background: '#FBF9F3',
                    }}
                  >
                    <span
                      style={{
                        fontFamily: MONO,
                        fontWeight: 700,
                        fontSize: 12,
                        color: C.paper,
                        background: activeRow ? C.signal : C.slate,
                        padding: '2px 7px',
                        borderRadius: 4,
                        flex: 'none',
                      }}
                    >
                      ×{c}
                    </span>
                    {cells.length === 0 ? (
                      <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>—</span>
                    ) : (
                      cells.map((val, vi) => {
                        const taken = f.result.includes(val)
                        const justTook = f.activeVal === val && f.kind === 'collect'
                        const justPlaced = f.activeVal === val && f.kind === 'bucketPlace'
                        let bg: string = C.paper
                        let fg: string = C.ink
                        let bd: string = C.wire
                        if (justTook || justPlaced) {
                          bg = C.go
                          fg = C.paper
                          bd = C.go
                        } else if (taken) {
                          bg = '#E4EDE4'
                          fg = C.slate
                          bd = '#CdD8Cd'
                        }
                        return (
                          <span
                            key={vi}
                            style={{
                              fontFamily: MONO,
                              fontWeight: 700,
                              fontSize: 13,
                              padding: '4px 9px',
                              borderRadius: 4,
                              border: `1.5px solid ${bd}`,
                              background: bg,
                              color: fg,
                            }}
                          >
                            {val}
                          </span>
                        )
                      })
                    )}
                  </div>
                )
              })
            )}
          </div>

          {/* result */}
          <Label>result</Label>
          <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap', minHeight: 30 }}>
            {f.result.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>[]</span>
            ) : (
              f.result.map((val, idx) => (
                <span
                  key={idx}
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '6px 11px',
                    borderRadius: 4,
                    border: `1.5px solid ${C.go}`,
                    background: idx === f.result.length - 1 && f.kind === 'collect' ? C.go : C.paper,
                    color: idx === f.result.length - 1 && f.kind === 'collect' ? C.paper : C.go,
                  }}
                >
                  {val}
                </span>
              ))
            )}
          </div>

          {/* narration */}
          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'collect' || f.kind === 'done'
                  ? C.go
                  : f.kind === 'count'
                    ? C.signal
                    : f.kind === 'bucketPlace' || f.kind === 'scan'
                      ? C.trace
                      : C.ink
              }`,
              paddingLeft: 12,
              minHeight: 70,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>
              STEP {Math.min(i, frames.length - 1)} / {frames.length - 1} · line {f.line}
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
        <button className="tk-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="tk-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="tk-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.go }}>
            [{f.result.join(', ')}]
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="tk-btn"
            onClick={() => setI(idx)}
            aria-label={`step ${idx}`}
            style={{
              height: 6,
              flex: 1,
              border: 'none',
              borderRadius: 3,
              padding: 0,
              background:
                idx <= Math.min(i, frames.length - 1)
                  ? fr.kind === 'collect' || fr.kind === 'done'
                    ? C.go
                    : fr.kind === 'count'
                      ? C.signal
                      : fr.kind === 'bucketPlace' || fr.kind === 'scan'
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

function Label({ children }: { children: string }) {
  return (
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
      {children}
    </div>
  )
}

function Empty() {
  return <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
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
