'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; nums: string }[] = [
  { name: '[1,2,3]', nums: '[1,2,3]' },
  { name: 'pair', nums: '[1,2]' },
  { name: '[5,6,7]', nums: '[5,6,7]' },
  { name: 'four', nums: '[1,2,3,4]' },
]

function parseNums(text: string): number[] {
  const m = text.match(/-?\d+/g)
  return (m ? m.map(Number) : []).slice(0, 4)
}

const CODE = [
  { ln: 1, t: 'function subsets(nums) {' },
  { ln: 2, t: '  const res = [], path = [];' },
  { ln: 3, t: '  function backtrack(start) {' },
  { ln: 4, t: '    res.push([...path]);' },
  { ln: 5, t: '    for (let i = start; i < nums.length; i++) {' },
  { ln: 6, t: '      path.push(nums[i]);' },
  { ln: 7, t: '      backtrack(i + 1);' },
  { ln: 8, t: '      path.pop();          // undo' },
  { ln: 9, t: '    }' },
  { ln: 10, t: '  }' },
  { ln: 11, t: '  backtrack(0);' },
  { ln: 12, t: '  return res;' },
  { ln: 13, t: '}' },
]

type Frame = {
  kind: string
  line: number
  pathIdx: number[]
  current: number | null
  results: number[][]
  justAdded: number
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(nums: number[]): Frame[] {
  const frames: Frame[] = []
  const pathIdx: number[] = []
  const results: number[][] = []
  let current: number | null = null
  let justAdded = -1
  const CAP = 400

  const subsetStr = () => `[${pathIdx.map((x) => nums[x]).join(', ')}]`
  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) => {
    if (frames.length >= CAP) return
    frames.push({ kind, line, title, note, vars, pathIdx: [...pathIdx], current, results: results.map((r) => [...r]), justAdded })
  }

  const backtrack = (start: number) => {
    results.push(pathIdx.map((x) => nums[x]))
    justAdded = results.length - 1
    push('record', 4, `Record ${subsetStr()}`, `Every state of the path is itself a valid subset, so record it immediately: ${subsetStr()}.`, [['res.length', String(results.length)]])
    justAdded = -1
    for (let i = start; i < nums.length; i++) {
      current = i
      pathIdx.push(i)
      push('add', 6, `Add ${nums[i]}`, `Include nums[${i}] = ${nums[i]} and recurse to decide the elements after it.`, [['path', subsetStr()]])
      backtrack(i + 1)
      pathIdx.pop()
      current = i
      push('pop', 8, `Remove ${nums[i]}`, `Backtrack: drop ${nums[i]} so we can try subsets that DON’T include it.`, [['path', subsetStr()]])
    }
    current = null
  }

  if (nums.length === 0) {
    push('record', 4, 'Record []', 'The only subset of an empty set is the empty set.', [['res.length', '1']])
    return frames
  }

  push('start', 11, 'backtrack(0)', 'Build subsets by choosing, for each element, whether to include it — depth-first.', [])
  backtrack(0)
  current = null
  push('done', 12, `${results.length} subsets`, `Every include/exclude choice has been explored. Return all ${results.length} subsets.`, [['res.length', String(results.length)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'pop'
    ? C.signal
    : kind === 'record' || kind === 'done'
      ? C.go
      : kind === 'add' || kind === 'start'
        ? C.trace
        : C.ink

export default function SubsetsViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)

  const nums = useMemo(() => parseNums(numsText), [numsText])
  const frames = useMemo(() => buildFrames(nums), [nums])
  const [i, setI] = useState(0)

  const changeNums = useCallback((v: string) => {
    setNumsText(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 24))
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

  const cellColors = (idx: number): { bg: string; fg: string; bd: string } => {
    if (idx === f.current) return { bg: C.signal, fg: C.paper, bd: C.signal }
    if (f.pathIdx.includes(idx)) return { bg: C.go, fg: C.paper, bd: C.go }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
  }

  return (
    <div>
      <style>{`.su-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .su-btn:active{transform:translateY(1px)} .su-btn:disabled{opacity:.35;cursor:not-allowed}
        .su-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input value={numsText} spellCheck={false} placeholder="[1,2,3]" onChange={(e) => changeNums(e.target.value)} style={{ ...inputStyle, minWidth: 200, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText.replace(/\s/g, '') === p.nums.replace(/\s/g, '')
            return (
              <button key={p.name} className="su-btn" onClick={() => applyPreset(p.nums)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Every element is either in or out — backtracking explores all 2ⁿ combinations.
        </div>
      </div>

      {/* TOP: nums + path + results */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>nums</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {nums.map((v, idx) => {
            const cc = cellColors(idx)
            return (
              <div key={idx} style={{ minWidth: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 16, borderRadius: 6, background: cc.bg, color: cc.fg, border: `2px solid ${cc.bd}`, padding: '0 6px' }}>{v}</div>
            )
          })}
        </div>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>current subset</div>
        <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, minHeight: 24, marginBottom: 12 }}>[{f.pathIdx.map((x) => nums[x]).join(', ')}]</div>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>subsets found · {f.results.length}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 32, alignItems: 'center' }}>
          {f.results.map((r, ri) => (
            <span key={ri} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12.5, padding: '4px 8px', borderRadius: 4, border: `1.5px solid ${ri === f.justAdded ? C.go : C.wire}`, background: ri === f.justAdded ? C.go : C.paper, color: ri === f.justAdded ? C.paper : C.ink }}>
              [{r.join(',')}]
            </span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 12 }}>
          <Swatch color={C.signal} label="deciding" />
          <Swatch color={C.go} label="in subset" />
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
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
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
            <button className="su-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="su-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="su-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="su-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
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
