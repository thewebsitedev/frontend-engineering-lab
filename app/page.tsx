import ExperimentCard from './components/ExperimentCard'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1 className='text-3xl mb-6'>Frontend Engineering Lab</h1>

        <ExperimentCard
          title="React Rendering"
          href="/experiments/react-rendering"
        />
      </main>
    </div>
  )
}
