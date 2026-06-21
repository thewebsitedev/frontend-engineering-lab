import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AlgoShell from '../../AlgoShell'
import CodeTabs from '../../CodeTabs'
import { ALGORITHMS, getAlgorithm, getCategory } from '../../registry'
import { C, DIFFICULTY_COLOR, MONO } from '../../theme'

type Params = { category: string; algo: string }

export function generateStaticParams(): Params[] {
  return ALGORITHMS.map((a) => ({ category: a.category, algo: a.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { category, algo } = await params
  const found = getAlgorithm(category, algo)
  return { title: found ? `${found.title} · Algorithms` : 'Algorithms' }
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2
      style={{
        fontFamily: MONO,
        fontWeight: 700,
        fontSize: 13,
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        color: C.slate,
        margin: '36px 0 12px',
      }}
    >
      {children}
    </h2>
  )
}

export default async function AlgorithmPage({ params }: { params: Promise<Params> }) {
  const { category, algo } = await params
  const cat = getCategory(category)
  const found = getAlgorithm(category, algo)
  if (!cat || !found) notFound()

  const { Visualizer } = found

  return (
    <AlgoShell
      crumbs={[
        { label: 'lab', href: '/' },
        { label: 'algorithms', href: '/algorithms' },
        { label: cat.name, href: `/algorithms/${category}` },
        { label: found.title },
      ]}
      kicker={found.tags?.join(' · ')}
      title={found.title}
    >
      {/* Meta row */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', marginBottom: 24 }}>
        <span
          style={{
            fontFamily: MONO,
            fontWeight: 700,
            fontSize: 12,
            color: DIFFICULTY_COLOR[found.difficulty],
            border: `1.5px solid ${DIFFICULTY_COLOR[found.difficulty]}`,
            borderRadius: 4,
            padding: '4px 9px',
          }}
        >
          {found.difficulty}
        </span>
        <span style={{ fontFamily: MONO, fontSize: 13, color: C.slate }}>{found.blurb}</span>
      </div>

      {/* Problem statement */}
      <div
        style={{
          borderLeft: `3px solid ${C.ink}`,
          paddingLeft: 16,
          fontSize: 16,
          lineHeight: 1.6,
        }}
      >
        {found.statement}
      </div>

      {/* Interactive walkthrough */}
      {Visualizer && (
        <>
          <SectionHeading>Walkthrough</SectionHeading>
          <Visualizer />
        </>
      )}

      {/* Intuition */}
      <SectionHeading>Intuition</SectionHeading>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {found.intuition.map((p, idx) => (
          <p key={idx} style={{ fontSize: 15.5, lineHeight: 1.65, margin: 0 }}>
            {p}
          </p>
        ))}
      </div>

      {/* Steps */}
      <SectionHeading>The algorithm</SectionHeading>
      <ol style={{ margin: 0, paddingLeft: 0, listStyle: 'none', counterReset: 'step' }}>
        {found.steps.map((s, idx) => (
          <li
            key={idx}
            style={{
              display: 'flex',
              gap: 12,
              alignItems: 'baseline',
              marginBottom: 10,
              fontSize: 15.5,
              lineHeight: 1.6,
            }}
          >
            <span
              style={{
                fontFamily: MONO,
                fontWeight: 700,
                fontSize: 13,
                color: C.signal,
                flex: 'none',
                width: 24,
              }}
            >
              {String(idx + 1).padStart(2, '0')}
            </span>
            <span>{s}</span>
          </li>
        ))}
      </ol>

      {/* Code */}
      {found.solutions && found.solutions.length > 0 ? (
        <>
          <SectionHeading>Reference implementations</SectionHeading>
          {found.solutions.map((sol, idx) => (
            <div key={idx} style={{ marginBottom: 22 }}>
              <div
                style={{
                  fontFamily: MONO,
                  fontWeight: 700,
                  fontSize: 15,
                  marginBottom: sol.blurb ? 4 : 10,
                }}
              >
                {sol.name}
              </div>
              {sol.blurb && (
                <p style={{ fontSize: 14, lineHeight: 1.55, opacity: 0.8, margin: '0 0 10px' }}>
                  {sol.blurb}
                </p>
              )}
              <CodeTabs code={sol.code} />
            </div>
          ))}
        </>
      ) : (
        <>
          <SectionHeading>Reference implementation</SectionHeading>
          <CodeTabs code={found.code} />
        </>
      )}

      {/* Complexity */}
      <SectionHeading>Complexity</SectionHeading>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
        {(
          [
            ['Time', found.complexity.time],
            ['Space', found.complexity.space],
          ] as const
        ).map(([label, value]) => (
          <div
            key={label}
            style={{
              border: `1.5px solid ${C.wire}`,
              borderRadius: 6,
              padding: 16,
              background: '#FBF9F3',
            }}
          >
            <div
              style={{
                fontFamily: MONO,
                fontSize: 11,
                letterSpacing: 1,
                textTransform: 'uppercase',
                color: C.slate,
                marginBottom: 6,
              }}
            >
              {label}
            </div>
            <div style={{ fontSize: 14.5, lineHeight: 1.5 }}>{value}</div>
          </div>
        ))}
      </div>
    </AlgoShell>
  )
}
