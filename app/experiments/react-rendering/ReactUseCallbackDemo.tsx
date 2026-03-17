"use client"

import { memo, useCallback, useState } from "react"

type ChildProps = {
  onClick: React.MouseEventHandler<HTMLButtonElement>
}

function Child({ onClick }: ChildProps) {
  console.log("Child render")
  return <button onClick={onClick}>Child Component</button>
}

const MemoizedChild = memo(Child);

export default function ReactUseCallbackDemo() {
  const [count, setCount] = useState(0)

  console.log("App render")

  const handleClick = useCallback(() => {
    setCount(c => c + 1)
  }, [])

  return (
    <div className="mt-2 text-lg text-balance text-white sm:text-md">
      <p className="text-lg font-bold mt-10">Experiment 4: useCallback Hook and memo</p>
      <div className="mt-5 flex items-center gap-x-6">
        <button onClick={handleClick}
          className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mb-5 "
        >
          Increment
        </button>
      </div>

      <p>Count: {count}</p>

      <MemoizedChild onClick={handleClick} />

      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 mt-5">
        <p className="text-sm text-yellow-300">
          Check console to see only parent re-render on increment.<br /><br />
          App render<br /><br />
          React.memo → prevents re-render<br />
          useCallback → stabilizes function props
        </p>
      </div>

    </div>
  )
}