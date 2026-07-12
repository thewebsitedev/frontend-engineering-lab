'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'
import { type TNode, parseTree, layout } from '../../lib/tree'

const PRESETS: { name: string; tree: string }[] = [
  { name: 'valid', tree: '2,1,3' },
  { name: 'bad root', tree: '5,1,4,null,null,3,6' },
  { name: 'sneaky', tree: '5,4,6,null,null,3,7' },
  { name: 'big valid', tree: '8,3,10,1,6,null,14,null,null,4,7,13' },
]

const CODE = [
  { ln: 1, t: 'function isValidBST(root) {' },
  { ln: 2, t: '  function valid(node, low, high) {' },
  { ln: 3, t: '    if (!node) return true;' },
  { ln: 4, t: '    if (node.val <= low || node.val >= high) return false;' },
  { ln: 5, t: '    return valid(node.left,  low,      node.val)' },
  { ln: 6, t: '        && valid(node.right, node.val, high);' },
  { ln: 7, t: '  }' },
  { ln: 8, t: '  return valid(root, -Infinity, Infinity);' },
  { ln: 9, t: '}' },
]

type Frame = {
  kind: string
  line: number
  current: number | null
  low: number
  high: number
  stack: number[]
  ok: number[]
  failId: number | null
  result: boolean | null
  title: string
  note: string
}

const bound = (v: number) => (v === -Infinity ? '−∞' : v === Infinity ? '+∞' : String(v))

function buildFrames(nodes: TNode[], rootId: number | null): Frame[] {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const frames: Frame[] = []
  const stack: number[] = []
  const ok: number[] = []
  let failId: number | null = null

  const push = (kind: string, line: number, low: number, high: number, current: number | null, title: string, note: string, result: boolean | null = null) =>
    frames.push({ kind, line, current, low, high, stack: [...stack], ok: [...ok], failId, result, title, note })

  if (rootId === null) {
    push('done', 8, -Infinity, Infinity, null, 'Empty tree', 'An empty tree is trivially a valid BST. Return true.', true)
    return frames
  }

  push('start', 8, -Infinity, Infinity, null, 'Start with no bounds', 'Every node must fall inside an allowed (low, high) range. The root can be anything, so start with (−∞, +∞). Each step tightens the range for the subtree below.')

  const valid = (id: number | null, low: number, high: number): boolean => {
    if (id === null) return true
    const node = byId.get(id)!
    stack.push(id)
    push('enter', 4, low, high, id, `Is ${bound(low)} < ${node.val} < ${bound(high)}?`, `Node ${node.val} is only allowed in the open range (${bound(low)}, ${bound(high)}) set by its ancestors.`)

    if (node.val <= low || node.val >= high) {
      failId = id
      push('fail', 4, low, high, id, `${node.val} is out of range → not a BST`, `${node.val} violates (${bound(low)}, ${bound(high)}): ${node.val <= low ? `it is ≤ the lower bound ${bound(low)}` : `it is ≥ the upper bound ${bound(high)}`}. The whole tree is invalid — return false and stop.`, false)
      stack.pop()
      return false
    }
    ok.push(id)

    push('recL', 5, low, high, id, `Left of ${node.val}: cap high at ${node.val}`, `${node.val} passes. Everything in its LEFT subtree must be less than ${node.val}, so recurse left with the range (${bound(low)}, ${node.val}).`)
    const l = valid(node.left, low, node.val)
    if (!l) {
      stack.pop()
      return false
    }

    push('recR', 6, low, high, id, `Right of ${node.val}: raise low to ${node.val}`, `Left subtree is fine. Everything in the RIGHT subtree must be greater than ${node.val}, so recurse right with the range (${node.val}, ${bound(high)}).`)
    const r = valid(node.right, node.val, high)
    stack.pop()
    return l && r
  }

  const result = valid(rootId, -Infinity, Infinity)
  push('done', result ? 8 : 4, -Infinity, Infinity, null, result ? 'Valid BST ✓' : 'Not a valid BST ✗', result ? 'Every node stayed inside the range its ancestors allowed. Return true.' : `Node ${failId !== null ? byId.get(failId)!.val : ''} broke the ordering rule. Return false.`, result)
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'fail'
    ? C.signal
    : kind === 'recL' || kind === 'recR'
      ? C.go
      : kind === 'enter'
        ? C.trace
        : kind === 'done'
          ? C.ink
          : C.ink

export default function ValidateBstViz() {
  const [input, setInput] = useState(PRESETS[0].tree)

  const parsed = useMemo(() => parseTree(input), [input])
  const frames = useMemo(() => buildFrames(parsed.nodes, parsed.rootId), [parsed])
  const [i, setI] = useState(0)

  const changeInput = useCallback((v: string) => {
    setInput(v.replace(/[^0-9,\s\-nul]/gi, '').slice(0, 80))
    setI(0)
  }, [])
  const applyPreset = useCallback((tree: string) => {
    setInput(tree)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const byId = useMemo(() => new Map(parsed.nodes.map((n) => [n.id, n])), [parsed])
  const { W, H, pos } = useMemo(() => layout(parsed.nodes), [parsed])

  const finalResult = frames[frames.length - 1]?.result

  const fillFor = (id: number) => {
    if (f.failId === id) return C.signal
    if (f.current === id) return C.trace
    if (f.ok.includes(id)) return C.go
    return '#FBF9F3'
  }
  const textFor = (id: number) => (f.failId === id || f.current === id || f.ok.includes(id) ? C.paper : C.ink)

  return (
    <div>
      <style>{`.vb-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .vb-btn:active{transform:translateY(1px)} .vb-btn:disabled{opacity:.35;cursor:not-allowed}
        .vb-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>root =</label>
          <input value={input} spellCheck={false} placeholder="2,1,3" onChange={(e) => changeInput(e.target.value)} style={{ ...inputStyle, minWidth: 220, flex: 1 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = input.replace(/\s/g, '') === p.tree.replace(/\s/g, '')
            return (
              <button key={p.name} className="vb-btn" onClick={() => applyPreset(p.tree)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, margin: '8px 0 16px' }}>
          LeetCode array format. A valid BST needs every node in its left subtree smaller and every node in its right subtree larger — not just its direct children.
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,0.95fr) minmax(0,1.05fr)', gap: 18, alignItems: 'start' }}>
        {/* CODE PANEL */}
        <div>
          <div style={{ background: C.codebg, borderRadius: 6, padding: '16px 6px 16px 0', overflowX: 'auto' }}>
            {CODE.map((row) => {
              const active = row.ln === f.line && row.t.trim() !== ''
              return (
                <div key={row.ln} style={{ display: 'flex', background: active ? C.codehl : 'transparent', borderLeft: `3px solid ${active ? C.signal : 'transparent'}` }}>
                  <span style={{ width: 28, textAlign: 'right', paddingRight: 9, color: C.codedim, fontFamily: MONO, fontSize: 11, userSelect: 'none', lineHeight: '1.8' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10, lineHeight: '1.8', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 11, lineHeight: '1.8' }}>◄</span>}
                </div>
              )
            })}

            <div style={{ borderTop: `1px solid ${C.codehl}`, marginTop: 12, paddingTop: 12, paddingLeft: 12, fontFamily: MONO, fontSize: 12, color: C.codedim }}>
              <div style={{ marginBottom: 6 }}>current range</div>
              <div style={{ color: C.codeink, fontWeight: 700, fontSize: 15, marginBottom: 12 }}>
                ({bound(f.low)}, {bound(f.high)})
              </div>
              <div style={{ marginBottom: 4 }}>call stack (root → current)</div>
              <div style={{ color: C.codeink, fontWeight: 700 }}>{f.stack.length === 0 ? '—' : f.stack.map((id) => byId.get(id)!.val).join(' → ')}</div>
            </div>
          </div>

          {/* controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 14 }}>
            <button className="vb-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="vb-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="vb-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="vb-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        {/* RIGHT: tree + narration */}
        <div>
          <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 6, marginBottom: 14 }}>
            {parsed.rootId === null ? (
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.slate, padding: 24, textAlign: 'center' }}>empty tree</div>
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
                {parsed.nodes.map((n) => {
                  const pp = pos(n.idx)
                  return (['left', 'right'] as const).map((side) => {
                    const childId = n[side]
                    if (childId === null) return null
                    const cp = pos(byId.get(childId)!.idx)
                    return <line key={`${n.id}-${side}`} x1={pp.x} y1={pp.y} x2={cp.x} y2={cp.y} stroke={C.wire} strokeWidth={2} />
                  })
                })}
                {parsed.nodes.map((n) => {
                  const pp = pos(n.idx)
                  const isCurrent = f.current === n.id
                  return (
                    <g key={n.id}>
                      <circle cx={pp.x} cy={pp.y} r={18} fill={fillFor(n.id)} stroke={C.ink} strokeWidth={1.5} />
                      <text x={pp.x} y={pp.y + 5} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="14" fill={textFor(n.id)}>{n.val}</text>
                      {isCurrent && (
                        <text x={pp.x} y={pp.y - 24} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="10.5" fill={f.failId === n.id ? C.signal : C.trace}>
                          ({bound(f.low)}, {bound(f.high)})
                        </text>
                      )}
                    </g>
                  )
                })}
              </svg>
            )}
          </div>

          {/* legend */}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 14, fontFamily: MONO, fontSize: 11, color: C.slate }}>
            <Swatch color={C.trace} label="checking" />
            <Swatch color={C.go} label="in range ✓" />
            <Swatch color={C.signal} label="out of range ✗" />
          </div>

          {/* narration */}
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>STEP {Math.min(i, frames.length - 1)} / {frames.length - 1} · line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.55 }}>{f.note}</div>
            {atEnd && finalResult != null && (
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: finalResult ? C.go : C.signal, marginTop: 10 }}>return {String(finalResult)}</div>
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
      <span style={{ width: 14, height: 14, borderRadius: 3, background: color, border: `1.5px solid ${C.ink}` }} />
      {label}
    </span>
  )
}

function btn(bg: string, fg: string, border?: boolean): React.CSSProperties {
  return { fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '11px 18px', background: bg, color: fg, border: border ? `1.5px solid ${C.ink}` : 'none', borderRadius: 4 }
}
