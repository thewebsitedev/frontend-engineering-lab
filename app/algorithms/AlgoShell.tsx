import Link from 'next/link'
import type { ReactNode } from 'react'
import { C, MONO, SANS } from './theme'

export type Crumb = { label: string; href?: string }

type AlgoShellProps = {
  crumbs: Crumb[]
  kicker?: string
  title: string
  titleAside?: ReactNode
  children: ReactNode
}

// Shared chrome for every page in the Algorithms section. Server component:
// no interactivity here, just layout + fonts + breadcrumb.
export default function AlgoShell({ crumbs, kicker, title, titleAside, children }: AlgoShellProps) {
  return (
    <div
      style={{
        background: C.paper,
        color: C.ink,
        minHeight: '100vh',
        fontFamily: SANS,
        padding: '24px 16px 64px',
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
        a{color:inherit;text-decoration:none}
        @media (prefers-reduced-motion: reduce){*{transition:none!important}}`}</style>

      <div style={{ maxWidth: 1040, margin: '0 auto' }}>
        <header style={{ borderBottom: `2px solid ${C.ink}`, paddingBottom: 12, marginBottom: 24 }}>
          <nav
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: 1,
              color: C.slate,
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            {crumbs.map((c, idx) => (
              <span key={idx} style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
                {idx > 0 && <span style={{ color: C.wire }}>/</span>}
                {c.href ? (
                  <Link href={c.href} style={{ color: C.trace }}>
                    {c.label}
                  </Link>
                ) : (
                  <span>{c.label}</span>
                )}
              </span>
            ))}
          </nav>

          {kicker && (
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 2,
                color: C.signal,
                textTransform: 'uppercase',
                marginTop: 14,
              }}
            >
              {kicker}
            </div>
          )}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              gap: 16,
              flexWrap: 'wrap',
              margin: kicker ? '4px 0 0' : '14px 0 0',
            }}
          >
            <h1
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 30,
                margin: 0,
                letterSpacing: -1,
              }}
            >
              {title}
            </h1>
            {titleAside}
          </div>
        </header>

        {children}
      </div>
    </div>
  )
}
