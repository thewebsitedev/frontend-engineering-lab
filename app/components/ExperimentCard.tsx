import Link from "next/link"

type ExperimentCardProps = {
  title: string
  href: string
}

export default function ExperimentCard({ title, href }: ExperimentCardProps) {
  return (
    <Link href={href}>
      <figure
        className="rounded-2xl bg-gray-800/75 p-6 ring-1 ring-white/10 mb-10"
      >
        <blockquote className="text-white">
          <p>{title}</p>
        </blockquote>
      </figure>
    </Link>
  )
}