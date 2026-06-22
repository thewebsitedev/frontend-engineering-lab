'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; cap: string; ops: string }[] = [
  { name: 'classic', cap: '2', ops: 'put(1,1),put(2,2),get(1),put(3,3),get(2),put(4,4),get(1),get(3),get(4)' },
  { name: 'update', cap: '2', ops: 'put(1,1),put(2,2),put(1,10),get(1),put(3,3),get(2)' },
  { name: 'capacity 1', cap: '1', ops: 'put(1,1),put(2,2),get(1),get(2)' },
  { name: 'all hits', cap: '3', ops: 'put(1,1),put(2,2),put(3,3),get(1),get(2),get(3)' },
]

type Op = { type: 'get' | 'put'; key: number; value?: number }

function parseOps(text: string): Op[] {
  const out: Op[] = []
  const re = /(get|put)\s*\(([^)]*)\)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(text)) !== null) {
    const nums = (m[2].match(/-?\d+/g) || []).map(Number)
    if (m[1] === 'get' && nums.length >= 1) out.push({ type: 'get', key: nums[0] })
    else if (m[1] === 'put' && nums.length >= 2) out.push({ type: 'put', key: nums[0], value: nums[1] })
    if (out.length >= 12) break
  }
  return out
}

const CODE = [
  { ln: 1, t: 'class LRUCache {' },
  { ln: 2, t: '  constructor(capacity) {' },
  { ln: 3, t: '    this.cap = capacity;' },
  { ln: 4, t: '    this.map = new Map();   // oldest → newest' },
  { ln: 5, t: '  }' },
  { ln: 6, t: '  get(key) {' },
  { ln: 7, t: '    if (!this.map.has(key)) return -1;' },
  { ln: 8, t: '    const v = this.map.get(key);' },
  { ln: 9, t: '    this.map.delete(key);' },
  { ln: 10, t: '    this.map.set(key, v);    // renew as newest' },
  { ln: 11, t: '    return v;' },
  { ln: 12, t: '  }' },
  { ln: 13, t: '  put(key, value) {' },
  { ln: 14, t: '    if (this.map.has(key)) this.map.delete(key);' },
  { ln: 15, t: '    this.map.set(key, value);' },
  { ln: 16, t: '    if (this.map.size > this.cap) {' },
  { ln: 17, t: '      const lru = this.map.keys().next().value;' },
  { ln: 18, t: '      this.map.delete(lru);   // evict oldest' },
  { ln: 19, t: '    }' },
  { ln: 20, t: '  }' },
  { ln: 21, t: '}' },
]

type Entry = { key: number; value: number }
type Frame = {
  kind: string
  line: number
  entries: Entry[] // ordered oldest (LRU) → newest (MRU)
  opIndex: number
  activeKey: number | null
  insertKey: number | null
  evictKey: number | null
  log: string[]
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(cap: number, ops: Op[]): Frame[] {
  const frames: Frame[] = []
  const entries: Entry[] = []
  const log: string[] = []
  let opIndex = -1
  let activeKey: number | null = null
  let insertKey: number | null = null
  let evictKey: number | null = null

  const find = (key: number) => entries.findIndex((e) => e.key === key)
  const push = (kind: string, line: number, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({
      kind,
      line,
      title,
      note,
      vars,
      entries: entries.map((e) => ({ ...e })),
      opIndex,
      activeKey,
      insertKey,
      evictKey,
      log: [...log],
    })

  push('init', 4, `New cache, capacity ${cap}`, 'The Map keeps keys in insertion order: the first key is the least-recently-used (LRU), the last is the most-recently-used (MRU).', [['cap', String(cap)]])

  for (let oi = 0; oi < ops.length; oi++) {
    const op = ops[oi]
    opIndex = oi
    activeKey = null
    insertKey = null
    evictKey = null

    if (op.type === 'get') {
      activeKey = op.key
      push('op', 6, `get(${op.key})`, `Look up key ${op.key}.`, [['key', String(op.key)]])
      const idx = find(op.key)
      if (idx < 0) {
        log.push(`get(${op.key}) → -1`)
        push('miss', 7, `Key ${op.key} missing → -1`, `Key ${op.key} is not in the cache, so get returns -1.`, [['return', '-1']])
        continue
      }
      const v = entries[idx].value
      push('hit', 8, `Found: ${v}`, `Key ${op.key} maps to ${v}.`, [['v', String(v)]])
      entries.splice(idx, 1)
      push('move', 9, `Delete key ${op.key}`, `Remove it from its current spot so we can re-insert it as the newest.`, [['key', String(op.key)]])
      entries.push({ key: op.key, value: v })
      insertKey = op.key
      activeKey = null
      push('move', 10, `Re-insert ${op.key} as newest`, `Adding it back puts key ${op.key} at the MRU end — it was just used.`, [])
      insertKey = null
      log.push(`get(${op.key}) → ${v}`)
      push('hit', 11, `Return ${v}`, `get(${op.key}) returns ${v}.`, [['return', String(v)]])
    } else {
      const value = op.value!
      activeKey = op.key
      push('op', 13, `put(${op.key}, ${value})`, `Insert or update key ${op.key} with value ${value}.`, [['key', String(op.key)], ['value', String(value)]])
      const idx = find(op.key)
      if (idx >= 0) {
        entries.splice(idx, 1)
        push('move', 14, `Key ${op.key} exists → delete it`, `It is already present, so remove the old copy first; the re-insert below will refresh its recency.`, [['key', String(op.key)]])
      } else {
        push('check', 14, `Key ${op.key} is new`, `Not present yet — nothing to delete.`, [['key', String(op.key)]])
      }
      entries.push({ key: op.key, value })
      insertKey = op.key
      activeKey = null
      push('insert', 15, `Set ${op.key} = ${value} (newest)`, `Insert at the MRU end.`, [['size', String(entries.length)]])
      insertKey = null

      if (entries.length > cap) {
        push('check', 16, `Over capacity (${entries.length} > ${cap})`, `The cache exceeded its capacity, so the LRU entry must be evicted.`, [['size', String(entries.length)], ['cap', String(cap)]])
        const lru = entries[0]
        evictKey = lru.key
        push('evict', 17, `LRU = key ${lru.key}`, `The oldest key (front of the Map) is ${lru.key} — that is the least-recently-used.`, [['lru', String(lru.key)]])
        entries.shift()
        push('evict', 18, `Evict key ${lru.key}`, `Delete key ${lru.key} to make room.`, [['size', String(entries.length)]])
        evictKey = null
      } else {
        push('check', 16, `Within capacity (${entries.length} ≤ ${cap})`, `No eviction needed.`, [['size', String(entries.length)], ['cap', String(cap)]])
      }
    }
  }

  opIndex = ops.length
  activeKey = null
  push('done', 21, 'All operations done', log.length ? `Results: ${log.join(',  ')}.` : 'No get calls were made.', [])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'evict' || kind === 'miss'
    ? C.signal
    : kind === 'insert' || kind === 'done' || kind === 'hit'
      ? C.go
      : kind === 'op' || kind === 'move' || kind === 'check'
        ? C.trace
        : C.ink

export default function LRUCacheViz() {
  const [capText, setCapText] = useState(PRESETS[0].cap)
  const [opsText, setOpsText] = useState(PRESETS[0].ops)

  const cap = Math.min(Math.max(Number(capText) || 1, 1), 5)
  const ops = useMemo(() => parseOps(opsText), [opsText])
  const frames = useMemo(() => buildFrames(cap, ops), [cap, ops])
  const [i, setI] = useState(0)

  const changeCap = useCallback((v: string) => {
    setCapText(v.replace(/[^0-9]/g, '').slice(0, 1))
    setI(0)
  }, [])
  const changeOps = useCallback((v: string) => {
    setOpsText(v.replace(/[^0-9a-z(),\s]/gi, '').slice(0, 120))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { cap: string; ops: string }) => {
    setCapText(p.cap)
    setOpsText(p.ops)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const entryColors = (key: number): { bg: string; fg: string; bd: string; strike: boolean } => {
    if (key === f.evictKey) return { bg: '#E9B7AE', fg: C.ink, bd: C.signal, strike: true }
    if (key === f.activeKey) return { bg: C.trace, fg: C.paper, bd: C.trace, strike: false }
    if (key === f.insertKey) return { bg: C.go, fg: C.paper, bd: C.go, strike: false }
    return { bg: '#FBF9F3', fg: C.ink, bd: C.wire, strike: false }
  }

  return (
    <div>
      <style>{`.lr-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .lr-btn:active{transform:translateY(1px)} .lr-btn:disabled{opacity:.35;cursor:not-allowed}
        .lr-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      {/* Editable input */}
      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>capacity =</label>
          <input value={capText} spellCheck={false} onChange={(e) => changeCap(e.target.value)} style={{ ...inputStyle, width: 52 }} />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>ops =</label>
          <input
            value={opsText}
            spellCheck={false}
            placeholder="put(1,1),get(1)"
            onChange={(e) => changeOps(e.target.value)}
            style={{ ...inputStyle, minWidth: 220, flex: 1 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = capText === p.cap && opsText.replace(/\s/g, '') === p.ops.replace(/\s/g, '')
            return (
              <button
                key={p.name}
                className="lr-btn"
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
          get(k) and put(k,v) must each run in O(1). Recency order = Map insertion order.
        </div>
      </div>

      {/* TOP: cache + ops */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14 }}>
        {/* operations */}
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>operations</div>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 16 }}>
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
                {op.type === 'get' ? `get(${op.key})` : `put(${op.key},${op.value})`}
              </span>
            )
          })}
        </div>

        {/* cache row */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: MONO, fontSize: 10, color: C.slate, marginBottom: 4, maxWidth: 520 }}>
          <span>← LRU (oldest)</span>
          <span>MRU (newest) →</span>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', minHeight: 50, alignItems: 'center' }}>
          {f.entries.length === 0 ? (
            <span style={{ fontFamily: MONO, fontSize: 12, color: C.slate }}>(empty)</span>
          ) : (
            f.entries.map((e) => {
              const cc = entryColors(e.key)
              return (
                <div
                  key={e.key}
                  style={{
                    minWidth: 56,
                    height: 46,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontFamily: MONO,
                    fontWeight: 700,
                    borderRadius: 6,
                    background: cc.bg,
                    color: cc.fg,
                    border: `2px solid ${cc.bd}`,
                    textDecoration: cc.strike ? 'line-through' : 'none',
                    padding: '0 8px',
                  }}
                >
                  <span style={{ fontSize: 15 }}>
                    {e.key}:{e.value}
                  </span>
                </div>
              )
            })
          )}
        </div>

        {/* result log */}
        {f.log.length > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 14, alignItems: 'center' }}>
            <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>get results</span>
            {f.log.map((l, li) => (
              <span key={li} style={{ fontFamily: MONO, fontSize: 12, padding: '3px 8px', borderRadius: 4, border: `1.5px solid ${C.wire}`, background: C.paper }}>
                {l}
              </span>
            ))}
          </div>
        )}

        {/* legend */}
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 14 }}>
          <Swatch color={C.trace} label="accessed" />
          <Swatch color={C.go} label="inserted / renewed" />
          <Swatch color="#E9B7AE" label="evicted" />
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
                      lineHeight: '1.75',
                    }}
                  >
                    {row.ln}
                  </span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.75', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 11.5, lineHeight: '1.75' }}>◄</span>}
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
            <button className="lr-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>
              ‹ back
            </button>
            <button className="lr-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>
              {atEnd ? 'done' : 'next ›'}
            </button>
            <button className="lr-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>
              restart
            </button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button
                key={idx}
                className="lr-btn"
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
