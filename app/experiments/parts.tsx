'use client'

import { useRef, useState, type ReactNode } from 'react'
import { C, MONO, SANS } from '../algorithms/theme'

/* ─────────────────────────  Code viewer  ───────────────────────── */

function isComment(line: string): boolean {
  const t = line.trim()
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
}

export function CodeBlock({ code, label = 'TSX' }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const source = code.replace(/^\n+/, '').replace(/\n+$/, '')
  const lines = source.split('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      /* clipboard may be unavailable */
    }
  }

  return (
    <div style={{ borderRadius: 6, overflow: 'hidden', border: `1.5px solid ${C.ink}` }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: C.codehl, padding: '6px 10px' }}>
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 12, letterSpacing: 1, color: C.codeink, textTransform: 'uppercase' }}>{label}</span>
        <div style={{ flex: 1 }} />
        <button
          onClick={copy}
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 12,
            padding: '5px 11px',
            borderRadius: 4,
            border: `1px solid ${C.codedim}`,
            cursor: 'pointer',
            background: 'transparent',
            color: copied ? C.go : C.codeink,
          }}
        >
          {copied ? 'copied ✓' : 'copy'}
        </button>
      </div>
      <div style={{ background: C.codebg, overflowX: 'auto', padding: '14px 0' }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex' }}>
            <span
              style={{
                width: 40,
                flex: 'none',
                textAlign: 'right',
                paddingRight: 14,
                color: C.codedim,
                fontFamily: MONO,
                fontSize: 12.5,
                lineHeight: '1.8',
                userSelect: 'none',
              }}
            >
              {idx + 1}
            </span>
            <pre
              style={{
                margin: 0,
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: '1.8',
                color: isComment(line) ? C.codedim : C.codeink,
                whiteSpace: 'pre',
                paddingRight: 16,
              }}
            >
              {line || ' '}
            </pre>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────  Prose helpers  ───────────────────────── */

export function Prose({ children }: { children: ReactNode }) {
  return <p style={{ fontSize: 15.5, lineHeight: 1.65, color: C.ink, opacity: 0.9, margin: '0 0 14px', maxWidth: 680 }}>{children}</p>
}

export function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: MONO, fontWeight: 700, fontSize: 22, letterSpacing: -0.5, margin: '0 0 12px' }}>{children}</h2>
}

export function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: C.slate,
        margin: '8px 0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}
    >
      {children}
      <span style={{ flex: 1, height: 1, background: C.wire }} />
    </div>
  )
}

const TONES: Record<string, string> = { note: C.trace, warn: C.signal, go: C.go }

export function Callout({ tone = 'note', children }: { tone?: 'note' | 'warn' | 'go'; children: ReactNode }) {
  const color = TONES[tone]
  return (
    <div style={{ borderLeft: `3px solid ${color}`, background: '#FBF9F3', padding: '12px 14px', borderRadius: '0 6px 6px 0', margin: '0 0 14px' }}>
      <div style={{ fontSize: 13.5, lineHeight: 1.6, color: C.ink }}>{children}</div>
    </div>
  )
}

/* ─────────────────────────  Demo chrome  ───────────────────────── */

export function DemoCard({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        border: `1.5px solid ${C.wire}`,
        background: '#FBF9F3',
        borderRadius: 8,
        padding: 18,
        marginBottom: 14,
        fontFamily: SANS,
      }}
    >
      {children}
    </div>
  )
}

export function DemoButton({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 14,
        padding: '10px 18px',
        background: C.ink,
        color: C.paper,
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
      }}
    >
      {children}
    </button>
  )
}

// Counts how many times the calling component has rendered. We deliberately bump a
// ref during render: it adds no extra renders, and the badge only re-renders when its
// parent does — which is exactly the thing these demos are measuring.
export function useRenderCount(): number {
  const n = useRef(0)
  // eslint-disable-next-line react-hooks/refs -- intentional render counter for the demo
  n.current += 1
  // eslint-disable-next-line react-hooks/refs -- read the live count for display
  return n.current
}

// A badge that shows a component's render count; flashes when it changes.
export function RenderBadge({ label, count, hot }: { label: string; count: number; hot?: boolean }) {
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        fontFamily: MONO,
        fontSize: 12.5,
        fontWeight: 700,
        padding: '5px 10px',
        borderRadius: 6,
        border: `1.5px solid ${hot ? C.signal : C.wire}`,
        background: hot ? C.signal : C.paper,
        color: hot ? C.paper : C.ink,
      }}
    >
      {label}
      <span style={{ opacity: 0.85 }}>·</span>
      <span>{count} render{count === 1 ? '' : 's'}</span>
    </span>
  )
}

export function Stat({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', gap: 2 }}>
      <span style={{ fontFamily: MONO, fontSize: 11, color: C.slate, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</span>
      <span style={{ fontFamily: MONO, fontSize: 18, fontWeight: 700 }}>{value}</span>
    </div>
  )
}
