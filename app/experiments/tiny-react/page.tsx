import type { Metadata } from 'next'
import AlgoShell from '../../algorithms/AlgoShell'
import { CodeBlock, Callout, DemoCard, SectionLabel, H2, Prose } from '../parts'
import TinyReactDemo from './TinyReactDemo'

export const metadata: Metadata = {
  title: 'Tiny React · Experiments',
  description: 'Build a miniature React from scratch: createElement, a virtual DOM, and a render function that mounts it to the real DOM.',
}

const CREATE_CODE = `// A text node is just an object with a special type.
function createTextElement(text) {
  return { type: "TEXT_ELEMENT", props: { nodeValue: text, children: [] } };
}

// createElement returns a plain object — the "virtual DOM" node.
// This is what JSX compiles down to: <h1>hi</h1> → createElement("h1", null, "hi")
function createElement(type, props, ...children) {
  return {
    type,
    props: {
      attrs: props ?? {},
      children: children.map(child =>
        typeof child === "string" ? createTextElement(child) : child
      ),
    },
  };
}`

const RENDER_CODE = `// render walks the virtual tree and builds real DOM nodes.
function render(element, container) {
  let dom;

  if (element.type === "TEXT_ELEMENT") {
    dom = document.createTextNode(element.props.nodeValue);
  } else {
    dom = document.createElement(element.type);
    // copy attributes onto the real node
    Object.entries(element.props.attrs).forEach(([name, value]) =>
      dom.setAttribute(name, value)
    );
    // recurse into children
    element.props.children.forEach(child => render(child, dom));
  }

  container.appendChild(dom);
}

// Build a tree and mount it:
const tree = createElement(
  "div", { id: "tiny-root" },
  createElement("h1", null, "Hello Tiny React"),
  createElement("p", null, "Rendered by a 20-line renderer")
);
render(tree, document.getElementById("app"));`

export default function Page() {
  return (
    <AlgoShell
      crumbs={[{ label: 'lab', href: '/' }, { label: 'experiments', href: '/experiments' }, { label: 'tiny react' }]}
      kicker="from scratch"
      title="Tiny React"
    >
      <p style={{ fontSize: 16, lineHeight: 1.65, maxWidth: 680, marginBottom: 18 }}>
        React’s core idea is smaller than it looks: describe your UI as plain JavaScript objects (a{' '}
        <strong>virtual DOM</strong>), then have a <strong>render</strong> function translate those
        objects into real DOM nodes. Here we build both — in about 20 lines — and watch a tree of
        objects become actual elements on the page.
      </p>

      <SectionLabel>Live demo</SectionLabel>
      <DemoCard>
        <TinyReactDemo />
      </DemoCard>
      <Callout tone="note">
        Left: the virtual DOM — just nested objects with a <code>type</code> and{' '}
        <code>props</code>. Right: the real DOM our <code>render</code> function produced from it.
      </Callout>

      <SectionLabel>How it works</SectionLabel>

      <H2>Step 1 — describe the UI as objects</H2>
      <Prose>
        <code>createElement</code> doesn’t touch the DOM at all. It just returns a plain object
        describing what you want: a <code>type</code> (<code>&quot;div&quot;</code>,{' '}
        <code>&quot;h1&quot;</code>, …), its attributes, and its children. Strings become special
        text nodes. This is exactly what JSX compiles into — <code>&lt;h1&gt;hi&lt;/h1&gt;</code>{' '}
        becomes <code>createElement(&quot;h1&quot;, null, &quot;hi&quot;)</code>.
      </Prose>
      <CodeBlock code={CREATE_CODE} />

      <div style={{ height: 18 }} />

      <H2>Step 2 — render the objects to the real DOM</H2>
      <Prose>
        <code>render</code> walks that object tree recursively. For a text node it creates a real
        text node; for an element it creates the tag, copies attributes across, and recurses into the
        children — appending each result to its parent. One depth-first pass turns the whole virtual
        tree into live DOM.
      </Prose>
      <CodeBlock code={RENDER_CODE} />

      <SectionLabel>What’s missing (and why React is more)</SectionLabel>
      <Callout tone="go">
        This renderer only <em>mounts</em> — it builds the DOM once. Real React adds{' '}
        <strong>reconciliation</strong> (diffing a new virtual tree against the old one and updating
        only what changed), <strong>components &amp; hooks</strong> (state, effects), and{' '}
        <strong>event handling</strong>. But the foundation is exactly this: UI as data, plus a
        function that projects that data onto the screen.
      </Callout>
    </AlgoShell>
  )
}
