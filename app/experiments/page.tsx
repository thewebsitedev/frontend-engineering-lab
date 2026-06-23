import Link from 'next/link'
import type { Metadata } from 'next'
import AlgoShell from '../algorithms/AlgoShell'
import { C, MONO } from '../algorithms/theme'

export const metadata: Metadata = {
  title: 'Experiments · Frontend Lab',
  description: 'Interactive frontend engineering experiments with full explanations and source.',
}

const EXPERIMENTS = [
  {
    title: 'React Rendering',
    href: '/experiments/react-rendering',
    tag: 'React internals',
    blurb: 'Watch exactly when React re-renders — and how React.memo, useCallback, and useMemo change the picture. Five live demos with on-screen render counters.',
  },
  {
    title: 'Graph Visualizer',
    href: '/experiments/graph-visualizer',
    tag: 'SVG · State',
    blurb: 'A clickable SVG graph: select a node and its neighbours light up. A tour of adjacency lists, derived state, and rendering with SVG.',
  },
  {
    title: 'Tiny React',
    href: '/experiments/tiny-react',
    tag: 'From scratch',
    blurb: 'Build a miniature React from first principles — createElement, a virtual DOM, and a render function that mounts it to the real DOM.',
  },
]

export default function ExperimentsLanding() {
  return (
    <AlgoShell crumbs={[{ label: 'lab', href: '/' }, { label: 'experiments' }]} kicker="learn by building" title="Experiments">
      <p style={{ fontSize: 16, lineHeight: 1.6, maxWidth: 640, marginBottom: 28 }}>
        Hands-on frontend deep-dives. Each one pairs a live, interactive demo with a full written
        explanation and the actual source code, so you can read the idea, watch it run, and copy the
        code.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
        {EXPERIMENTS.map((e) => (
          <Link key={e.href} href={e.href}>
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
              <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.signal }}>{e.tag}</div>
              <div style={{ fontFamily: MONO, fontWeight: 700, fontSize: 20, letterSpacing: -0.5 }}>{e.title}</div>
              <p style={{ fontSize: 14, lineHeight: 1.5, color: C.ink, opacity: 0.8, margin: 0 }}>{e.blurb}</p>
              <div style={{ flex: 1 }} />
              <div style={{ fontFamily: MONO, fontSize: 13, color: C.trace }}>open →</div>
            </div>
          </Link>
        ))}
      </div>
    </AlgoShell>
  )
}
