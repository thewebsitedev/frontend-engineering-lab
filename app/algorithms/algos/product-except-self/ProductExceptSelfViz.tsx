'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; nums: string }[] = [
  { name: 'basic', nums: '[1,2,3,4]' },
  { name: 'with zero', nums: '[-1,1,0,-3,3]' },
  { name: 'negatives', nums: '[2,3,-2,4]' },
  { name: 'pair', nums: '[3,4]' },
]

function parseNums(text: string): number[] {
  const m = text.match(/-?\d+/g)
  let arr = m ? m.map(Number) : []
  if (arr.length > 8) arr = arr.slice(0, 8)
  return arr
}

const CODE = [
  { ln: 1, t: 'function productExceptSelf(nums) {' },
  { ln: 2, t: '  const n = nums.length;' },
  { ln: 3, t: '  const answer = new Array(n).fill(1);' },
  { ln: 4, t: '  let prefix = 1;' },
  { ln: 5, t: '  for (let i = 0; i < n; i++) {' },
  { ln: 6, t: '    answer[i] = prefix;' },
  { ln: 7, t: '    prefix *= nums[i];' },
  { ln: 8, t: '  }' },
  { ln: 9, t: '  let suffix = 1;' },
  { ln: 10, t: '  for (let i = n - 1; i >= 0; i--) {' },
  { ln: 11, t: '    answer[i] *= suffix;' },
  { ln: 12, t: '    suffix *= nums[i];' },
  { ln: 13, t: '  }' },
  { ln: 14, t: '  return answer;' },
  { ln: 15, t: '}' },
]

type Tag = 'active' | 'final' | 'partial' | 'empty'
type Phase = 'init' | 'prefix' | 'suffix' | 'done'
type Frame = {
  kind: string
  line: number
  curr: number | null
  phase: Phase
  answer: number[]
  tags: Tag[]
  prefix: number
  suffix: number
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(nums: number[]): Frame[] {
  const n = nums.length
  const frames: Frame[] = []
  const answer = new Array(n).fill(1)
  const filled = new Array(n).fill(false)
  const finalized = new Array(n).fill(false)
  let prefix = 1
  let suffix = 1
  let curr: number | null = null
  let phase: Phase = 'init'

  const tagOf = (i: number): Tag =>
    i === curr ? 'active' : finalized[i] ? 'final' : filled[i] ? 'partial' : 'empty'

  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({
      kind,
      line,
      title,
      note,
      vars,
      curr,
      phase,
      answer: [...answer],
      tags: nums.map((_, i) => tagOf(i)),
      prefix,
      suffix,
    })

  if (n === 0) {
    push('done', 14, 'Empty array', 'There is nothing to process. Return an empty array.')
    return frames
  }

  push('init', 3, 'Start with all 1s', 'answer starts as all 1s. Each answer[i] will become the product of every element EXCEPT nums[i] — and 1 is the neutral starting value for multiplication.', [
    ['answer', `[${answer.join(', ')}]`],
  ])

  phase = 'prefix'
  push('init', 4, 'prefix = 1', 'First pass goes left → right. prefix carries the running product of everything to the LEFT of the current index.', [['prefix', '1']])

  for (let i = 0; i < n; i++) {
    curr = i
    answer[i] = prefix
    filled[i] = true
    push('prefix', 6, `answer[${i}] = prefix`, `Everything to the left of index ${i} multiplies to ${prefix}. Store that in answer[${i}].`, [
      ['i', String(i)],
      ['prefix', String(prefix)],
      ['answer', `[${answer.join(', ')}]`],
    ])
    prefix *= nums[i]
    push('prefix', 7, `prefix *= nums[${i}]`, `Fold nums[${i}] = ${nums[i]} into prefix so it is ready for the next index: prefix = ${prefix}.`, [
      ['i', String(i)],
      ['nums[i]', String(nums[i])],
      ['prefix', String(prefix)],
    ])
  }

  curr = null
  phase = 'suffix'
  push('init', 9, 'suffix = 1', 'Second pass goes right → left. suffix carries the running product of everything to the RIGHT of the current index.', [['suffix', '1']])

  for (let i = n - 1; i >= 0; i--) {
    curr = i
    answer[i] *= suffix
    finalized[i] = true
    push('suffix', 11, `answer[${i}] *= suffix`, `answer[${i}] already holds the left product. Multiply in the right product (${suffix}) → answer[${i}] = ${answer[i]} is now final.`, [
      ['i', String(i)],
      ['suffix', String(suffix)],
      ['answer', `[${answer.join(', ')}]`],
    ])
    suffix *= nums[i]
    push('suffix', 12, `suffix *= nums[${i}]`, `Fold nums[${i}] = ${nums[i]} into suffix for the next index to the left: suffix = ${suffix}.`, [
      ['i', String(i)],
      ['nums[i]', String(nums[i])],
      ['suffix', String(suffix)],
    ])
  }

  curr = null
  phase = 'done'
  push('done', 14, 'Return answer', `Every cell now holds (left product) × (right product) = the product of all other elements. Return [${answer.join(', ')}].`, [
    ['answer', `[${answer.join(', ')}]`],
  ])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'prefix' ? C.trace : kind === 'suffix' ? C.go : kind === 'done' ? C.go : C.ink

export default function ProductExceptSelfViz() {
  const [numsText, setNumsText] = useState(PRESETS[0].nums)

  const nums = useMemo(() => parseNums(numsText), [numsText])
  const frames = useMemo(() => buildFrames(nums), [nums])
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

  const cellColors = (tag: Tag): { bg: string; fg: string; bd: string } => {
    switch (tag) {
      case 'active':
        return { bg: C.signal, fg: C.paper, bd: C.signal }
      case 'final':
        return { bg: C.go, fg: C.paper, bd: C.go }
      case 'partial':
        return { bg: C.trace, fg: C.paper, bd: C.trace }
      default:
        return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
    }
  }

  const cell = (value: React.ReactNode, colors: { bg: string; fg: string; bd: string }, isCurr: boolean) => (
    <div
      style={{
        minWidth: 46,
        height: 46,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 15,
        borderRadius: 6,
        background: colors.bg,
        color: colors.fg,
        border: `2px solid ${isCurr ? C.ink : colors.bd}`,
        padding: '0 6px',
      }}
    >
      {value}
    </div>
  )

  return (
    <div>
      <style>{`.pa-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .pa-btn:active{transform:translateY(1px)} .pa-btn:disabled{opacity:.35;cursor:not-allowed}
        .pa-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>nums =</label>
          <input
            value={numsText}
            spellCheck={false}
            placeholder="[1,2,3,4]"
            onChange={(e) => changeNums(e.target.value)}
            style={{ ...inputStyle, minWidth: 200, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = numsText.replace(/\s/g, '') === p.nums.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="pa-btn"
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
          answer[i] = product of every element except nums[i] — done in two passes, no division.
        </div>
      </div>

      {/* TOP: arrays */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        {/* index labels */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 6, paddingLeft: 64 }}>
          {nums.map((_, idx) => (
            <div key={idx} style={{ minWidth: 46, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: C.slate }}>
              i={idx}
            </div>
          ))}
        </div>

        {/* nums row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
          <div style={{ width: 56, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>nums</div>
          {nums.map((v, idx) => cell(v, idx === f.curr ? { bg: C.ink, fg: C.paper, bd: C.ink } : { bg: '#FBF9F3', fg: C.ink, bd: C.wire }, false))}
        </div>

        {/* answer row */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <div style={{ width: 56, fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>answer</div>
          {f.answer.map((v, idx) => cell(v, cellColors(f.tags[idx]), idx === f.curr))}
        </div>

        {/* accumulators */}
        <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap', paddingLeft: 64 }}>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              border: `2px solid ${C.trace}`,
              background: f.phase === 'prefix' ? C.trace : C.paper,
              color: f.phase === 'prefix' ? C.paper : C.trace,
              opacity: f.phase === 'prefix' || f.phase === 'init' ? 1 : 0.45,
            }}
          >
            prefix = {f.prefix} →
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              padding: '6px 12px',
              borderRadius: 6,
              border: `2px solid ${C.go}`,
              background: f.phase === 'suffix' ? C.go : C.paper,
              color: f.phase === 'suffix' ? C.paper : C.go,
              opacity: f.phase === 'suffix' || f.phase === 'done' ? 1 : 0.45,
            }}
          >
            ← suffix = {f.suffix}
          </span>
        </div>

        {/* legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 12 }}>
          <Swatch color={C.signal} label="current" />
          <Swatch color={C.trace} label="left product stored" />
          <Swatch color={C.go} label="final" />
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
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 11, lineHeight: '1.8', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
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
            <button className="pa-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="pa-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="pa-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="pa-btn"
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
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>
              line {f.line} · {f.phase === 'prefix' ? 'left → right pass' : f.phase === 'suffix' ? 'right → left pass' : 'setup'}
            </div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && (
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.go, marginTop: 10 }}>answer = [{f.answer.join(', ')}]</div>
            )}
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
