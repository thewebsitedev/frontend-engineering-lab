'use client';

import PageWrapper from "@/app/components/PageWrapper";
import { useEffect, useRef } from "react";

type TinyNode = TinyElement | TinyTextElement

type TinyElement = {
  type: string
  props: ElementProps
}

type TinyTextElement = {
  type: "TEXT_ELEMENT"
  props: TextProps
}

type ElementProps = {
  children: TinyNode[]
  attrs: Record<string, string>
}

type TextProps = {
  nodeValue: string
  children: []
}

function createTextElement(text: string): TinyTextElement {
  return {
    type: "TEXT_ELEMENT",
    props: {
      nodeValue: text,
      children: []
    }
  }
}

function createElement(
  type: string,
  props: Record<string, string> | null,
  ...children: (TinyNode | string)[]
): TinyElement {
  return {
    type,
    props: {
      attrs: props ?? {},
      children: children.map(child =>
        typeof child === "string" ? createTextElement(child) : child
      )
    }
  }
}

function render(element: TinyNode, container: Node): void {
  let dom: Node

  if (element.type === "TEXT_ELEMENT") {
    dom = document.createTextNode((element as TinyTextElement).props.nodeValue)
  } else {
    const tinyEl = element as TinyElement
    const el = document.createElement(tinyEl.type)

    Object.entries(tinyEl.props.attrs).forEach(([name, value]) => {
      el.setAttribute(name, value)
    })

    tinyEl.props.children.forEach(child => render(child, el))
    dom = el
  }

  container.appendChild(dom)
}

export default function Page() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const tree = createElement(
      "div",
      { id: "tiny-root" },
      createElement("h1", null, "Hello Tiny React"),
      createElement("p", null, "Rendered by a tiny renderer")
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
      <div ref={containerRef} className="text-amber-600 mt-10" />
    </PageWrapper>
  )
}