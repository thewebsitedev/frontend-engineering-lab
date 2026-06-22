'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; ops: string }[] = [
  { name: 'cat/car/card', ops: 'insert(cat),insert(car),insert(card),search(car),startsWith(ca),search(ca)' },
  { name: 'apple', ops: 'insert(app),insert(apple),search(app),search(appl),startsWith(app)' },
  { name: 'miss then add', ops: 'insert(dog),search(do),startsWith(do),insert(do),search(do)' },
  { name: 'single', ops: 'insert(a),search(a),startsWith(b)' },
]

type Op = { type: 'insert' | 'search' | 'startsWith'; word: string }

function parseOps(text: string): Op[] {
  const out: Op[] = []
  const re = /(insert|search|startsWith)\s*\(\s*([a-z]+)\s*\)/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const type = m[1].toLowerCase() === 'insert' ? 'insert' : m[1].toLowerCase() === 'search' ? 'search' : 'startsWith'
    out.push({ type, word: m[2].toLowerCase().slice(0, 8) })
    if (out.length >= 8) break
  }
  return out
}

const CODE = [
  { ln: 1, t: 'class Trie {' },
  { ln: 2, t: '  constructor() { this.root = {}; }' },
  { ln: 3, t: '  insert(word) {' },
  { ln: 4, t: '    let node = this.root;' },
  { ln: 5, t: '    for (const c of word) {' },
  { ln: 6, t: '      if (!node[c]) node[c] = {};' },
  { ln: 7, t: '      node = node[c];' },
  { ln: 8, t: '    }' },
  { ln: 9, t: '    node.end = true;' },
  { ln: 10, t: '  }' },
  { ln: 11, t: '  search(word) {' },
  { ln: 12, t: '    let node = this.root;' },
  { ln: 13, t: '    for (const c of word) {' },
  { ln: 14, t: '      if (!node[c]) return false;' },
  { ln: 15, t: '      node = node[c];' },
  { ln: 16, t: '    }' },
  { ln: 17, t: '    return node.end === true;' },
  { ln: 18, t: '  }' },
  { ln: 19, t: '  startsWith(prefix) {' },
  { ln: 20, t: '    let node = this.root;' },
  { ln: 21, t: '    for (const c of prefix) {' },
  { ln: 22, t: '      if (!node[c]) return false;' },
  { ln: 23, t: '      node = node[c];' },
  { ln: 24, t: '    }' },
  { ln: 25, t: '    return true;' },
  { ln: 26, t: '  }' },
  { ln: 27, t: '}' },
]

type SNode = { id: number; char: string; isEnd: boolean; depth: number; childrenIds: number[] }
type Frame = {
  kind: string
  line: number
  nodes: SNode[]
  opIndex: number
  currentId: number
  pathIds: number[]
  createdId: number | null
  activeChar: string | null
  failed: boolean
  log: string[]
  vars: [string, string][]
  title: string
  note: string
}

type MNode = { id: number; char: string; isEnd: boolean; depth: number; children: Record<string, MNode> }

function buildFrames(ops: Op[]): Frame[] {
  let nextId = 1
  const root: MNode = { id: 0, char: '', isEnd: false, depth: 0, children: {} }
  const byId: Record<number, MNode> = { 0: root }
  const frames: Frame[] = []
  const log: string[] = []
  let opIndex = -1
  let currentId = 0
  let pathIds: number[] = [0]
  let createdId: number | null = null
  let activeChar: string | null = null
  let failed = false

  const snapshot = (): SNode[] =>
    Object.values(byId).map((n) => ({
      id: n.id,
      char: n.char,
      isEnd: n.isEnd,
      depth: n.depth,
      childrenIds: Object.values(n.children).map((c) => c.id),
    }))

  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({
      kind,
      line,
      title,
      note,
      vars,
      nodes: snapshot(),
      opIndex,
      currentId,
      pathIds: [...pathIds],
      createdId,
      activeChar,
      failed,
      log: [...log],
    })

  push('init', 2, 'Empty trie', 'A trie is a tree of characters. Every path from the root spells a prefix; a flag marks where a real word ends.', [])

  for (let oi = 0; oi < ops.length; oi++) {
    const op = ops[oi]
    opIndex = oi
    currentId = 0
    pathIds = [0]
    createdId = null
    activeChar = null
    failed = false
    let node: MNode | null = root

    if (op.type === 'insert') {
      push('op', 4, `insert("${op.word}")`, 'Start at the root.', [['word', `"${op.word}"`]])
      for (const c of op.word) {
        activeChar = c
        push('loop', 5, `char '${c}'`, `Follow the branch for '${c}'.`, [['c', `'${c}'`]])
        if (!node!.children[c]) {
          const nn: MNode = { id: nextId++, char: c, isEnd: false, depth: node!.depth + 1, children: {} }
          node!.children[c] = nn
          byId[nn.id] = nn
          createdId = nn.id
          push('create', 6, `Create node '${c}'`, `No '${c}' child exists here, so add one.`, [])
          createdId = null
        } else {
          push('check', 6, `'${c}' already exists`, `Reuse the existing '${c}' branch (shared prefix).`, [])
        }
        node = node!.children[c]
        currentId = node.id
        pathIds.push(node.id)
        push('move', 7, `Move to '${c}'`, `Advance to the '${c}' node.`, [])
      }
      node!.isEnd = true
      activeChar = null
      push('end', 9, `Mark end of "${op.word}"`, `Flag this node as the end of a complete word.`, [])
    } else {
      const isSearch = op.type === 'search'
      const baseLine = isSearch ? 12 : 20
      push('op', baseLine, `${op.type}("${op.word}")`, 'Start at the root.', [['word', `"${op.word}"`]])
      let broke = false
      for (const c of op.word) {
        activeChar = c
        push('loop', isSearch ? 13 : 21, `char '${c}'`, `Look for branch '${c}'.`, [['c', `'${c}'`]])
        if (!node!.children[c]) {
          failed = true
          log.push(`${op.type}("${op.word}") → false`)
          push('fail', isSearch ? 14 : 22, `No '${c}' → false`, `There is no '${c}' branch here, so the ${isSearch ? 'word' : 'prefix'} is not present. Return false.`, [['return', 'false']])
          broke = true
          break
        }
        push('check', isSearch ? 14 : 22, `'${c}' found`, `Branch '${c}' exists — keep walking.`, [])
        node = node!.children[c]
        currentId = node.id
        pathIds.push(node.id)
        push('move', isSearch ? 15 : 23, `Move to '${c}'`, `Advance to the '${c}' node.`, [])
      }
      if (!broke) {
        activeChar = null
        if (isSearch) {
          const res = node!.isEnd
          log.push(`search("${op.word}") → ${res}`)
          push(res ? 'end' : 'fail', 17, `end === ${res}`, res ? 'This node is flagged as a word end → return true.' : 'We reached the node, but it is not a word end (only a prefix) → return false.', [['return', String(res)]])
        } else {
          log.push(`startsWith("${op.word}") → true`)
          push('end', 25, 'Prefix exists → true', `We walked the whole prefix without a gap, so some word starts with "${op.word}". Return true.`, [['return', 'true']])
        }
      }
    }
  }

  opIndex = ops.length
  currentId = -1
  activeChar = null
  push('done', 27, 'All operations done', log.length ? `Results: ${log.join(',  ')}.` : 'Inserts complete — the trie is built.', [])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'fail'
    ? C.signal
    : kind === 'create' || kind === 'end' || kind === 'done'
      ? C.go
      : kind === 'op' || kind === 'loop' || kind === 'move' || kind === 'check'
        ? C.trace
        : C.ink

export default function TrieViz() {
  const [opsText, setOpsText] = useState(PRESETS[0].ops)

  const ops = useMemo(() => parseOps(opsText), [opsText])
  const frames = useMemo(() => buildFrames(ops), [ops])
  const [i, setI] = useState(0)

  const changeOps = useCallback((v: string) => {
    setOpsText(v.replace(/[^a-z(),\s]/gi, '').slice(0, 130))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { ops: string }) => {
    setOpsText(p.ops)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  // layout
  const { positions, W, H } = useMemo(() => {
    const byId: Record<number, SNode> = {}
    for (const n of f.nodes) byId[n.id] = n
    const dx = 58
    const dy = 46
    const mx = 26
    const my = 24
    const yOf: Record<number, number> = {}
    let row = 0
    let maxDepth = 0
    const assign = (id: number) => {
      const node = byId[id]
      if (!node) return
      maxDepth = Math.max(maxDepth, node.depth)
      const kids = [...node.childrenIds].sort((a, b) => (byId[a]?.char || '').localeCompare(byId[b]?.char || ''))
      if (kids.length === 0) {
        yOf[id] = row++
        return
      }
      kids.forEach(assign)
      const ys = kids.map((k) => yOf[k])
      yOf[id] = (Math.min(...ys) + Math.max(...ys)) / 2
    }
    assign(0)
    const rows = Math.max(row, 1)
    const pos: Record<number, { x: number; y: number }> = {}
    for (const n of f.nodes) pos[n.id] = { x: mx + n.depth * dx, y: my + (yOf[n.id] ?? 0) * dy }
    return { positions: pos, W: mx * 2 + maxDepth * dx + 24, H: my * 2 + (rows - 1) * dy + 24 }
  }, [f.nodes])

  const byId: Record<number, SNode> = {}
  for (const n of f.nodes) byId[n.id] = n

  const nodeFill = (id: number): string => {
    if (id === f.createdId) return C.go
    if (id === f.currentId) return C.signal
    if (f.pathIds.includes(id)) return C.trace
    return '#FBF9F3'
  }
  const nodeTextColor = (id: number): string =>
    id === f.createdId || id === f.currentId || f.pathIds.includes(id) ? C.paper : C.ink

  return (
    <div>
      <style>{`.tr-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .tr-btn:active{transform:translateY(1px)} .tr-btn:disabled{opacity:.35;cursor:not-allowed}
        .tr-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>ops =</label>
          <input
            value={opsText}
            spellCheck={false}
            placeholder="insert(cat),search(car)"
            onChange={(e) => changeOps(e.target.value)}
            style={{ ...inputStyle, minWidth: 240, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = opsText.replace(/\s/g, '') === p.ops.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="tr-btn"
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
          insert(word), search(word), startsWith(prefix). Lowercase letters only. A green ring marks a word end.
        </div>
      </div>

      {/* TOP: trie + ops */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        {/* operations */}
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>operations</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
          {ops.map((op, oi) => {
            const active = oi === f.opIndex
            const done = oi < f.opIndex
            return (
              <span
                key={oi}
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 12,
                  padding: '4px 8px',
                  borderRadius: 4,
                  border: `1.5px solid ${active ? C.ink : C.wire}`,
                  background: active ? C.ink : C.paper,
                  color: active ? C.paper : done ? C.slate : C.ink,
                  opacity: done ? 0.6 : 1,
                }}
              >
                {op.type}({op.word})
              </span>
            )
          })}
        </div>

        {/* trie tree */}
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display: 'block', maxHeight: 360 }}>
          {/* edges */}
          {f.nodes.map((n) =>
            n.childrenIds.map((cid) => {
              const p = positions[n.id]
              const cpos = positions[cid]
              if (!p || !cpos) return null
              const onPath = f.pathIds.includes(cid) && f.pathIds.includes(n.id)
              return <line key={`${n.id}-${cid}`} x1={p.x} y1={p.y} x2={cpos.x} y2={cpos.y} stroke={onPath ? C.trace : C.wire} strokeWidth={onPath ? 2.5 : 1.5} />
            }),
          )}
          {/* nodes */}
          {f.nodes.map((n) => {
            const p = positions[n.id]
            if (!p) return null
            const isRoot = n.id === 0
            return (
              <g key={n.id}>
                <circle
                  cx={p.x}
                  cy={p.y}
                  r={isRoot ? 9 : 16}
                  fill={isRoot ? C.ink : nodeFill(n.id)}
                  stroke={n.isEnd ? C.go : C.ink}
                  strokeWidth={n.isEnd ? 3.5 : 1.5}
                />
                {!isRoot && (
                  <text x={p.x} y={p.y + 5} textAnchor="middle" fontFamily={MONO} fontWeight="700" fontSize="14" fill={nodeTextColor(n.id)}>
                    {n.char}
                  </text>
                )}
                {isRoot && (
                  <text x={p.x} y={p.y + 26} textAnchor="middle" fontFamily={MONO} fontSize="10" fill={C.slate}>
                    root
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* result log */}
        {f.log.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12, alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>results</span>
            {f.log.map((l, li) => (
              <span key={li} style={{ fontFamily: MONO, fontSize: 12, padding: '3px 8px', borderRadius: 4, border: `1.5px solid ${C.wire}`, background: C.paper }}>
                {l}
              </span>
            ))}
          </div>
        )}

        {/* legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 12 }}>
          <Swatch color={C.signal} label="current" />
          <Swatch color={C.trace} label="path" />
          <Swatch color={C.go} label="created" />
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
            <span style={{ width: 14, height: 14, borderRadius: 7, background: '#FBF9F3', border: `3px solid ${C.go}` }} />
            word end
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
                      lineHeight: '1.65',
                    }}
                  >
                    {row.ln}
                  </span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10, lineHeight: '1.65', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 11, lineHeight: '1.65' }}>◄</span>}
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
            <button className="tr-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="tr-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="tr-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="tr-btn"
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
      <span style={{ width: 14, height: 14, borderRadius: 7, background: color, border: `1.5px solid ${C.ink}` }} />
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
