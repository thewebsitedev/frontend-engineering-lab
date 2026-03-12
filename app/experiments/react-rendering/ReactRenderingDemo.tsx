"use client"

import { useState } from "react"

function Child() {
  console.log("Child render")
  return <div>Child Component</div>
}

export default function ReactRenderingDemo() {
  const [count, setCount] = useState(0)

  console.log("App render")

  return (
    <div>
      <button onClick={() => setCount(count + 1)}>
        Increment
      </button>

      <p>Count: {count}</p>

      <Child />
    </div>
  )
}