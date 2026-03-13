import PageWrapper from "@/app/components/PageWrapper";
import { useEffect, useRef } from "react";

type TinyElement = {
  type: string
  props: {
    [key: string]: any
    children: TinyElement[]
  }
}

function createElement(
  type: string,
  props: Record<string, any> | null,
  ...children: (TinyElement | string)[]
): TinyElement {
  return {
    type,
    props: {
      ...(props || {}),
      children: children.map(child =>
        typeof child === "object" ? child : createTextElement(child)
      )
    }
  }
}

function createTextElement(text: string): TinyElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function render(element: TinyElement, container: HTMLElement) {
  const dom =
    element.type === "TEXT_ELEMENT"
      ? document.createTextNode(element.props.nodeValue)
      : document.createElement(element.type)

  Object.keys(element.props)
    .filter(key => key !== "children")
    .forEach(name => {
      ;(dom as any)[name] = element.props[name]
    })

  element.props.children.forEach(child =>
    render(child, dom as HTMLElement)
  )

  container.appendChild(dom)
}

export default function Page() {
  const containerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tree = createElement(
      "div",
      { id: "tiny-root" },
      createElement("h1", null, "Hello Tiny React"),
      createElement("p", null, "This is a mini renderer")
    )

    render(tree, containerRef.current)
  }, [])
  return (
    <PageWrapper>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
        React Virtual DOM
      </h1>
      <p className="mt-2 text-lg text-balance text-white sm:text-md">
        This demonstrates:
      </p>
      <ul className="text-white">
        <li>Virtual DOM</li>
        <li>Rendering</li>
        <li>Reconciliation</li>
      </ul>
      <div ref={containerRef} />
    </PageWrapper>
  )
}