'use client'

import { useState, useMemo, useCallback } from 'react'
import { C, MONO } from '../../theme'

const PRESETS: { name: string; coins: string; amount: string }[] = [
  { name: 'classic', coins: '[1,2,5]', amount: '11' },
  { name: 'greedy trap', coins: '[1,3,4]', amount: '6' },
  { name: 'no solution', coins: '[2]', amount: '3' },
  { name: 'amount 7', coins: '[2,3]', amount: '7' },
]

function parseNums(text: string): number[] {
  const m = text.match(/\d+/g)
  return (m ? m.map(Number).filter((x) => x > 0) : []).slice(0, 4)
}

const CODE = [
  { ln: 1, t: 'function coinChange(coins, amount) {' },
  { ln: 2, t: '  const dp = Array(amount + 1).fill(Infinity);' },
  { ln: 3, t: '  dp[0] = 0;' },
  { ln: 4, t: '  for (let a = 1; a <= amount; a++) {' },
  { ln: 5, t: '    for (const coin of coins) {' },
  { ln: 6, t: '      if (coin <= a) {' },
  { ln: 7, t: '        dp[a] = Math.min(dp[a], dp[a-coin] + 1);' },
  { ln: 8, t: '      }' },
  { ln: 9, t: '    }' },
  { ln: 10, t: '  }' },
  { ln: 11, t: '  return dp[amount] === Infinity ? -1 : dp[amount];' },
  { ln: 12, t: '}' },
]

const INF = Infinity
const show = (v: number) => (v === INF ? '∞' : String(v))

type Frame = {
  kind: string
  line: number
  dp: number[]
  a: number | null
  coin: number | null
  fromIdx: number | null
  updated: boolean
  result: number | null
  vars: [string, string][]
  title: string
  note: string
}

function buildFrames(coins: number[], amount: number): Frame[] {
  const frames: Frame[] = []
  const dp = new Array(amount + 1).fill(INF)
  let coin: number | null = null
  let fromIdx: number | null = null
  let updated = false

  const push = (kind: string, line: number, a: number | null, result: number | null, title: string, note: string, vars: [string, string][] = []) =>
    frames.push({ kind, line, dp: [...dp], a, coin, fromIdx, updated, result, title, note, vars })

  push('init', 2, null, null, 'dp[a] = fewest coins to make a', 'Fill dp so dp[a] is the minimum number of coins summing to a. Start everything at ∞ (unreachable).', [])
  dp[0] = 0
  push('base', 3, 0, null, 'dp[0] = 0', 'It takes zero coins to make amount 0 — the anchor every other value builds on.', [['dp[0]', '0']])

  for (let a = 1; a <= amount; a++) {
    coin = null
    fromIdx = null
    updated = false
    push('amount', 4, a, null, `Solve amount ${a}`, `Find the cheapest way to make ${a} using any coin as the LAST one.`, [['a', String(a)]])
    for (const c of coins) {
      coin = c
      if (c <= a) {
        fromIdx = a - c
        const cand = dp[a - c] === INF ? INF : dp[a - c] + 1
        updated = cand < dp[a]
        push('try', 7, a, null, updated ? `Coin ${c}: ${a} = ${a - c} + ${c}` : `Coin ${c}: no better`, `Use coin ${c} last → need dp[${a - c}] = ${show(dp[a - c])} more coins, total ${show(cand)}. ${updated ? `Better than dp[${a}] = ${show(dp[a])} → update.` : `Not better than dp[${a}] = ${show(dp[a])}.`}`, [['dp[a-coin]', show(dp[a - c])], ['candidate', show(cand)]])
        if (updated) dp[a] = cand
        updated = false
      } else {
        fromIdx = null
        push('skip', 6, a, null, `Coin ${c} too big`, `Coin ${c} > ${a}, so it can’t be the last coin for amount ${a}. Skip.`, [['coin', String(c)]])
      }
    }
    coin = null
    fromIdx = null
  }

  coin = null
  fromIdx = null
  const result = dp[amount] === INF ? -1 : dp[amount]
  push('done', 11, amount, result, result === -1 ? `${amount} is unreachable` : `Answer: ${result} coins`, result === -1 ? `dp[${amount}] is still ∞ — no combination of coins makes ${amount}. Return −1.` : `dp[${amount}] = ${result}. Return ${result}.`, [['result', String(result)]])
  return frames
}

const kindColor = (kind: string): string =>
  kind === 'skip'
    ? C.signal
    : kind === 'done' || kind === 'base'
      ? C.go
      : kind === 'try' || kind === 'amount'
        ? C.trace
        : C.ink

export default function CoinChangeViz() {
  const [coinsText, setCoinsText] = useState(PRESETS[0].coins)
  const [amountText, setAmountText] = useState(PRESETS[0].amount)

  const coins = useMemo(() => parseNums(coinsText), [coinsText])
  const amount = Math.min(Math.max(Number(amountText) || 0, 0), 14)
  const frames = useMemo(() => buildFrames(coins, amount), [coins, amount])
  const [i, setI] = useState(0)

  const changeCoins = useCallback((v: string) => {
    setCoinsText(v.replace(/[^0-9,\s[\]]/g, '').slice(0, 20))
    setI(0)
  }, [])
  const changeAmount = useCallback((v: string) => {
    setAmountText(v.replace(/[^0-9]/g, '').slice(0, 2))
    setI(0)
  }, [])
  const applyPreset = useCallback((p: { coins: string; amount: string }) => {
    setCoinsText(p.coins)
    setAmountText(p.amount)
    setI(0)
  }, [])

  const f = frames[Math.min(i, frames.length - 1)]
  const atEnd = i >= frames.length - 1
  const next = useCallback(() => setI((x) => Math.min(x + 1, frames.length - 1)), [frames.length])
  const prev = useCallback(() => setI((x) => Math.max(x - 1, 0)), [])

  const cellColors = (idx: number): { bg: string; fg: string; bd: string } => {
    if (idx === f.a) return { bg: C.signal, fg: C.paper, bd: C.signal }
    if (idx === f.fromIdx) return { bg: C.trace, fg: C.paper, bd: C.trace }
    if (f.dp[idx] !== INF) return { bg: C.go, fg: C.paper, bd: C.go }
    return { bg: '#FBF9F3', fg: C.slate, bd: C.wire }
  }

  return (
    <div>
      <style>{`.cc-btn{font-family:${MONO};cursor:pointer;transition:transform .08s,background .15s,opacity .15s}
        .cc-btn:active{transform:translateY(1px)} .cc-btn:disabled{opacity:.35;cursor:not-allowed}
        .cc-btn:focus-visible{outline:2px solid ${C.ink};outline-offset:2px}`}</style>

      <div style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>coins =</label>
          <input value={coinsText} spellCheck={false} placeholder="[1,2,5]" onChange={(e) => changeCoins(e.target.value)} style={{ ...inputStyle, minWidth: 140, flex: 1 }} />
          <label style={{ fontFamily: MONO, fontSize: 13, fontWeight: 700 }}>amount =</label>
          <input value={amountText} spellCheck={false} onChange={(e) => changeAmount(e.target.value)} style={{ ...inputStyle, width: 56 }} />
        </div>
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>try:</span>
          {PRESETS.map((p) => {
            const active = coinsText.replace(/\s/g, '') === p.coins.replace(/\s/g, '') && amountText === p.amount
            return (
              <button key={p.name} className="cc-btn" onClick={() => applyPreset(p)} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, padding: '4px 9px', borderRadius: 4, border: `1.5px solid ${active ? C.signal : C.wire}`, background: active ? C.signal : C.paper, color: active ? C.paper : C.ink }}>
                {p.name}
              </button>
            )
          })}
        </div>
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          Fewest coins to make the amount. Build up dp[0..amount]; dp[a] uses dp[a−coin] + 1.
        </div>
      </div>

      {/* TOP: coins + dp */}
      <div style={{ border: `1.5px solid ${C.wire}`, background: '#FBF9F3', borderRadius: 8, padding: 16, marginBottom: 14, overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
          <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: C.slate }}>coins</span>
          {coins.map((c, idx) => (
            <span key={idx} style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, padding: '5px 11px', borderRadius: 20, border: `2px solid ${c === f.coin ? C.trace : C.wire}`, background: c === f.coin ? C.trace : C.paper, color: c === f.coin ? C.paper : C.ink }}>{c}</span>
          ))}
        </div>

        <div style={{ display: 'flex', gap: 6, marginBottom: 4 }}>
          {f.dp.map((_, idx) => (
            <div key={idx} style={{ width: 36, textAlign: 'center', fontFamily: MONO, fontSize: 10, color: C.slate }}>{idx}</div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {f.dp.map((v, idx) => {
            const cc = cellColors(idx)
            return (
              <div key={idx} style={{ width: 36, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: MONO, fontWeight: 700, fontSize: 15, borderRadius: 6, background: cc.bg, color: cc.fg, border: `2px solid ${cc.bd}` }}>{show(v)}</div>
            )
          })}
        </div>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 12 }}>
          <Swatch color={C.signal} label="dp[a] (solving)" />
          <Swatch color={C.trace} label="dp[a−coin] (source)" />
          <Swatch color={C.go} label="reachable" />
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
                  <span style={{ width: 26, textAlign: 'right', paddingRight: 8, color: C.codedim, fontFamily: MONO, fontSize: 10.5, userSelect: 'none', lineHeight: '1.7' }}>{row.ln}</span>
                  <pre style={{ margin: 0, fontFamily: MONO, fontSize: 9.5, lineHeight: '1.7', color: C.codeink, whiteSpace: 'pre' }}>{row.t || ' '}</pre>
                  {active && <span style={{ marginLeft: 'auto', paddingRight: 8, color: C.signal, fontFamily: MONO, fontSize: 10.5, lineHeight: '1.7' }}>◄</span>}
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
            <button className="cc-btn" onClick={prev} disabled={i === 0} style={btn(C.paper, C.ink, true)}>‹ back</button>
            <button className="cc-btn" onClick={next} disabled={atEnd} style={btn(atEnd ? C.go : C.ink, C.paper)}>{atEnd ? 'done' : 'next ›'}</button>
            <button className="cc-btn" onClick={() => setI(0)} style={btn(C.paper, C.ink, true)}>restart</button>
          </div>

          <div style={{ display: 'flex', gap: 3, marginTop: 12 }}>
            {frames.map((fr, idx) => (
              <button key={idx} className="cc-btn" onClick={() => setI(idx)} aria-label={`step ${idx}`} style={{ height: 6, flex: 1, border: 'none', borderRadius: 3, padding: 0, background: idx <= Math.min(i, frames.length - 1) ? kindColor(fr.kind) : C.wire }} />
            ))}
          </div>
          <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>step {Math.min(i, frames.length - 1)} / {frames.length - 1}</div>
        </div>

        <div>
          <div style={{ borderLeft: `3px solid ${kindColor(f.kind)}`, paddingLeft: 12, minHeight: 78 }}>
            <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate }}>line {f.line}</div>
            <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 16, margin: '3px 0 6px' }}>{f.title}</div>
            <div style={{ fontSize: 13.5, lineHeight: 1.6 }}>{f.note}</div>
            {atEnd && f.result != null && <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 15, color: f.result >= 0 ? C.go : C.signal, marginTop: 10 }}>return {f.result}</div>}
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
