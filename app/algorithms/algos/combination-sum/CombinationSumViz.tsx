'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; cands: string; target: string }[] = [
  { name: 'classic', cands: '[2,3,6,7]', target: '7' },
  { name: 'target 8', cands: '[2,3,5]', target: '8' },
  { name: 'single', cands: '[2]', target: '6' },
  { name: 'no solution', cands: '[3,5]', target: '7' },
]

function parseNums(text: string): number[] {
  const m = text.match(/\d+/g)
  return (m ? m.map(Number).filter((x) => x > 0) : []).slice(0, 5)
}

const CODE = [
  { ln: 1, t: 'function combinationSum(cands, target) {' },
  { ln: 2, t: '  const res = [], path = [];' },
  { ln: 3, t: '  function backtrack(start, remain) {' },
  { ln: 4, t: '    if (remain === 0) { res.push([...path]); return; }' },
  { ln: 5, t: '    if (remain < 0) return;' },
  { ln: 6, t: '    for (let i = start; i < cands.length; i++) {' },
  { ln: 7, t: '      path.push(cands[i]);' },
  { ln: 8, t: '      backtrack(i, remain - cands[i]);  // reuse i' },
  { ln: 9, t: '      path.pop();                       // undo' },
  { ln: 10, t: '    }' },
  { ln: 11, t: '  }' },
  { ln: 12, t: '  backtrack(0, target);' },
  { ln: 13, t: '  return res;' },
  { ln: 14, t: '}' },
]

type Frame = {
  kind: string
  line: number
  path: number[]
  remain: number
  current: number | null
  results: number[][]
  justAdded: number
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(cands: number[], target: number): Frame[] {
  const frames: Frame[] = []
  const path: number[] = []
  const results: number[][] = []
  let current: number | null = null
  let justAdded = -1
  const CAP = 450

  const pathStr = () => `[${path.join(', ')}]`
  const push = (kind: string, line: number, remain: number, title: string, note: string, vars: [string, string][] = []) => {
    if (frames.length >= CAP) return
    frames.push({ kind, line, remain, title, note, vars, path: [...path], current, results: results.map((r) => [...r]), justAdded })
  }

  const backtrack = (start: number, remain: number) => {
    if (remain === 0) {
      results.push([...path])
      justAdded = results.length - 1
      push('found', 4, remain, `Found ${pathStr()}`, `remain hit 0 — the numbers in the path sum exactly to the target. Record ${pathStr()}.`, [['res.length', String(results.length)]])
      justAdded = -1
      return
    }
    if (remain < 0) {
      push('prune', 5, remain, 'Overshot → prune', `remain = ${remain} < 0: the last choice pushed the sum past the target. Abandon this branch.`, [['remain', String(remain)]])
      return
    }
    for (let i = start; i < cands.length; i++) {
      current = i
      path.push(cands[i])
      push('add', 7, remain - cands[i], `Add ${cands[i]}`, `Use cands[${i}] = ${cands[i]}. remain drops to ${remain} − ${cands[i]} = ${remain - cands[i]}. We pass i (not i+1) so the same number can be reused.`, [['path', pathStr()], ['remain', String(remain - cands[i])]])
      backtrack(i, remain - cands[i])
      path.pop()
      current = i
      push('pop', 9, remain, `Remove ${cands[i]}`, `Backtrack: undo ${cands[i]} and try the next candidate.`, [['path', pathStr()]])
    }
    current = null
  }

  push('start', 12, target, `backtrack(0, ${target})`, `Build combinations that add up to ${target}. Numbers may be reused; each recursion subtracts a choice from the remaining target.`, [['target', String(target)]])
  backtrack(0, target)
  current = null
  push('done', 13, 0, `${results.length} combination${results.length === 1 ? '' : 's'}`, results.length ? `Return ${results.map((r) => `[${r.join(',')}]`).join(', ')}.` : 'No combination sums to the target. Return [].', [['res.length', String(results.length)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'prune' || kind === 'pop'
    ? C.signal
    : kind === 'found' || kind === 'done'
      ? C.go
      : kind === 'add' || kind === 'start'
        ? C.trace
        : C.ink

export default function CombinationSumViz() {
  const [candsText, setCandsText] = useState(PRESETS[0].cands)
  const [targetText, setTargetText] = useState(PRESETS[0].target)

  const cands = useMemo(() => parseNums(candsText), [candsText])
  const target = Math.min(Math.max(Number(targetText) || 0, 0), 15)
  const frames = useMemo(() => buildFrames(cands, target), [cands, target])
  const [i, setI] = useState(0)

  const changeCands = useCallback((v: string) => {
    setCandsText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 24))
    setI(0)
  }, [])
  const changeTarget = useCallback((v: string) => {
    setTargetText(v.replace(/[^0-9]/g, '').slice(0, 2))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { cands: string; target: string }) => {
    setCandsText(p.cands)
    setTargetText(p.target)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const remainColor = f.remain === 0 ? C.go : f.remain < 0 ? C.signal : C.ink

  return (
    <div>
      <style>{`.cs-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .cs-btn:active{transform:translateY(1px)} .cs-btn:disabled{opacity:.35;cursor:not-allowed}
        .cs-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>candidates =</label>
          <input value={candsText} spellCheck={false} placeholder="[2,3,6,7]" onChange={(e) => changeCands(e.target.value)} style={{ ...inputStyle, minWidth: 160, flex: 1 }} />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>target =</label>
          <input value={targetText} spellCheck={false} onChange={(e) => changeTarget(e.target.value)} style={{ ...inputStyle, width: 56 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = candsText.replace(/\s/g, '') === p.cands.replace(/\s/g, '') && targetText === p.target
            return (
              <button key={p.name} className="cs-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Pick numbers (with repetition) that sum to the target. Backtrack when you hit or overshoot 0.
        </div>
      </div>

      {/* TOP */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14 }}>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>candidates</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
          {cands.map((v, idx) => {
            const active = idx === f.current
            return (
              <div key={idx} style={{ minWidth: 42, height: 42, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 16, borderRadius: 6, background: active ? C.signal : '#FBF9F3', color: active ? C.paper : C.ink, border: `2px solid ${active ? C.signal : C.wire}` }}>{v}</div>
            )
          })}
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 4 }}>path</div>
            <div style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700 }}>[{f.path.join(', ')}]</div>
          </div>
          <div>
            <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 4 }}>remain</div>
            <div style={{ fontFamily: MONO, fontSize: 22, fontWeight: 700, color: remainColor }}>{f.remain}</div>
          </div>
        </div>

        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>combinations · {f.results.length}</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', minHeight: 32, alignItems: 'center' }}>
          {f.results.length === 0 ? (
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(none yet)</span>
          ) : (
            f.results.map((r, ri) => (
              <span key={ri} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${C.go}`, background: ri === f.justAdded ? C.go : '#DDE8DC', color: ri === f.justAdded ? C.paper : C.ink }}>
                [{r.join(',')}]
              </span>
            ))
          )}
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
                  <span style={{ width: 26, textAlign: 'right', paddingRight: 8, color: C.codedim, fontFamily: MONO, fontSize: 10.5, userSelect: 'none', lineHeight: '1.65' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 9.5, lineHeight: '1.65', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.65' }}>◄</span>}
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
            <button className="cs-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="cs-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="cs-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="cs-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
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

function btn(bg: string, fg: string, border?: boolean): React.CSSProperties {
  return { fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '11px 18px', background: bg, color: fg, border: border ? `1.5px solid ${C.ink}` : 'none', borderRadius: 4 }
}
