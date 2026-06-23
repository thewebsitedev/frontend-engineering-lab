'use client'

import { memo, useCallback, useMemo, useState } from 'react'
import { CodeBlock, Callout, DemoCard, DemoButton, RenderBadge, Stat, H2, Prose, useRenderCount } from '../parts'

const CODE = `function Child({ onClick, config }) {
  return <p>Theme: {config.theme}</p>;
}

const MemoizedChild = memo(Child);

function App() {
  const [count, setCount] = useState(0);

  const handleClick = useCallback(() => setCount(c => c + 1), []);

  // Object literals are a new reference every render too — useMemo freezes it.
  const config = useMemo(() => ({ theme: "paper" }), []);

  return (
    <>
      <p>Count: {count}</p>
      <MemoizedChild onClick={handleClick} config={config} />
    </>
  );
}`

function ChildInner({ onClick, config }: { onClick: () => void; config: { theme: string } }) {
  const renders = useRenderCount()
  return (
    <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}>
      <RenderBadge label="Child" count={renders} />
      <span style={{ fontFamily: 'monospace', fontSize: 12.5 }} onClick={onClick}>
        theme: {config.theme}
      </span>
    </span>
  )
}
const MemoizedChild = memo(ChildInner)

export default function ReactUseCallbackUseMemoDemo() {
  const appRenders = useRenderCount()
  const [count, setCount] = useState(0)
  const handleClick = useCallback(() => setCount((c) => c + 1), [])
  const config = useMemo(() => ({ theme: 'paper' }), [])

  return (
    <div style={{ marginBottom: 12 }}>
      <H2>5 · useMemo stabilizes an object prop</H2>
      <Prose>
        The same trap applies to objects and arrays: an inline <code>{'{ theme: "paper" }'}</code> is
        a new reference every render. <code>useMemo</code> caches the object so its identity is
        stable, keeping the memoized child quiet even though we pass it both a function and an object.
      </Prose>

      <DemoCard>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <RenderBadge label="App" count={appRenders} />
          <MemoizedChild onClick={handleClick} config={config} />
          <div style={{ flex: 1 }} />
          <Stat label="count" value={count} />
        </div>
        <DemoButton onClick={() => setCount((c) => c + 1)}>Increment</DemoButton>
      </DemoCard>

      <Callout tone="go">
        Child stays at 1. Full recipe for a quiet memoized child: <strong>memo</strong> the child,{' '}
        <strong>useCallback</strong> its function props, and <strong>useMemo</strong> its object/array
        props — every reference it receives must be stable.
      </Callout>

      <CodeBlock code={CODE} />
    </div>
  )
}
