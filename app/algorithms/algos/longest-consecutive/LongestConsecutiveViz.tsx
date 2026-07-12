'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; nums: string }[] = [
  { name: 'classic', nums: '[100,4,200,1,3,2]' },
  { name: 'with dupes', nums: '[0,3,7,2,5,8,4,6,0,1]' },
  { name: 'two runs', nums: '[10,5,11,6,12,7]' },
  { name: 'tiny', nums: '[1,2,0,1]' },
]

function parseNums(text: string): number[] {
  const m = text.match(/-?\d+/g)
  return (m ? m.map(Number) : []).slice(0, 12)
}

const CODE = [
  { ln: 1, t: 'function longestConsecutive(nums) {' },
  { ln: 2, t: '  const set = new Set(nums);' },
  { ln: 3, t: '  let best = 0;' },
  { ln: 4, t: '  for (const n of set) {' },
  { ln: 5, t: '    if (!set.has(n - 1)) {      // n starts a run' },
  { ln: 6, t: '      let length = 1;' },
  { ln: 7, t: '      let cur = n;' },
  { ln: 8, t: '      while (set.has(cur + 1)) {' },
  { ln: 9, t: '        cur++;' },
  { ln: 10, t: '        length++;' },
  { ln: 11, t: '      }' },
  { ln: 12, t: '      best = Math.max(best, length);' },
  { ln: 13, t: '    }' },
  { ln: 14, t: '  }' },
  { ln: 15, t: '  return best;' },
  { ln: 16, t: '}' },
]

type Frame = {
  kind: string
  line: number
  curr: number | null
  probe: number | null
  probeHit: boolean
  runMembers: number[]
  bestRun: number[]
  length: number | null
  best: number
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(nums: number[]): { frames: Frame[]; setArr: number[] } {
  // display order = first occurrence, deduped (matches Set insertion order)
  const setArr: number[] = []
  const set = new Set<number>()
  for (const x of nums) {
    if (!set.has(x)) {
      set.add(x)
      setArr.push(x)
    }
  }

  const frames: Frame[] = []
  let best = 0
  let bestRun: number[] = []
  let runMembers: number[] = []
  let length: number | null = null
  let curr: number | null = null
  let probe: number | null = null
  let probeHit = false

  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({
      kind,
      line,
      title,
      note,
      vars,
      curr,
      probe,
      probeHit,
      runMembers: [...runMembers],
      bestRun: [...bestRun],
      length,
      best,
    })

  if (setArr.length === 0) {
    push('done', 15, 'Empty input', 'There are no numbers, so the longest run has length 0.', [['best', '0']])
    return { frames, setArr }
  }

  push('init', 2, 'Put every number in a set', `Dedupe into a hash set so membership tests (“is x here?”) are O(1). ${nums.length !== setArr.length ? `Duplicates dropped: ${nums.length} → ${setArr.length}.` : ''}`, [['set', `{${setArr.join(', ')}}`]])
  push('init', 3, 'best = 0', 'Track the longest consecutive run seen so far.', [['best', '0']])

  for (const n of setArr) {
    curr = n
    probe = null
    runMembers = []
    length = null
    push('pick', 4, `Consider n = ${n}`, `Look at ${n} as a possible START of a run.`, [['n', String(n)]])

    probe = n - 1
    probeHit = set.has(n - 1)
    if (probeHit) {
      push('skip', 5, `${n} is not a run start`, `${n - 1} IS in the set, so ${n} sits in the MIDDLE of some run — it will be counted when we start from that run's beginning. Skip it. (This is the trick that keeps the whole thing O(n).)`, [['n-1', String(n - 1)], ['in set?', 'yes → skip']])
      probe = null
      continue
    }
    push('start', 5, `${n} starts a run`, `${n - 1} is NOT in the set, so nothing comes before ${n}. It is the true beginning of a run — count forward from here.`, [['n-1', String(n - 1)], ['in set?', 'no → start']])

    length = 1
    runMembers = [n]
    push('build', 6, 'length = 1', `The run so far is just [${n}].`, [['length', '1']])

    let cur = n
    push('build', 7, `cur = ${n}`, 'cur is the walking pointer along the run.', [['cur', String(cur)]])

    while (true) {
      probe = cur + 1
      probeHit = set.has(cur + 1)
      if (!probeHit) {
        push('stop', 8, `${cur + 1} not in set`, `${cur + 1} is missing, so the run ends at ${cur}. Length = ${length}.`, [['cur+1', String(cur + 1)], ['in set?', 'no → stop']])
        break
      }
      push('check', 8, `${cur + 1} is in the set`, `${cur + 1} continues the run — extend.`, [['cur+1', String(cur + 1)], ['in set?', 'yes → extend']])
      cur++
      length++
      runMembers.push(cur)
      push('extend', 10, `Extend to ${cur}`, `Run is now [${runMembers.join(', ')}], length ${length}.`, [['cur', String(cur)], ['length', String(length)]])
    }

    probe = null
    const improved = (length ?? 0) > best
    if (improved) {
      best = length!
      bestRun = [...runMembers]
    }
    push('best', 12, improved ? `New best: ${best}` : `Best stays ${best}`, `This run has length ${length}. ${improved ? `That beats the old best → best = ${best}.` : `best is still ${best}.`}`, [['length', String(length)], ['best', String(best)]])
  }

  curr = null
  probe = null
  runMembers = []
  length = null
  push('done', 15, `Answer: ${best}`, `The longest consecutive run is ${bestRun.length ? `[${bestRun.join(', ')}]` : 'empty'} with length ${best}. Return ${best}.`, [['best', String(best)]])
  return { frames, setArr }
}

const kindColor = (kind: string): string =>
  kind === 'skip' || kind === 'stop'
    ? C.signal
    : kind === 'extend' || kind === 'build' || kind === 'start' || kind === 'best' || kind === 'done'
      ? C.go
      : kind === 'pick' || kind === 'check'
        ? C.trace
        : C.ink

export default function LongestConsecutiveViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)

  const nums = useMemo(() => parseNums(numsText), [numsText])
  const { frames, setArr } = useMemo(() => buildFrames(nums), [nums])
  const [i, setI] = useState(0)

  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 60))
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

  const atEndFrame = atEnd
  const chipColors = (v: number): { bg: string; fg: string; bd: string; dash: boolean } => {
    const inRun = f.runMembers.includes(v)
    const isBest = atEndFrame && f.bestRun.includes(v)
    const isProbe = f.probe === v
    if (f.curr === v && !inRun) return { bg: C.signal, fg: C.paper, bd: C.signal, dash: isProbe }
    if (inRun) return { bg: C.go, fg: C.paper, bd: C.go, dash: isProbe }
    if (isBest) return { bg: '#DDE8DC', fg: C.ink, bd: C.go, dash: false }
    if (isProbe) return { bg: '#FBF9F3', fg: C.ink, bd: f.probeHit ? C.trace : C.signal, dash: true }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire, dash: false }
  }

  return (
    <div>
      <style>{`.lc-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .lc-btn:active{transform:translateY(1px)} .lc-btn:disabled{opacity:.35;cursor:not-allowed}
        .lc-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input
            value={numsText}
            spellCheck={false}
            placeholder="[100,4,200,1,3,2]"
            onChange={(e) => changeNums(e.target.value)}
            style={{ ...inputStyle, minWidth: 220, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText.replace(/\s/g, '') === p.nums.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="lc-btn"
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
          Find the longest run of consecutive integers (order doesn’t matter). No sorting — a hash set does it in O(n).
        </div>
      </div>

      {/* TOP: set + run */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>hash set</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 46, alignItems: 'center' }}>
          {setArr.length === 0 ? (
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
          ) : (
            setArr.map((v) => {
              const cc = chipColors(v)
              return (
                <div
                  key={v}
                  style={{
                    minWidth: 42,
                    height: 42,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 15,
                    borderRadius: 6,
                    background: cc.bg,
                    color: cc.fg,
                    border: `2px ${cc.dash ? 'dashed' : 'solid'} ${cc.bd}`,
                    padding: '0 8px',
                  }}
                >
                  {v}
                </div>
              )
            })
          )}
        </div>

        {/* run builder */}
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, margin: '16px 0 6px' }}>current run</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 40, alignItems: 'center' }}>
          {f.runMembers.length === 0 ? (
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>—</span>
          ) : (
            f.runMembers.map((v, idx) => (
              <span key={idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                {idx > 0 && <span style={{ fontFamily: MONO, color: C.slate }}>→</span>}
                <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '5px 10px', borderRadius: 4, background: C.go, color: C.paper, border: `1.5px solid ${C.go}` }}>{v}</span>
              </span>
            ))
          )}
          {f.length != null && (
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate, marginLeft: 6 }}>length {f.length}</span>
          )}
          <div style={{ flex: 1 }} />
          <span style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700, padding: '6px 12px', borderRadius: 6, border: `2px solid ${C.go}`, background: C.go, color: C.paper }}>best = {f.best}</span>
        </div>

        {/* legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 14 }}>
          <Swatch color={C.signal} label="candidate n" />
          <Swatch color={C.go} label="in current run" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 14, borderRadius: 4, background: '#FBF9F3', border: `2px dashed ${C.trace}` }} />
            probed (set lookup)
          </span>
        </div>
      </div>

      {/* BOTTOM: code+controls | narration */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 18, alignItems: 'start' }}>
        {/* LEFT */}
        <div>
          <div style={{ background: C.codebg, borderRadius: 6, padding: '14px 6px 14px 0', overflowX: 'auto' }}>
            {CODE.map((row) => {
              const active = row.ln === f.line && row.t.trim() !== ''
              return (
                <div
                  key={row.ln}
                  style={{ display: 'flex', background: active ? C.codehl : 'transparent', borderLeft: `3px solid ${active ? C.signal : 'transparent'}` }}
                >
                  <span
                    style={{
                      width: 26,
                      textAlign: 'right',
                      paddingRight: 8,
                      color: C.codedim,
                      fontFamily: MONO,
                      fontSize: 11,
                      userSelect: 'none',
                      lineHeight: '1.7',
                    }}
                  >
                    {row.ln}
                  </span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 11, lineHeight: '1.7' }}>◄</span>}
                </div>
              )
            })}

            <div style={{ borderTop: `1px solid ${C.codehl}`, marginTop: 10, paddingTop: 10, paddingLeft: 12, display: 'flex', flexWrap: 'wrap', gap: 8 }}>
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
            <button className="lc-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="lc-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="lc-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="lc-btn"
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
