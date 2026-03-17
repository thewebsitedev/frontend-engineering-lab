import PageWrapper from "@/app/components/PageWrapper";
import GraphVisualizer from "./GraphVisualizer";

export default function Page() {
  return (
    <PageWrapper>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">
        Graph Visualizer
      </h1>
      <p className="mt-2 text-lg text-balance text-white sm:text-md">
        This is a great mini-project because it combines:
      </p>
      <ul className="text-white">
        <li>Graph algorithms</li>
        <li>State management</li>
        <li>Rendering with SVG</li>
        <li>Interactive UI</li>
      </ul>
      <GraphVisualizer />
      <div className="border-l-4 border-yellow-500 bg-yellow-500/10 p-4 mt-5">
        <p className="text-sm text-yellow-300">
          Click a circle to highlight neighbors.
        </p>
      </div>
    </PageWrapper>
  )
}