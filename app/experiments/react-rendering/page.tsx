import type { Metadata } from 'next'
import AlgoShell from '../../algorithms/AlgoShell'
import { Callout, SectionLabel } from '../parts'
import ReactRenderingDemo from './ReactRenderingDemo'
import ReactMemoDemo from './ReactMemoDemo'
import ReactMemoPropsDemo from './ReactMemoPropsDemo'
import ReactUseCallbackDemo from './ReactUseCallbackDemo'
import ReactUseCallbackUseMemoDemo from './ReactUseCallbackUseMemoDemo'

export const metadata: Metadata = {
  title: 'React Rendering · Experiments',
  description: 'When does React re-render? A guided tour of memo, useCallback, and useMemo with live render counters.',
}

export default function Page() {
  return (
    <AlgoShell
      crumbs={[{ label: 'lab', href: '/' }, { label: 'experiments', href: '/experiments' }, { label: 'react rendering' }]}
      kicker="react internals"
      title="When does React re-render?"
    >
      <p style={{ fontSize: 16, lineHeight: 1.65, maxWidth: 680, marginBottom: 18 }}>
        React’s default is simple: when a component re-renders, all of its children re-render too.
        That is usually fine — re-rendering is cheap and React only touches the real DOM where output
        actually changed. But for expensive subtrees you sometimes want to skip the work. These five
        demos build up the full mental model, with a live render counter on every component so you can
        <em> see</em> the difference instead of reading the console.
      </p>

      <Callout tone="note">
        Each badge counts how many times that component has rendered. Click the buttons and compare
        how the <strong>App</strong> and <strong>Child</strong> counters move. (In development React
        may render twice; the production build counts once per commit.)
      </Callout>

      <SectionLabel>The demos</SectionLabel>

      <ReactRenderingDemo />
      <ReactMemoDemo />
      <ReactMemoPropsDemo />
      <ReactUseCallbackDemo />
      <ReactUseCallbackUseMemoDemo />

      <SectionLabel>Takeaways</SectionLabel>
      <Callout tone="go">
        <strong>1.</strong> By default, a parent render re-renders all children. &nbsp;
        <strong>2.</strong> <code>React.memo</code> skips a child whose props are unchanged. &nbsp;
        <strong>3.</strong> Inline functions and objects are new references every render, which
        silently defeats memo. &nbsp;
        <strong>4.</strong> <code>useCallback</code> stabilizes function props; <code>useMemo</code>{' '}
        stabilizes object/array props. Reach for these only when a real render cost shows up — not
        everywhere by default.
      </Callout>
    </AlgoShell>
  )
}
