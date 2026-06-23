'use client'

import { useEffect, useRef } from 'react'
import { C, MONO } from '../../algorithms/theme'

type TinyNode = TinyElement | TinyTextElement
type TinyElement = { type: string; props: { children: TinyNode[]; attrs: Record<string, string> } }
type TinyTextElement = { type: 'TEXT_ELEMENT'; props: { nodeValue: string; children: [] } }

function createTextElement(text: string): TinyTextElement {
  return { type: 'TEXT_ELEMENT', props: { nodeValue: text, children: [] } }
}

function createElement(type: string, props: Record<string, string> | null, ...children: (TinyNode | string)[]): TinyElement {
  return {
    type,
    props: {
      attrs: props ?? {},
      children: children.map((c) => (typeof c === 'string' ? createTextElement(c) : c)),
    },
  }
}

function render(element: TinyNode, container: Node): void {
  let dom: Node
  if (element.type === 'TEXT_ELEMENT') {
    dom = document.createTextNode((element as TinyTextElement).props.nodeValue)
  } else {
    const el = element as TinyElement
    const node = document.createElement(el.type)
    Object.entries(el.props.attrs).forEach(([name, value]) => node.setAttribute(name, value))
    el.props.children.forEach((child) => render(child, node))
    dom = node
  }
  container.appendChild(dom)
}

// The tree we build and mount.
const tree = createElement(
  'div',
  { id: 'tiny-root' },
  createElement('h1', null, 'Hello Tiny React'),
  createElement('p', null, 'Rendered by a 20-line renderer'),
)

// A readable view of the virtual DOM object.
const VDOM = JSON.stringify(tree, null, 2)

export default function TinyReactDemo() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    container.innerHTML = '' // guard against double-mount in dev
    render(tree, container)
  }, [])

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 16, alignItems: 'start' }}>
      <div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>
          1 · virtual DOM (plain objects)
        </div>
        <pre
          style={{
            margin: 0,
            background: C.codebg,
            color: C.codeink,
            fontFamily: MONO,
            fontSize: 12,
            lineHeight: 1.6,
            padding: 14,
            borderRadius: 6,
            overflowX: 'auto',
            border: `1.5px solid ${C.ink}`,
          }}
        >
          {VDOM}
        </pre>
      </div>

      <div>
        <div style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: C.slate, marginBottom: 6 }}>
          2 · mounted to the real DOM
        </div>
        <div
          ref={containerRef}
          style={{
            border: `1.5px solid ${C.wire}`,
            background: '#FBF9F3',
            borderRadius: 6,
            padding: '4px 18px',
            minHeight: 120,
            color: C.ink,
          }}
        />
        <div style={{ fontFamily: MONO, fontSize: 11, color: C.slate, marginTop: 8 }}>
          ↑ real <code>&lt;div&gt;</code>, <code>&lt;h1&gt;</code> and <code>&lt;p&gt;</code> nodes, created by our renderer.
        </div>
      </div>
    </div>
  )
}
