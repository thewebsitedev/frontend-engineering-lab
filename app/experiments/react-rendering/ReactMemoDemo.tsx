'use client'

import React, { useState } from 'react'
import { CodeBlock, Callout, DemoCard, DemoButton, RenderBadge, Stat, H2, Prose, useRenderCount } from '../parts'

const CODE = `function Child() {
  return <div>Child Component</div>;
}

// React.memo skips the re-render when props are unchanged.
const MemoizedChild = React.memo(Child);

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Count: {count}</p>
      <MemoizedChild />
    </>
  );
}`

function ChildInner() {
  const renders = useRenderCount()
  return <RenderBadge label="Child" count={renders} />
}
const MemoizedChild = React.memo(ChildInner)

export default function ReactMemoDemo() {
  const appRenders = useRenderCount()
  const [count, setCount] = useState(0)

  return (
    <div style={{ marginBottom: 36 }}>
      <H2>2 · React.memo</H2>
      <Prose>
        Wrapping a component in <code>React.memo</code> tells React: “only re-render this if its
        props change.” This child takes no props, so after the first render it never needs to run
        again. Click increment — App climbs, Child stays put.
      </Prose>

      <DemoCard>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <RenderBadge label="App" count={appRenders} />
          <MemoizedChild />
          <div style={{ flex: 1 }} />
          <Stat label="count" value={count} />
        </div>
        <DemoButton onClick={() => setCount(count + 1)}>Increment</DemoButton>
      </DemoCard>

      <Callout tone="go">
        Child stays at 1 render no matter how many times you click. React.memo did a cheap props
        comparison, saw nothing changed, and reused the previous output.
      </Callout>

      <CodeBlock code={CODE} />
    </div>
  )
}
