'use client'

import { useState } from 'react'
import { C, MONO } from './theme'
import { LANGS, type Lang } from './types'

type CodeTabs = {
  code: Record<Lang, string>
}

// Tabbed multi-language source viewer (JS / TS / Python / Java / C++).
// Styled like the inline code panel: dark background, mono font, line numbers.
export default function CodeTabs({ code }: CodeTabs) {
  const [lang, setLang] = useState<Lang>('py')
  const [copied, setCopied] = useState(false)

  const source = code[lang] ?? ''
  const lines = source.replace(/\n$/, '').split('\n')

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source)
      setCopied(true)
      setTimeout(() => setCopied(false), 1200)
    } catch {
      // clipboard may be unavailable; ignore
    }
  }

  return (
    <div style={{ borderRadius: 6, overflow: 'hidden', border: `1.5px solid ${C.ink}` }}>
      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          background: C.codehl,
          padding: '6px 8px',
          flexWrap: 'wrap',
        }}
      >
        {LANGS.map(({ id, label }) => {
          const active = id === lang
          return (
            <button
              key={id}
              onClick={() => setLang(id)}
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 12.5,
                padding: '6px 11px',
                borderRadius: 4,
                border: 'none',
                cursor: 'pointer',
                background: active ? C.signal : 'transparent',
                color: active ? C.paper : C.codedim,
                transition: 'background .15s, color .15s',
              }}
            >
              {label}
            </button>
          )
        })}
        <div style={{ flex: 1 }} />
        <button
          onClick={copy}
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 12,
            padding: '6px 11px',
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

      {/* Source */}
      <div style={{ background: C.codebg, overflowX: 'auto', padding: '14px 0' }}>
        {lines.map((line, idx) => (
          <div key={idx} style={{ display: 'flex' }}>
            <span
              style={{
                width: 42,
                flex: 'none',
                textAlign: 'right',
                paddingRight: 14,
                color: C.codedim,
                fontFamily: MONO,
                fontSize: 13,
                lineHeight: '1.85',
                userSelect: 'none',
              }}
            >
              {idx + 1}
            </span>
            <pre
              style={{
                margin: 0,
                fontFamily: MONO,
                fontSize: 13.5,
                lineHeight: '1.85',
                color: isComment(line, lang) ? C.codedim : C.codeink,
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

function isComment(line: string, lang: Lang): boolean {
  const t = line.trim()
  if (!t) return false
  if (lang === 'py') return t.startsWith('#')
  return t.startsWith('//') || t.startsWith('*') || t.startsWith('/*')
}
