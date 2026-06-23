import Link from 'next/link'
import { C, MONO, SANS } from './algorithms/theme'

const experiments = [
  {
    title: 'Graph Visualizer',
    blurb: 'Interactive SVG graph — click a node to light up its neighbors.',
    href: '/experiments/graph-visualizer',
    tag: 'SVG · State',
  },
  {
    title: 'React Rendering',
    blurb: 'See exactly when React re-renders — memo, useMemo, useCallback.',
    href: '/experiments/react-rendering',
    tag: 'React internals',
  },
  {
    title: 'Tiny React',
    blurb: 'A miniature React-like renderer built from first principles.',
    href: '/experiments/tiny-react',
    tag: 'From scratch',
  },
]

// Small union-find motif echoing the algorithms section.
const NODES = [
  { id: 1, x: 40, y: 38 },
  { id: 2, x: 150, y: 38 },
  { id: 3, x: 40, y: 140 },
  { id: 4, x: 150, y: 140 },
]
const EDGES: [number, number, boolean][] = [
  [1, 2, false],
  [1, 3, false],
  [3, 4, false],
  [2, 4, true], // the redundant edge — drawn in signal
]

export default function Home() {
  return (
    <div
      style={{
        background: C.paper,
        color: C.ink,
        minHeight: '100vh',
        fontFamily: SANS,
      }}
    >
      <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Space+Mono:wght@400;700&display=swap');
        a{color:inherit;text-decoration:none}
        .card{transition:transform .14s ease, box-shadow .14s ease}
        .card:hover{transform:translate(-3px,-3px);box-shadow:6px 6px 0 ${C.ink}}
        .feature:hover{transform:translate(-4px,-4px);box-shadow:8px 8px 0 ${C.signal}}
        .feature .go{transition:gap .14s ease}
        .feature:hover .go{gap:14px}
        @media (prefers-reduced-motion: reduce){*{transition:none!important}}`}</style>

      {/* Top bar */}
      <div
        style={{
          maxWidth: 1040,
          margin: '0 auto',
          padding: '20px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}
      >
        <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 13, letterSpacing: 1 }}>
          LAB by Gautam Thapar
        </span>
        <nav style={{ display: 'flex', gap: 18, fontFamily: MONO, fontSize: 13 }}>
          <Link href="/algorithms" style={{ color: C.trace }}>
            algorithms
          </Link>
          <Link href="/experiments" style={{ color: C.trace }}>
            experiments
          </Link>
        </nav>
      </div>

      <div style={{ maxWidth: 1040, margin: '0 auto', padding: '0 16px 72px' }}>
        {/* Hero */}
        <section
          style={{
            borderTop: `2px solid ${C.ink}`,
            paddingTop: 40,
            display: 'grid',
            gridTemplateColumns: 'minmax(0,1.4fr) minmax(0,1fr)',
            gap: 32,
            alignItems: 'center',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: MONO,
                fontSize: 12,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: C.signal,
                marginBottom: 16,
              }}
            >
              Frontend Engineering Lab
            </div>
            <h1
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 'clamp(34px, 6vw, 60px)',
                lineHeight: 1.02,
                letterSpacing: -2,
                margin: 0,
              }}
            >
              Build it,
              <br />
              then watch
              <br />
              it run.
            </h1>
            <p
              style={{
                fontSize: 17,
                lineHeight: 1.6,
                maxWidth: 460,
                marginTop: 20,
                color: C.ink,
                opacity: 0.85,
              }}
            >
              A playground for the things that are easier to understand when you can step through
              them — algorithms, React internals, and interactive visualizations.
            </p>
            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <Link href="/algorithms" style={cta(C.ink, C.paper)}>
                Explore algorithms →
              </Link>
              <Link href="/experiments" style={cta(C.paper, C.ink)}>
                See experiments
              </Link>
            </div>
          </div>

          {/* Decorative union-find motif */}
          <div style={{ justifySelf: 'center' }}>
            <svg viewBox="0 0 190 180" width="100%" style={{ maxWidth: 240, display: 'block' }}>
              {EDGES.map(([a, b, red], idx) => {
                const na = NODES.find((n) => n.id === a)!
                const nb = NODES.find((n) => n.id === b)!
                return (
                  <line
                    key={idx}
                    x1={na.x}
                    y1={na.y}
                    x2={nb.x}
                    y2={nb.y}
                    stroke={red ? C.signal : C.ink}
                    strokeWidth={red ? 3 : 2}
                    strokeDasharray={red ? '6 5' : '2 0'}
                    strokeLinecap="round"
                  />
                )
              })}
              {NODES.map((n) => (
                <g key={n.id}>
                  <circle cx={n.x} cy={n.y} r={20} fill="#FBF9F3" stroke={C.ink} strokeWidth={2} />
                  <text
                    x={n.x}
                    y={n.y + 5}
                    textAnchor="middle"
                    fontFamily={MONO}
                    fontWeight="700"
                    fontSize="15"
                    fill={C.ink}
                  >
                    {n.id}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        </section>

        {/* Featured: Algorithms */}
        <SectionLabel>Featured</SectionLabel>
        <Link href="/algorithms">
          <div
            className="feature card"
            style={{
              border: `2px solid ${C.ink}`,
              borderRadius: 10,
              background: '#FBF9F3',
              padding: 28,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 20,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ maxWidth: 560 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontSize: 11,
                  letterSpacing: 1,
                  textTransform: 'uppercase',
                  color: C.signal,
                  marginBottom: 8,
                }}
              >
                4 problems · 5 languages
              </div>
              <div
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 26,
                  letterSpacing: -1,
                  marginBottom: 8,
                }}
              >
                Algorithms, traced step by step
              </div>
              <p style={{ fontSize: 15.5, lineHeight: 1.6, margin: 0, opacity: 0.85 }}>
                Worked intuition, a step-by-step walkthrough, and reference code in JavaScript,
                TypeScript, Python, Java, and C++ — with an interactive trace for Union–Find.
              </p>
            </div>
            <div
              className="go"
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 15,
                color: C.signal,
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              open →
            </div>
          </div>
        </Link>

        {/* Experiments grid */}
        <SectionLabel>Experiments</SectionLabel>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
            gap: 16,
          }}
        >
          {experiments.map((e) => (
            <Link key={e.href} href={e.href}>
              <div
                className="card"
                style={{
                  border: `1.5px solid ${C.ink}`,
                  borderRadius: 10,
                  background: '#FBF9F3',
                  padding: 22,
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    fontFamily: MONO,
                    fontSize: 11,
                    letterSpacing: 1,
                    textTransform: 'uppercase',
                    color: C.trace,
                  }}
                >
                  {e.tag}
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 19, letterSpacing: -0.5 }}>
                  {e.title}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.55, margin: 0, opacity: 0.8 }}>{e.blurb}</p>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: MONO, fontSize: 13, color: C.signal }}>open →</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Footer */}
        <footer
          style={{
            borderTop: `2px solid ${C.ink}`,
            marginTop: 56,
            paddingTop: 18,
            display: 'flex',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 8,
            fontFamily: MONO,
            fontSize: 12,
            color: C.slate,
          }}
        >
          <span>© 2026 Lab by Gautam Thapar</span>
          <span>built with Next.js · React</span>
        </footer>
      </div>
    </div>
  )
}

function SectionLabel({ children }: { children: string }) {
  return (
    <div
      style={{
        fontFamily: MONO,
        fontSize: 12,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: C.slate,
        margin: '52px 0 14px',
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

function cta(bg: string, fg: string): React.CSSProperties {
  return {
    fontFamily: MONO,
    fontWeight: 700,
    fontSize: 14,
    padding: '12px 20px',
    background: bg,
    color: fg,
    border: `1.5px solid ${C.ink}`,
    borderRadius: 6,
    display: 'inline-block',
  }
}
