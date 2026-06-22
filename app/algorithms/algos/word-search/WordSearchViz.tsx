'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; board: string; word: string }[] = [
  { name: 'found', board: 'ABCE SFCS ADEE', word: 'ABCCED' },
  { name: 'SEE', board: 'ABCE SFCS ADEE', word: 'SEE' },
  { name: 'not found', board: 'ABCE SFCS ADEE', word: 'ABCB' },
  { name: 'tiny', board: 'AB CD', word: 'ABDC' },
]

function parseBoard(text: string): string[] {
  const rows = text
    .trim()
    .split(/[\s,]+/)
    .map((r) => r.toUpperCase().replace(/[^A-Z]/g, ''))
    .filter((r) => r.length > 0)
    .slice(0, 4)
  if (rows.length === 0) return []
  const cols = Math.min(...rows.map((r) => r.length), 5)
  return rows.map((r) => r.slice(0, cols))
}

const CODE = [
  { ln: 1, t: 'function exist(board, word) {' },
  { ln: 2, t: '  const R = board.length, C = board[0].length;' },
  { ln: 3, t: '  function dfs(r, c, i) {' },
  { ln: 4, t: '    if (i === word.length) return true;' },
  { ln: 5, t: '    if (r<0||c<0||r>=R||c>=C) return false;' },
  { ln: 6, t: '    if (board[r][c] !== word[i]) return false;' },
  { ln: 7, t: "    const tmp = board[r][c];" },
  { ln: 8, t: "    board[r][c] = '#';            // mark used" },
  { ln: 9, t: '    const found = dfs(r+1,c,i+1) || dfs(r-1,c,i+1)' },
  { ln: 10, t: '                || dfs(r,c+1,i+1) || dfs(r,c-1,i+1);' },
  { ln: 11, t: '    board[r][c] = tmp;           // backtrack' },
  { ln: 12, t: '    return found;' },
  { ln: 13, t: '  }' },
  { ln: 14, t: '  for (let r = 0; r < R; r++)' },
  { ln: 15, t: '    for (let c = 0; c < C; c++)' },
  { ln: 16, t: '      if (dfs(r, c, 0)) return true;' },
  { ln: 17, t: '  return false;' },
  { ln: 18, t: '}' },
]

type Cell = [number, number]
type Frame = {
  kind: string
  line: number
  curr: Cell | null
  fail: Cell | null
  path: Cell[]
  matchIndex: number
  found: boolean
  result: string | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(board: string[], word: string): Frame[] {
  const R = board.length
  const Cc = R ? board[0].length : 0
  const frames: Frame[] = []
  const grid = board.map((row) => row.split(''))
  const path: Cell[] = []
  let found = false
  let result: string | null = null
  let aborted = false
  const CAP = 700

  const push = (
    kind: string,
    line: number,
    title: string,
    note: string,
    extra: { curr?: Cell | null; fail?: Cell | null; matchIndex?: number; vars?: [string, string][] } = {},
  ) => {
    if (frames.length >= CAP) {
      aborted = true
      return
    }
    frames.push({
      kind,
      line,
      title,
      note,
      curr: extra.curr ?? null,
      fail: extra.fail ?? null,
      path: path.map((p) => [p[0], p[1]] as Cell),
      matchIndex: extra.matchIndex ?? path.length,
      found,
      result,
      vars: extra.vars ?? [],
    })
  }

  if (R === 0 || word.length === 0) {
    push('done', 17, 'Nothing to search', 'Provide a board and a word to search for.', { matchIndex: 0 })
    return frames
  }

  const dfs = (r: number, c: number, i: number): boolean => {
    if (aborted) return false
    if (i === word.length) {
      found = true
      push('found', 4, 'Whole word matched!', `i reached ${word.length} (the word length): every character matched along the path. Return true.`, { matchIndex: i })
      return true
    }
    if (r < 0 || c < 0 || r >= R || c >= Cc) {
      push('oob', 5, 'Off the grid', `(${r}, ${c}) is outside the board — this branch fails.`, { matchIndex: i })
      return false
    }
    if (grid[r][c] !== word[i]) {
      push('mismatch', 6, `'${grid[r][c]}' ≠ '${word[i]}'`, `Cell (${r},${c}) holds '${grid[r][c]}', but we need '${word[i]}'. Dead end.`, { curr: [r, c], fail: [r, c], matchIndex: i })
      return false
    }
    push('match', 6, `'${word[i]}' matches at (${r},${c})`, `Cell (${r},${c}) is '${word[i]}' — exactly the character we need. Step onto it.`, { curr: [r, c], matchIndex: i })
    const tmp = grid[r][c]
    grid[r][c] = '#'
    path.push([r, c])
    push('visit', 8, `Mark (${r},${c}) used`, `Blank it to '#' so this path cannot reuse the same cell.`, { curr: [r, c], matchIndex: i + 1 })
    const nextCh = i + 1 < word.length ? word[i + 1] : '—'
    push('explore', 9, `Explore neighbours of (${r},${c})`, `Try the four neighbours (down, up, right, left) for the next character '${nextCh}'.`, { curr: [r, c], matchIndex: i + 1 })
    const ok = dfs(r + 1, c, i + 1) || dfs(r - 1, c, i + 1) || dfs(r, c + 1, i + 1) || dfs(r, c - 1, i + 1)
    grid[r][c] = tmp
    if (!ok) {
      path.pop()
      push('backtrack', 11, `Backtrack from (${r},${c})`, `No neighbour completed the word. Restore '${tmp}' and step back.`, { curr: [r, c], matchIndex: i })
    }
    push('return', 12, `Return ${ok} from (${r},${c})`, ok ? 'A neighbour finished the word — propagate true up the chain.' : 'This cell leads nowhere for the word.', { curr: ok ? [r, c] : null, matchIndex: i })
    return ok
  }

  push('start', 14, 'Scan for a starting cell', 'Any cell could be the first letter, so try starting a DFS from each one until the word is found.', { matchIndex: 0 })

  let done = false
  for (let r = 0; r < R && !done; r++) {
    for (let c = 0; c < Cc && !done; c++) {
      push('try', 16, `Try start (${r},${c})`, `Begin a fresh DFS for "${word}" at cell (${r},${c}).`, { curr: [r, c], matchIndex: 0 })
      if (dfs(r, c, 0)) {
        result = 'exist → true'
        done = true
      }
    }
  }

  if (!found) result = 'exist → false'
  push('done', found ? 16 : 17, found ? 'Found the word ✓' : 'Word not found ✗', found ? `"${word}" can be traced through adjacent cells. Return true.` : `No path spells "${word}". Return false.`, { matchIndex: found ? word.length : 0 })
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'found'
    ? C.go
    : kind === 'mismatch' || kind === 'oob'
      ? C.signal
      : kind === 'match' || kind === 'visit' || kind === 'explore' || kind === 'try' || kind === 'start'
        ? C.trace
        : kind === 'done'
          ? C.go
          : C.slate

export default function WordSearchViz() {
  const [boardText, setBoardText] = useState(PRESETS[0].board)
  const [wordText, setWordText] = useState(PRESETS[0].word)

  const board = useMemo(() => parseBoard(boardText), [boardText])
  const word = useMemo(() => wordText.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 8), [wordText])
  const frames = useMemo(() => buildFrames(board, word), [board, word])
  const [i, setI] = useState(0)

  const changeBoard = useCallback((v: string) => {
    setBoardText(v.replace(/[^a-z\s,]/gi, '').slice(0, 40))
    setI(0)
  }, [])
  const changeWord = useCallback((v: string) => {
    setWordText(v.replace(/[^a-z]/gi, '').slice(0, 8))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { board: string; word: string }) => {
    setBoardText(p.board)
    setWordText(p.word)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const eq = (a: Cell | null, r: number, c: number) => !!a && a[0] === r && a[1] === c
  const inPath = (r: number, c: number) => f.path.some((p) => p[0] === r && p[1] === c)
  const pathOrder = (r: number, c: number) => f.path.findIndex((p) => p[0] === r && p[1] === c)

  const cellColors = (r: number, c: number): { bg: string; fg: string; bd: string } => {
    if (eq(f.fail, r, c)) return { bg: '#E9B7AE', fg: C.ink, bd: C.signal }
    if (eq(f.curr, r, c)) return { bg: C.signal, fg: C.paper, bd: C.signal }
    if (inPath(r, c)) return { bg: C.go, fg: C.paper, bd: C.go }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire }
  }

  return (
    <div>
      <style>{`.ws-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .ws-btn:active{transform:translateY(1px)} .ws-btn:disabled{opacity:.35;cursor:not-allowed}
        .ws-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>board =</label>
          <input
            value={boardText}
            spellCheck={false}
            placeholder="ABCE SFCS ADEE"
            onChange={(e) => changeBoard(e.target.value)}
            style={{ ...inputStyle, minWidth: 180, flex: 1 }}
          />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>word =</label>
          <input value={wordText} spellCheck={false} onChange={(e) => changeWord(e.target.value)} style={{ ...inputStyle, width: 120 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = boardText.replace(/\s/g, '') === p.board.replace(/\s/g, '') && wordText.toUpperCase() === p.word
            return (
              <button
                key={p.name}
                className="ws-btn"
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
          Separate rows with spaces. Letters move up/down/left/right; each cell is used at most once per path.
        </div>
      </div>

      {/* TOP: grid + word */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14 }}>
        {/* word progress */}
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>word</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
          {[...word].map((ch, k) => {
            const matched = k < f.path.length
            const current = k === f.matchIndex && !f.found
            return (
              <span
                key={k}
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 15,
                  width: 30,
                  height: 34,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 4,
                  border: `1.5px solid ${current ? C.signal : matched ? C.go : C.wire}`,
                  background: matched ? C.go : current ? C.signal : C.paper,
                  color: matched || current ? C.paper : C.ink,
                }}
              >
                {ch}
              </span>
            )
          })}
        </div>

        {/* grid */}
        <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 6 }}>
          {board.map((row, r) => (
            <div key={r} style={{ display: 'flex', gap: 6 }}>
              {row.split('').map((ch, c) => {
                const cc = cellColors(r, c)
                const order = pathOrder(r, c)
                return (
                  <div
                    key={c}
                    style={{
                      position: 'relative',
                      width: 46,
                      height: 46,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 18,
                      borderRadius: 6,
                      background: cc.bg,
                      color: cc.fg,
                      border: `2px solid ${cc.bd}`,
                    }}
                  >
                    {ch}
                    {order >= 0 && (
                      <span style={{ position: 'absolute', top: 2, right: 4, fontFamily: MONO, fontSize: 9, color: cc.fg, opacity: 0.85 }}>{order + 1}</span>
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>

        {/* legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 14 }}>
          <Swatch color={C.signal} label="current" />
          <Swatch color={C.go} label="path so far" />
          <Swatch color="#E9B7AE" label="mismatch" />
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
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
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
            <button className="ws-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="ws-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="ws-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="ws-btn"
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
            {atEnd && f.result && (
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: f.found ? C.go : C.signal, marginTop: 10 }}>{f.result}</div>
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
