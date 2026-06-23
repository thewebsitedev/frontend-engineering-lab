'use client'

import { memo, useCallback, useState } from 'react'
import { CodeBlock, Callout, DemoCard, DemoButton, RenderBadge, Stat, H2, Prose, useRenderCount } from '../parts'

const CODE = `function Child({ onClick }) {
  return <button onClick={onClick}>Child button</button>;
}

const MemoizedChild = memo(Child);

function App() {
  const [count, setCount] = useState(0);

  // Without useCallback, this function is a NEW value every render,
  // so memo sees a "changed" prop and re-renders the child.
  const handleClick = useCallback(() => {
    setCount(c => c + 1);
  }, []); // stable identity across renders

  return (
    <>
      <p>Count: {count}</p>
      <MemoizedChild onClick={handleClick} />
    </>
  );
}`

function ChildInner({ onClick }: { onClick: () => void }) {
  const renders = useRenderCount()
  return (
    <button
      onClick={onClick}
      style={{ fontFamily: 'inherit', cursor: 'pointer', border: 'none', background: 'transparent', padding: 0 }}
      title="Child button — also increments"
    >
      <RenderBadge label="Child" count={renders} />
    </button>
  )
}
const MemoizedChild = memo(ChildInner)

export default function ReactUseCallbackDemo() {
  const appRenders = useRenderCount()
  const [count, setCount] = useState(0)
  const handleClick = useCallback(() => setCount((c) => c + 1), [])

  return (
    <div style={{ marginBottom: 36 }}>
      <H2>4 · useCallback stabilizes a function prop</H2>
      <Prose>
        Functions are recreated on every render, so passing one as a prop normally defeats{' '}
        <code>memo</code> (a brand-new function looks like a changed prop).{' '}
        <code>useCallback</code> memoizes the function so its identity is stable, and the memoized
        child stops re-rendering. The Child badge itself is the button — clicking it also increments.
      </Prose>

      <DemoCard>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <RenderBadge label="App" count={appRenders} />
          <MemoizedChild onClick={handleClick} />
          <div style={{ flex: 1 }} />
          <Stat label="count" value={count} />
        </div>
        <DemoButton onClick={() => setCount((c) => c + 1)}>Increment</DemoButton>
      </DemoCard>

      <Callout tone="go">
        Child holds at 1 render. The combo is the rule of thumb: <strong>memo on the child</strong> +{' '}
        <strong>useCallback on every function prop</strong> you hand it.
      </Callout>

      <CodeBlock code={CODE} />
    </div>
  )
}
