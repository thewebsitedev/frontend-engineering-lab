'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; rows: string[] }[] = [
  { name: '3 islands', rows: ['11000', '11000', '00100', '00011'] },
  { name: 'one island', rows: ['111', '101', '111'] },
  { name: 'scatter', rows: ['1010', '0101', '1010', '0101'] },
  { name: 'all water', rows: ['000', '000', '000'] },
]

const toGrid = (rows: string[]) => rows.map((r) => r.split(''))
const gridKey = (g: string[][]) => g.map((r) => r.join('')).join('/')

const ISLAND_COLORS = [C.go, C.trace, '#B5762E', '#6E5AA0', '#3E8E9C', C.signal, '#9C5C8A']
const islandColor = (id: number) => ISLAND_COLORS[(id - 1) % ISLAND_COLORS.length]

// JS source shown in the trace panel (matches the default language).
const CODE = [
  { ln: 1, t: 'function numIslands(grid) {' },
  { ln: 2, t: '  let count = 0;' },
  { ln: 3, t: '  const sink = (r, c) => {' },
  { ln: 4, t: "    if (oob(r, c) || grid[r][c] !== '1') return;" },
  { ln: 5, t: "    grid[r][c] = '0';" },
  { ln: 6, t: '    sink(r+1,c); sink(r-1,c); sink(r,c+1); sink(r,c-1);' },
  { ln: 7, t: '  };' },
  { ln: 8, t: '  for (let r = 0; r < rows; r++)' },
  { ln: 9, t: '    for (let c = 0; c < cols; c++)' },
  { ln: 10, t: "      if (grid[r][c] === '1') { count++; sink(r, c); }" },
  { ln: 11, t: '  return count;' },
  { ln: 12, t: '}' },
]

type Cell = number | null
type Pt = [number, number]
type Frame = {
  kind: string
  line: number
  islandOf: Cell[][]
  cursor: Pt | null
  dfs: Pt | null
  count: number
  title: string
  note: string
}

function buildFrames(grid: string[][]): { frames: Frame[]; count: number } {
  const R = grid.length
  const Cc = R ? grid[0].length : 0
  const islandOf: Cell[][] = grid.map((row) => row.map(() => null))
  const snap = (): Cell[][] => islandOf.map((r) => r.slice())
  const frames: Frame[] = []
  let count = 0

  frames.push({
    kind: 'start',
    line: 2,
    islandOf: snap(),
    cursor: null,
    dfs: null,
    count: 0,
    title: 'Start',
    note: 'Scan the grid row by row. Each unvisited land cell starts a new island, which we flood-fill.',
  })

  for (let r = 0; r < R; r++) {
    for (let c = 0; c < Cc; c++) {
      const visitedId = islandOf[r][c]
      frames.push({
        kind: 'scan',
        line: 10,
        islandOf: snap(),
        cursor: [r, c],
        dfs: null,
        count,
        title: `Scan (${r}, ${c})`,
        note:
          grid[r][c] === '1'
            ? visitedId !== null
              ? `(${r}, ${c}) is land but already part of island #${visitedId}. Skip.`
              : `(${r}, ${c}) is unvisited land — a new island!`
            : `(${r}, ${c}) is water — skip.`,
      })

      if (grid[r][c] === '1' && islandOf[r][c] === null) {
        count++
        frames.push({
          kind: 'found',
          line: 10,
          islandOf: snap(),
          cursor: [r, c],
          dfs: null,
          count,
          title: `Island #${count}`,
          note: `New land found — bump the count to ${count} and flood-fill outward from here.`,
        })

        // iterative DFS so we can snapshot each step
        const stack: Pt[] = [[r, c]]
        while (stack.length) {
          const [cr, cc] = stack.pop() as Pt
          if (cr < 0 || cc < 0 || cr >= R || cc >= Cc) continue
          if (grid[cr][cc] === '0') continue
          if (islandOf[cr][cc] !== null) continue
          islandOf[cr][cc] = count
          frames.push({
            kind: 'dfs',
            line: 5,
            islandOf: snap(),
            cursor: [r, c],
            dfs: [cr, cc],
            count,
            title: `Flood-fill #${count}`,
            note: `Sink (${cr}, ${cc}) into island #${count}, then explore its 4 neighbours.`,
          })
          stack.push([cr + 1, cc], [cr - 1, cc], [cr, cc + 1], [cr, cc - 1])
        }
      }
    }
  }

  frames.push({
    kind: 'done',
    line: 11,
    islandOf: snap(),
    cursor: null,
    dfs: null,
    count,
    title: `${count} island${count === 1 ? '' : 's'}`,
    note: `Scan complete — the grid contains ${count} island${count === 1 ? '' : 's'}.`,
  })

  return { frames, count }
}

export default function NumberOfIslandsViz() {
  const [grid, setGrid] = useState<string[][]>(() => toGrid(PRESETS[0].rows))
  const { frames, count } = useMemo(() => buildFrames(grid), [grid])
  const [i, setI] = useState(0)

  // Editing the grid is a new problem — apply it and rewind in one update.
  const changeGrid = useCallback((g: string[][]) => {
    setGrid(g)
    setI(0)
  }, [])

  const toggle = (r: number, c: number) => {
    const g = grid.map((row) => row.slice())
    g[r][c] = g[r][c] === '1' ? '0' : '1'
    changeGrid(g)
  }

  const f = frames[i]
  const atEnd = i === frames.length - 1
  const next = useCallback(
    () => setI((x) => Math.min(x + 1, frames.length - 1)),
    [frames.length],
  )
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const cols = grid[0]?.length ?? 0
  const activeKey = gridKey(grid)

  // chips
  const cellPt = f.dfs ?? f.cursor

  return (
    <div>
      <style>{`.ni-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .ni-btn:active{transform:translateY(1px)} .ni-btn:disabled{opacity:.35;cursor:not-allowed}
        .ni-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}
        .ni-cell{cursor:pointer}`}</style>

      {/* Presets */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>boards:</span>
        {PRESETS.map((p) => {
          const active = activeKey === gridKey(toGrid(p.rows))
          return (
            <button
              key={p.name}
              className="ni-btn"
              onClick={() => changeGrid(toGrid(p.rows))}
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
      <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginBottom: 16 }}>
        click any cell to toggle land / water
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)',
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
                    fontSize: 12.5,
                    userSelect: 'none',
                    lineHeight: '1.9',
                  }}
                >
                  {row.ln}
                </span>
                <pre
                  style={{
                    margin: 0,
                    fontFamily: MONO,
                    fontSize: 12,
                    lineHeight: '1.9',
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
                      paddingRight: 10,
                      color: C.signal,
                      fontFamily: MONO,
                      fontSize: 12.5,
                      lineHeight: '1.9',
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
              ['count', String(f.count)],
              ...(cellPt ? [['r,c', `${cellPt[0]},${cellPt[1]}`]] : []),
            ].map(([k, v]) => (
              <span
                key={k}
                style={{
                  fontFamily: MONO,
                  fontSize: 13,
                  background: '#000',
                  color: C.codeink,
                  padding: '4px 9px',
                  borderRadius: 4,
                  border: `1px solid ${k === 'count' ? C.signal : C.trace}`,
                }}
              >
                <span style={{ color: k === 'count' ? C.signal : C.trace }}>{k}</span>
                <span style={{ color: C.codedim }}> = </span>
                <b>{v}</b>
              </span>
            ))}
          </div>
        </div>

        {/* RIGHT: grid + legend + narration */}
        <div>
          {/* Grid */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${cols}, 40px)`,
              gap: 5,
              marginBottom: 14,
            }}
          >
            {grid.map((rowArr, r) =>
              rowArr.map((_, c) => {
                const id = f.islandOf[r][c]
                const water = grid[r][c] === '0'
                const isDfs = !!f.dfs && f.dfs[0] === r && f.dfs[1] === c
                const isCursor = !!f.cursor && f.cursor[0] === r && f.cursor[1] === c

                let bg: string
                let fg: string
                let border: string
                let label: string
                if (water) {
                  bg = '#DCE6EC'
                  fg = C.slate
                  border = `1.5px solid ${C.wire}`
                  label = ''
                } else if (id !== null) {
                  const col = islandColor(id)
                  bg = col
                  fg = C.paper
                  border = `1.5px solid ${col}`
                  label = String(id)
                } else {
                  bg = '#FBF9F3'
                  fg = C.ink
                  border = `2px solid ${C.ink}`
                  label = '1'
                }
                if (isDfs) border = `3px solid ${C.ink}`

                return (
                  <button
                    key={`${r}-${c}`}
                    className="ni-cell"
                    onClick={() => toggle(r, c)}
                    title={`(${r}, ${c}) — click to toggle`}
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 6,
                      border,
                      background: bg,
                      color: fg,
                      fontFamily: MONO,
                      fontWeight: 700,
                      fontSize: 15,
                      outline: isCursor ? `2px dashed ${C.signal}` : 'none',
                      outlineOffset: 2,
                    }}
                  >
                    {label}
                  </button>
                )
              }),
            )}
          </div>

          {/* Legend */}
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
            <Legend swatch="#DCE6EC" border={C.wire} label="water" />
            <Legend swatch="#FBF9F3" border={C.ink} label="land" />
            <Legend swatch={C.go} border={C.go} label="island" />
            <Legend swatch="transparent" border={C.signal} dashed label="scanning" />
          </div>

          {/* narration */}
          <div
            style={{
              borderLeft: `3px solid ${
                f.kind === 'dfs'
                  ? C.go
                  : f.kind === 'found'
                    ? C.signal
                    : f.kind === 'done'
                      ? C.go
                      : f.kind === 'scan'
                        ? C.trace
                        : C.ink
              }`,
              paddingLeft: 12,
              minHeight: 70,
            }}
          >
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>
              STEP {i} / {frames.length - 1} · line {f.line}
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
        <button className="ni-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
          ‹ back
        </button>
        <button
          className="ni-btn"
          onClick={next}
          disabled={atEnd}
          style={btn(atEnd ? C.go : C.ink, C.paper)}
        >
          {atEnd ? 'done' : 'next ›'}
        </button>
        <button className="ni-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
          restart
        </button>
        <div style={{ flex: 1 }} />
        {atEnd && (
          <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: C.signal }}>
            return {count}
          </div>
        )}
      </div>

      <div style={{ display: 'flex', gap: 4, marginTop: 14 }}>
        {frames.map((fr, idx) => (
          <button
            key={idx}
            className="ni-btn"
            onClick={() => setI(idx)}
            aria-label={`step ${idx}`}
            style={{
              height: 6,
              flex: 1,
              border: 'none',
              borderRadius: 3,
              padding: 0,
              background:
                idx <= i
                  ? fr.kind === 'dfs' || fr.kind === 'done'
                    ? C.go
                    : fr.kind === 'found'
                      ? C.signal
                      : fr.kind === 'scan'
                        ? C.trace
                        : C.ink
                  : C.wire,
            }}
          />
        ))}
      </div>
    </div>
  )
}

function Legend({
  swatch,
  border,
  label,
  dashed,
}: {
  swatch: string
  border: string
  label: string
  dashed?: boolean
}) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span
        style={{
          width: 14,
          height: 14,
          borderRadius: 3,
          background: swatch,
          border: `${dashed ? '2px dashed' : '1.5px solid'} ${border}`,
        }}
      />
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
