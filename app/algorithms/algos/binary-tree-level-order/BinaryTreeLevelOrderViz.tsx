'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'
import { type TNode, parseTree, layout } from '../../lib/tree'

const PRESETS: { name: string; text: string }[] = [
  { name: 'classic', text: '3,9,20,null,null,15,7' },
  { name: 'perfect', text: '1,2,3,4,5,6,7' },
  { name: 'left skew', text: '1,2,null,3,null,4' },
  { name: 'single', text: '1' },
]

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function levelOrder(root) {' },
  { ln: 2, t: '  const result = [];' },
  { ln: 3, t: '  if (!root) return result;' },
  { ln: 4, t: '  const queue = [root];' },
  { ln: 5, t: '  while (queue.length) {' },
  { ln: 6, t: '    const level = [];' },
  { ln: 7, t: '    for (let n = queue.length; n > 0; n--) {' },
  { ln: 8, t: '      const node = queue.shift();' },
  { ln: 9, t: '      level.push(node.val);' },
  { ln: 10, t: '      if (node.left) queue.push(node.left);' },
  { ln: 11, t: '      if (node.right) queue.push(node.right);' },
  { ln: 12, t: '    }' },
  { ln: 13, t: '    result.push(level);' },
  { ln: 14, t: '  }' },
  { ln: 15, t: '  return result;' },
  { ln: 16, t: '}' },
]

type Frame = {
  kind: string
  line: number
  queueIds: number[]
  currentId: number | null
  currentLevel: number[]
  result: number[][]
  done: number[]
  title: string
  note: string
}

function buildFrames(nodes: TNode[], rootId: number | null): { frames: Frame[]; levels: number } {
  const byId = new Map(nodes.map((n) => [n.id, n]))
  const frames: Frame[] = []
  const result: number[][] = []
  const snapResult = () => result.map((l) => [...l])

  if (rootId === null) {
    frames.push({
      kind: 'done',
      line: 3,
      queueIds: [],
      currentId: null,
      currentLevel: [],
      result: [],
      done: [],
      title: 'Empty tree',
      note: 'The tree is empty, so the level-order traversal is an empty list.',
    })
    return { frames, levels: 0 }
  }

  const queue: number[] = [rootId]
  const done: number[] = []

  frames.push({
    kind: 'start',
    line: 4,
    queueIds: [...queue],
    currentId: null,
    currentLevel: [],
    result: [],
    done: [],
    title: 'Start',
    note: 'Seed the queue with the root. We process the tree breadth-first, one full level per round.',
  })

  while (queue.length) {
    const levelSize = queue.length
    const currentLevel: number[] = []

    for (let s = 0; s < levelSize; s++) {
      const id = queue.shift()!
      const node = byId.get(id)!
      currentLevel.push(node.val)
      const kids: number[] = []
      if (node.left !== null) {
        queue.push(node.left)
        kids.push(node.left)
      }
      if (node.right !== null) {
        queue.push(node.right)
        kids.push(node.right)
      }
      done.push(id)
      frames.push({
        kind: 'visit',
        line: 9,
        queueIds: [...queue],
        currentId: id,
        currentLevel: [...currentLevel],
        result: snapResult(),
        done: [...done],
        title: `Visit ${node.val}`,
        note: kids.length
          ? `Dequeue ${node.val}, add it to this level, and enqueue its ${kids.length === 1 ? 'child' : 'children'}: ${kids.map((k) => byId.get(k)!.val).join(', ')}.`
          : `Dequeue ${node.val}, add it to this level. It has no children.`,
      })
    }

    result.push([...currentLevel])
    frames.push({
      kind: 'levelDone',
      line: 13,
      queueIds: [...queue],
      currentId: null,
      currentLevel: [],
      result: snapResult(),
      done: [...done],
      title: `Level ${result.length - 1} done`,
      note: `This level is complete: [${currentLevel.join(', ')}].${queue.length ? ' Move on to the next level.' : ''}`,
    })
  }

  frames.push({
    kind: 'done',
    line: 15,
    queueIds: [],
    currentId: null,
    currentLevel: [],
    result: snapResult(),
    done: [...done],
    title: `${result.length} levels`,
    note: `The queue is empty — traversal complete with ${result.length} level${result.length === 1 ? '' : 's'}.`,
  })

  return { frames, levels: result.length }
}

export default function BinaryTreeLevelOrderViz() {
  const [input, setInput] = useState(PRESETS[0].text)
  const parsed = useMemo(() => parseTree(input), [input])
  const { frames } = useMemo(
    () => buildFrames(parsed.nodes, parsed.rootId),
    [parsed],
  )
  const [i, setI] = useState(0)

  const changeInput = useCallback((v: string) => {
    setInput(v)
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

  // layout
  const { W, H, pos } = useMemo(() => layout(parsed.nodes), [parsed])

  const statusOf = (id: number) => {
    if (f.currentId === id) return 'current'
    if (f.queueIds.includes(id)) return 'queued'
    if (f.done.includes(id)) return 'done'
    return 'unvisited'
  }
  const fillFor = (s: string) =>
    s === 'current' ? C.signal : s === 'queued' ? C.trace : s === 'done' ? C.go : '#FBF9F3'

  return (
    <div>
      <style>{`.bt-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .bt-btn:active{transform:translateY(1px)} .bt-btn:disabled{opacity:.35;cursor:not-allowed}
        .bt-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>root =</label>
          <input
            value={input}
            spellCheck={false}
            placeholder="3,9,20,null,null,15,7"
            onChange={(e) =>
              changeInput(e.target.value.replace(/[^0-9,\s\-nul]/gi, '').slice(0, 80))
            }
            style={{
              fontFamily: MONO,
              fontSize: 14,
              fontWeight: 700,
              padding: '8px 11px',
              border: `1.5px solid ${C.ink}`,
              borderRadius: 6,
              background: '#FBF9F3',
              color: C.ink,
              minWidth: 240,
              flex: 1,
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>trees:</span>
          {PRESETS.map((p) => {
            const active = input.replace(/\s/g, '') === p.text.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="bt-btn"
                onClick={() => changeInput(p.text)}
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
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, margin: '8px 0 16px' }}>
          LeetCode array format · use null for a missing child
        </div>
      </div>

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
            {[
              ['levels', String(f.result.length), C.go],
              ['queue', String(f.queueIds.length), C.trace],
            ].map(([k, v, col]) => (
              <span
                key={k}
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  background: '#000',
                  color: C.codeink,
                  padding: '4px 9px',
                  borderRadius: 4,
                  border: `1px solid ${col}`,
                }}
              >
                <span style={{ color: col }}>{k}</span>
                <span style={{ color: C.codedim }}> = </span>
                <b>{v}</b>
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: tree + queue + result + narration */}
        <div>
          {/* Tree */}
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
                  const p = pos(n.idx)
                  return (['left', 'right'] as const).map((side) => {
                    const childId = n[side]
                    if (childId === null) return null
                    const cp = pos(byId.get(childId)!.idx)
                    return (
                      <line
                        key={`${n.id}-${side}`}
                        x1={p.x}
                        y1={p.y}
                        x2={cp.x}
                        y2={cp.y}
                        stroke={C.wire}
                        strokeWidth={2}
                      />
                    )
                  })
                })}
                {parsed.nodes.map((n) => {
                  const p = pos(n.idx)
                  const s = statusOf(n.id)
                  const fill = fillFor(s)
                  const txt = s === 'unvisited' ? C.ink : C.paper
                  return (
                    <g key={n.id}>
                      <circle cx={p.x} cy={p.y} r={18} fill={fill} stroke={C.ink} strokeWidth={1.5} />
                      <text
                        x={p.x}
                        y={p.y + 5}
                        textAnchor="middle"
                        fontFamily={MONO}
                        fontWeight="700"
                        fontSize="14"
                        fill={txt}
                      >
                        {n.val}
                      </text>
                    </g>
                  )
                })}
              </svg>
            )}
          </div>

          {/* Queue */}
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
            queue (front → back)
          </div>
          <div
            style={{
              display: 'flex',
              gap: 6,
              flexWrap: 'wrap',
              minHeight: 40,
              marginBottom: 14,
              alignItems: 'center',
            }}
          >
            {f.queueIds.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
            ) : (
              f.queueIds.map((id, qi) => (
                <span
                  key={`${id}-${qi}`}
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 14,
                    padding: '6px 11px',
                    borderRadius: 4,
                    border: `1.5px solid ${qi === 0 ? C.trace : C.wire}`,
                    background: qi === 0 ? C.trace : C.paper,
                    color: qi === 0 ? C.paper : C.ink,
                  }}
                >
                  {byId.get(id)!.val}
                </span>
              ))
            )}
          </div>

          {/* Result */}
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
            result
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16, minHeight: 30 }}>
            {f.result.length === 0 && f.currentLevel.length === 0 ? (
              <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>[]</span>
            ) : (
              <>
                {f.result.map((lvl, li) => (
                  <div key={li} style={{ fontFamily: MONO, fontSize: 13, color: C.ink }}>
                    <span style={{ color: C.slate }}>[{li}]</span> [{lvl.join(', ')}]
                  </div>
                ))}
                {f.currentLevel.length > 0 && (
                  <div style={{ fontFamily: MONO, fontSize: 13, color: C.signal }}>
                    <span style={{ color: C.slate }}>[{f.result.length}]</span> [{f.currentLevel.join(', ')}]{' '}
                    <span style={{ color: C.slate }}>building…</span>
                  </div>
                )}
              </>
            )}
          </div>

          {/* narration */}
          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'visit'
                  ? C.signal
                  : f.kind === 'levelDone' || f.kind === 'done'
                    ? C.go
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
        <button className="bt-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="bt-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="bt-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, color: C.signal }}>
            {f.result.length} level{f.result.length === 1 ? '' : 's'}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="bt-btn"
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
                  ? fr.kind === 'visit'
                    ? C.signal
                    : fr.kind === 'levelDone' || fr.kind === 'done'
                      ? C.go
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
