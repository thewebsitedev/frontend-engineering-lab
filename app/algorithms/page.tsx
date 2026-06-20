import Link from 'next/link'
import type { Metadata } from 'next'
import AlgoShell from './AlgoShell'
import { CATEGORIES, getAlgorithmsByCategory } from './registry'
import { C, MONO } from './theme'

export const metadata: Metadata = {
  title: 'Algorithms · Frontend Lab',
  description: 'Interactive, traced explanations of classic algorithms.',
}

export default function AlgorithmsLanding() {
  return (
    <AlgoShell
      crumbs={[{ label: 'lab', href: '/' }, { label: 'algorithms' }]}
      kicker="learn by tracing"
      title="Algorithms"
    >
      <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 620, marginBottom: 28 }}>
        Pick a category to browse problems. Each problem comes with a worked intuition, a
        step-by-step walkthrough, and reference code in JavaScript, TypeScript, Python, Java, and
        C++.
      </p>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gap: 16,
        }}
      >
        {CATEGORIES.map((cat) => {
          const count = getAlgorithmsByCategory(cat.slug).length
          return (
            <Link key={cat.slug} href={`/algorithms/${cat.slug}`}>
              <div
                style={{
                  border: `1.5px solid ${C.ink}`,
                  borderRadius: 8,
                  padding: 20,
                  background: '#FBF9F3',
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
                    color: C.signal,
                  }}
                >
                  {count} {count === 1 ? 'problem' : 'problems'}
                </div>
                <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>
                  {cat.name}
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: C.ink, opacity: 0.8, margin: 0 }}>
                  {cat.blurb}
                </p>
                <div style={{ flex: 1 }} />
                <div style={{ fontFamily: MONO, fontSize: 13, color: C.trace }}>browse →</div>
              </div>
            </Link>
          )
        })}
      </div>
    </AlgoShell>
  )
}
