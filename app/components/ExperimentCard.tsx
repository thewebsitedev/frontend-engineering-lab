import Link from "next/link"

type ExperimentCardProps = {
  title: string
  href: string
}

export default function ExperimentCard({ title, href }: ExperimentCardProps) {
  return (
    <Link href={href}>
      <div className="border p-4 rounded-lg hover:shadow">
        <h3>{title}</h3>
      </div>
    </Link>
  )
}