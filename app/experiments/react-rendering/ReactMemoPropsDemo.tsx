"use client"

import React from "react";
import { useState } from "react"

type ChildProps = {
  value: number
}

function Child({ value }: ChildProps) {
  console.log("Child render")
  return <div>Child Component {value}</div>
}

const MemoizedChild = React.memo(Child)

export default function ReactMemoPropsDemo() {
  const [count, setCount] = useState(0)

  console.log("App render")

  return (
    <div className="mt-2 text-lg text-balance text-white sm:text-md">
      <p className="text-lg font-bold mt-10">Experiment 3: Memoization with Props</p>
      <div className="mt-5 flex items-center gap-x-6">
        <button onClick={() => setCount(count + 1)}
          className="rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-indigo-400 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 mb-5 "
        >
          Increment
        </button>
      </div>

      <p>Count: {count}</p>

      <MemoizedChild value={count} />

      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 mt-5">
        <p className="text-sm text-yellow-300">
          Check console to see that both parent and child re-render on increment because props break Memoization.<br /><br />
          App render <br />
          Child render
        </p>
      </div>

    </div>
  )
}