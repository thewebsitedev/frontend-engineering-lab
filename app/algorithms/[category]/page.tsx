import Link from 'next/link'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import AlgoShell from '../AlgoShell'
import { CATEGORIES, getAlgorithmsByCategory, getCategory } from '../registry'
import { C, DIFFICULTY_COLOR, MONO } from '../theme'

type Params = { category: string }

export function generateStaticParams(): Params[] {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>
}): Promise<Metadata> {
  const { category } = await params
  const cat = getCategory(category)
  return { title: cat ? `${cat.name} · Algorithms` : 'Algorithms' }
}

export default async function CategoryPage({ params }: { params: Promise<Params> }) {
  const { category } = await params
  const cat = getCategory(category)
  if (!cat) notFound()

  const algos = getAlgorithmsByCategory(category)

  return (
    <AlgoShell
      crumbs={[
        { label: 'lab', href: '/' },
        { label: 'algorithms', href: '/algorithms' },
        { label: cat.name },
      ]}
      kicker="category"
      title={cat.name}
    >
      <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 620, marginBottom: 28 }}>{cat.blurb}</p>

      {algos.length === 0 ? (
        <p style={{ fontFamily: MONO, color: C.slate }}>No problems here yet — check back soon.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {algos.map((algo) => (
            <Link key={algo.slug} href={`/algorithms/${category}/${algo.slug}`}>
              <div
                style={{
                  border: `1.5px solid ${C.ink}`,
                  borderRadius: 8,
                  padding: '16px 18px',
                  background: '#FBF9F3',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                    <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 17 }}>
                      {algo.title}
                    </span>
                    {algo.Visualizer && (
                      <span
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          letterSpacing: 1,
                          textTransform: 'uppercase',
                          color: C.paper,
                          background: C.trace,
                          padding: '2px 7px',
                          borderRadius: 3,
                        }}
                      >
                        interactive
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: 14, lineHeight: 1.5, opacity: 0.8, margin: '6px 0 0' }}>
                    {algo.blurb}
                  </p>
                </div>
                <span
                  style={{
                    fontFamily: MONO,
                    fontWeight: 700,
                    fontSize: 12,
                    color: DIFFICULTY_COLOR[algo.difficulty],
                    border: `1.5px solid ${DIFFICULTY_COLOR[algo.difficulty]}`,
                    borderRadius: 4,
                    padding: '4px 9px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {algo.difficulty}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </AlgoShell>
  )
}
