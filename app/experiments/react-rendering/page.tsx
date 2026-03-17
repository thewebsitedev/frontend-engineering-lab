import PageWrapper from "@/app/components/PageWrapper";
import ReactRenderingDemo from "./ReactRenderingDemo";
import ReactMemoDemo from "./ReactMemoDemo";
import ReactMemoPropsDemo from "./ReactMemoPropsDemo";
import ReactUseCallbackDemo from "./ReactUseCallbackDemo";
import ReactUseCallbackUseMemoDemo from "./ReactUseCallbackUseMemoDemo";

export default function Page() {
  return (
    <PageWrapper>
      <h1 className="mt-2 text-3xl font-semibold tracking-tight text-balance text-white sm:text-4xl">React Rendering Experiment</h1>

      <p className="mt-2 text-lg text-balance text-white sm:text-md">
        This experiment demonstrates how React re-renders
        child components when parent state changes.
      </p>

      <ReactRenderingDemo />
      <ReactMemoDemo />
      <ReactMemoPropsDemo />
      <ReactUseCallbackDemo />
      <ReactUseCallbackUseMemoDemo />
    </PageWrapper>
  )
}