import ReactRenderingDemo from "./ReactRenderingDemo";

export default function Page() {
  return (
    <div>
      <h1>React Rendering Experiment</h1>

      <p>
        This experiment demonstrates how React re-renders
        child components when parent state changes.
      </p>

      <ReactRenderingDemo />
    </div>
  )
}