'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'
import { type TNode, parseTree, layout } from '../../lib/tree'

type Approach = 'general' | 'bst'
type Preset = { name: string; tree: string; p: string; q: string }

const GENERAL_PRESETS: Preset[] = [
  { name: 'split', tree: '3,5,1,6,2,0,8,null,null,7,4', p: '5', q: '1' },
  { name: 'ancestor', tree: '3,5,1,6,2,0,8,null,null,7,4', p: '5', q: '4' },
  { name: 'deep', tree: '1,2,3,4,5,6,7', p: '4', q: '7' },
]

// BST presets — valid binary search trees so the iterative method is correct.
const BST_PRESETS: Preset[] = [
  { name: 'split', tree: '6,2,8,0,4,7,9,null,null,3,5', p: '2', q: '8' },
  { name: 'ancestor', tree: '6,2,8,0,4,7,9,null,null,3,5', p: '2', q: '4' },
  { name: 'leaves', tree: '6,2,8,0,4,7,9,null,null,3,5', p: '3', q: '5' },
]

const PRESETS: Record<Approach, Preset[]> = { general: GENERAL_PRESETS, bst: BST_PRESETS }

// JS source per approach (matches the default language).
const CODE_GENERAL = [
  { ln: 1, t: 'function lca(root, p, q) {' },
  { ln: 2, t: '  if (!root) return null;' },
  { ln: 3, t: '  if (root.val === p || root.val === q) return root;' },
  { ln: 4, t: '  const left = lca(root.left, p, q);' },
  { ln: 5, t: '  const right = lca(root.right, p, q);' },
  { ln: 6, t: '  if (left && right) return root;' },
  { ln: 7, t: '  return left || right;' },
  { ln: 8, t: '}' },
]

const CODE_BST = [
  { ln: 1, t: 'function lca(root, p, q) {' },
  { ln: 2, t: '  while (root) {' },
  { ln: 3, t: '    if (p < root.val && q < root.val) {' },
  { ln: 4, t: '      root = root.left;' },
  { ln: 5, t: '    } else if (p > root.val && q > root.val) {' },
  { ln: 6, t: '      root = root.right;' },
  { ln: 7, t: '    } else {' },
  { ln: 8, t: '      return root;' },
  { ln: 9, t: '    }' },
  { ln: 10, t: '  }' },
  { ln: 11, t: '}' },
]

type Frame = {
  kind: string
  line: number
  current: number | null
  stack: number[]
  carries: number[]
  lca: number | null
  title: string
  note: string
}

function isBST(nodes: TNode[], rootId: number | null): boolean {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const chk = (id: number | null, lo: number | null, hi: number | null): boolean => {
    if (id === null) return true
    const n = byId.get(id)!
    if (lo !== null && n.val <= lo) return false
    if (hi !== null && n.val >= hi) return false
    return chk(n.left, lo, n.val) && chk(n.right, n.val, hi)
  }
  return chk(rootId, null, null)
}

function buildFramesBst(
  nodes: TNode[],
  rootId: number | null,
  p: number,
  q: number,
): { frames: Frame[]; finalId: number | null } {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const frames: Frame[] = []
  const path: number[] = []
  let lcaId: number | null = null

  frames.push({
    kind: 'start',
    line: 2,
    current: null,
    stack: [],
    carries: [],
    lca: null,
    title: 'Start',
    note: `Walk down using the BST order. Steer toward both ${p} and ${q}; where the paths diverge is the LCA.`,
  })

  let cur = rootId
  while (cur !== null) {
    const node = byId.get(cur)!
    path.push(cur)
    const val = node.val
    if (p < val && q < val) {
      frames.push({
        kind: 'step',
        line: 4,
        current: cur,
        stack: [...path],
        carries: [...path],
        lca: null,
        title: `Go left from ${val}`,
        note: `${p} and ${q} are both < ${val} → the LCA must be in the left subtree.`,
      })
      cur = node.left
    } else if (p > val && q > val) {
      frames.push({
        kind: 'step',
        line: 6,
        current: cur,
        stack: [...path],
        carries: [...path],
        lca: null,
        title: `Go right from ${val}`,
        note: `${p} and ${q} are both > ${val} → the LCA must be in the right subtree.`,
      })
      cur = node.right
    } else {
      lcaId = cur
      frames.push({
        kind: 'found',
        line: 8,
        current: cur,
        stack: [...path],
        carries: [...path],
        lca: cur,
        title: `LCA = ${val}`,
        note: `${p} and ${q} fall on different sides of ${val} (or one equals it) → ${val} is the lowest common ancestor.`,
      })
      break
    }
  }

  frames.push({
    kind: 'done',
    line: lcaId !== null ? 8 : 11,
    current: null,
    stack: [],
    carries: [...path],
    lca: lcaId,
    title: lcaId !== null ? `LCA = ${byId.get(lcaId)!.val}` : 'No LCA',
    note:
      lcaId !== null
        ? `Done — the lowest common ancestor is ${byId.get(lcaId)!.val}.`
        : `Walked off the tree without locating both ${p} and ${q}.`,
  })

  return { frames, finalId: lcaId }
}

function buildFramesGeneral(
  nodes: TNode[],
  rootId: number | null,
  p: number,
  q: number,
): { frames: Frame[]; finalId: number | null } {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const frames: Frame[] = []
  const stack: number[] = []
  const carries: number[] = []
  let lcaId: number | null = null

  frames.push({
    kind: 'start',
    line: 1,
    current: null,
    stack: [],
    carries: [],
    lca: null,
    title: 'Start',
    note: `Find the lowest common ancestor of ${p} and ${q}. Each call reports whether a target lives in its subtree.`,
  })

  function rec(id: number | null): number | null {
    if (id === null) return null
    const node = byId.get(id)!
    stack.push(id)
    frames.push({
      kind: 'enter',
      line: 3,
      current: id,
      stack: [...stack],
      carries: [...carries],
      lca: lcaId,
      title: `Visit ${node.val}`,
      note: `At ${node.val}: is it ${p} or ${q}?`,
    })

    if (node.val === p || node.val === q) {
      carries.push(id)
      frames.push({
        kind: 'match',
        line: 3,
        current: id,
        stack: [...stack],
        carries: [...carries],
        lca: lcaId,
        title: `Found ${node.val}`,
        note: `${node.val} is a target — return it up to the caller.`,
      })
      stack.pop()
      return id
    }

    const left = rec(node.left)
    const right = rec(node.right)

    if (left !== null && right !== null) {
      lcaId = id
      carries.push(id)
      frames.push({
        kind: 'split',
        line: 6,
        current: id,
        stack: [...stack],
        carries: [...carries],
        lca: id,
        title: `LCA = ${node.val}`,
        note: `Targets came back from BOTH sides of ${node.val} → it is the lowest common ancestor.`,
      })
      stack.pop()
      return id
    }

    const ret = left !== null ? left : right
    if (ret !== null) carries.push(id)
    frames.push({
      kind: 'return',
      line: 7,
      current: id,
      stack: [...stack],
      carries: [...carries],
      lca: lcaId,
      title: `Return from ${node.val}`,
      note:
        ret !== null
          ? `One side returned ${byId.get(ret)!.val}; ${node.val} passes it upward.`
          : `Neither side found a target; ${node.val} returns null.`,
    })
    stack.pop()
    return ret
  }

  const ans = rootId !== null ? rec(rootId) : null
  const finalId = lcaId !== null ? lcaId : ans

  frames.push({
    kind: 'done',
    line: lcaId !== null ? 6 : 7,
    current: null,
    stack: [],
    carries: [...carries],
    lca: finalId,
    title: finalId !== null ? `LCA = ${byId.get(finalId)!.val}` : 'No LCA',
    note:
      finalId === null
        ? `${p} and/or ${q} are not both in the tree.`
        : lcaId !== null
          ? `Done — the lowest common ancestor of ${p} and ${q} is ${byId.get(finalId)!.val}.`
          : `${byId.get(finalId)!.val} is an ancestor of the other target, so it is the LCA.`,
  })

  return { frames, finalId }
}

export default function LowestCommonAncestorViz() {
  const [approach, setApproach] = useState<Approach>('general')
  const [input, setInput] = useState(GENERAL_PRESETS[0].tree)
  const [pText, setPText] = useState(GENERAL_PRESETS[0].p)
  const [qText, setQText] = useState(GENERAL_PRESETS[0].q)

  const parsed = useMemo(() => parseTree(input), [input])
  const nodeValues = useMemo(
    () => Array.from(new Set(parsed.nodes.map((n) => n.val))),
    [parsed],
  )

  // clamp p / q to values that actually exist in the tree
  const p = nodeValues.includes(Number(pText)) ? Number(pText) : (nodeValues[0] ?? 0)
  const q = nodeValues.includes(Number(qText))
    ? Number(qText)
    : (nodeValues[1] ?? nodeValues[0] ?? 0)

  const { frames } = useMemo(
    () =>
      approach === 'bst'
        ? buildFramesBst(parsed.nodes, parsed.rootId, p, q)
        : buildFramesGeneral(parsed.nodes, parsed.rootId, p, q),
    [approach, parsed, p, q],
  )
  const [i, setI] = useState(0)

  const treeIsBst = useMemo(() => isBST(parsed.nodes, parsed.rootId), [parsed])
  const CODE = approach === 'bst' ? CODE_BST : CODE_GENERAL
  const presets = PRESETS[approach]

  const changeApproach = useCallback((a: Approach) => {
    setApproach(a)
    const pr = PRESETS[a][0]
    setInput(pr.tree)
    setPText(pr.p)
    setQText(pr.q)
    setI(0)
  }, [])

  const changeInput = useCallback((v: string) => {
    setInput(v.replace(/[^0-9,\s\-nul]/gi, '').slice(0, 80))
    setI(0)
  }, [])
  const changeP = useCallback((v: string) => {
    setPText(v)
    setI(0)
  }, [])
  const changeQ = useCallback((v: string) => {
    setQText(v)
    setI(0)
  }, [])
  const applyPreset = useCallback((pr: { tree: string; p: string; q: string }) => {
    setInput(pr.tree)
    setPText(pr.p)
    setQText(pr.q)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const byId = useMemo(() => new Map(parsed.nodes.map((n) => [n.id, n])), [parsed])
  const { W, H, pos } = useMemo(() => layout(parsed.nodes), [parsed])

  const fillFor = (id: number, val: number) => {
    if (f.lca === id) return C.go
    if (f.current === id) return C.signal
    if (val === p || val === q) return C.trace
    if (f.carries.includes(id)) return '#D9E6D9'
    return '#FBF9F3'
  }
  const textFor = (id: number, val: number) => {
    if (f.lca === id || f.current === id || val === p || val === q) return C.paper
    return C.ink
  }

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
      <style>{`.lca-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .lca-btn:active{transform:translateY(1px)} .lca-btn:disabled{opacity:.35;cursor:not-allowed}
        .lca-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Approach toggle */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 14, flexWrap: 'wrap' }}>
        {(
          [
            ['general', 'Any binary tree'],
            ['bst', 'BST (iterative)'],
          ] as const
        ).map(([a, label], idx) => {
          const active = approach === a
          return (
            <button
              key={a}
              className="lca-btn"
              onClick={() => changeApproach(a)}
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 13,
                padding: '8px 14px',
                border: `1.5px solid ${C.ink}`,
                borderRadius: idx === 0 ? '6px 0 0 6px' : '0 6px 6px 0',
                marginLeft: idx === 0 ? 0 : -1.5,
                background: active ? C.ink : C.paper,
                color: active ? C.paper : C.ink,
              }}
            >
              {label}
            </button>
          )
        })}
      </div>

      {/* Editable input */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>root =</label>
          <input
            value={input}
            spellCheck={false}
            placeholder="3,5,1,6,2,0,8,null,null,7,4"
            onChange={(e) => changeInput(e.target.value)}
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              padding: '8px 11px',
              border: `1.5px solid ${C.ink}`,
              borderRadius: 6,
              background: '#FBF9F3',
              color: C.ink,
              minWidth: 220,
              flex: 1,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>p =</label>
          <select value={String(p)} onChange={(e) => changeP(e.target.value)} style={selectStyle}>
            {nodeValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>q =</label>
          <select value={String(q)} onChange={(e) => changeQ(e.target.value)} style={selectStyle}>
            {nodeValues.map((v) => (
              <option key={v} value={v}>
                {v}
              </option>
            ))}
          </select>
          <span style={{ flexBasis: '100%', height: 0 }} />
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>presets:</span>
          {presets.map((pr) => {
            const active =
              input.replace(/\s/g, '') === pr.tree.replace(/\s/g, '') &&
              String(p) === pr.p &&
              String(q) === pr.q
            return (
              <button
                key={pr.name}
                className="lca-btn"
                onClick={() => applyPreset(pr)}
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
                {pr.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, margin: '8px 0 16px' }}>
          LeetCode array format · p and q are node values
        </div>
      </div>

      {approach === 'bst' && parsed.rootId !== null && !treeIsBst && (
        <div
          style={{
            border: `1.5px solid ${C.signal}`,
            background: 'rgba(224,83,58,0.08)',
            color: C.ink,
            borderRadius: 6,
            padding: '10px 12px',
            marginBottom: 16,
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          <b style={{ fontFamily: MONO, color: C.signal }}>Heads up:</b> this tree isn’t a valid BST,
          so the iterative method can give a wrong answer. Pick a BST preset or switch to “Any binary
          tree”.
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,0.95fr) minmax(0,1.05fr)',
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
                    fontSize: 11.5,
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

          {/* call stack */}
          <div
            style={{
              borderTop: `1px solid ${C.codehl}`,
              marginTop: 12,
              paddingTop: 12,
              paddingLeft: 12,
              fontFamily: MONO,
              fontSize: 12,
              color: C.codedim,
            }}
          >
            <div style={{ marginBottom: 4 }}>
              {approach === 'bst' ? 'path (root → current)' : 'call stack (root → current)'}
            </div>
            <div style={{ color: C.codeink, fontWeight: 700 }}>
              {f.stack.length === 0
                ? '—'
                : f.stack.map((id) => byId.get(id)!.val).join(' → ')}
            </div>
          </div>
        </div>

        {/* RIGHT: tree + narration */}
        <div>
          <div
            style={{
              border: `1.5px solid ${C.wire}`,
              background: '#FBF9F3',
              borderRadius: 6,
              marginBottom: 14,
            }}
          >
            {parsed.rootId === null ? (
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.slate, padding: 24, textAlign: 'center' }}>
                empty tree
              </div>
            ) : (
              <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block' }}>
                {parsed.nodes.map((n) => {
                  const pp = pos(n.idx)
                  return (['left', 'right'] as const).map((side) => {
                    const childId = n[side]
                    if (childId === null) return null
                    const cp = pos(byId.get(childId)!.idx)
                    return (
                      <line
                        key={`${n.id}-${side}`}
                        x1={pp.x}
                        y1={pp.y}
                        x2={cp.x}
                        y2={cp.y}
                        stroke={C.wire}
                        strokeWidth={2}
                      />
                    )
                  })
                })}
                {parsed.nodes.map((n) => {
                  const pp = pos(n.idx)
                  const isP = n.val === p
                  const isQ = n.val === q
                  return (
                    <g key={n.id}>
                      <circle
                        cx={pp.x}
                        cy={pp.y}
                        r={18}
                        fill={fillFor(n.id, n.val)}
                        stroke={C.ink}
                        strokeWidth={1.5}
                      />
                      <text
                        x={pp.x}
                        y={pp.y + 5}
                        textAnchor="middle"
                        fontFamily={MONO}
                        fontWeight="700"
                        fontSize="14"
                        fill={textFor(n.id, n.val)}
                      >
                        {n.val}
                      </text>
                      {isP && <Badge x={pp.x - 17} y={pp.y - 17} label="p" />}
                      {isQ && <Badge x={pp.x + 17} y={pp.y - 17} label="q" />}
                    </g>
                  )
                })}
              </svg>
            )}
          </div>

          {/* legend */}
          <div
            style={{
              display: 'flex',
              gap: 12,
              flexWrap: 'wrap',
              marginBottom: 14,
              fontFamily: MONO,
              fontSize: 11,
              color: C.slate,
            }}
          >
            <Swatch color={C.trace} label="p / q" />
            <Swatch color={C.signal} label="visiting" />
            <Swatch color="#D9E6D9" label={approach === 'bst' ? 'path walked' : 'contains a target'} />
            <Swatch color={C.go} label="LCA" />
          </div>

          {/* narration */}
          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'split' || f.kind === 'done'
                  ? C.go
                  : f.kind === 'match'
                    ? C.trace
                    : f.kind === 'enter'
                      ? C.signal
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
        <button className="lca-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="lca-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="lca-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && f.lca !== null && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.go }}>
            LCA = {byId.get(f.lca)!.val}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="lca-btn"
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
                  ? fr.kind === 'split' || fr.kind === 'done'
                    ? C.go
                    : fr.kind === 'match'
                      ? C.trace
                      : fr.kind === 'enter'
                        ? C.signal
                        : C.ink
                  : C.wire,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function Badge({ x, y, label }: { x: number; y: number; label: string }) {
  return (
    <g>
      <circle cx={x} cy={y} r={8} fill={C.ink} stroke={C.paper} strokeWidth={1} />
      <text x={x} y={y + 3.5} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="10" fill={C.paper}>
        {label}
      </text>
    </g>
  )
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
