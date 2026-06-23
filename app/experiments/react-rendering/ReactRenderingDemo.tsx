'use client'

import { useState } from 'react'
import { CodeBlock, Callout, DemoCard, DemoButton, RenderBadge, Stat, H2, Prose, useRenderCount } from '../parts'

const CODE = `function Child() {
  // re-runs every time the parent renders
  return <div>Child Component</div>;
}

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Count: {count}</p>
      <Child />
    </>
  );
}`

function Child() {
  const renders = useRenderCount()
  return <RenderBadge label="Child" count={renders} />
}

export default function ReactRenderingDemo() {
  const appRenders = useRenderCount()
  const [count, setCount] = useState(0)

  return (
    <div style={{ marginBottom: 36 }}>
      <H2>1 · The base case</H2>
      <Prose>
        When a component’s state changes, React re-renders that component <em>and every child it
        returns</em> — by default, regardless of whether the child actually depends on what changed.
        Click increment and watch both counters climb together.
      </Prose>

      <DemoCard>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <RenderBadge label="App" count={appRenders} />
          <Child />
          <div style={{ flex: 1 }} />
          <Stat label="count" value={count} />
        </div>
        <DemoButton onClick={() => setCount(count + 1)}>Increment</DemoButton>
      </DemoCard>

      <Callout tone="warn">
        Child re-renders on every click even though it takes no props and shows nothing dynamic. Its
        render count rises in lock-step with App — wasted work React did not need to do.
      </Callout>

      <CodeBlock code={CODE} />
    </div>
  )
}
