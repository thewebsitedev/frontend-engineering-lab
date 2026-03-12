"use client"

import { useCallback, useMemo, useState, memo } from "react"

type ChildProps = {
  onClick: () => void
  config: { theme: string }
}

const Child = memo(function Child({ onClick, config }: ChildProps) {
  console.log("Child render")

  return (
    <div>
      <button onClick={onClick}>Child button</button>
      <p>Theme: {config.theme}</p>
    </div>
  )
})

export default function ReactUseCallbackUseMemoDemo() {
  const [count, setCount] = useState(0)

  console.log("App render")

  const handleClick = useCallback(() => {
    setCount((c) => c + 1)
  }, [])

  const config = useMemo(() => {
    return { theme: "dark" }
  }, [])

  return (
    <div className="mt-2 text-lg text-balance text-white sm:text-md">
      <p className="text-lg font-bold mt-10">Experiment 5: useCallback and useMemo Hooks</p>
      <button onClick={handleClick}
          className="mt-5 rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mb-5 "
        >
          Increment
        </button>

      <p>Count: {count}</p>

      <Child onClick={handleClick} config={config} />

      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 mt-5">
        <p className="text-sm text-yellow-300">
          Check console to see only parent re-render on increment.<br /><br />
          App render<br /><br />
          React.memo → prevents re-render<br />
          useCallback → stabilizes function props<br />
          useMemo → Stabilizes object/value references
        </p>
      </div>
    </div>
  )
}