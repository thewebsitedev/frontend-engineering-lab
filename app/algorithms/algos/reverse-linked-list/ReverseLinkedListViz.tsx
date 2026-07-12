'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; list: string }[] = [
  { name: '1→2→3→4→5', list: '[1,2,3,4,5]' },
  { name: '1→2→3', list: '[1,2,3]' },
  { name: 'pair', list: '[1,2]' },
  { name: 'single', list: '[7]' },
]

function parseList(text: string): number[] {
  const m = text.match(/-?\d+/g)
  return (m ? m.map(Number) : []).slice(0, 7)
}

const CODE = [
  { ln: 1, t: 'function reverseList(head) {' },
  { ln: 2, t: '  let prev = null;' },
  { ln: 3, t: '  let curr = head;' },
  { ln: 4, t: '  while (curr !== null) {' },
  { ln: 5, t: '    const next = curr.next;' },
  { ln: 6, t: '    curr.next = prev;' },
  { ln: 7, t: '    prev = curr;' },
  { ln: 8, t: '    curr = next;' },
  { ln: 9, t: '  }' },
  { ln: 10, t: '  return prev;' },
  { ln: 11, t: '}' },
]

type Frame = {
  kind: string
  line: number
  nextPtr: (number | null)[]
  prev: number | null
  curr: number | null
  nextTmp: number | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(values: number[]): Frame[] {
  const n = values.length
  const frames: Frame[] = []
  const nextPtr: (number | null)[] = values.map((_, idx) => (idx + 1 < n ? idx + 1 : null))
  let prev: number | null = null
  let curr: number | null = n > 0 ? 0 : null
  let nextTmp: number | null = null

  const nameOf = (idx: number | null) => (idx === null ? 'null' : String(values[idx]))
  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, title, note, vars, nextPtr: [...nextPtr], prev, curr, nextTmp })

  if (n === 0) {
    push('done', 10, 'Empty list', 'Nothing to reverse. Return null.', [['prev', 'null']])
    return frames
  }

  push('init', 2, 'prev = null', 'prev will become the head of the reversed list. It starts as null (the new tail’s next).', [['prev', 'null']])
  push('init', 3, 'curr = head', 'curr walks the original list from the front.', [['curr', nameOf(curr)]])

  while (curr !== null) {
    push('check', 4, `curr = ${nameOf(curr)}`, `curr is not null, so reverse this node’s link.`, [['curr', nameOf(curr)]])

    nextTmp = nextPtr[curr]
    push('save', 5, `next = ${nameOf(nextTmp)}`, `Save the next node BEFORE we overwrite curr.next — otherwise we’d lose the rest of the list.`, [['next', nameOf(nextTmp)]])

    nextPtr[curr] = prev
    push('reverse', 6, `${nameOf(curr)}.next = ${nameOf(prev)}`, `Flip this node’s pointer to aim backward at prev.`, [['curr.next', nameOf(prev)]])

    prev = curr
    push('advprev', 7, `prev = ${nameOf(curr)}`, `prev moves up to the node we just reversed.`, [['prev', nameOf(prev)]])

    curr = nextTmp
    nextTmp = null
    push('advcurr', 8, `curr = ${nameOf(curr)}`, `curr moves on to the saved next node.`, [['curr', nameOf(curr)]])
  }

  push('done', 10, `New head = ${nameOf(prev)}`, `curr fell off the end. prev now points at the last original node, which is the head of the reversed list. Return it.`, [['prev', nameOf(prev)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'reverse'
    ? C.signal
    : kind === 'advprev' || kind === 'done'
      ? C.go
      : kind === 'save' || kind === 'advcurr' || kind === 'check'
        ? C.trace
        : C.ink

export default function ReverseLinkedListViz() {
  const [listText, setListText] = useState(PRESETS[0].list)

  const values = useMemo(() => parseList(listText), [listText])
  const frames = useMemo(() => buildFrames(values), [values])
  const [i, setI] = useState(0)

  const changeList = useCallback((v: string) => {
    setListText(v.replace(/[^0-9,\s[\]-]/g, '').slice(0, 40))
    setI(0)
  }, [])
  const applyPreset = useCallback((list: string) => {
    setListText(list)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const n = values.length
  const W = 460
  const nodeW = 46
  const gap = (W - 24 - n * nodeW) / Math.max(n - 1, 1)
  const step = nodeW + Math.max(gap, 26)
  const H = 150
  const midY = 70
  const xOf = (idx: number) => 12 + idx * step
  const cxOf = (idx: number) => xOf(idx) + nodeW / 2

  const nodeFill = (idx: number): string => {
    if (idx === f.curr) return C.signal
    if (idx === f.prev) return C.go
    if (idx === f.nextTmp) return C.trace
    return '#FBF9F3'
  }

  return (
    <div>
      <style>{`.rl-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .rl-btn:active{transform:translateY(1px)} .rl-btn:disabled{opacity:.35;cursor:not-allowed}
        .rl-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>list =</label>
          <input value={listText} spellCheck={false} placeholder="[1,2,3,4,5]" onChange={(e) => changeList(e.target.value)} style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = listText.replace(/\s/g, '') === p.list.replace(/\s/g, '')
            return (
              <button key={p.name} className="rl-btn" onClick={() => applyPreset(p.list)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Reverse the links one node at a time with three pointers: prev, curr, next.
        </div>
      </div>

      {/* TOP: linked list */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', minWidth: 360 }}>
          <defs>
            <marker id="rl-arr" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={C.ink} />
            </marker>
            <marker id="rl-arr-hot" markerWidth="9" markerHeight="9" refX="7" refY="4" orient="auto">
              <path d="M0,0 L8,4 L0,8 z" fill={C.signal} />
            </marker>
          </defs>

          {/* pointer arrows following nextPtr */}
          {f.nextPtr.map((tgt, idx) => {
            if (tgt === null) return null
            const backward = tgt < idx
            const x1 = backward ? xOf(idx) : xOf(idx) + nodeW
            const x2 = backward ? xOf(tgt) + nodeW : xOf(tgt)
            const yy = backward ? midY + 30 : midY - 30
            const hot = idx === f.curr
            const cxm = (x1 + x2) / 2
            return (
              <path key={idx} d={`M ${x1} ${midY} Q ${cxm} ${yy} ${x2} ${midY}`} fill="none" stroke={hot ? C.signal : C.slate} strokeWidth={hot ? 2.5 : 1.5} markerEnd={`url(#${hot ? 'rl-arr-hot' : 'rl-arr'})`} />
            )
          })}

          {/* nodes */}
          {values.map((val, idx) => (
            <g key={idx}>
              <rect x={xOf(idx)} y={midY - 20} width={nodeW} height={40} rx={6} fill={nodeFill(idx)} stroke={C.ink} strokeWidth={1.5} />
              <text x={cxOf(idx)} y={midY + 5} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="16" fill={idx === f.curr || idx === f.prev || idx === f.nextTmp ? C.paper : C.ink}>{val}</text>
              <text x={cxOf(idx)} y={midY + 40} textAnchor="middle" fontFamily={MONO} fontSize="11" fontWeight="700" fill={idx === f.prev ? C.go : idx === f.curr ? C.signal : idx === f.nextTmp ? C.trace : 'transparent'}>
                {idx === f.prev && idx === f.curr ? 'prev/curr' : idx === f.prev ? 'prev' : idx === f.curr ? 'curr' : idx === f.nextTmp ? 'next' : '·'}
              </text>
            </g>
          ))}
        </svg>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 6 }}>
          <Swatch color={C.go} label="prev" />
          <Swatch color={C.signal} label="curr" />
          <Swatch color={C.trace} label="next" />
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
                  <span style={{ width: 26, textAlign: 'right', paddingRight: 8, color: C.codedim, fontFamily: MONO, fontSize: 11, userSelect: 'none', lineHeight: '1.75' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 11, lineHeight: '1.75', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 11, lineHeight: '1.75' }}>◄</span>}
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
            <button className="rl-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="rl-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="rl-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="rl-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
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
