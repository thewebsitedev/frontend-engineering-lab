'use client'

import React, { useState } from 'react'
import { CodeBlock, Callout, DemoCard, DemoButton, RenderBadge, Stat, H2, Prose, useRenderCount } from '../parts'

const CODE = `function Child({ value }) {
  return <div>Child Component {value}</div>;
}

const MemoizedChild = React.memo(Child);

function App() {
  const [count, setCount] = useState(0);
  return (
    <>
      <button onClick={() => setCount(count + 1)}>Increment</button>
      <p>Count: {count}</p>
      {/* value changes every click → memo can't skip */}
      <MemoizedChild value={count} />
    </>
  );
}`

function ChildInner({ value }: { value: number }) {
  const renders = useRenderCount()
  return <RenderBadge label={`Child (value=${value})`} count={renders} hot />
}
const MemoizedChild = React.memo(ChildInner)

export default function ReactMemoPropsDemo() {
  const appRenders = useRenderCount()
  const [count, setCount] = useState(0)

  return (
    <div style={{ marginBottom: 36 }}>
      <H2>3 · memo, but the prop changes</H2>
      <Prose>
        <code>React.memo</code> only helps when the props actually stay the same. Here we pass{' '}
        <code>value={'{count}'}</code>, which is different on every click — so memo compares, sees a
        new value, and re-renders the child anyway. Memo is a guard, not a freeze.
      </Prose>

      <DemoCard>
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <RenderBadge label="App" count={appRenders} />
          <MemoizedChild value={count} />
          <div style={{ flex: 1 }} />
          <Stat label="count" value={count} />
        </div>
        <DemoButton onClick={() => setCount(count + 1)}>Increment</DemoButton>
      </DemoCard>

      <Callout tone="warn">
        Child climbs in step with App again. The takeaway: memo is only as good as the stability of
        the props you pass it — which is exactly what useCallback and useMemo (next) fix.
      </Callout>

      <CodeBlock code={CODE} />
    </div>
  )
}
