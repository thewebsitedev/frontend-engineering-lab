import type { Metadata } from 'next'
import AlgoShell from '../../algorithms/AlgoShell'
import { CodeBlock, Callout, DemoCard, SectionLabel, H2, Prose } from '../parts'
import GraphVisualizer from './GraphVisualizer'

export const metadata: Metadata = {
  title: 'Graph Visualizer · Experiments',
  description: 'An interactive SVG graph: click a node to highlight its neighbours. Adjacency lists, derived state, and SVG rendering.',
}

const CODE = `const graph = {            // adjacency list: node -> neighbours
  1: [2, 4], 2: [1, 3],
  3: [2, 4], 4: [1, 3],
};

const positions = {        // where to draw each node
  1: { x: 90,  y: 80  }, 2: { x: 290, y: 80  },
  3: { x: 290, y: 240 }, 4: { x: 90,  y: 240 },
};

function GraphVisualizer() {
  const [selected, setSelected] = useState(null);
  const neighbors = selected != null ? graph[selected] : [];

  return (
    <svg viewBox="0 0 380 320">
      {/* edges */}
      {Object.entries(graph).map(([node, nbrs]) =>
        nbrs.map((nbr) => Number(node) < nbr && (
          <line key={node + '-' + nbr}
                x1={positions[node].x} y1={positions[node].y}
                x2={positions[nbr].x}  y2={positions[nbr].y} />
        ))
      )}
      {/* nodes — fill depends on selection (derived, not stored) */}
      {Object.keys(graph).map((node) => {
        const id = Number(node);
        const fill = selected === id ? 'signal'
                   : neighbors.includes(id) ? 'trace'
                   : 'paper';
        return (
          <circle key={id} cx={positions[id].x} cy={positions[id].y} r={26}
                  fill={fill} onClick={() => setSelected(id)} />
        );
      })}
    </svg>
  );
}`

export default function Page() {
  return (
    <AlgoShell
      crumbs={[{ label: 'lab', href: '/' }, { label: 'experiments', href: '/experiments' }, { label: 'graph visualizer' }]}
      kicker="svg · state"
      title="Graph Visualizer"
    >
      <p style={{ fontSize: 16, lineHeight: 1.65, maxWidth: 680, marginBottom: 18 }}>
        A tiny but complete example of rendering data structures interactively. A graph is stored as
        an <strong>adjacency list</strong> (each node maps to its neighbours), drawn with SVG, and
        made interactive with a single piece of state: which node is selected. Click a node below to
        light up its neighbours.
      </p>

      <SectionLabel>Live demo</SectionLabel>
      <DemoCard>
        <GraphVisualizer />
      </DemoCard>
      <Callout tone="note">Click any circle to select it; its direct neighbours turn blue and the connecting edges highlight. Click reset to clear.</Callout>

      <SectionLabel>How it works</SectionLabel>
      <H2>Adjacency list</H2>
      <Prose>
        The whole graph is just an object mapping each node id to an array of the nodes it connects
        to. Looking up a node’s neighbours is an O(1) object access — no scanning required. A separate{' '}
        <code>positions</code> map says where to draw each node, keeping <em>structure</em> separate
        from <em>layout</em>.
      </Prose>

      <H2>Derived state, not stored state</H2>
      <Prose>
        We store only one thing: <code>selected</code>. The set of highlighted neighbours and every
        node’s colour are <em>derived</em> from it during render. There is no second “highlighted”
        array to keep in sync — a key habit for bug-free UI: store the minimum, compute the rest.
      </Prose>

      <H2>Rendering with SVG</H2>
      <Prose>
        Edges are <code>&lt;line&gt;</code> elements and nodes are <code>&lt;circle&gt;</code>{' '}
        elements, mapped straight from the data. Each undirected edge is drawn once (by only drawing
        when <code>a &lt; b</code>), and an <code>onClick</code> on each circle updates the selection,
        which re-renders the colours.
      </Prose>

      <CodeBlock code={CODE} />
    </AlgoShell>
  )
}
